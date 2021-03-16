import React from "react"
import { render, fireEvent, getNodeText } from "@testing-library/react"

import NumericInput from "./index"

test("renders correctly", () => {
  const { container } = render(<NumericInput/>);
  expect(container).toBeTruthy();

  const inputElement = container.querySelector("input");
  // console.dir(inputElement);

  describe("По дефолту инпут пустой", () => {
    expect(inputElement.value).toEqual("");
  });

  describe("В инпут помещается значение из props.defaultValue", () => {
    const { container } = render(<NumericInput defaultValue={0} />);
    const inputElement = container.querySelector("input");
    expect(inputElement.value).toEqual("0");
  });

})