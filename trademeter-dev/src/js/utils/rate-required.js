export default function rateRequired(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment = 0, dayoffirstpayload = 0, comission = 0, realdata = {}) {

  ///////////////////////////////////////////

  // ( Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1), комиссия на вывод, массив данных по реальным дням  )
  // Возвращает: Минимальная доходность в день

  // точность в процентах от итоговой суммы
  var delataMaxPercent = 0.1;

  // максимальное количество итераций
  var iterMax = 250;

  var showday = [];

  payment = payment * (1 + comission);

  ///////////////////////////////////////////
  function ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1) {
    var res = present;
    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    rate += 1;

    for (var x = 0; x < periods; x++) {
      if (realdata[x] !== undefined) {
        res = res * (1 + (realdata[x].scale / 100));
        p1--; p2--;
        res += realdata[x].payload;
        res -= realdata[x].payment;
        if (!p2) { p2 = payloadper; }
        if (!p1) { p1 = paymentper; }
      } else {
        res = res * rate;
        p1--; p2--;
        if (!p2) { p2 = payloadper; res += payload; }
        if (!p1) { p1 = paymentper; res -= payment; }
      }
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

// const Realdata = { '2': { scale: 0.2, payload: 1000, payment: 100 }, '10': { scale: 0.2, payload: 1000, payment: 500 }, '20': { scale: 0.2, payload: 10000, payment: 0 }, '30': { scale: 0.2, payload: 0, payment: 1000 } };

// $('#tre').html(rateRequired(1000000, 30000000, 10000, 1, 5000, 1, 260, 1, 1, 0.2, Realdata));