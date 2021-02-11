import React from "react"

import NumericInput from "../../../../../../common/components/numeric-input"

import round        from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"

// import "./style.scss"

export default function ReversedByingRow({
  data,
  contracts,
  options,
  onPercentChange,
  onLengthChange,
  onStepInPercentChange,
}) {
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
          onBlur={value => onLengthChange(value)}
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
          onBlur={value => onPercentChange(value)}
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
          onBlur={value => onStepInPercentChange(value)}
        />
      </label>

      <div className="settings-generator-content__print-group">
        <span>Суммарный % докупки</span>
        <b>{
          round(
            data
              .map(row => row.contracts)
              .reduce((acc, curr) => acc + curr, 0)
            /
            (contracts || 1)
            *
            100
            , 1
          )
        }%</b>
      </div>

    </div>
  )
};