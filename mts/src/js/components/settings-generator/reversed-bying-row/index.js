import React from "react"

import NumericInput from "../../../../../../common/components/numeric-input"

import round        from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"

// import "./style.scss"

export default function ReversedByingRow({
  data,
  contracts,
  options,
  onPropertyChange,
}) {
  const contractsSum = data
    .map(row => row.contracts)
    .reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="settings-generator-content__row settings-generator-content__opt-row">

      <label className="input-group">
        <span className="input-group__label">Кол-во докупок</span>
        <NumericInput
          className="input-group__input"
          defaultValue={options.length}
          format={formatNumber}
          unsigned="true"
          placeholder="1"
          min={1}
          onBlur={length => onPropertyChange({ length })}
        />
      </label>

      <label className="input-group">
        <span className="input-group__label">% докупки</span>
        <NumericInput
          className="input-group__input"
          defaultValue={options.percent}
          format={formatNumber}
          unsigned="true"
          min={0}
          onBlur={formatNumber => onPropertyChange({ formatNumber })}
        />
      </label>

      <label className="input-group">
        <span className="input-group__label">Шаг в %</span>
        <NumericInput
          className="input-group__input"
          defaultValue={options.stepInPercent}
          format={formatNumber}
          unsigned="true"
          min={0}
          onBlur={stepInPercent => onPropertyChange({ stepInPercent })}
        />
      </label>

      <div className="settings-generator-content__print-group">
        <span>Суммарный % докупки</span>
        <b>{round(contractsSum / (contracts || 1) * 100, 1)}%</b>
      </div>

    </div>
  )
};