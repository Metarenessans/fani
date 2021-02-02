import croppNumber from "./cropp-number";

test("Обрезание до одного числа после запятой", () => {

  expect(croppNumber(120      , 1)).toBe(120);
  expect(croppNumber(120.641  , 1)).toBe(120.6);
  expect(croppNumber(120.0001 , 1)).toBe(120);

});

test("Обрезание до двух чисел после запятой", () => {

  expect(croppNumber(120      , 2)).toBe(120);
  expect(croppNumber(120.641  , 2)).toBe(120.64);
  expect(croppNumber(120.0001 , 2)).toBe(120);

});

test("Обрезание всех чисел после запятой", () => {

  expect(croppNumber(120      , 0)).toBe(120);
  expect(croppNumber(120.123  , 0)).toBe(120);
  expect(croppNumber(120.4444 , 0)).toBe(120);
  expect(croppNumber(120.4004 , 0)).toBe(120);

});

test("Обрезание всех чисел после запятой с отрицательной основой", () => {

  expect(croppNumber(-120      , 0)).toBe(-120);
  expect(croppNumber(-120.123  , 0)).toBe(-120);
  expect(croppNumber(-120.4444 , 0)).toBe(-120);
  expect(croppNumber(-120.4004 , 0)).toBe(-120);

});
