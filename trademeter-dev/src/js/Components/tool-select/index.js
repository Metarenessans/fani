import React, { memo } from 'react'
import { Select } from 'antd/es'

import { isEqual } from 'lodash'

import {
  LoadingOutlined,
} from "@ant-design/icons"

const ToolSelect = ({ tools, value, disabled, onChange }) => {
  return (
    <Select
      value={value}
      disabled={disabled}
      onChange={index => onChange && onChange(index)}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      style={{ width: "100%" }}
    >
      {(() => {
        if (tools.length) {
          return tools
            .map(tool => String(tool))
            .map((value, index) => 
              <Select.Option key={index} value={index}>{value}</Select.Option>
            )
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
  return prevProps.value == nextProps.value && isEqual(prevProps.tools, nextProps.tools)
});
