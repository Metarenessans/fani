import React from "react";
import { cloneDeep } from "lodash";
import { act, mockComponent } from "react-dom/test-utils";
import { render, fireEvent } from "@testing-library/react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });

import BaseComponent from "./BaseComponent";

test("Загруженный сейв пушится в стейт", async () => {
  const wrapper = shallow(<BaseComponent />);
  /** @type {BaseComponent} */
  const component = wrapper.instance();

  const prevState = cloneDeep(component.state);
  const response = {
    error: false,
    data: {
      id: 9999,
      name: "Custom Name",
      dateCreate: 1619442172
    } 
  }
  await component.fetchLastModifiedSnapshot({ fallback: response });

  expect(component.state).not.toEqual(prevState);
  expect(component.state.id).not.toEqual(null);
  expect(component.getTitle()).toEqual(response.data.name);
});