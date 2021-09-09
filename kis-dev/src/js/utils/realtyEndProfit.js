// import round from "../../../../common/utils/round"

function round(value, decimals = 0) {
  if (value == null) return value;

  let dec = Math.pow(10, decimals);
  return Math.round(value * dec) / dec;
}

/** Недвижимость
 * возвращает итоговую сумму в зависимости от периода
 * @period      количество месяцев
 * 
*/
export default function realtyEndProfit(period, rentIncome, monthAppend, monthPay, monthOutcome, profitPercent, firstPay) {
  const arr = []

  for (let i = 0; i < period; i++) {
    // ежемесячный баланс
    let monthBalance = (rentIncome + monthAppend) - (monthPay + monthOutcome)

    // упущенная прибыль
    let lostProfit = (firstPay - ((rentIncome + monthAppend) - (monthPay + monthOutcome))) / 12 * profitPercent

    // итог
    let endSum = monthBalance - lostProfit

    if (i == 1) {
      let currentBalance = (firstPay - (arr[i - 1].monthBalance + rentIncome - monthPay)) / 12 * profitPercent

      monthBalance = arr[i - 1].monthBalance + (rentIncome + monthAppend) - (monthPay + monthOutcome);
      lostProfit = currentBalance;
      endSum = monthBalance + -lostProfit;
    }

    if (i == 2) {
      monthBalance = arr[i - 1].monthBalance + (rentIncome + monthAppend) - (monthPay + monthOutcome);
      lostProfit = arr[i - 1].lostProfit + (firstPay - monthBalance) / 12 * profitPercent;
      endSum = monthBalance + -lostProfit;
    }

    if (i > 2) {
      monthBalance = arr[i - 1].monthBalance + (rentIncome + monthAppend) - (monthPay + monthOutcome);
      lostProfit = arr[i - 1].lostProfit + (firstPay - monthBalance) / 12 * profitPercent;
      endSum = monthBalance + -lostProfit;
    }

    arr[i] = {
      monthBalance: round(monthBalance),
      lostProfit: round(lostProfit),
      endSum: round(endSum)
    }
  }

  return arr[arr.length - 1].endSum
}