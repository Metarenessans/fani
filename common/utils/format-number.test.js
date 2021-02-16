import formatNumber from "./format-number"

test("Правильно расставляем разделители между разрядами", () => {
  expect(formatNumber(1)).toEqual("1");
  expect(formatNumber(1_000)).toEqual("1 000");
  expect(formatNumber(10_000)).toEqual("10 000");
  expect(formatNumber(1_000_000)).toEqual("1 000 000");
});

test("Корректно работает с отрицательными числами", () => {
  expect(formatNumber(-1)).toEqual("-1");
  expect(formatNumber(-1_000)).toEqual("-1 000");
  expect(formatNumber(-100_000)).toEqual("-100 000");
  expect(formatNumber(-1_000_000)).toEqual("-1 000 000");
});

test("Не изменяет дробную часть", () => {
  expect(formatNumber(.5)).toEqual("0.5");
  expect(formatNumber(.0005)).toEqual("0.0005");
  expect(formatNumber(1.5)).toEqual("1.5");
  expect(formatNumber(1_000.5)).toEqual("1 000.5");
});
