import syncToolsWithInvestorInfo from "./index"
import { Tools } from "../../tools"

const context = {
  state: {
    investorInfo: {
      deposit: 1_500_000,
      status:  "KSUR",
      type:    "LONG"
    },
    tools: Tools.createArray()
  },
  setState(state, callback) {
    this.state = { ...this.state, ...state };
    callback?.();
  }
};

/** @type {syncToolsWithInvestorInfo} */
const func = syncToolsWithInvestorInfo.bind(context);

test("Возвращает промис", () => {
  return expect(func()).toBeInstanceOf(Promise);
})

test("В `then` передается массив обновленных инструментов", async () => {
  const tools = await func();
  expect(tools).toBeDefined();
  expect(tools).toBeInstanceOf(Array);
  expect(tools.length).toEqual(context.state.tools.length);
})

describe("Работает с заготовленным массивом инструментов на примере Apple Inc (AAPL)", () => {
  const parsedTools = Tools.createArray();
  context.setState({ tools: parsedTools });

  test("КСУР ЛОНГ", async () => {
    const tools = await func({ status: "KSUR", type: "LONG" });
    const tool = tools.find(tool => tool.code == "AAPL");
    expect(tool).toBeDefined();
    // У ГО может быть дробная часть, которая не интересует нас во время этого теста
    expect(Math.floor(tool.guarantee)).toEqual(4516);
  });

  test("КПУР ЛОНГ", async () => {
    const tools = await func({ status: "KPUR", type: "LONG" });
    const tool = tools.find(tool => tool.code == "AAPL");
    expect(tool).toBeDefined();
    // У ГО может быть дробная часть, которая не интересует нас во время этого теста
    expect(Math.floor(tool.guarantee)).toEqual(2580);
  });

  test("КСУР ЛОНГ с флагом `useDefault`", async () => {
    const tools = await func({ status: "KSUR", type: "SHORT" }, { useDefault: true });
    const tool = tools.find(tool => tool.code == "AAPL");
    expect(tool).toBeDefined();
    expect(Math.floor(tool.guarantee)).toEqual(10322);
  });
})

test("Throws an error if no context provided", () => {
  expect.assertions(1);
  return syncToolsWithInvestorInfo().catch(error => expect(error).not.toBeUndefined());
})