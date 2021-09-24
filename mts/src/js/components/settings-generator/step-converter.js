const stepConverter = {
  fromStepToPercents(step, tool) {
    return step / tool.currentPrice * 100
  },
  fromPercentsToStep(percent, tool) {
    return percent / 100 * tool.currentPrice
  },
  // https://docs.google.com/document/d/1wuO5RF_VH1PD-XxjHXLYDW124L5R2EuHt9b_PNeRiG0/edit#bookmark=kix.34i0zgw4qwsj
  complexFromStepsToPercent(points, tool, contracts) {
    let percent = 0;
    // Акции
    if (tool.dollarRate >= 1) {
      percent =
        (
          // загрузка в контрактах
          contracts *
          // ход в пунктах
          points *
          // лот
          tool.lotSize
        )
        /
        (
          // объем входа в деньгах
          contracts * tool.guarantee
        );
    }
    // ФОРТС
    else {
      percent =
        (
          // загрузка в контрактах
          contracts *
          // ход в пунктах
          points *
          // стоимость шага
          tool.stepPrice
        )
        /
        (
          // объем входа в деньгах
          (contracts * tool.guarantee)
          *
          // шаг цены
          tool.priceStep
        );
    }

    percent *= 100;

    if (isNaN(percent)) {
      percent = 0;
    }

    return percent;
  },
  // https://docs.google.com/document/d/1wuO5RF_VH1PD-XxjHXLYDW124L5R2EuHt9b_PNeRiG0/edit#bookmark=kix.oz32wk9usy3c
  complexFromPercentToSteps(percent, tool, contracts) {
    let points;
    // Акции
    if (tool.dollarRate >= 1) {
      points =
        (
          // объем входа в деньгах
          (contracts * tool.guarantee)
          *
          // ход в %
          percent / 100
        )
        /
        (
          // кол-во контрактов на данную загрузку
          contracts
          *
          // лот
          tool.lotSize
        )
    }
    // ФОРТС
    else {
      points =
        (
          // контракты * го = объем входа в деньгах
          (contracts * tool.guarantee)
          *
          // ход в %
          percent / 100
        )
        /
        (
          // кол-во контрактов на данную загрузку
          contracts
          *
          // стоимость шага цены
          tool.stepPrice
        )
        *
        // шаг цены
        tool.priceStep;
    }

    // points /= 100;

    if (isNaN(points)) {
      points = 0;
    }

    return points;
  }
};
export default stepConverter;