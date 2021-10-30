import extractSnapshot from ".";

const Component = {
  state: { initial: 0 },
  setState(state, callback) {
    this.state = { ...this.state, ...state };
    callback?.();
  }
};

/** @type {extractSnapshot} */
const func = extractSnapshot.bind(Component);

const snapshot = require("../../api/snapshot.json");

test("Данные, которые возвращаются из коллбэка, пушатся в стейт", async () => {
  const parseFn = () => ({ test: true });

  await func(snapshot.data, parseFn);
  // Старые знаения в стейте остались неизмененными
  expect(Component.state.initial).toEqual(0);
  // Новые значения добавились в стейт
  expect(Component.state).toHaveProperty("test");
  expect(Component.state.id).toEqual(snapshot.data.id);
})

test("Коллбэк вызывается", async () => {
  const callback = jest.fn();

  await func(snapshot.data, callback);
  // Коллбэк должен вызываеться всего один раз
  expect(callback).toHaveBeenCalled();
  expect(callback).toHaveBeenCalledTimes(1);
  // Проверка аргументов коллбэка
  const callbackArguments = callback.mock.calls[0];
  // Первый аргумент - распаршенный static
  expect(callbackArguments[0]).toStrictEqual(JSON.parse(snapshot.data.static));
})