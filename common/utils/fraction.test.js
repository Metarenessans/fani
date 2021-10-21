import fraction from "./fraction";

test("Правильно находит дробную часть", () => { 
  expect(fraction(0)).toBe("");
  expect(fraction(1)).toBe("");
  expect(fraction(2.1)).toBe("1");
  expect(fraction(1.123)).toBe("123");
  expect(fraction(1.12345678)).toBe("12345678");
});

test("Работает с отрицательными числами", () => {
  expect(fraction(-1)).toBe("");
  expect(fraction(-2.1)).toBe("1");
  expect(fraction(-1.123)).toBe("123");
  expect(fraction(-1.12345678)).toBe("12345678");
});

test("Работает с дробными числами меньше 1", () => {
  expect(fraction(.0008)).toBe("0008");
  expect(fraction(.9999)).toBe("9999");
});
