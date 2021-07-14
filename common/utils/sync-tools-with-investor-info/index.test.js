import syncToolsWithInvestorInfo from "./index"
import { Tools } from "../../tools"

const context = {
  state: {
    investorInfo: {
      "deposit": 1500000,
      "status": "KSUR",
    },
    tools: Tools.createArray()
  },

  setState(state, callback) {
    callback();
  }
};

test("Returns a promise", () => {
  return expect(syncToolsWithInvestorInfo()).toBeInstanceOf(Promise);
})

test("Resolved promise provides tools", () => {
  return syncToolsWithInvestorInfo.call(context).then(tools => {
    expect(tools).toBeDefined();
    expect(tools).toBeInstanceOf(Array);
    expect(tools.length).toEqual(context.state.tools.length);
  });
})

test("Throws an error if no context provided", () => {
  expect.assertions(1);
  return syncToolsWithInvestorInfo().catch(e => expect(e).not.toBeUndefined());
})