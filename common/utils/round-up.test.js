import roundUp from "./round-up";

test("Округляет числа в большую сторону", () => {

  expect( roundUp(-1.2) ).toBe(-2);
  expect( roundUp(-1) ).toBe(-1);
  expect( roundUp(0) ).toBe(0);
  expect( roundUp(.1) ).toBe(1);
  expect( roundUp(.5) ).toBe(1);
  expect( roundUp(.9999) ).toBe(1);

});

test("Выдаёт ошибку если введён неверный тип значения", () => {

  expect( () => roundUp() ).toThrow();
  expect( () => roundUp(null) ).toThrow();
  expect( () => roundUp(undefined) ).toThrow();
  expect( () => roundUp("2") ).toThrow();
  expect( () => roundUp([]) ).toThrow();
  expect( () => roundUp({}) ).toThrow();

});