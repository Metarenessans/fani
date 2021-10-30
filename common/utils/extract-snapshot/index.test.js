import extractSnapshot from ".";

const Component = {
  state: {},
  setState(state, callback) {
    this.state = { ...this.state, ...state };
    callback?.();
  }
};

/** @type {extractSnapshot} */
const func = extractSnapshot.bind(Component);

test("works properly", async () => {
  const snapshot = require("../../api/snapshot.json");
  const parseFn = () => ({
    test: true
  });

  await func(snapshot.data, parseFn);
  expect(Component.state).toHaveProperty("test");
  expect(Component.state.id).toEqual(snapshot.data.id);
})