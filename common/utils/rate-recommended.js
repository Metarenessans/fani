export default function extRateReal(
  present,
  future,
  payment,
  paymentper,
  payload,
  payloadper,
  periods,
  dayoffirstpayment = 0,
  dayoffirstpayload = 0,
  comission = 0,
  realdata = {},
  options = { extendDays: undefined, rateSuggest: 0.01 }
) {

  ///////////////////
  //  Version 1.4  //
  ///////////////////

  // ( Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1), комиссия на вывод, массив данных по реальным дням, Опции: { extendDays -> коллбэк функция, которая вызывается если не хватает дней для достижения цели, rateSuggest -> Предлагаемая доходность, на основе которой расчитывается отставание / опережение графика}  )
  // Возвращает: { rate -> Минимальная доходность в день, extraDays -> разница в днях между планом и реальностью }

  // точность в процентах от итоговой суммы
  var deltaMaxPercent = 0.00001;

  // максимальное количество итераций
  var iterMax = 2500;

  var showday = [];

  payment = payment * (1 + comission);

  ///////////////////////////////////////////
  function ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1, mode = 0) {
    var res = present;
    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    rate += 1;

    for (var x = 0; x < periods; x++) {
      if (realdata[x] !== undefined) {
        res = res * (1 + realdata[x].scale);
        p1--; p2--;
        res += realdata[x].payload;
        res -= realdata[x].payment;
        if (!p2) { p2 = payloadper; }
        if (!p1) { p1 = paymentper; }
        // console.log('нашли ', x);
      } else {
        res = res * rate;
        p1--; p2--;
        if (!p2) { p2 = payloadper; res += payload; }
        if (!p1) { p1 = paymentper; res -= payment; }
      }
      if (mode === 2) {
        if (res >= future) {
          //console.log(res);
          return x + 1;
        }
      }
    }
    if (mode === 0) return res;
    if (mode === 1 || mode === 2) {
      var daysPlus = 0;
      var res1 = res;
      rate = 1 + options.rateSuggest;
      while (res < future) {
        daysPlus++;
        res = res * rate;
        p1--; p2--;
        if (!p2) { p2 = payloadper; res += payload; }
        if (!p1) { p1 = paymentper; res -= payment; }
      }
      if (mode === 1) return daysPlus;
      return x + daysPlus;
    }
  }
  function ff2(rate, periods, present, payment) {
    var k1 = (1 + rate) ** periods;
    return present * k1 + payment * (k1 - 1) / rate;
  }

  var deltaMax = future * deltaMaxPercent / 100;
  var guess = (((future + periods * (payment)) / present) ** (1 / periods)) - 1;
  var guess2 = (periods * payment) ** (1 / (periods * 2)) - 1;

  var delta = guess;

  var rate = guess;
  var minrate = 0;
  var maxrate = 0;
  var daysExtend = 0;

  var drd = 0;
  var rdgtp = false;
  for (var x = 0; x < periods; x++) {
    if (realdata[x] !== undefined) drd++;
  }

  if (drd >= periods) {
    rdgtp = true;
    var daysExtend = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, 1);
    if (daysExtend > 0) {
      if (options.extendDays !== undefined && typeof (options.extendDays) === 'function') options.extendDays(daysExtend);
      //return {rate: options.rateSuggest, extraDays: daysExtend};
    } else {
      var current = ff(0, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);
      if ((current <= (future + deltaMax)) && (current > future)) return { rate: 0, extraDays: daysExtend };
    }
  }

  if (options.rateSuggest !== undefined) {
    var daysFact = ff(options.rateSuggest, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, 2);
  }

  periods += daysExtend;
  var daysDiff = daysFact - periods;

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
  return { rate: rate, extraDays: daysExtend, daysDiff: daysDiff };
}