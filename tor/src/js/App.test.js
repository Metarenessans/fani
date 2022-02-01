import React from "react";
import { cloneDeep } from "lodash";
import { act, mockComponent } from "react-dom/test-utils";
import { render, fireEvent } from "@testing-library/react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });

import { App } from "./App";

test("Загруженный сейв пушится в стейт", async () => {
  const wrapper = shallow(<App test="true"/>);
  /** @type {App} */
  const component = wrapper.instance();

  const prevState = cloneDeep(component.state);
  const response = component.getTestSnapshot();
  await component.fetchLastModifiedSnapshot({ fallback: response });
  expect(component.state.id).not.toEqual(null);
  expect(component.state.tax).toEqual(13);

  // expect(component.state).not.toEqual(prevState);
  // console.log(expect(component.getTitle()).toEqual(response.data.name));
  // expect(component.getTitle()).toEqual(response.data.name);
});