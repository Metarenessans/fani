import { Tools } from "../../../../common/tools"
import extRateReal from "./rate"
import Data from "./data"

const depoStart = 1_000_000;
const depoEnd   = 3_000_000;
const days      = 3;
const { rate } = extRateReal(
  depoStart,
  depoEnd,
  0,
  20,
  0,
  20,
  days,
  20,
  20,
  0,
  {},
);

const settings = {
  $mode:            0,
  $start:           depoStart,
  $percent:         9.99814,
  $length:          days,
  $rate:            rate * 100,
  $rateRequired:    null,
  $payment:         0,
  $paymentInterval: 20,
  $payload:         0,
  $payloadInterval: 20,
  $tool:            Tools.create()
};
const data = new Data();
data.build(settings);

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

test("Правильно считает первый день", () => {
  // Длина массива равна длине и настроек
  expect(data.length).toEqual(settings.$length);
  // Начальный депозит первого дня равен начальному депозиту из статика
  expect(data[0].depoStart).toEqual(settings.$start);
  expect(data[0].depoEnd).toEqual(1_442_250);
  expect(data[0].goal).toEqual(442_250);
  expect(data[0].contracts).toEqual(37);
});

test("Правильно считает второй день", () => {
  // Начальный депозит второго дня всегда больше начального депозита первого
  expect(data[1].depoStart).toEqual(data[0].depoEnd);
  expect(data[1].depoEnd).toEqual(2_080_085);
  expect(data[1].goal).toEqual(637_835);
  // expect(data[0].contracts).toEqual(37);
});

test("Целевой депозит последнего дня совпадает с планом с погрешностью в 0.1%", () => {
  expect(data[data.length - 1].depoEnd)
    .toBeWithinRange(
      depoEnd - (depoEnd / 1_000),
      depoEnd + (depoEnd / 1_000)
    );
})