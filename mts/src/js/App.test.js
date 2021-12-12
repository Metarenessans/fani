const ComponentMock = {
  state: {},
  setState(state, callback) {
    this.state = { ...this.state, ...state };
    callback?.();
  },
  async setStateAsync(state) {
    this.state = { ...this.state, ...state };
  }
};

test("Hello world!", () => {
  expect(true).toEqual(true);
});