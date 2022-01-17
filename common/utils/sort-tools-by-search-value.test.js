import sortToolsBySearchValue from "./sort-tools-by-search-value";
import { Tools } from "../tools";
import { cloneDeep } from "lodash";

test("Не меняет исходный массив", () => {
  const tools = Tools.createArray();
  const toolsClone = cloneDeep(tools);
  sortToolsBySearchValue("apple", tools);
  expect(tools).toEqual(toolsClone);
});