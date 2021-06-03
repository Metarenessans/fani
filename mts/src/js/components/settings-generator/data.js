import round           from "../../../../../common/utils/round"
import roundUp         from "../../../../../common/utils/round-up"
import fractionLength  from '../../../../../common/utils/fraction-length'
import croppNumber     from '../../../../../common/utils/cropp-number'
import fallbackBoolean from '../../../../../common/utils/fallback-boolean'

import stepConverter from './step-converter'

const createData = (type, options, meta) => {

  const optionsCopy = {...options};

  let {
    currentPreset,
    currentTool,
    contractsTotal,
    contracts,
    contractsSecondary,
    comission,
    mainData,
    on,
    // Массив прямых профитных докупок
    profitableByingArray
  } = options;

  const isBying = options.isBying || false;
  const presetOptions = options.options || currentPreset.options[type];
  const { closeAll, shouldResetByings } = presetOptions;

  const infiniteLength = meta?.infiniteLength;

  if (contractsSecondary > 0) {
    contracts -= contractsSecondary;
  }
  if (type == "Закрытие плечевого депозита") {
    contracts = contractsSecondary;
  }
  
  let contractsLeft = contracts;
  if (isBying) {
    // contractsLeft = contracts + contractsSecondary;
    contractsLeft = contractsTotal - (contracts + contractsSecondary);
    contracts = contractsLeft;
  }

  const fraction = fractionLength(currentTool.priceStep);

  const isSMS_TOR = false;
    // currentPreset.type == "СМС + ТОР" &&
    // ["Обратные докупки (ТОР)", "Прямые профитные докупки"].indexOf(type) > -1;

  const stepsToPercentConverter = currentPreset.type == "Лимитник" && type == "Закрытие основного депозита"
    ? stepConverter.complexFromStepsToPercent
    : stepConverter.fromStepToPercents;
  const percentToStepsConverter = currentPreset.type == "Лимитник" && type == "Закрытие основного депозита"
    ? stepConverter.complexFromPercentToSteps
    : stepConverter.fromPercentsToStep;

  let { mode, stepInPercent, length, preferredStep, inPercent } = presetOptions;

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
  let readyToClosedAll = false;

  for (let index = 0; index < length; index++) {

    let subLength = 1;

    let currentOptions;
    if (mode == 'custom') {
      currentOptions = { ...presetOptions.customData[index] };
      subLength = (currentOptions.length || 1);
    }

    let shouldBreak = false;

    if (infiniteLength) {
      // console.log('expected length:', subLength);
      subLength = 1_000;
    }

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

      // Округляем до 2 знаков
      percent = round(percent, 2);

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

      if (mode == "custom") {
        preferredStep = currentOptions.preferredStep;
        inPercent = currentOptions.inPercent;
        if (inPercent) {
          preferredStep = stepConverter.fromPercentsToStep(preferredStep, currentTool);
        }
      }

      if (!stepInPercent) {
        stepInPercent = round(stepConverter.fromStepToPercents((preferredStep / (length || 1)), currentTool), fraction);
      }

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

      if (mode == 'fibonacci') {
        const blockPointsMultipliers = presetRules.multipliers[blockNumber - 1];
        const multiplier = blockPointsMultipliers[indexInBlock - 1];
        points = currentTool.adrDay * (multiplier / 100);
      }

      points = round(points, fraction);

      if (mode == 'custom') {
        let preferredStepInMoney = currentOptions.preferredStep;
        const { inPercent } = currentOptions;
        if (inPercent) {
          if (preferredStepInMoney == "") {
            preferredStepInMoney = currentTool.adrDay;
          }
          else {
            preferredStepInMoney = percentToStepsConverter(preferredStepInMoney, currentTool, contracts + contractsSecondary);
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

      if (isNaN(points)) {
        points = 0;
      }

      // Если ход больше желаемого хода - массив заканчивается
      if (
        !(currentPreset.type == "СМС + ТОР" && type == "Закрытие плечевого депозита") &&
        !(isSMS_TOR) &&
        (mode != 'fibonacci' && mode != 'custom') &&
        points > (preferredStep || currentTool.adrDay)
      ) {
        if (closeAll && !readyToClosedAll) {
          console.log('1 step back');
          readyToClosedAll = true;
          index--;
          continue;
        }
        
        shouldBreak = true;
        break;
      }

      // Кол-во закрытых/докупленных контрактов
      let _contracts = contracts * percent / 100;
      if (currentPreset.type == "СМС + ТОР" && type == "Обратные докупки (ТОР)") {
        _contracts = contractsLeft * percent / 100;
      }

      // если контрактов получается меньше одного - тогда округляется до 1
      // а если контрактов к примеру 1,2 на закрытие получилось - то округление математическое
      if (_contracts < 1) {
        _contracts = roundUp(_contracts);
      }
      else {
        _contracts = Math.round(_contracts);
      }

      if (readyToClosedAll) {
        _contracts = contractsLeft;
        shouldBreak = true;
      }

      if (infiniteLength || contractsLeft - _contracts >= 0) {
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
<<<<<<< HEAD
      
      let comissionsSum = data
        .slice(0, subIndex)
        .map(row => row.comission)
        .reduce((prev, curr) => prev + curr, 0);
      comissionsSum += _comission;
      
      let incomeWithComission = incomeWithoutComission + (comissionsSum * (isBying ? 1 : -1));
=======

      let incomeWithComission = incomeWithoutComission + (_comission * (isBying ? 1 : -1));
>>>>>>> parent of fa168178 (Merge branch 'master' into meta)

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

  const updateContracts = (c, data, index) => {
    const row = data[index];

    row.contracts = c;

    // Пересчитываем комиссию
    row.comission = row.contracts * comission;
    // Если выбрана акция 
    if (currentTool.dollarRate >= 1) {
      row.comission = comission;

      if (index == 0) {
        row.comission *= 2;
      }
    }

    row.incomeWithoutComission = row.contracts * row.points / currentTool.priceStep * currentTool.stepPrice;
    // Прибавляем доход/убыток из предыдущей строки
    row.incomeWithoutComission += data[index - 1]?.incomeWithoutComission || 0;

    let comissionsSum = data
      .slice(0, index)
      .map(row => row.comission)
      .reduce((prev, curr) => prev + curr, 0);
    comissionsSum += row.comission;

    row.incomeWithComission = row.incomeWithoutComission + (comissionsSum * (isBying ? 1 : -1));
  }

  // Массив профитных докупок сливается с основным массивом
  if (profitableByingArray?.length) {
    const profitableByingArrayFormatted = profitableByingArray.map(row => ({ ...row, merged: true }));
    data = data.concat(profitableByingArrayFormatted)
      .sort((l, r) => l.points - r.points)
      .map((row, index, arr) => {
        if (index > 0) {
          if (row.merged) {
            row.contracts = arr[index - 1].contractsLoaded * row.percent / 100;
            // если контрактов получается меньше одного - тогда округляется до 1
            // а если контрактов к примеру 1,2 на закрытие получилось - то округление математическое
            if (row.contracts < 1) {
              row.contracts = roundUp(row.contracts);
            }
            else {
              row.contracts = Math.round(row.contracts);
            }

            row.contractsLoaded = arr[index - 1].contractsLoaded + row.contracts;
          }
          else {
            row.contractsLoaded = arr[index - 1].contractsLoaded - row.contracts;
          }

          // Пересчитываем комиссию
          row.comission = row.contracts * comission;
          // Если выбрана акция 
          if (currentTool.dollarRate >= 1) {
            row.comission = comission;

            if (index == 0) {
              row.comission *= 2;
            }
          }

          row.incomeWithoutComission = row.contracts * row.points / currentTool.priceStep * currentTool.stepPrice;
          // Прибавляем доход/убыток из предыдущей строки
          row.incomeWithoutComission += arr[index - 1]?.incomeWithoutComission || 0;

          let comissionsSum = data
            .slice(0, index)
            .map(row => row.comission)
            .reduce((prev, curr) => prev + curr, 0);
          comissionsSum += row.comission;

          row.incomeWithComission = row.incomeWithoutComission + (comissionsSum * (isBying ? 1 : -1));
        }

        return row;
      })
  }

  // Выключен свитч "Сброс массива закрытия"
  if (!shouldResetByings) {
    if (data.slice(-1)[0]?.merged) {
      data.splice(data.length - 1, 1);
    }
  }
  else {
    if (!infiniteLength) {
      return createData(type, optionsCopy, { infiniteLength: true });
    }
    else {
      const indexOfLast = data.indexOf(data.find(row => row.contractsLoaded < 0));
      if (indexOfLast > -1) {
        data = data.slice(0, indexOfLast + 1);
        const _contracts = data.length > 1
          ? data[indexOfLast - 1].contractsLoaded
          : contracts;
        data[indexOfLast].contractsLoaded = 0;
        updateContracts(_contracts, data, indexOfLast);
      }
    }
  }

  // Отрабатывает свитч "100%""
  if (closeAll) {
    const { length } = data;
    const lastItem = data[length - 1];
    const _contracts = length > 1 
      ? data[length - 2].contractsLoaded
      : contracts;
    lastItem.contractsLoaded = 0;
    updateContracts(_contracts, data, length - 1);
  }

  data.isBying = isBying;
  data.on = on;

  return data;
};

export default createData;