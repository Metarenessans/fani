import round           from "../../../../../common/utils/round"
import roundUp         from "../../../../../common/utils/round-up"
import fractionLength  from '../../../../../common/utils/fraction-length'
import croppNumber     from '../../../../../common/utils/cropp-number'
import fallbackBoolean from '../../../../../common/utils/fallback-boolean'

import stepConverter from './step-converter'

const createData = (type, options, meta) => {

  let {
    currentPreset,
    currentTool,
    contractsTotal,
    contracts,
    contractsSecondary,
    comission,
    mainData,
    on,
  } = options;

  const isBying = options.isBying || false;

  const presetOptions = options.options || currentPreset.options[type];

  if (contractsSecondary > 0) {
    contracts -= contractsSecondary;
  }
  if (type == "Закрытие плечевого депозита") {
    contracts = contractsSecondary;
  }
  
  let contractsLeft = contracts;
  if (isBying) {
    contractsLeft = contracts + contractsSecondary;
    contracts = contractsLeft;
  }

  const fraction = fractionLength(currentTool.priceStep);

  const isSMS_TOR = false;
    // currentPreset.type == "СМС + ТОР" &&
    // ["Обратные докупки (ТОР)", "Прямые профитные докупки"].indexOf(type) > -1;

  let { mode, stepInPercent, length } = presetOptions;

  const presetRules = {
    blockStartIndicies: [0, 4, 8],
    blockLengths: [4, 4, 16],
    percents: [9.5, 9.5, 1.5],
    multipliers: [
      [2, 3, 5, 8],
      [13, 15, 18, 20],
      new Array((100 - 20) / 5 + 1).fill(0).map((v, i) => 20 + (5 * i))
    ]
  };

  on = fallbackBoolean(on, true);

  let data = [];
  data.isBying = isBying;
  data.on      = on;
  if (!on || contracts == 0) {
    return data;
  }

  if (isSMS_TOR) {
    // Инпут "% докупки" пустой
    if (presetOptions.percent == "") {
      return data;
    }

    length = 
      Math.floor(50 / presetOptions.percent) + 
      Math.floor(200 / (presetOptions.percent * 4));

    if (isNaN(length) || mainData?.length == 0) {
      return data;
    }
  }

  if (!length) {
    if (stepInPercent) {
      length = Math.floor(100 / stepInPercent);
      if (isNaN(length)) {
        return data;
      }
    }
    else {
      length = 1;
    }
  }

  if (mode == 'fibonacci') {
    length = 24;
  }
  else if (mode == 'custom') {
    length = presetOptions.customData.length || 1;
    data.realLength = presetOptions.customData.map(row => row.length).reduce((prev, curr) => prev + curr);
  }

  let subIndex = -1;
  let lastRowInGroupIndex = -1;

  for (let index = 0; index < length; index++) {

    let subLength = 1;

    let currentOptions;
    if (mode == 'custom') {
      currentOptions = { ...presetOptions.customData[index] };
      subLength = (currentOptions.length || 1);
    }

    let shouldBreak = false;

    for (let j = 0; j < subLength; j++) {

      subIndex++;

      let blockNumber = 1;
      for (let i = 0; i < presetRules.blockStartIndicies.length; i++) {
        if (index >= presetRules.blockStartIndicies[i]) {
          blockNumber = i + 1;
        }
      }

      const blockLen = presetRules.blockLengths[blockNumber - 1];

      let indexInBlock = ((index + 1) - presetRules.blockStartIndicies[blockNumber - 1]) % blockLen;
      if (indexInBlock == 0) {
        indexInBlock = blockLen;
      }

      // % закрытия
      let percent = presetOptions.percent;
      if (mode == 'fibonacci') {
        percent = presetRules.percents[blockNumber - 1] || 0;
      }
      else if (mode == 'custom') {
        percent = currentOptions.percent || 0;
      }

      if (isSMS_TOR) {
        percent = subIndex < Math.floor(50 / presetOptions.percent) ? percent : percent * 4;;
      }

      // Округляем
      percent = round(percent, fraction);

      let { preferredStep, inPercent } = presetOptions;
      if (inPercent) {
        if (preferredStep == "") {
          preferredStep = currentTool.adrDay;
        }
        else {
          preferredStep = stepConverter.fromPercentsToStep(
            preferredStep,
            currentTool
          );
        }
      }
      else {
        if (preferredStep == "") {
          preferredStep = currentTool.adrDay;
        }
      }

      if (mode == 'custom') {
        preferredStep = currentOptions.preferredStep;
        inPercent = currentOptions.inPercent;
        if (inPercent) {
          preferredStep = stepConverter.fromPercentsToStep(preferredStep, currentTool);
        }
      }

      let { stepInPercent } = presetOptions;

      // Ход
      let points =
        (
          // контракты * го = объем входа в деньгах
          (contracts * currentTool.guarantee)
          *
          // величина смещения из массива закрытия
          (stepInPercent / 100 * (index + 1))
          *
          // шаг цены
          currentTool.priceStep
        )
        /
        (
          // кол-во контрактов на заданную загрузку
          contracts
          *
          // стоимость шага цены
          currentTool.stepPrice
        );
      
      // Если выбрана акция - применяю другую формулу 
      // https://docs.google.com/document/d/1wuO5RF_VH1PD-XxjHXLYDW124L5R2EuHt9b_PNeRiG0/edit#bookmark=id.vpv7265cfmik
      if (currentTool.dollarRate >= 1) {
        points =
          (
            // контракты * го = объем входа в деньгах
            (contracts * currentTool.guarantee)
            *
            // величина смещения из массива закрытия
            (stepInPercent / 100 * (index + 1))
          )
          /
          (
            // кол-во контрактов на заданную загрузку
            contracts
            *
            // лот
            currentTool.lotSize
          );
      }

      points = round(points, fraction);

      if (isNaN(points)) {
        points = 0;
      }

      if (mode == 'fibonacci') {
        const blockPointsMultipliers = presetRules.multipliers[blockNumber - 1];
        const multiplier = blockPointsMultipliers[indexInBlock - 1];
        points = Math.floor(currentTool.adrDay * currentTool.currentPrice * (multiplier / 100));
      }

      if (mode == 'custom') {
        let preferredStepInMoney = currentOptions.preferredStep;
        const { inPercent } = currentOptions;
        if (inPercent) {
          if (preferredStepInMoney == "") {
            preferredStepInMoney = currentTool.adrDay;
          }
          else {
            preferredStepInMoney = stepConverter.fromPercentsToStep(
              preferredStepInMoney,
              currentTool
            );
          }
        }
        else {
          if (preferredStepInMoney == "") {
            preferredStepInMoney = currentTool.adrDay;
          }
        }

        const groupLength = currentOptions.length || 1;

        const base = preferredStepInMoney / groupLength;

        points = croppNumber(
          base * (j + 1)
          +
          // Добавляем последнее значение из предыдущего блока
          (index > 0 ? data[lastRowInGroupIndex].points : 0)
          ,
          fraction
        );

        if (j == groupLength - 1) {
          lastRowInGroupIndex = subIndex;
        }
      }

      if (currentPreset.type == "СМС + ТОР" && type == "Закрытие основного депозита") {
        // points = round(
        //   round(preferredStep * stepInPercent / 100, fraction) * (index + 1),
        //   fraction
        // );
      }

      // if (currentPreset.type == "СМС + ТОР" && type == "Закрытие плечевого депозита") {
      //   points = round(preferredStep * (index + 1), fraction);
      // }

      if (isSMS_TOR) {
        points = round(currentTool.currentPrice * (stepInPercent * (index + 1)) / 100, fraction);
      }

      // if (currentPreset.type == "СМС + ТОР" && type == "Обратные докупки (ТОР)") {
      //   points = subIndex < Math.floor(50 / presetOptions.percent)
      //     ? round((mainData[0].points / 2) * (index + 1), fraction)
      //     : round(currentTool.adrDay * (index + 1 - Math.floor(50 / presetOptions.percent)), fraction);
      // }

      // Если ход больше желаемого хода - массив заканчивается
      if (
        !(currentPreset.type == "СМС + ТОР" && type == "Закрытие плечевого депозита") &&
        !(isSMS_TOR) &&
        (mode != 'fibonacci' && mode != 'custom') &&
        points > (preferredStep || currentTool.adrDay)
      ) {
        shouldBreak = true;
        break;
      }

      // Кол-во закрытых/докупленных контрактов
      let _contracts = roundUp(contracts * percent / 100);
      if (currentPreset.type == "СМС + ТОР" && type == "Обратные докупки (ТОР)") {
        _contracts = roundUp(contractsLeft * percent / 100);
      }

      if (contractsLeft - _contracts >= 0) {
        contractsLeft -= _contracts;
      }
      else {
        _contracts = contractsLeft;
        contractsLeft = 0;
        shouldBreak = true;
      }

      // Контрактов в работе
      let contractsLoaded = contractsLeft;
      if (contractsLoaded == 0) {
        shouldBreak = true;
      }

      let _comission = _contracts * comission;
      // NOTE: больше не прибавляем комиссию из предыдущей строки
      // _comission += data[subIndex - 1]?.comission || 0;

      let incomeWithoutComission = _contracts * points / currentTool.priceStep * currentTool.stepPrice;
      // Прибавляем доход/убыток из предыдущей строки
      incomeWithoutComission += data[subIndex - 1]?.incomeWithoutComission || 0;

      let incomeWithComission = 
        incomeWithoutComission + (_comission * (isBying ? 1 : -1));

      data[subIndex] = {
        inPercent,
        percent,
        points,
        contracts: _contracts,
        contractsLoaded,
        incomeWithoutComission,
        comission: _comission,
        incomeWithComission,
      };

      if (mode == 'custom') {
        data[subIndex] = {
          ...data[subIndex],
          group: index
        };
      }

      if (shouldBreak) {
        break;
      }
    }

    if (shouldBreak) {
      break;
    }
  }

  return data;
};

export default createData;