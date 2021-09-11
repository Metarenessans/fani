import React, { memo, useState } from 'react'
import { Select } from 'antd/es'

import { isEqual } from 'lodash'

import sortInputFirst from "../../../../../common/utils/sort-input-first";

import {
  LoadingOutlined,
} from "@ant-design/icons"

const ToolSelect = ({ tools, value, disabled, onChange, toolsLoading, onFocus, onBlur }) => {

  const [searchVal, setSearchVal] = useState("");

  const options = tools.map((tool, idx) => {
    return {
      idx:   idx,
      label: String(tool),
    };
  });

  return (
    <Select
      onFocus={onFocus}
      onBlur={onBlur}
      value={value}
      loading={toolsLoading}
      disabled={disabled}
      onChange={index => onChange && onChange(index)}
      showSearch
      onSearch={value => setSearchVal(value)}
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      style={{ width: "100%" }}
    >
      {(() => {
        if (tools.length) {
          return sortInputFirst(searchVal, options).map((option) => (
            <Select.Option key={option.idx} value={option.idx} title={option.label}>
              {option.label}
            </Select.Option>
          ));
        }
        else {
          return (
            <Select.Option key={0} value={0}>
              <LoadingOutlined style={{ marginRight: ".2em" }} />
              Загрузка...
            </Select.Option>
          )
        }
      })()}
    </Select>
  )
}

export default memo(ToolSelect, (prevProps, nextProps) => {
  return prevProps.value == nextProps.value && isEqual(prevProps.tools, nextProps.tools && prevProps.toolsLoading == nextProps.toolsLoading)
});
