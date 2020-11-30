import React from 'react'
import { Select } from "antd/es"

export default function SaveSelect(props) {
  return (
    <Select
      disabled={state.loading}
      loading={state.loading}
      value={state.currentSaveIndex}
      onSelect={val => onSaveChange(val)}
      {...props}
    >
      <Select.Option key={0} value={0}>
        {state.loading ? "Загрузка..." : "Не выбрано"}
      </Select.Option>
      {state.saves.map((save, index) =>
        <Select.Option key={index + 1} value={index + 1}>
          {save.name}
        </Select.Option>
      )}
    </Select>
  )
}