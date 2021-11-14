import typeOf from "./type-of"

test("Работает с самыми частотными литералами", () => {
  expect(typeOf(0)).toEqual("number");
  expect(typeOf("")).toEqual("string");
  expect(typeOf(true)).toEqual("boolean");
  expect(typeOf([])).toEqual("array");
  expect(typeOf({})).toEqual("object");
  expect(typeOf(function(){})).toEqual("function");
  expect(typeOf(() => {})).toEqual("function");
})

test("Работает с числовыми значениями", () => {
  expect(typeOf(NaN)).toEqual("number");
  expect(typeOf(Infinity)).toEqual("number");
})