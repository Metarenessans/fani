import React, { useState, useContext } from "react";
import { Select, Tooltip } from "antd";
const { Option } = Select;
import { LoadingOutlined } from "@ant-design/icons";
import clsx from "clsx";

import sortInputBySearhValue from "../../utils/sort-tools-by-search-value";

import { Context } from "../BaseComponent";

export default function ToolSelect({
  test,
  className,
  errorMessage,
  errorTrigger,
  value,
  onChange,
  onFocus,
  onBlur,
  tooltipPlacement
}) {
  const context = useContext(Context);
  const { state } = context;
  const { toolsLoading, toolSelectDisabled } = state;
  const tools = context.getTools();
  
  const [searchValue, setSearchValue] = useState("");
  
  const code = tools[value]?.code;
  const filteredTools = sortInputBySearhValue(searchValue, tools);
  value = Math.max(filteredTools.findIndex(tool => tool.code === code), 0);

  return (
    <Tooltip
      title={errorMessage}
      trigger={errorTrigger}
      defaultVisible={errorTrigger ? false : errorMessage?.length > 0}
      placement={tooltipPlacement}
    >
      <Select
        className={clsx(className, errorMessage && "error")}
        disabled={toolsLoading || toolSelectDisabled}
        loading={toolsLoading || toolSelectDisabled}
        value={toolsLoading ? 0 : value}
        showSearch
        onSearch={value => setSearchValue(value)}
        onChange={async currentToolIndex => {
          const tools = context.getTools();
          const filteredTools = sortInputBySearhValue(searchValue, tools);
          const currentTool = filteredTools[currentToolIndex];
          const currentToolCode = currentTool.code;
          currentToolIndex = tools.findIndex(tool => tool.code == currentToolCode);
          await context.setStateAsync({ currentToolCode, isToolsDropdownOpen: false });
          if (onChange) {
            onChange(currentToolIndex, currentToolCode);
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
            filteredTools.map((tool, index) => (
              <Option
                key={index}
                value={index}
                title={String(tool)}
                data-code={tool.code}
              >
                {String(tool)}
              </Option>
            ))
        }
      </Select>
    </Tooltip>
  );
}