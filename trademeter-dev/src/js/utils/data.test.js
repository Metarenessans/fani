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

test("Правильно считает первый день в первом режиме", () => {
  // Длина массива равна длине и настроек
  expect(data.length).toEqual(settings.$length);
  // Начальный депозит первого дня равен начальному депозиту из статика
  expect(data[0].depoStart).toEqual(settings.$start);
  expect(data[0].depoEnd).toEqual(1_442_250);
  expect(data[0].goal).toEqual(442_250);
  expect(data[0].contracts).toEqual(32);
});

test("Правильно считает второй день в первом режиме", () => {
  // Начальный депозит второго дня всегда больше начального депозита первого
  expect(data[1].depoStart).toBeGreaterThanOrEqual(data[0].depoStart);
  expect(data[1].depoStart).toEqual(data[0].depoEnd);
  expect(data[1].depoEnd).toEqual(2_080_085);
  expect(data[1].goal).toEqual(637_835);
});

test("Целевой депозит последнего дня совпадает с планом с погрешностью в 5%", () => {
  expect(data[data.length - 1].depoEnd)
    .toBeWithinRange(
      depoEnd - (depoEnd * 0.05),
      depoEnd + (depoEnd * 0.05)
    );
})

test("Кейс второй режим, 3 дня, начиная с 1млн по 1%", () => {
  const mode = 1;
  const depoStart = 1_000_000;
  const days = 3;
  const { rate, sum } = extRateReal(
    depoStart,
    null,
    0, 20,
    0, 20,
    days,
    20,
    20,
    0,
    {},
    { customRate: 0.01 },
  );

  const settings = {
    $mode:            mode,
    $start:           depoStart,
    $percent:         10,
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

  /* Первый день */
  // План был равен 1 010 000
  expect(data[0].depoEndPlan).toEqual(1_010_000);

  // Докидываем 10 тысяч в первый день
  data[0].payload = 10_000;
  data.build(settings);
  
  // После пополнения план равен 1 020 000
  expect(data[0].depoEndReal).toEqual(1_010_000);

  expect(data[0].depoEndPlan).toEqual(1_020_000);
  expect(data[0].getRealDepoEnd(mode)).toEqual(1_020_000);
  
  /* Второй день */
  // На второй день целевой депозит должен быть равен 1 032 000
  expect(data[1].depoStart).toEqual(1_020_000);
  expect(data[1].depoEndPlan).toEqual(1_030_200);
  expect(data[1].getRealDepoEnd(mode)).toEqual(1_030_200);
  
  // Докидываем еще 10 тысяч во второй день
  data[1].payload = 10_000;
  data.build(settings);

  expect(data[1].depoEndReal).toEqual(1_020_000);
  
  expect(data[1].depoEndPlan).toEqual(1_040_200);
  expect(data[1].getRealDepoEnd(mode)).toEqual(1_040_200);

  expect(data[data.length - 1].depoEnd)
    .toBeWithinRange(
      sum - (sum * .05),
      sum + (sum * .05)
    );
})