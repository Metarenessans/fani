import stepConverter from "./step-converter"
import { Tools } from "../../../../../common/tools"

test("Конвертация по простой формуле идет в обе стороны", () => {

  const tool = { currentPrice: 1_000 };
  const step = 5;

  expect(stepConverter.fromStepToPercents(step, tool))
    .toEqual(0.5);
  expect(stepConverter.fromPercentsToStep(0.5, tool))
    .toEqual(step);
});

test("Конвертация по сложной формуле для ФОРТС идет в обе стороны", () => {

  const contracts = 100;
  const tool = { 
    currentPrice: 1_000,
    dollarRate: 0,
    lotSize: 10,
    guarantee: 500,
    stepPrice: 0.1,
    priceStep: 0.01
  };
  const step = 5;

  expect(stepConverter.complexFromStepsToPercent(step, tool, contracts))
    .toEqual(10);

  expect(stepConverter.complexFromPercentToSteps(10, tool, contracts))
    .toEqual(step);
});

test("Конвертация по сложной формуле для акций идет в обе стороны", () => {

  const contracts = 100;
  const tool = { 
    currentPrice: 1_000,
    dollarRate: 1,
    lotSize: 10,
    guarantee: 500,
    stepPrice: 0.1,
    priceStep: 0.01
  };
  const step = 5;

  expect(stepConverter.complexFromStepsToPercent(step, tool, contracts))
    .toEqual(10);
  expect(stepConverter.complexFromPercentToSteps(10, tool, contracts))
    .toEqual(step);
});

test("Работает на реальных инструментах", () => {
  const contracts = 100;
  const step = 5;

  const tools = Tools.createArray();
  for (let tool of tools) {
    const percent = stepConverter.complexFromStepsToPercent(step, tool, contracts);
    try {
      expect(stepConverter.complexFromPercentToSteps(percent, tool, contracts))
        .toBeCloseTo(step, 5);
    }
    catch (e) {
      console.error(tool.code, tool.dollarRate >= 1 ? "Акция" : "ФОРТС", e);
    }
  }
})