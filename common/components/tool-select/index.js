import React, { useState, useContext } from "react";
import { Select, Tooltip } from "antd";
const { Option } = Select;
import { LoadingOutlined } from "@ant-design/icons";

import { Context } from "../BaseComponent";

import sortToolsBySearchValue from "../../utils/sort-tools-by-search-value";

export default function ToolSelect({
  errorMessage,
  value,
  onChange,
  onFocus,
  onBlur
}) {
  const context = useContext(Context);
  const { state } = context;
  const { toolsLoading, toolSelectDisabled } = state;

  const tools = context.getTools();

  const [searchValue, setSearchValue] = useState("");

  return (
    <Tooltip title={errorMessage} visible={errorMessage?.length > 0}>
      <Select
        className={errorMessage && "error"}
        disabled={toolsLoading || toolSelectDisabled}
        loading={toolsLoading || toolSelectDisabled}
        value={toolsLoading && tools.length == 0 ? 0 : value}
        showSearch
        onSearch={value => setSearchValue(value)}
        onChange={async currentToolIndex => {
          const tools = context.getTools();
          const currentTool = tools[currentToolIndex];
          const currentToolCode = currentTool.code;
          await context.setStateAsync({ currentToolCode, isToolsDropdownOpen: false });
          if (onChange) {
            onChange(currentToolIndex);
          }
        }}
        onFocus={() => {
          context.setState({ isToolsDropdownOpen: true });
          if (onFocus) {
            onFocus();
          }
        }}
        onBlur={() => {
          context.setState({ isToolsDropdownOpen: false });
          if (onBlur) {
            onBlur();
          }
        }}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        style={{ width: "100%" }}
      >
        {toolsLoading
          ?
            <Option key={0} value={0}>
              <LoadingOutlined style={{ marginRight: ".2em" }} />
              Загрузка...
            </Option>
          :
            sortToolsBySearchValue(searchValue, tools).map((tool, index) => (
              <Option key={index} value={index} title={String(tool)}>
                {String(tool)}
              </Option>
            ))
        }
      </Select>
    </Tooltip>
  );
}