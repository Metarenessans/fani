import React from "react"
import { render, fireEvent, getNodeText } from "@testing-library/react"

import IterationsContainer from "./index.js"

test("renders correctly", () => {
  const { container } = render(<IterationsContainer
    expanded={true}
    data={[]}
    currentDay={1}
    placeholder={"-"}
  />);
  // expect(container).toBeTruthy();

  // const displayString = getNodeText(container.querySelector("li"));
  // expect(displayString).toEqual("");
})
