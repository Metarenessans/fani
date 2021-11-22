import React, { useContext } from 'react'
import { Tooltip, Select, Checkbox} from 'antd/es'

import { Tools } from "../../../../../common/tools"


import { StateContext } from "../../App"
import { cloneDeep } from "lodash"
import ResultPanel from "../result-panel"


import {
  PlusOutlined,
  MinusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import NumericInput from "../../../../../common/components/numeric-input"
import CrossButton from "../../../../../common/components/cross-button"

import round from "../../../../../common/utils/round"
import num2str from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'
import { data } from 'jquery'

import "./style.scss"

const { Option } = Select;

export default class ThirdStep extends React.Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <StateContext.Consumer>
        {context => {
          const { state } = context;
          const { data, currentRowIndex } = state
          const { reportMonitor, deals} = data[currentRowIndex];
          return (
            <div {...this.props} className="third-step">
              <ResultPanel/>
              <div className="title">
                Мониторинг раппорта
              </div>

              <div className="third-step-table">
                {/* row */}
                <div className="table-row">
                  <div className="table-base-column">
                    <div className="table-base-column-key">
                      Параметры на отслеживание
                    </div>

                    <div className="table-base-column-value">
                      Восприяте общего направления тренда
                    </div>
                  </div>
                  <div className="table-extra-column-container scroll-hide">
                    {deals.map((item, index) => {
                      const { baseTrendDirection } = reportMonitor[index];
                      return (
                        <div className="table-extra-column" key={index}>
                          <Tooltip
                            key={index}
                            title={() => {
                              let hours   = String(new Date(item.enterTime).getHours());
                              let minutes = String(new Date(item.enterTime).getMinutes());
                              let formattedHours   = hours.split("").length === 1 ? "0" + hours : hours;
                              let formattedMinutes = minutes.split("").length === 1 ? "0" + minutes : minutes;
                              let time = formattedHours + ":" + formattedMinutes;
                              
                              let selectedToolIndex  = Tools.getToolIndexByCode(state.tools, item.currentToolCode);
                              let selectedToolData   = state.tools[selectedToolIndex];
                              let preferableToolName = selectedToolData.shortName || selectedToolData.fullName;

                              if (item.enterTime != null) {
                                return time + " | " + preferableToolName;
                              }
                              else return preferableToolName;
                            }}
                          >
                            <div className="table-extra-column-key">
                              {(index + 1) + " " + "сделка"}
                            </div>
                          </Tooltip>

                          <div className="table-extra-column-value">
                            <div className="table-extra-column-value-row">
                              <p>Long</p>
                              <Checkbox
                                className="green"
                                checked={baseTrendDirection === true}
                                onChange={ e => {
                                  const data = cloneDeep(state.data);
                                  
                                  if (baseTrendDirection === true) {
                                    data[currentRowIndex].reportMonitor[index].baseTrendDirection = null;
                                  }
                                  else {
                                    data[currentRowIndex].reportMonitor[index].baseTrendDirection = true;
                                  }
                                  context.setState({ data });
                                }}
                              />
                            </div>
                            <div className="table-extra-column-value-row">
                              <p>Short</p>
                              <Checkbox
                                className="red"
                                checked={baseTrendDirection === false}
                                onChange={e => {
                                  const data = cloneDeep(state.data);

                                  if (baseTrendDirection === false) {
                                    data[currentRowIndex].reportMonitor[index].baseTrendDirection = null;
                                  }
                                  else {
                                    data[currentRowIndex].reportMonitor[index].baseTrendDirection = false;
                                  }
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* row */}

                {/* row */}
                <div className="table-row">
                  <div className="table-base-column">
                    <div className="table-base-column-value">
                      Восприятие направления в моменте
                    </div>
                  </div>
                  <div className="table-extra-column-container scroll-hide">
                    {deals.map((item, index) => {
                      const { momentDirection } = reportMonitor[index];
                      return (
                        <div className="table-extra-column" key={index}>
                          <div className="table-extra-column-value">
                            <div className="table-extra-column-value-row">
                              <p>Long</p>
                              <Checkbox
                                className="green"
                                checked={momentDirection === true}
                                onChange={ e => {
                                  const data = cloneDeep(state.data);

                                  if (momentDirection === true) {
                                    data[currentRowIndex].reportMonitor[index].momentDirection = null;
                                  }
                                  else {
                                    data[currentRowIndex].reportMonitor[index].momentDirection = true;
                                  }
                                  context.setState({ data });
                                }}
                              />
                            </div>
                            <div className="table-extra-column-value-row">
                              <p>Short</p>
                              <Checkbox
                                className="red"
                                checked={momentDirection === false}
                                onChange={ e => {
                                  const data = cloneDeep(state.data);

                                  if (momentDirection === false) {
                                    data[currentRowIndex].reportMonitor[index].momentDirection = null;
                                  }
                                  else {
                                    data[currentRowIndex].reportMonitor[index].momentDirection = false;
                                  }
                                  context.setState({ data });
                                  
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* row */}

                {/* row */}
                <div className="table-row">
                  <div className="table-base-column">
                    <div className="table-base-column-value">
                      Сомнения в принятом решении
                    </div>
                  </div>
                  <div className="table-extra-column-container scroll-hide">
                    {deals.map((item, index) => {
                      const { doubts } = reportMonitor[index];
                      return (
                        <div className="table-extra-column" key={index}>
                          <div className="table-extra-column-value">
                            <div className="table-extra-column-value-row">
                              <p>Нет</p>
                              <Checkbox
                                className="green"
                                checked={doubts === true}
                                onChange={e => {
                                  const data = cloneDeep(state.data);

                                  if (doubts === true) {
                                    data[currentRowIndex].reportMonitor[index].doubts = null;
                                  }
                                  else {
                                    data[currentRowIndex].reportMonitor[index].doubts = true;
                                  }
                                  context.setState({ data });
                                }}
                              />
                            </div>
                            <div className="table-extra-column-value-row">
                              <p>Да</p>
                              <Checkbox
                                className="red"
                                checked={doubts === false}
                                onChange={e => {
                                  const data = cloneDeep(state.data);

                                  if (doubts === false) {
                                    data[currentRowIndex].reportMonitor[index].doubts = null;
                                  }
                                  else {
                                    data[currentRowIndex].reportMonitor[index].doubts = false;
                                  }
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* row */}

                {/* row */}
                <div className="table-row">
                  <div className="table-base-column table-base-column--result">
                    <p>Результат сделки</p>
                  </div>
                  <div className="table-extra-column-container">
                    {deals.map((item, index) => {
                      const { result } = item
                      return (
                        <div className="table-extra-column" key={index}>
                          <div className="table-extra-column-value table-extra-column-value--result">
                            <span className={clsx("circle", result >= 0 ? (result == 0 ? "default" :"positive") : "negative")} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* row */}
              </div>

            </div>
          )
        }}
      </StateContext.Consumer>
    )
  }
}


