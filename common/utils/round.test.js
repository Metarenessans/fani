import round from "./round";

test("Работает с нулем", () => {
  expect(round(0, 1)).toBe(0);
  expect(round(0, 2)).toBe(0);
  expect(round(0, 5)).toBe(0);
})

test("Округляет до двух чисел после запятой", () => {

  expect(round(0.01, 1)).toBe(0);
  expect(round(0.04, 1)).toBe(0);
  expect(round(0.05, 1)).toBe(0.1);
  expect(round(0.09, 1)).toBe(0.1);

  expect(round(0.01, 2)).toBe(0.01);
  expect(round(0.25, 2)).toBe(0.25);

  expect(round(0.257, 2)).toBe(0.26);
  expect(round(0.499, 2)).toBe(0.5);
  expect(round(0.505, 2)).toBe(0.51);
  expect(round(0.999, 2)).toBe(1);

  expect( round(0.867997, 4)).toBe(0.868);
  expect( round(0.000007, 4)).toBe(0);
  expect( round(0.000707, 4)).toBe(0.0007);

});

test("Правильно работает с отрицательными числами", () => {

  expect( round(-120     ,   2) ).toBe(-120);
  expect( round(-120.001 ,   2) ).toBe(-120);
  expect( round(-120.1   ,   2) ).toBe(-120.1);
  expect( round(-120.010 ,   2) ).toBe(-120.01);
  expect( round(-120.111 ,   2) ).toBe(-120.11);
  expect( round(-120.826 ,   2) ).toBe(-120.83);
  expect( round(-120.1856  , 2) ).toBe(-120.19);
  expect( round(-120.86777 , 2) ).toBe(-120.87);
  expect( round(-120.010007, 2) ).toBe(-120.01);

});

test("Использует Math.round, если не передан второй аргумент", () => {
  expect(round(0.1)).toBe(0);
  expect(round(0.5)).toBe(1);
  expect(round(0.9)).toBe(1);
});