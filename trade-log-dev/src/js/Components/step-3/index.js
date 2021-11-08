import React from 'react'
import { Button, Tooltip, Select, Progress, Checkbox, Input } from 'antd/es'

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

    this.state = {
      extraRows: [
        { result:  true, firstRow: null, secondRow: null, thirdRow: null},
        { result:  true, firstRow: null, secondRow: null, thirdRow: null},
        { result: false, firstRow: null, secondRow: null, thirdRow: null},
        { result:  true, firstRow: null, secondRow: null, thirdRow: null},
        { result:  true, firstRow: null, secondRow: null, thirdRow: null},
        { result:  true, firstRow: null, secondRow: null, thirdRow: null},
        { result: false, firstRow: null, secondRow: null, thirdRow: null},
        { result:  true, firstRow: null, secondRow: null, thirdRow: null},
      ]
    }
  }

  
  render() {
    let { extraRows } = this.state

    return (
      <div className="third-step">
        <ResultPanel/>
        <div className="title">
          Мониторинг рапорта
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
              {extraRows.map((item, index) => {
                const { firstRow } = extraRows[index]
                return (
                  <div className="table-extra-column">
                    <div className="table-extra-column-key">
                      {(index + 1) + " " + "сделка"}
                    </div>

                    <div className="table-extra-column-value">
                      <div className="table-extra-column-value-row">
                        <p>Long</p>
                        <Checkbox
                          className="green"
                          checked={firstRow == "long"}
                          onChange={e => {
                            const extraRowsClone = [...extraRows];
                            extraRowsClone[index]["firstRow"] = "long";
                            this.setState({ extraRows: extraRowsClone });
                          }}
                        />
                      </div>
                      <div className="table-extra-column-value-row">
                        <p>Short</p>
                        <Checkbox
                          className="red"
                          checked={firstRow == "short"}
                          onChange={e => {
                            const extraRowsClone = [...extraRows];
                            extraRowsClone[index]["firstRow"] = "short";
                            this.setState({ extraRows: extraRowsClone });
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
              {extraRows.map((item, index) => {
                const { secondRow } = extraRows[index]
                return (
                  <div className="table-extra-column">
                    <div className="table-extra-column-value">
                      <div className="table-extra-column-value-row">
                        <p>Long</p>
                        <Checkbox
                          className="green"
                          checked={secondRow == "long"}
                          onChange={e => {
                            const extraRowsClone = [...extraRows];
                            extraRowsClone[index]["secondRow"] = "long";
                            this.setState({ extraRows: extraRowsClone });
                          }}
                        />
                      </div>
                      <div className="table-extra-column-value-row">
                        <p>Short</p>
                        <Checkbox
                          className="red"
                          checked={secondRow == "short"}
                          onChange={e => {
                            const extraRowsClone = [...extraRows];
                            extraRowsClone[index]["secondRow"] = "short";
                            this.setState({ extraRows: extraRowsClone });
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
              {extraRows.map((item, index) => {
                const { thirdRow } = extraRows[index]
                return (
                  <div className="table-extra-column">
                    <div className="table-extra-column-value">
                      <div className="table-extra-column-value-row">
                        <p>Нет</p>
                        <Checkbox
                          className="green"
                          checked={thirdRow == true}
                          onChange={e => {
                            const extraRowsClone = [...extraRows];
                            extraRowsClone[index]["thirdRow"] = true;
                            this.setState({ extraRows: extraRowsClone });
                          }}
                        />
                      </div>
                      <div className="table-extra-column-value-row">
                        <p>Да</p>
                        <Checkbox
                          className="red"
                          checked={thirdRow == false}
                          onChange={e => {
                            const extraRowsClone = [...extraRows];
                            extraRowsClone[index]["thirdRow"] = false;
                            this.setState({ extraRows: extraRowsClone });
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
              {extraRows.map((item, index) => {
                const { result } = extraRows[index]
                return (
                  <div className="table-extra-column">
                    <div className="table-extra-column-value table-extra-column-value--result">
                      <span className={clsx("circle", result ? "positive" : "negative")} />
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
  }
}


