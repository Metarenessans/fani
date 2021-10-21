import fractionLength from "./fraction-length";

test("Правильно находит количество знаков после запятой", () => { 
  expect(fractionLength(1     )).toBe(0);
  expect(fractionLength(2.11  )).toBe(2);
  expect(fractionLength(1.123 )).toBe(3);
  expect(fractionLength(1.3224)).toBe(4);
});

test("Правильно находит количество знаков после запятой у отрицательных чисел", () => {
  expect(fractionLength(-1     )).toBe(0);
  expect(fractionLength(-2.1   )).toBe(1);
  expect(fractionLength(-2.11  )).toBe(2);
  expect(fractionLength(-1.123 )).toBe(3);
  expect(fractionLength(-1.3224)).toBe(4);
});
