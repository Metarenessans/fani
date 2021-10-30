import { App } from "./App"

const Component = {
  state: {},
  setState(state, callback) {
    this.state = { ...this.state, ...state };
    callback?.();
  },
  async setStateAsync(state) {
    this.state = { ...this.state, ...state };
    callback?.();
  }
};


test("Парсинг сейва", async () => {
  const fn = App.prototype.extractSave.bind(Component);

  const snapshot = require("../../../common/api/snapshot.json");
  try {
    await fn(snapshot.data);
  }
  catch (error) {
    console.log(error);
  }

  const prevState = Component.state;
  console.log(prevState);

  const fn2 = App.prototype.extractSnapshot.bind(Component);
  try {
    await fn2(snapshot);
  }
  catch (error) {
    console.log(error);
  }

  const currState = Component.state;
  console.log(currState);

  expect(prevState).toBe(currState);
})