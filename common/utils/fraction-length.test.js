import fractionLength from "./fraction-length";


test("Подсчёт количества чисел после запятой", () => { 

  expect(fractionLength(1     )).toBe(0);
  expect(fractionLength(2.11  )).toBe(2);
  expect(fractionLength(1.123 )).toBe(3);
  expect(fractionLength(1.3224)).toBe(4);

});

test("Подсчёт количества чисел после запятой с отрицательной основой", () => { 

  expect(fractionLength(-1     )).toBe(0);
  expect(fractionLength(-2.1   )).toBe(1);
  expect(fractionLength(-2.11  )).toBe(2);
  expect(fractionLength(-1.123 )).toBe(3);
  expect(fractionLength(-1.3224)).toBe(4);

});
