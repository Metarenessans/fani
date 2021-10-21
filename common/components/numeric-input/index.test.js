import React from "react"
import { render, fireEvent, getNodeText } from "@testing-library/react"

import NumericInput from "./index"

describe("Первый рендер", () => {
  const { container } = render(<NumericInput/>);
  expect(container).toBeInTheDocument();
  expect(container).toBeTruthy();

  const inputElement = container.querySelector("input");
  // console.dir(inputElement);

  test("По дефолту инпут пустой", () => {
    expect(inputElement.value).toEqual("");
  });


  test("В инпут помещается значение из props.defaultValue", () => {
    for (let value of [0, -1, 1, 2, null, undefined]) {
      const { container } = render(<NumericInput defaultValue={value} />);
      const inputElement = container.querySelector("input");

      let expected = String(value);
      if (value == null) {
        expected = "";
      }
      expect(inputElement.value).toEqual(expected);
    }
  });

})

describe("defaultValue", () => {
  test("NaN не ломает инпут", () => {
    const { container } = render(<NumericInput defaultValue={NaN} />);
    const inputElement = container.querySelector("input");
    expect(inputElement.value).toEqual("");
  });
})