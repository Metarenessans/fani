import React from "react"
import NumericInput from "../../../../../../common/components/numeric-input"
import formatNumber from "../../../../../../common/utils/format-number"

import "./style.scss"

export default function TemplateRow({ title }) {
  return (
    <div className="settings-generator-content__row settings-generator-content__opt-row">

      <label className="input-group">
        <span className="input-group__label">Кол-во закрытий</span>
        <NumericInput
          className="input-group__input"
          defaultValue={0}
          format={formatNumber}
          unsigned="true"
          min={1}
          max={Infinity}
          onBlur={val => {}}
        />
      </label>

      <label className="input-group">
        <span className="input-group__label">% закрытия</span>
        <NumericInput
          className="input-group__input"
          defaultValue={0}
          format={formatNumber}
          unsigned="true"
          min={0}
          max={Infinity}
          onBlur={val => {}}
        />
      </label>

      <label className="input-group">
        <span className="input-group__label">Шаг</span>
        <NumericInput
          className="input-group__input"
          defaultValue={0}
          format={formatNumber}
          unsigned="true"
          min={0}
          max={Infinity}
          onBlur={val => {}}
        />
      </label>

      <div className="settings-generator-content__print-group">
        <span>Суммарный % закрытия</span>
        <b>59%</b>
      </div>

    </div>
  )
};