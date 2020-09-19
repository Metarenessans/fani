import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from "prop-types"
import { Radio } from 'antd/es'

import "./style.scss"

const ModeToggle = ({ mode, saved, onChange }) => {
  return (
    <Radio.Group
      key={mode}
      className="tabs"
      name="radiogroup"
      defaultValue={mode}
      onChange={e => onChange(e.target.value)}
    >
      <span className="tabs__centerline"></span>
      <Radio className="tabs__label tabs__label--1" disabled={saved && mode == 1} value={0}>
        <span className="prefix">Расчет</span>
          от желаемой суммы
      </Radio>
      <Radio className="tabs__label tabs__label--2" disabled={saved && mode == 0} value={1}>
        <span className="prefix">Расчет</span>
          от желаемой доходности
      </Radio>
    </Radio.Group>
  )
};

ModeToggle.propTypes = {
  mode: PropTypes.number.isRequired,
  saved: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ModeToggle;