import React from 'react'
import { Button, Tooltip, Select, Progress, Checkbox, TimePicker } from 'antd/es'
import moment from 'moment'

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

import { Tools, Tool, template, parseTool } from "../../../../../common/tools"
import CustomSlider from "../custom-slider"


import NumericInput from "../../../../../common/components/numeric-input"
import sortInputFirst from "../../../../../common/utils/sort-input-first"
import CrossButton from "../../../../../common/components/cross-button"

import TimeRangePicker from "../time-range-picker"

import round from "../../../../../common/utils/round"
import num2str from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'
import { data } from 'jquery'

import "./style.scss"

const { Option } = Select;

function onChangeTime(time, timeString) {
  console.log(timeString, "timeString");
}

export default class FirstStep extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      combineTable: [
        {
          load:   60.34,
          iterations: 5,
        },
        {
          load:    28.19,
          iterations: 20,
        },
      ],

      transactionRegister: [
        {
          enterTime:  null,
          short:     false,
          long:      false,
          impulse:   false,
          postponed: false,
          levels:    false,
          breakout:  false,
          result:        0,
          practiceStep:  0,
        },
      ]
    };
  }

  getOptions() {
    let { tools } = this.props;
    return tools.map((tool, idx) => {
      return {
        idx: idx,
        label: String(tool),
      };
    });
  }

  getCurrentToolIndex() {
    const { currentToolCode } = this.props;
    
    let { tools } = this.props;
    return Tools.getToolIndexByCode(tools, currentToolCode);
  }

  getSortedOptions() {
    let { searchVal } = this.props
    return sortInputFirst(searchVal, this.getOptions());
  }

  render() {
    let { combineTable, transactionRegister } = this.state
    let { 
      onChange, 
      currentRowIndex, 
      rowData, 
      tools, 
      setSeachVal,
      toolsLoading,
      isToolsDropdownOpen,
    } = this.props;

    let {
      enterTime,
      long,
      short,
      impulse,
      postponed,
      levels,
      breakout,
      result,
    } = rowData[currentRowIndex];

    return (
      <>
        <div className="first-step">

          <div className="title">
            Инсрументы предварительной выборки
          </div>

          <div className="pages-link-buttons">
            
            <a className="first-step-button" href="https://fani144.ru/trademeter/">
              Трейдометр
            </a>

            <a className="first-step-button" href="https://fani144.ru/intraday/">
              Интрадей портфель
            </a>

            <a className="first-step-button" href="https://fani144.ru/mts/">
              Мтс
            </a>

            <a className="first-step-button" href="https://fani144.ru/ksd/">
              Ксд
            </a>
          </div>


          <div className="title">
            Интрадей Трейдометр
          </div>

          <div className="first-step-combine-table">
            {combineTable.map((item, index) => {
              const {load, iterations} = item;
              return (
                <div className="combine-table-row">
                  <div className="combine-table-row-col">
                    {index === 0 && (
                      <div className="combine-table-row-key">
                        Инструмент
                      </div>
                    )}
                    <div className="combine-table-row-val combine-table-row-val--tool">
                      {/* Торговый инструмент */}
                      <Select
                        key={currentRowIndex}
                        value={toolsLoading && tools.length == 0 ? 0 : this.getCurrentToolIndex()}
                        onChange={currentToolIndex => {
                          const currentTool = tools[currentToolIndex];
                          const currentToolCode = currentTool.code;
                          onChange("currentToolCode", currentToolCode, currentRowIndex)
                        }}
                        disabled={toolsLoading}
                        loading={toolsLoading}
                        showSearch
                        onSearch={(value) => setSeachVal(value)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%" }}
                      >
                        {(() => {
                          if (toolsLoading && tools.length == 0) {
                            return (
                              <Option key={0} value={0}>
                                <LoadingOutlined style={{ marginRight: ".2em" }} />
                                Загрузка...
                              </Option>
                            )
                          }
                          else {
                            return this.getSortedOptions().map((option) => (
                              <Option key={option.idx} value={option.idx}>
                                {option.label}
                              </Option>
                            ));
                          }
                        })()}
                      </Select>
                    </div>
                  </div>

                  <div className="combine-table-row-col">
                    {index === 0 && (
                      <div className="combine-table-row-key">
                        Калибровка
                      </div>
                    )}
                    <div className="combine-table-row-val combine-table-row-val-slider">
                      {/* <div className="sliders-container">
                      </div> */}
                      <div className="combine-table-row-val-row">
                        <span>Загрузка</span>
                        <div className="slider-container">
                          <CustomSlider
                            value={load}
                            min={0.01}
                            max={100}
                            step={.01}
                            precision={100}
                            filter={val => round(val, 2) + "%"}
                            onChange={val => {
                              let copy = [...combineTable];
                              copy[index]["load"] = val;
                              this.setState({ combineTable: copy });
                            }}
                          />
                        </div>
                      </div>
                      <div className="combine-table-row-val-row">
                        <span>Итераций</span>
                        <div className="slider-container">
                          <CustomSlider
                            value={iterations}
                            min={1}
                            max={100}
                            step={1}
                            precision={100}
                            filter={val => round(val)}
                            onChange={val => {
                              let copy = [...combineTable];
                              copy[index]["iterations"] = val;
                              this.setState({ combineTable: copy });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="combine-table-row-col">
                    {index === 0 && (
                      <div className="combine-table-row-key">
                        Выходные данные
                      </div>
                    )}
                    <div className="combine-table-row-val combine-table-row-val--final">
                      <p>
                        Длина хода<br />
                        <span style={{ color: "#736d6b" }}>125 п.</span>
                      </p>
                      <p>
                        Вероятность взять ход<br/>
                        <span style={{ color: "#bdb284" }}>68%</span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className={"add-btn-container"}>
              <Button 
                className="first-step-button"
                onClick={() => {
                  const dataClone = [...combineTable];
                  // console.log(dataClone);
                  dataClone.push({ ...combineTable[combineTable.length - 1]});
                  // dataClone[dataClone.length - 1].practiceStep = dataClone[0].practiceStep
                  this.setState({ combineTable: dataClone });
                }}
              >
                Добавить
              </Button>
            </div>
          </div>


          <div className="title">
            Регистр сделок
          </div>

          <div className="stats-container">
            <p>
              Общая дохолность<br />
              <span style={{ color: "#65c565" }}>0,38%</span>
            </p>
            <p>
              Выполнение плана<br />
              <span style={{ color: "#5a6dce" }}>76%</span>
            </p>
            <p>
              Внутридневной КОД<br />
              <span style={{ color: "#65c565" }}>0,095%</span>
            </p>
          </div>


          <div className="transaction-register-table">
            {transactionRegister.map((item, index) => {
              return (
                <div className="first-step-row">
                  {/* col */}
                  <div className="first-step-row-col">
                    {index == 0 && (
                      <div className="first-step-row-key">
                        Инструмент
                      </div>
                    )}

                    <div className="first-step-row-val first-step-row-val--base first-step-row-val-tool">
                      {/* Торговый инструмент */}
                      <Select
                        key={currentRowIndex}
                        value={toolsLoading && tools.length == 0 ? 0 : this.getCurrentToolIndex()}
                        onChange={currentToolIndex => {
                          const currentTool = tools[currentToolIndex];
                          const currentToolCode = currentTool.code;
                          onChange("currentToolCode", currentToolCode, currentRowIndex)
                        }}
                        disabled={toolsLoading}
                        loading ={toolsLoading}
                        showSearch
                        onSearch={(value) => setSeachVal(value)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%" }}
                      >
                        {(() => {
                          if (toolsLoading && tools.length == 0) {
                            return (
                              <Option key={0} value={0}>
                                <LoadingOutlined style={{ marginRight: ".2em" }} />
                                Загрузка...
                              </Option>
                            )
                          }
                          else {
                            return this.getSortedOptions().map((option) => (
                              <Option key={option.idx} value={option.idx}>
                                {option.label}
                              </Option>
                            ));
                          }
                        })()}
                      </Select>
                    </div>
                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="first-step-row-col">
                    {index == 0 && (
                      <div className="first-step-row-key">
                        Время входа
                      </div>
                    )}

                    <div className="first-step-row-val first-step-row-val--base first-step-row-val-time">
                      <div className="time-picker-container">
                        <TimePicker 
                          key={currentRowIndex}
                          format={'HH:mm'}
                          allowClear={true}
                          onChange={onChangeTime}
                          defaultValue={enterTime != null ? moment(new Date(enterTime), 'HH:mm') : null}
                          placeholder="Введите время"
                          onChange={time => {
                            let value = +time;
                            console.log(value);
                            onChange("enterTime", value, currentRowIndex);
                          }}
                          placeholder="введите время"
                        />
                      </div>
                    </div>
                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="first-step-row-col">
                    {index == 0 && (
                      <div className="first-step-row-key">
                        Направление
                      </div>
                    )}
                    <div className="first-step-row-row">
                      <div className="first-step-row-val first-step-row-val--first first-step-row-val--long">
                        Long
                      </div>
                      <div className="check-box-container check-box-container--first">
                        <Checkbox
                          className={"green"}
                          key={currentRowIndex}
                          checked={long}
                          onChange={(val) => {
                            let value = val.target.checked
                            onChange("long", value, currentRowIndex)
                          }}
                        />
                      </div>
                    </div>

                    <div className="first-step-row-row">
                      <div className="first-step-row-val first-step-row-val--second first-step-row-val--short">
                        Short
                      </div>
                      <div className="check-box-container check-box-container--second">
                        <Checkbox
                          className={"red"}
                          checked={short}
                          onChange={(val) => {
                            let value = val.target.checked
                            onChange("short", value, currentRowIndex)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="first-step-row-col">
                    {index == 0 && (
                      <div className="first-step-row-key">
                        Метод входа
                      </div>
                    )}
                    <div className="first-step-row-row">
                      <div className="first-step-row-val first-step-row-val--first">
                        Импульс
                      </div>
                      <div className="check-box-container check-box-container--first">
                        <Checkbox
                          checked={impulse}
                          onChange={(val) => {
                            let value = val.target.checked
                            onChange("impulse", value, currentRowIndex)
                          }}
                        />
                      </div>
                    </div>

                    <div className="first-step-row-row">
                      <div className="first-step-row-val first-step-row-val--second">
                        Отложенный
                      </div>

                      <div className="check-box-container check-box-container--second">
                        <Checkbox
                          checked={postponed}
                          onChange={(val) => {
                            let value = val.target.checked
                            onChange("postponed", value, currentRowIndex)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="first-step-row-col">
                    {index == 0 && (
                      <div className="first-step-row-key">
                        Сигнал
                      </div>
                    )}
                    <div className="first-step-row-row">
                      <div className="first-step-row-val first-step-row-val--first">
                        Уровни
                      </div>
                      <div className="check-box-container check-box-container--first">
                        <Checkbox
                          checked={levels}
                          onChange={(val) => {
                            let value = val.target.checked
                            onChange("levels", value, currentRowIndex)
                          }}
                        />
                      </div>
                    </div>

                    <div className="first-step-row-row">
                      <div className="first-step-row-val first-step-row-val--second">
                        Пробои
                      </div>
                      <div className="check-box-container check-box-container--second">
                        <Checkbox
                          checked={breakout}
                          onChange={(val) => {
                            let value = val.target.checked
                            onChange("breakout", value, currentRowIndex)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="first-step-row-col first-step-row-col--final">
                    {index == 0 && (
                      <div className="first-step-row-key first-step-row-key--final">
                        Итог
                      </div>
                    )}

                    <div className="first-step-row-val first-step-row-val--final">
                      <NumericInput
                        defaultValue={result || 0}
                        onBlur={(val) => {
                          onChange("result", val, currentRowIndex)
                        }}
                        unsigned="true"
                        min={0}
                        suffix={"%"}
                      />
                    </div>

                  </div>
                  {/* col */}
                </div>
              )
            })}
          </div>
          <div className={"add-btn-container"}>
            <Button
              className="first-step-button"
              // ~~
              onClick={() => {
                const dataClone = [...transactionRegister];
                dataClone.push({ ...transactionRegister });
                this.setState({ transactionRegister: dataClone });
              }}
            >
              Добавить
            </Button>
          </div>
        </div>
      </>
    )
  }
}
