export default
  // CHANGELOG
  // 3.2 - realdata, dayoffirstpayload, dayoffirstpayload   do   ZERO based !
  // 3.21 - change to ||
  // 3.22 - change to baseRate
  // 3.4 - adding averageProf
  // 4.0 - adding bond profit
  // 4.1 - simple bond
  // 5 - many other

  function extRateReal(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment = 1, dayoffirstpayload = 1, comission = 0, realdata = {}, options = { customRate: undefined, fmode: 0, tax: 0.13, getAverage: false, bond: undefined }) {


  const RD_modifier = -1; // realdata[0] - same realdata[1] in past 
  ////

  const bonds2 = {
    cash: 0,
    bondsTotal: 0,
    get total() {
      return this.cash + this.bondsTotal;
    },

    init(opts, cash) {
      this.opts = opts;
      this.cash = cash;
      this.bondsTotal = 0;
      this.uB(cash);
    },

    uB(s) {
      //return s;
      if (isNaN(s)) { return s; }
      var d = s - this.total;
      //if ( d!= 0) console.log('d != 0 ');//t

      //console.log('s', s, 'd', d,'CR',this.opts.couponRate); // t

      this.cash += this.bondsTotal * (1 + this.opts.couponRate) + d;

      //console.log('cash', this.cash); // t

      if (this.cash < 0) {
        this.cash = 0;
        this.bondsTotal = 0;
      }
      else {
        if (this.cash >= this.opts.price) {
          let t = this.cash % this.opts.price;
          this.bondsTotal = this.cash - t;
          this.cash = t;
        }
      }
      if (isNaN(s)) { console.log(this.total); }
      return this.total;
    }

  }


  function getDataRate(rate, present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment = 0, dayoffirstpayload = 0, comission = 0, realdata = [], options = { customRate: undefined, bond: undefined }) {

    var res = present;

    // для в 4.1
    if (options.bond !== undefined) {
      bonds2.init(options.bond, present);
      //console.log( 'gdr',present, bonds2.total, bonds2.cash, bonds2.bondsTotal );
    }

    // костыль для в. 3.2
    dayoffirstpayment++;
    dayoffirstpayload++;
    /////

    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    var day = 1;
    var x = 1;
    var RD_modifier = -1;
    if (RD_modifier == 0) var arr = [present];
    else arr = [];

    rate += 1;
    payment = payment * (1 + comission);

    while (x <= periods) {
      if (realdata[x + RD_modifier] !== undefined) {
        if (options.customRate === undefined) res = res * (1 + realdata[x + RD_modifier].scale);
        else res = res * rate;
        p1--; p2--;
        res += realdata[x + RD_modifier].payload;
        res -= realdata[x + RD_modifier].payment;
        if (!p2) { p2 = payloadper; }
        if (!p1) { p1 = paymentper; }
      } else {
        res = res * rate;
        p1--; p2--;
        if (!p2) { p2 = payloadper; res += payload; }
        if (!p1) { p1 = paymentper; res -= payment; }
      }
      x++;

      if (options.bond !== undefined) {
        res = bonds2.uB(res);
      }

      if (res < 0) {
        res = 0;
        arr.push(res);
        break;
      }

      arr.push(res);
    }
    return arr;
  }

  function extRateReal2(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment = 1, dayoffirstpayload = 1, comission = 0, realdata = {}, options = { customRate: undefined, fmode: 0, tax: 0.13, getAverage: false, bond: undefined }) {

    //////////////////////// 
    //  Version 5.0 beta  //
    ////////////////////////

    // ( Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1), комиссия на вывод, массив данных по реальным дням, Опции: { extendDays -> коллбэк функция, которая вызывается если не хватает дней для достижения цели, customRate -> Предлагаемая доходность, на основе которой расчитывается отставание / опережение графика}  )
    // bond = { 
    // 		price,   	 				// цена ОФЗ 
    //    couponRate,				// ставка выплаты по купону в день, например, 0.01. Если установлена, то "coupon", "frequency", "startDateCoupon" не используются
    // 		coupon,  	 				// величина выплаты по купону 
    // 		frequency, 				// периодичность выплаты по купону в днях 
    // 		startDateCoupon, 	// в этой версии не используется. Зарезервировано для другой версии // первый день с которого идет первая выплата по купону, если поставить 0, то "startDateCoupon" автоматически устанавливается равен "frequency"
    // 		date 							// в этой версии не используется. Зарезервировано для другой версии // дата выпуска ОФЗ
    // } 
    // Возвращает: { rate -> Минимальная доходность в день, rateRecommended -> базовая доходность без учета рилдата, extraDays -> дополнительные дни при необходимости, daysDiff -> разница в днях между планом и реальностью, future -> цель, sum -> итоговая сумма, periods -> дней фактически, ndflSum -> сумма НДФЛ}

    // точность в процентах от итоговой суммы
    var deltaMaxPercent = 0.0001;

    // максимальное количество итераций
    var iterMax = 1500;

    // ставка НДФЛ
    const NDFL = options.tax || 0.13;
    const extraDaysMode0 = options.extraDaysMode0 || 0;

    payment = payment * (1 + comission);

    // костыль для в. 3.2
    const RD_modifier = -1; // realdata[0] - same realdata[1] in past 
    dayoffirstpayment++;
    dayoffirstpayload++;

    // костыль для отрицательных процентов
    const rateInc = 100000;
    var negativeGrow = (present >= future);

    var cash = present; //добавляем кэш на будущее для исп в паре с бондами 

    const bonds2 = {
      cash: 0,
      bondsTotal: 0,
      get total() {
        return this.cash + this.bondsTotal;
      },

      init(opts, cash) {
        this.opts = opts;
        if (this.opts.couponRate === undefined) this.opts.couponRate = (this.opts.coupon / this.opts.frequency) / this.opts.price;
        this.cash = cash;
        this.bondsTotal = 0;
        this.uB(cash);
      },

      uB(s) {
        if (isNaN(s)) { return s; }
        var d = s - this.total;

        //console.log('s', s, 'd', d,'CR',this.opts.couponRate); // t

        this.cash += this.bondsTotal * (1 + this.opts.couponRate) + d;

        //console.log('cash', this.cash); // t

        if (this.cash < 0) {
          this.cash = 0;
          this.bondsTotal = 0;
        }
        else {
          if (this.cash >= this.opts.price) {
            let t = this.cash % this.opts.price;
            this.bondsTotal = this.cash - t;
            this.cash = t;
          }
        }
        if (isNaN(s)) { console.log(this.total); }
        return this.total;
      }

    }

    ///////////////////////////////////////////
    function ff(rate, periods, present, payment, paymentper, payload, payloadper, p1 = 1, p2 = 1, realdata = []) {
      //    var p1 = dayoffirstpayment;
      //    var p2 = dayoffirstpayload;

      var res = present;

      if (options.bond !== undefined) {
        bonds2.init(options.bond, present);
        //	console.log( present, bonds2.total, bonds2.cash, bonds2.bondsTotal );
      }

      rate += 1;
      for (var x = 1; x <= periods; x++) {

        if (realdata[x + RD_modifier] !== undefined) {
          res = res * (1 + realdata[x + RD_modifier].scale);
          res += realdata[x + RD_modifier].payload - realdata[x + RD_modifier].payment;
          if (!--p2) { p2 = payloadper; }
          if (!--p1) { p1 = paymentper; }
        } else {
          res = res * rate;
          if (!--p2) { p2 = payloadper; res += payload; }
          if (!--p1) { p1 = paymentper; res -= payment; }
        }

        if (options.bond !== undefined) {
          //console.log( 'bef', res );
          res = bonds2.uB(res);
          //console.log( 'aft', res );
        }

      }
      return res;
    }
    function ff3(rate, periods, present, payment, paymentper, payload, payloadper, p1 = 1, p2 = 1, realdata = []) {
      var res = present;

      if (options.bond !== undefined) {
        bonds2.init(options.bond, present);
      }

      rate += 1;
      for (var x = 1; x <= periods; x++) {
        res = res * rate;
        if (realdata[x + RD_modifier] !== undefined) {
          res += realdata[x + RD_modifier].payload - realdata[x + RD_modifier].payment;
          if (!--p2) { p2 = payloadper; }
          if (!--p1) { p1 = paymentper; }
        } else {
          if (!--p2) { p2 = payloadper; res += payload; }
          if (!--p1) { p1 = paymentper; res -= payment; }
        }

        if (options.bond !== undefined) {
          res = bonds2.uB(res);
        }

      }
      return res;
    }
    function ffFull(rate, periods, present, payment, paymentper, payload, payloadper, p1 = 1, p2 = 1, realdata = []) {
      //    var p1 = dayoffirstpayment;
      //    var p2 = dayoffirstpayload;

      var res = present;

      if (options.bond !== undefined) {
        bonds2.init(options.bond, present);
      }

      var ndflSum = 0;
      var purePayment = 0;
      rate += 1;
      var factDay = -1;
      for (var x = 1; x <= periods; x++) {
        if (realdata[x + RD_modifier] !== undefined) {
          res = res * (1 + realdata[x + RD_modifier].scale);
          res += realdata[x + RD_modifier].payload - realdata[x + RD_modifier].payment;
          purePayment += realdata[x + RD_modifier].payment;
          if (!--p2) { p2 = payloadper; }
          if (!--p1) { p1 = paymentper; }
        } else {
          res = res * rate;
          if (!--p2) { p2 = payloadper; res += payload; }
          if (!--p1) {
            p1 = paymentper;
            res -= payment;
            purePayment += payment;
          }
        }

        if (options.bond !== undefined) {
          res = bonds2.uB(res);
        }

        if (options.customRate === undefined) { if (res >= future && factDay == -1) factDay = x; }
        else if (x > lastRDDay && res >= future && factDay == -1) factDay = x;

      }
      x--;
      var extraDays = 0;
      var res1 = res;

      var t = 0;

      if (negativeGrow && options.customRate === undefined) {
        if (lastRDDay >= periods) t = 9999;
        else t = 10000;
      }

      while (res < future && t < 10000 && res >= -payload) {
        t++;
        extraDays++;
        res = res * rate;
        if (!--p2) { p2 = payloadper; res += payload; }
        if (!--p1) {
          p1 = paymentper;
          res -= payment;
          purePayment += payment;
        }

        if (options.bond !== undefined) {
          res = bonds2.uB(res);
        }

      }

      ndflSum = purePayment * NDFL;
      purePayment = purePayment - ndflSum;
      if (factDay === -1) factDay = x + extraDays;
      if (res < 0) res = 0;
      return { sum: res, extraDays, factDay, periods: x + extraDays, daysDiff: factDay - periods, ndflSum, purePayment };
    }

    function getRate(realdata = []) {
      var minrate = 0;
      var maxrate = 0;
      var current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

      var negativeFlag = false;

      while (((current > (future + deltaMax)) || (current < future)) && (iterMax > 0)) {
        current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

        if (rate < 0) {
          negativeFlag = true;
          rate += rateInc;
          maxrate += rateInc;
          minrate += rateInc;
        }

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

        if (negativeFlag) {
          negativeFlag = false;
          rate -= rateInc;
          maxrate -= rateInc;
          minrate -= rateInc;
        }

        //console.log('---', current, rate);

      }
      return rate;
    }

    var deltaMax = future * deltaMaxPercent / 100;
    var guess = (((future + periods * (payment)) / present) ** (1 / periods)) - 1;
    var delta = guess;
    var rate = guess;
    var daysExtend = 0;

    var averageRate = 0;

    var rateRecommended = 0;

    var current = 0;

    var drd = 0;
    var rdgtp = false;
    var lastRDDay = -1;
    for (var x = 1; x <= periods; x++) {
      if (realdata[x + RD_modifier] !== undefined) {
        drd++;
        lastRDDay = x;
        averageRate += realdata[x + RD_modifier].scale;
      }
    }
    averageRate = averageRate / drd;

    var averageProf = 'not calculating';
    if (options.getAverage) var averageProf = ff(averageRate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

    if (drd >= periods) rdgtp = true;

    if (options.customRate !== undefined) {

      if (options.customFuture === undefined) {
        future = ff3(options.customRate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);
      } else {
        future = options.customFuture;
      }
      var negativeGrow = (present >= future);

      if (drd >= periods) rateRecommended = options.customRate;
      else rateRecommended = getRate(realdata);

      current = ffFull(options.customRate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

      if (current.sum == 0) {
        console.log('вход в пустоту');
        rateRecommended = 0.3;
        current = ffFull(rateRecommended, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);
      }

      if (!rdgtp && !extraDaysMode0) current.extraDays = 0;

      return { rate: options.customRate, extraDays: current.extraDays, rateRecommended, daysDiff: current.daysDiff, future, sum: current.sum, periods: current.periods, ndflSum: current.ndflSum, purePayment: current.purePayment, averageRate, averageProf };
    }

    var baseRate = options.customBaseRate || getRate();

    if (drd >= periods) rateRecommended = baseRate;
    else rateRecommended = getRate(realdata);

    current = ffFull(baseRate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

    if (!rdgtp && !extraDaysMode0) current.extraDays = 0;

    return { rate: baseRate, rateRecommended, extraDays: current.extraDays, daysDiff: current.daysDiff, future, sum: current.sum, periods: current.periods, ndflSum: current.ndflSum, purePayment: current.purePayment, averageRate, averageProf };
  }

  var d = extRateReal2(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment, dayoffirstpayload, comission, realdata, options);
  var dataArr1 = getDataRate(d.rate, present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment - 1, dayoffirstpayload - 1, comission, realdata, options);
  options.bond = undefined;
  var d2 = extRateReal2(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment, dayoffirstpayload, comission, realdata, options);
  var dataArr2 = getDataRate(d2.rate, present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment - 1, dayoffirstpayload - 1, comission, realdata, options);


  return { rate: d.rate, ratewithoutbond: d2.rate, rateRecommended: d.rateRecommended, extraDays: d.extraDays, daysDiff: d.daysDiff, future: d.future, sum: d.sum, periods: d.periods, ndflSum: d.ndflSum, purePayment: d.purePayment, averageRate: d.averageRate, averageProf: d.averageProf, series1: dataArr1, series2: dataArr2 };

}

// Возвращает: { rate -> Минимальная доходность в день, rateRecommended -> базовая доходность без учета рилдата, extraDays -> дополнительные дни при необходимости, daysDiff -> разница в днях между планом и реальностью, future -> цель, sum -> итоговая сумма, periods -> дней фактически, ndflSum -> сумма НДФЛ}

/////////////////////////// 
//  ^ END extRateReal ^  //
///////////////////////////