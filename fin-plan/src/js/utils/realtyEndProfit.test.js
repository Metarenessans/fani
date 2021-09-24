import realtyEndProfit from "./realtyEndProfit"

const rentIncome    = 20_000
const monthAppend   = 0
const monthPay      = 48_000
const monthOutcome  = 0
const profitPercent = .04
const firstPay      = 1_000_000

test("Проверка итогов по окончанию различных сроков - Недвижимость", () => {
  expect(realtyEndProfit(1   , rentIncome, monthAppend, monthPay, monthOutcome, profitPercent, firstPay)).toEqual(-31_427);
  expect(realtyEndProfit(5   , rentIncome, monthAppend, monthPay, monthOutcome, profitPercent, firstPay)).toEqual(-154_640);
  expect(realtyEndProfit(6   , rentIncome, monthAppend, monthPay, monthOutcome, profitPercent, firstPay)).toEqual(-186_533);
  expect(realtyEndProfit(85  , rentIncome, monthAppend, monthPay, monthOutcome, profitPercent, firstPay)).toEqual(-3_001_040);
  expect(realtyEndProfit(120 , rentIncome, monthAppend, monthPay, monthOutcome, profitPercent, firstPay)).toEqual(-4_434_173);
});
