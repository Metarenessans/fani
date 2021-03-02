import React from "react"
import { render, fireEvent, getNodeText } from "@testing-library/react"

import NumericInput from "./index"

test("renders correctly", () => {
  const { container } = render(<NumericInput/>);
  expect(container).toBeTruthy();
})