import round          from "../../../../../common/utils/round"
import roundUp        from "../../../../../common/utils/round-up"
import fractionLength from '../../../../../common/utils/fraction-length'
import croppNumber    from '../../../../../common/utils/cropp-number'

import stepConverter from './step-converter'

const createData = (type, options) => {

  let {
    currentPreset,
    currentTool,
    contractsTotal,
    contracts,
    comission
  } = options;

  const isBying = options.isBying || false;
  
  let contractsLeft = contracts;
  if (isBying) {
    contractsLeft = contractsTotal - contracts;
  }

  const fraction = fractionLength(currentTool.priceStep);

  const { mode } = currentPreset.options[type];

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

  // ЗАКРЫТИЕ ОСНОВНОГО ДЕПОЗИТА
  let data = [];
  let length = currentPreset.options[type].length || 1;
  if (length == null) {
    length = 1;
  }

  if (mode == 'fibonacci') {
    length = 24;
  }
  else if (mode == 'custom') {
    length = currentPreset.options[type].customData.length || 1;
  }

  let subIndex = -1;
  let lastRowInGroupIndex = -1;

  for (let index = 0; index < length; index++) {

    let subLength = 1;

    let currentOptions;
    if (mode == 'custom') {
      currentOptions = { ...currentPreset.options[type].customData[index] };
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
      let percent = currentPreset.options[type].percent;
      if (mode == 'fibonacci') {
        percent = presetRules.percents[blockNumber - 1] || 0;
      }
      else if (mode == 'custom') {
        percent = currentOptions.percent || 0;
      }
      // Округляем
      percent = round(percent, fraction);

      let { preferredStep, inPercent } = currentPreset.options[type];
      if (inPercent) {
        preferredStep = stepConverter.fromPercentsToStep(preferredStep, currentTool.currentPrice);
      }

      if (mode == 'custom') {
        preferredStep = currentOptions.preferredStep;
        let inPercent = currentOptions.inPercent;
        if (inPercent) {
          preferredStep = stepConverter.fromPercentsToStep(preferredStep, currentTool.currentPrice);
        }
      }

      let { stepInPercent } = currentPreset.options[type];

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
      
      // Если акции - применяю другую формулу 
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
          )
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
        let preferredStepInPercent = currentOptions.preferredStep;
        const { inPercent } = currentOptions;
        if (!inPercent || currentOptions.preferredStep == "") {
          preferredStepInPercent = stepConverter.fromStepToPercents(
            (preferredStep || currentTool.adrDay),
            currentTool.currentPrice
          );
        }

        const groupLength = currentOptions.length || 1;

        if (j == groupLength - 1) {
          lastRowInGroupIndex = subIndex;
        }

        points = croppNumber(
          (preferredStepInPercent / groupLength) * (j + 1)
          +
          // Добавляем последнее значение из предыдущего блока
          (index > 0 ? data[lastRowInGroupIndex - 1].points : 0)
          ,
          fraction
        );
      }

      if (type == "Обратные докупки (ТОР)") {
        points = round(currentTool.currentPrice * (stepInPercent * (index + 1)) / 100, fraction);
      }
      // Если ход больше желаемого хода - массив заканчивается
      else if (
        (mode != 'fibonacci' && mode != 'custom') &&
        points > (preferredStep || currentTool.adrDay)
      ) {
        shouldBreak = true;
        break;
      }

      // кол-во закрытых контрактов
      let _contracts = roundUp(contracts * percent / 100);
      if (mode == 'fibonacci') {
        _contracts = roundUp(contracts * percent / 100);
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

      let incomeWithoutComission = contracts * currentTool.stepPrice * points;
      let incomeWithComission = 
        incomeWithoutComission + 
        (_comission * (type == "Обратные докупки (ТОР)" ? 1 : -1));

      data[subIndex] = {
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