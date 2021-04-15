import React, { memo } from 'react'
import PropTypes from "prop-types"
import { Radio } from 'antd/es'

import "./style.scss"

const ModeToggle = ({ mode, saved, onChange }) => {

  return (
    <Radio.Group
      name="radiogroup"
      className="tabs"
      value={mode}
      onChange={e => onChange && onChange(e.target.value)}
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

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.mode === nextProps.mode && prevProps.saved === nextProps.saved;
};

ModeToggle.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default memo(ModeToggle, arePropsEqual);