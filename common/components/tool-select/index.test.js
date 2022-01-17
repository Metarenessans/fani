import React from "react";
import { render, fireEvent, waitFor, logDOM } from "@testing-library/react";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'

import BaseComponent from "../BaseComponent";
import { Tools } from "../../tools";
import ToolSelect from ".";

import delay from "../../utils/delay";

const waitForPromises = () => new Promise(setImmediate);

const tools = Tools.createArray();

describe("Первый рендер", () => {
  const onChangeFn = jest.fn();
  const { container, debug, baseElement } = render(
    <BaseComponent tools={tools}>
      <ToolSelect value={0} onChange={onChangeFn} />
    </BaseComponent>
  );
  
  const select = container.querySelector(".ant-select");
  // Имитируем клик, чтобы отрендерить выпадающий список
  fireEvent.click(select);
  
  const menu = baseElement.querySelector(".ant-select-dropdown-menu");
  const menuItems = [...menu.querySelectorAll("li")];
  // console.log(menuItems.map(element => element.innerHTML));
  
  test("Рендерится корректно", () => {
    expect(select).toBeTruthy();
    expect(select).toBeInTheDocument();

    expect(menu).toBeTruthy();
    expect(menu).toBeInTheDocument();

    // Опции совпадают с инструментами 1 к 1
    expect(tools.every((tool, index) => String(tool) === menuItems[index].innerHTML)).toEqual(true);
  });
  
  describe("Выбор по клику", async () => {
    const code = "AAPL";
    const index = menuItems.findIndex(option => option.getAttribute("data-code") === code);
    // Клик по второму пункту меню (AAPL)
    menuItems[index].click();

    test("В onChange передаются правильные аргументы: 1) Индекс 2) Код инструмента", () => {
      // Коллбэк вызывается
      expect(onChangeFn).toBeCalled();
      // Проверка аргументов коллбэка
      const callbackArguments = onChangeFn.mock.calls[0];
      expect(callbackArguments[0]).toEqual(index);
      expect(callbackArguments[1]).toEqual(code);

      expect(tools[index].code).toEqual(code);
    })

  });

  describe("Выбор через клавиатуру", () => {
    const input = select.querySelector("input");
    const search = "ab";
    fireEvent.change(input, { target: { value: search } });
    expect(input.value).toEqual(search);
    
    const menuItems = [...menu.querySelectorAll("li")];
    console.log(menuItems.map(element => element.innerHTML));
    expect(menuItems.length).toBeGreaterThan(0);
    
    const code = menuItems[0].getAttribute("data-code");
    const index = tools.findIndex(tool => tool.code === code);

    test.todo("Сортировка элементов меню");

    test("name", async () => {
      input.focus();
      userEvent.keyboard("{enter}");

      await waitForPromises();

      // Проверка аргументов коллбэка
      const callbackArguments = onChangeFn.mock.calls.pop();
      expect(callbackArguments[0]).toEqual(index);
      expect(callbackArguments[1]).toEqual(code);

      expect(tools[index].code).toEqual(code);
    });
  })
});