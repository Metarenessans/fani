/* 
Использование:		kisDepositMonth(
                        annualRate,					// годовая ставка по вкладу
                        present,						// первоначальный вклад
                        days, 							// дней всего вклад ( но выплаты процентов считаются как помесячные! )
                        payment, 						// ежемесячный вывод
                        payload, 						// ежемесячное пополнение
                        paymentper=1, 
                        payloadper=1, 
                        dayoffirstpayment=0, 
                        dayoffirstpayload=0
                  )

Возвращает:				{			
                        total,								 // общая сумма на конец периода
                        firstMonthTotalResult, //	общая сумма на конец первого месяца	
                        averageMonthIncome, 	 // среднемесячные проценты по вкладу за период
                        data:	[ 
                            0:	{							 // номер месяца с начала ( отчет с [0] )
                                  total,			 // общая сумма на конец месяца
                                  rateIncome	 // проценты по вкладу в данном месяце 
                                },
                                	
                            ...
                          	
                            n: ...						// вплоть до последнего месяца, но если остаются дни до конца месяца, то добавляется данные на конец периода 
                        ] 
                  } 
                	
// ПРИМЕР
// получаем сколько начисленно процентов в последнем месяце вклада:
let result = kisDepositMonth( 0.12, 1_000_000, 36, 0, 0 )
let lastMonthRateIncome = result.data[ result.data.length - 1 ].rateIncome
*/

/** инструмент -"Вклад"
 * @total         	      общая сумма на конец периода
   @firstMonthTotalResult	общая сумма на конец первого месяца
   @averageMonthIncome    среднемесячные проценты по вкладу за период
*/

export default function kisDepositMonth(annualRate, present, days, payment, payload, paymentper = 1, payloadper = 1, dayoffirstpayment = 0, dayoffirstpayload = 0, comission = 0, realdata = [], customRate = undefined) {

  const bankCalendar = {
    daysToMonths(days) {
      /* first alg */
      // let cd = days*3;
      // let months = Math.trunc( cd / 65 );
      // let daysLeft = ( cd - ( months * 65 ) ) / 3;
      // let daysLeftInt = Math.ceil( daysLeft );
      /* second alg */
      let months = 0;
      while (days >= 260) {
        months += 12;
        days -= 260;
      }
      while (days >= 22) {
        months += 1;
        days -= 22;
      }
      return { months, days }
    }
  }

  var res = present;

  var rate = (1 + annualRate) ** (1 / 12);
  var rateM = rate - 1;
  var resM = 0;
  var bankDate = bankCalendar.daysToMonths(days);
  var months = bankDate.months;
  var daysleft = bankDate.days;
  var periods = months;

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

  payment = payment * (1 + comission);

  while (x <= periods) {
    if (realdata[x + RD_modifier] !== undefined) {
      if (customRate === undefined) res = res * (1 + realdata[x + RD_modifier].scale);
      else { resM = res * rateM; res += resM }
      p1--; p2--;
      res += realdata[x + RD_modifier].payload;
      res -= realdata[x + RD_modifier].payment;
      if (!p2) { p2 = payloadper; }
      if (!p1) { p1 = paymentper; }
    } else {
      resM = res * rateM;
      res += resM;
      p1--; p2--;
      if (!p2) { p2 = payloadper; res += payload; }
      if (!p1) { p1 = paymentper; res -= payment; }
    }
    x++;

    if (res < 0) {
      res = 0;
      arr.push({ total: res, rateIncome: resM });
      break;
    }

    arr.push({ total: res, rateIncome: resM });

  }

  var summM = 0;

  if (months < 1) arr = [{ total: present, rateIncome: 0 }]
  else if (daysleft > 0) arr.push({ total: arr[arr.length - 1].total, rateIncome: 0 });

  var firstMonthTotalResult = arr[0].total.toFixed(2);

  var data = arr.map((r) => ({ total: r.total.toFixed(2), rateIncome: r.rateIncome.toFixed(2) }));

  for (let item of arr) { summM += item.rateIncome; }
  var averageMonthIncome = (summM / months).toFixed(2);
  var total = arr[arr.length - 1].total.toFixed(2);

  return { total, firstMonthTotalResult, averageMonthIncome, data };
}