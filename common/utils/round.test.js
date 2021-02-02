import round from "./round";

test("Округляет до двух чисел после запятой", () => {

  expect( round(120     ,   2) ).toBe(120);
  expect( round(120.1   ,   2) ).toBe(120.1);
  expect( round(120.001 ,   2) ).toBe(120);
  expect( round(120.010 ,   2) ).toBe(120.01);
  expect( round(120.111 ,   2) ).toBe(120.11);
  expect( round(120.826 ,   2) ).toBe(120.83);
  expect( round(120.1856  , 2) ).toBe(120.19);
  expect( round(120.86777 , 2) ).toBe(120.87);
  expect( round(120.010007, 2) ).toBe(120.01);

});

test("Правильно работает с отрицательными числами", () => {

  expect( round(-120     ,   2) ).toBe(-120);
  expect( round(-120.1   ,   2) ).toBe(-120.1);
  expect( round(-120.001 ,   2) ).toBe(-120);
  expect( round(-120.010 ,   2) ).toBe(-120.01);
  expect( round(-120.111 ,   2) ).toBe(-120.11);
  expect( round(-120.826 ,   2) ).toBe(-120.83);
  expect( round(-120.1856  , 2) ).toBe(-120.19);
  expect( round(-120.86777 , 2) ).toBe(-120.87);
  expect( round(-120.010007, 2) ).toBe(-120.01);

});


