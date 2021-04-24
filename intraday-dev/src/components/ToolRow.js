import React, { useContext, useRef, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { numWithSpaces } from "../utils/format";
import { Select } from "antd";

const { Option } = Select;

function sortInputFirst(searchVal, options) {
  return options.sort((a, b) => {
    a = a.label.substr(0, searchVal.length).toLowerCase();
    b = b.label.substr(0, searchVal.length).toLowerCase();
    searchVal = searchVal.toLowerCase();

    if (a == searchVal) {
      if (b != searchVal) return -1;
    } else if (b == searchVal) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

export const ToolRow = ({ tableIdx, rowIdx, tool, options }) => {
  const { tools, updateTool } = useContext(GlobalContext);

  const selectRef = useRef(null);

  const [searchVal, setSearchVal] = useState("");

  const precision = (x) =>
    x.toString().includes(".") ? x.toString().split(".").pop().length : 0;

  const priceStepPrecision = precision(tool.priceStep.toString());

  return (
    <div className="tool-row">
      <div className="col tool">
        <Select
          onSearch={(value) => setSearchVal(value)}
          ref={selectRef}
          showSearch
          optionFilterProp="children"
          value={tool.idx}
          style={{ width: "100%" }}
          dropdownStyle={{ fontFamily: "Circe" }}
          onChange={(optionIdx) => {
            updateTool(
              tableIdx,
              rowIdx,
              tools[optionIdx].code,
              tools[optionIdx].ref.toolType
            );
          }}
        >
          {sortInputFirst(searchVal, options).map((option) => (
            <Option key={option.idx} value={option.idx}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
      <div className="col price-go">
        <div className="row title">Цена/ГО</div>
        <div className="row value">
          <span className="price">{numWithSpaces(tool.price)}</span>
          <span className="go">
            {" "}
            / {numWithSpaces(tool.guarantee.toFixed())}
          </span>
        </div>
      </div>
      <div className="contracts col">
        <div className="row title">Контракты</div>
        <div className="row value">{tool.contracts}</div>
      </div>
      <div className="adr col">
        <div className="row title">ADR</div>
        <div className="row value">{numWithSpaces(tool.adrValue)}</div>
      </div>
      <div className="stop col">
        <div className="row title">Стоп ₽/$</div>
        <div className="row value">
          {numWithSpaces(tool.stop.toFixed(priceStepPrecision))}
        </div>
      </div>
    </div>
  );
};