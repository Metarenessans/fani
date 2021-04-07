const stepConverter = {
  fromStepToPercents(step, tool) {
    return step / tool.currentPrice * 100
  },
  fromPercentsToStep(percent, tool) {
    return percent / 100 * tool.currentPrice
  },
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
        )
        *
        // лот
        tool.lotSize;
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

    points /= 100;

    if (isNaN(points)) {
      points = 0;
    }

    return points;
  }
};
export default stepConverter;