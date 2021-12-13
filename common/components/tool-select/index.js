import React, { useState, useContext } from "react";
import { Select, Tooltip } from "antd";
const { Option } = Select;
import { LoadingOutlined } from "@ant-design/icons";

import { Context } from "../BaseComponent";

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

  return (
    <Tooltip title={errorMessage} visible={errorMessage?.length > 0}>
      <Select
        className={errorMessage && "error"}
        disabled={toolsLoading || toolSelectDisabled}
        loading={toolsLoading || toolSelectDisabled}
        value={toolsLoading ? 0 : value}
        showSearch
        onChange={async currentToolIndex => {
          const tools = context.getTools();
          const currentTool = tools[currentToolIndex];
          const currentToolCode = currentTool.code;
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
            tools.map((tool, index) => (
              <Option key={index} value={index} title={String(tool)}>
                {String(tool)}
              </Option>
            ))
        }
      </Select>
    </Tooltip>
  );
}