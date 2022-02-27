import { Tools } from "../../../../common/tools"
import extRateReal from "./rate"
import Data from "./data"

const depoStart = 1_000_000;
const depoEnd = 3_000_000;
const days = 3;
const { rate } = extRateReal(depoStart, depoEnd, 0, 20, 0, 20, days, 20, 20, 0, {});

/** @type {import("./data").Options} */
const settings = {
  $mode: 0,
  $start: depoStart,
  $percent: 9.99814,
  $length: days,
  $rate: rate * 100,
  $payment: 0,
  $paymentInterval: 20,
  $payload: 0,
  $payloadInterval: 20,
  $tool: Tools.createArray()[0]
};
const data = new Data();
data.build(settings);

const tool = Tools.createArray()[0];

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    }
    else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },
  toBeClose(received, expected) {
    const floor   = expected - 10;
    const ceiling = expected + 10;
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    }
    else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },
});

describe("Первый режим", () => {

  const mode = 0;

  describe("Дефолтный кейс: 260д 1млн - 3млн", () => {
    const days = 260;
    const depoStart = 1_000_000;
    const depoEnd   = 3_000_000;

    const { rate, sum, series1 } = extRateReal(
      depoStart,
      depoEnd,
      0, 20,
      0, 20,
      days,
      20,
      20
    );

    /** @type {import("./data").Options} */
    const settings = {
      $mode:    mode,
      $start:   depoStart,
      $percent: 10,
      $length:  days,
      $rate:    rate * 100,
      $tool:    tool
    };
    /** @type {import("./data").DataInstance} */
    const data = new Data(settings);

    describe("Целевое депо в последний день", () => {
      const value = data[data.length - 1].depoEnd;
      test("Совпадает с формулой Милоша с точностью +-10р", () => {
        expect(value).toBeClose(sum);
      });

      test("Приходит к цели с точностью +-10р", () => {
        expect(value).toBeClose(depoEnd);
      });
    });

    test("Плановый график совпадает с формулой Милоша", () => {
      data.forEach((day, index) => {
        expect(day.depoEndPlan).toBeCloseTo(series1[index], 0);
      });
    });

    test("Первый день", () => {
      const firstDay = data[0];
      // Начальный депозит первого дня равен начальному депозиту из статика
      expect(firstDay.depoStart).toEqual(settings.$start);
      expect(firstDay.goal).toEqual(4_234);
      expect(firstDay.depoEnd).toEqual(1_004_234);
    });

    test("Второй день в первом режиме", () => {
      const secondDay = data[1];
      // Начальный депозит второго дня всегда больше начального депозита первого
      expect(secondDay.depoStart).toBeGreaterThanOrEqual(data[0].depoStart);
      expect(secondDay.depoStart).toEqual(data[0].depoEnd);
      expect(secondDay.goal).toBeClose(4_248);
      expect(secondDay.depoEnd).toBeClose(1_008_486);
    });
  });

});

describe("Второй режим", () => {

  const mode = 1;

  describe("5 дней, 1млн по 1%", () => {
    const depoStart = 1_000_000;
    const days = 5;
    const rate = 1;

    const { sum, series1 } = extRateReal(
      depoStart,
      null,
      0, 20,
      0, 20,
      days,
      20,
      20,
      0,
      {},
      { customRate: rate / 100 },
    );

    const settings = {
      $mode:   mode,
      $start:  depoStart,
      $length: days,
      $rate:   rate,
      $tool:   tool
    };
    /** @type {import("./data").DataInstance} */
    const data = new Data(settings);

    test("Плановый график совпадает с формулой Милоша", () => {
      data.forEach((day, index) => {
        expect(day.depoEndPlan).toBeCloseTo(series1[index], 0);
      });
    });
    
    test("Депозит на последний день совпадает с формулой Милоша", () => {
      expect(data[data.length - 1].depoEnd).toBeCloseTo(sum, 0);
    });
  });

  test("3 дня, начиная с 1млн по 1%", () => {
    const mode = 1;
    const depoStart = 1_000_000;
    const days = 3;
    const { rate, sum } = extRateReal(
      depoStart,
      null,
      0, 20,
      0, 20,
      days,
      20, 20,
      0,
      {},
      { customRate: 0.01 },
    );

    const settings = {
      $mode: mode,
      $start: depoStart,
      $percent: 10,
      $length: days,
      $rate: rate * 100,
      $rateRequired: null,
      $payment: 0,
      $paymentInterval: 20,
      $payload: 0,
      $payloadInterval: 20,
      $tool: Tools.createArray()[0]
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
  });

});