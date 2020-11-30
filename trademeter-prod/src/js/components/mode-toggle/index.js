import React from 'react'
import PropTypes from "prop-types"
import { Radio } from 'antd/es'

import { cloneDeep as clone } from "lodash"

import { Consumer } from "../../app"
import { updateChart } from "../../components/chart"

import "./style.scss"

let lastRealData = {};

const ModeToggle = props => {

  function handleModeChange(mode) {
    let { data, realData, currentDay } = this.state;
    // TODO: looks weird. simplify it?
    let days = this.state.days[mode];
    let state = {};

    if (Object.keys(lastRealData).length) {
      const tempRealData = clone(realData);
      realData     = clone(lastRealData);
      lastRealData = clone(tempRealData);
    }
    else {
      lastRealData = clone(realData);
      realData = {};
    }

    // В новой вкладке меньше дней, чем в предыдущей
    if (days < data.length) {
      // Текущий день больше, чем макс кол-во дней в новой вкладке
      if (currentDay > days) {
        // Текущий день становится последним
        currentDay = days;
        Object.assign(state, { currentDay });
      }
    }


    this.setState(Object.assign(state, { mode, realData }), () => {
      // TODO: вернуть?
      // params.set("mode", value);

      // TODO: optimize because this.recalc() already uses this.updateChart()
      this.recalc()
        .then(() => this.setState({ realData }))
        .then(() => updateChart.call(this));
    });
  }

  return (
    <Consumer>
      {app => {
        const state = app.state;
        return (
          <Radio.Group
            name="radiogroup"
            className="tabs"
            value={state.mode}
            onChange={e => handleModeChange.call(app, e.target.value)}
          >
            <span className="tabs__centerline"></span>
            <Radio className="tabs__label tabs__label--1" disabled={state.saved && state.mode == 1} value={0}>
              <span className="prefix">Расчет</span>
              от желаемой суммы
            </Radio>
            <Radio className="tabs__label tabs__label--2" disabled={state.saved && state.mode == 0} value={1}>
              <span className="prefix">Расчет</span>
              от желаемой доходности
            </Radio>
          </Radio.Group>
        )
      }}
    </Consumer>
  )
};

ModeToggle.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default ModeToggle;