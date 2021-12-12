import React from "react";
import { render, fireEvent } from "@testing-library/react";
import NumericInput from ".";

describe("Первый рендер", () => {
  const { container } = render(<NumericInput/>);
  expect(container).toBeTruthy();

  const inputElement = container.querySelector("input");

  test("По дефолту инпут пустой", () => {
    expect(inputElement.value).toEqual("");
  });

  test("В инпут помещается значение из props.defaultValue", () => {
    for (let value of [0, -1, 1, 2, null, undefined]) {
      const { container } = render(<NumericInput defaultValue={value}/>);
      const inputElement = container.querySelector("input");

      let expected = String(value);
      if (value == null) {
        expected = "";
      }
      expect(inputElement.value).toEqual(expected);
    }
  });
})

describe("Пропс defaultValue", () => {
  test("`NaN` не ломает инпут", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const { container, rerender } = render(
      <NumericInput defaultValue={NaN} onChange={onChange} onBlur={onBlur}/>
    );
    const inputElement = container.querySelector("input");
    expect(inputElement.value).toEqual("");
    expect(onChange).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();

    rerender(
      <NumericInput defaultValue={NaN} allowEmpty={false} onChange={onChange} onBlur={onBlur}/>
    );
    expect(inputElement.value).toEqual("0");
    expect(onBlur).not.toHaveBeenCalled();

    for (let i = 0; i < 5; i++) {
      rerender(<NumericInput defaultValue={NaN} onChange={onChange} onBlur={onBlur}/>);
      expect(inputElement.value).toEqual("");
      expect(onBlur).not.toHaveBeenCalled();
    }
  });
})

describe("Обновление инпута (onChange)", () => {
  let inputElement;
  let callback;

  beforeEach(() => {
    callback = jest.fn();
    const { container } = render(<NumericInput defaultValue={0} onChange={callback}/>);
    inputElement = container.querySelector("input");
  });

  describe("Во второй аргумент onChange передается отформатированное число", () => {
    test("0.n", () => {
      fireEvent.change(inputElement, { target: { value: "0.3" } });
      expect(inputElement.value).toEqual("0.3");
      // Коллбэк вызывается
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      // Проверка аргументов коллбэка
      const callbackArguments = callback.mock.calls[0];
      // Второй аргумент - значение из инпута
      expect(callbackArguments[1]).toEqual("0.3");
    });

    test("0,n", () => {
      fireEvent.change(inputElement, { target: { value: "0,3" } });
      expect(inputElement.value).toEqual("0,3");
      // Коллбэк вызывается
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      // Проверка аргументов коллбэка
      const callbackArguments = callback.mock.calls[0];
      // Второй аргумент - значение из инпута
      expect(callbackArguments[1]).toEqual("0.3");
    });

    test(",n", () => {
      fireEvent.change(inputElement, { target: { value: ",3" } });
      expect(inputElement.value).toEqual(",3");
      // Коллбэк вызывается
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      // Проверка аргументов коллбэка
      const callbackArguments = callback.mock.calls[0];
      // Второй аргумент - значение из инпута
      expect(callbackArguments[1]).toEqual("0.3");
    });

    test(".n", () => {
      fireEvent.change(inputElement, { target: { value: ".3" } });
      expect(inputElement.value).toEqual(".3");
      // Коллбэк вызывается
      expect(callback).toBeCalled();
      expect(callback).toBeCalledTimes(1);
      // Проверка аргументов коллбэка
      const callbackArguments = callback.mock.calls[0];
      // Второй аргумент - значение из инпута
      expect(callbackArguments[1]).toEqual("0.3");
    });
  });

  test("Стейт обновляется при вводе значения", () => {
    fireEvent.change(inputElement, { target: { value: "2" } });
    expect(inputElement.value).toEqual("2");
  });

  test("Автоматическая подстановка 0 перед точкой/запятой", () => {
    fireEvent.change(inputElement, { target: { value: "." } });
    expect(inputElement.value).toEqual("0.");

    fireEvent.change(inputElement, { target: { value: "-." } });
    expect(inputElement.value).toEqual("-0.");

    fireEvent.change(inputElement, { target: { value: "," } });
    expect(inputElement.value).toEqual("0,");

    fireEvent.change(inputElement, { target: { value: "-," } });
    expect(inputElement.value).toEqual("-0,");
  });

  test("Вставка из буфера обмена", () => {
    fireEvent.change(inputElement, { target: { value: "1 000 000" } });
    expect(inputElement.value).toEqual("1 000 000");

    fireEvent.change(inputElement, { target: { value: "-1 000 000" } });
    expect(inputElement.value).toEqual("-1 000 000");
    
    fireEvent.change(inputElement, { target: { value: ".9" } });
    expect(inputElement.value).toEqual(".9");

    fireEvent.change(inputElement, { target: { value: "-.9" } });
    expect(inputElement.value).toEqual("-.9");
  })
})

describe("Пропс `canBeNegative`", () => {

  test("Делает то же, что и `unsigned`", () => {
    // Проверка обратной совместимости,
    // пропс должен уметь считываеть как булевое значение, так и строку
    for (let truthy of [true, "true"]) {
      const initialValue = 0;
      const { container } = render(<NumericInput defaultValue={initialValue} canBeNegative={truthy}/>);
      const inputElement = container.querySelector("input");
      fireEvent.change(inputElement, { target: { value: "-" } });
      // Значение не должно измениться от предыдущего
      expect(inputElement.value).toEqual("-");
    }

    for (let falsy of [false, "false"]) {
      const initialValue = 0;
      const { container } = render(<NumericInput defaultValue={initialValue} canBeNegative={falsy}/>);
      const inputElement = container.querySelector("input");
      fireEvent.change(inputElement, { target: { value: "-" } });
      // Значение не должно измениться от предыдущего
      expect(inputElement.value).toEqual(String(initialValue));
    }
  });
})

describe("Пропс `unsigned`", () => {
  test("Нельзя вводить минус, если  пропс равен `true`", () => {
    // Проверка обратной совместимости,
    // пропс должен уметь считываеть как булевое значение, так и строку
    for (let value of [true, "true"]) {
      const initialValue = 0;
      const { container } = render(<NumericInput defaultValue={initialValue} unsigned={value}/>);
      const inputElement = container.querySelector("input");
      fireEvent.change(inputElement, { target: { value: "-" } });
      // Значение не должно измениться от предыдущего
      expect(inputElement.value).toEqual(String(initialValue));
    }
  });

  test("`min=0` должен иметь аналогичный эффект, что и `unsigned='true'`", () => {
    const initialValue = 0;
    const { container } = render(<NumericInput defaultValue={initialValue} min={0}/>);
    const inputElement = container.querySelector("input");
    fireEvent.change(inputElement, { target: { value: "-" } });
    // Значение не должно измениться от предыдущего
    expect(inputElement.value).toEqual(String(initialValue));
  });
})

describe("Пропс `allowEmpty`", () => {
  test("Выводит `0` если пропс равен `false`", () => {
    // Проверка обратной совместимости,
    // пропс должен уметь считываеть как булевое значение, так и строку
    for (let value of [false, "false"]) {
      const { container } = render(<NumericInput defaultValue={""} allowEmpty={value}/>);
      const inputElement = container.querySelector("input");
      expect(inputElement.value).toEqual("0");
    }
  });

  test("Оставляет пустое значение если пропс равен `true`", () => {
    // Проверка обратной совместимости,
    // пропс должен уметь считываеть как булевое значение, так и строку
    for (let value of [true, "true"]) {
      const { container } = render(<NumericInput defaultValue={""} allowEmpty={value}/>);
      const inputElement = container.querySelector("input");
      expect(inputElement.value).toEqual("");
    }
  });
})