import magnetToClosest from "./magnet-to-closest";

test("works properly", () => {
  expect(magnetToClosest(0, 3)).toEqual(0);
  expect(magnetToClosest(1, 3)).toEqual(0);
  expect(magnetToClosest(1.75, 3)).toEqual(3);
  expect(magnetToClosest(3.01, 3)).toEqual(3);
  expect(magnetToClosest(5, .01)).toEqual(5);
  expect(magnetToClosest(1.5, 3)).toEqual(3);
  expect(magnetToClosest(5.9, 1)).toEqual(6);
});

test("Результат всегда больше или равен шагу", () => {
  expect(magnetToClosest(0, 3)).toEqual(3);
  expect(magnetToClosest(1, 3)).toEqual(3);
});