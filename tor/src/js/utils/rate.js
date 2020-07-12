/**
 *
 * @param {number} present Начальный депозит
 * @param {number} future  Целевой депозит
 * @param {number} payment Сумма на вывод
 * @param {number} paymentper Периодичность вывода
 * @param {number} payload Сумма на добавление
 * @param {number} payloadper Периодичность добавления
 * @param {number} periods Торговых дней
 * @param {number} [dayoffirstpayment=0] День от начала до первого вывода
 * @param {number} [dayoffirstpayload=0] День от начала до первого взноса (с самого начала - 1)
 * @returns {number} Минимальная доходность в день
 */
export default function extRate(
  present,
  future,
  payment,
  paymentper,
  payload,
  payloadper,
  periods,
  dayoffirstpayment = 0,
  dayoffirstpayload = 0
  ) {

  // точность в процентах от итоговой суммы
  var delataMaxPercent = 0.1;

  // максимальное количество итераций
  var iterMax = 250;

  var showday = [];

  ///////////////////////////////////////////
  function ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1) {
    var res = present;
    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    rate += 1;

    for (var x = 0; x < periods; x++) {
      res = res * rate;
      p1--; p2--;
      if (!p2) { p2 = payloadper; res += payload; }
      if (!p1) { p1 = paymentper; res -= payment; }
    }
    return res;
  }
  function ff2(rate, periods, present, payment) {
    var k1 = (1 + rate) ** periods;
    return present * k1 + payment * (k1 - 1) / rate;
  }

  var deltaMax = future * delataMaxPercent / 100;
  var guess = (((future + periods * (payment)) / present) ** (1 / periods)) - 1;
  var guess2 = (periods * payment) ** (1 / (periods * 2)) - 1;

  var delta = guess;

  var rate = guess;
  var minrate = 0;
  var maxrate = 0;

  var current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);

  while (((current > (future + deltaMax)) || (current < future)) && (iterMax > 0)) {
    current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);
    if (current > (future + deltaMax)) {

      maxrate = rate;
      rate = minrate + (maxrate - minrate) / 2;
    }
    if (current < future) {

      minrate = rate;
      if (maxrate === 0) rate = rate * 2;
      else rate = minrate + (maxrate - minrate) * 2;
    }
    iterMax--;
  }
  return rate;
}