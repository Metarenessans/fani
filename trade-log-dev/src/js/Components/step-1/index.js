import React, { useContext } from 'react'
import { Button, Tooltip, Select, Progress, Checkbox, TimePicker } from 'antd/es'
import moment from 'moment'

import { LoadingOutlined } from '@ant-design/icons'

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

import { StateContext } from "../../App"

import "./style.scss"
import { cloneDeep } from 'lodash'

const { Option } = Select;

function onChangeTime(time, timeString) {
  console.log(timeString, "timeString");
}

export default class FirstStep extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {}
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

  getCurrentToolIndex(currentToolCode) {
    let { tools } = this.props;
    return Tools.getToolIndexByCode(tools, currentToolCode);
  }

  getSortedOptions() {
    let { searchVal } = this.props
    return sortInputFirst(searchVal, this.getOptions());
  }

  render() {
    let { setSeachVal } = this.props;

    return (
      <StateContext.Consumer>
        {context => {
          const { state } = context;
          const { 
            data, 
            tools, 
            dailyRate, 
            toolsLoading, 
            currentRowIndex, 
          } = state;
          const { expectedDeals, deals } = data[currentRowIndex];

          return (
            <div className="first-step">

              <div className="title">
                Инсрументы предварительной выборки
              </div>

              <div className="pages-link-buttons">
                
                <a className="trade-log-button" target="_blank" href="https://fani144.ru/trademeter/">
                  Трейдометр
                </a>

                <a className="trade-log-button" target="_blank" href="https://fani144.ru/intraday/">
                  Интрадей портфель
                </a>

                <a className="trade-log-button" target="_blank" href="https://fani144.ru/mts/">
                  Мтс
                </a>

                <a className="trade-log-button" target="_blank" href="https://fani144.ru/ksd/">
                  Ксд
                </a>
              </div>


              <div className="title">
                Интрадей Трейдометр
              </div>

              <div className="first-step-combine-table">
                {expectedDeals.map((item, index) => {
                  const { currentToolCode, load, iterations, depo } = item;
                  return (
                    <div className="combine-table-row" key={index}>
                      <div className="combine-table-row-col">
                        {index === 0 && (
                          <div className="combine-table-row-key">
                            Инструмент
                          </div>
                        )}
                        <div className="combine-table-row-val combine-table-row-val--tool">
                          <NumericInput
                            defaultValue={depo}
                            format={formatNumber}
                            unsigned="true"
                            round="true"
                            onBlur={ val => {
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].expectedDeals[index].depo = val;

                              if (index === 0) {
                                data[currentRowIndex].expectedDeals.map((item, index) => {
                                  item.depo = val;
                                })
                                context.setState({ data })
                              }
                              else context.setState({ data })
                            }}
                          />
                          {/* Торговый инструмент */}
                          <Select
                            value={
                              toolsLoading && tools.length == 0 
                                ? 0
                                : Tools.getToolIndexByCode(tools, currentToolCode)
                            }
                            onChange={currentToolIndex => {
                              const currentTool = tools[currentToolIndex];
                              const currentToolCode = currentTool.code;

                              const data = cloneDeep(state.data);
                              data[currentRowIndex].expectedDeals[index].currentToolCode = currentToolCode;
                              context.setState({ data });
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
                          <div className="combine-table-row-val-row">
                            <span>Загрузка</span>
                            <div className="slider-container">
                              {(() => {
                                let currentToolIndex = Tools.getToolIndexByCode(tools, currentToolCode);
                                let currentTool = tools[currentToolIndex];
                                let step = currentTool?.guarantee / depo * 100;
                                if (step > 100) {
                                  console.warn('step > 100');
                                  for (let i = 0; i < tools.length; i++) {
                                    let s = tools[i].guarantee / depo * 100;
                                    if (s < 100) {
                                      const data = cloneDeep(state.data);
                                      data[currentRowIndex].expectedDeals[index].currentToolCode = tools[i].code;
                                      context.setState({ data });
                                      step = s;
                                      break;
                                    }
                                  }
                                }
                                let min = step;

                                return (
                                  <CustomSlider
                                    value={load}
                                    min={min}
                                    max={100}
                                    step={step}
                                    precision={2}
                                    filter={val => val + "%"}
                                    onChange={ val => {
                                      const data = cloneDeep(state.data);
                                      data[currentRowIndex].expectedDeals[index].load = val;
                                      context.setState({ data });
                                    }}
                                  />
                                )
                              })()}
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
                                precision={1}
                                onChange={val => {
                                  const data = cloneDeep(state.data);
                                  data[currentRowIndex].expectedDeals[index].iterations = val;
                                  context.setState({ data });
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
                          {(() => {
                            let currentToolIndex = Tools.getToolIndexByCode(tools, currentToolCode);
                            let currentTool = tools[currentToolIndex];
                            
                            const _depo = round(depo * (load / 100), 0);

                            let contracts = round((_depo || 0) / currentTool?.guarantee, 1);
                            let stepPrice = currentTool?.stepPrice;
                            let goal = Math.round(depo * (dailyRate / 100));

                            let pointsForIteration = (goal / stepPrice / contracts) / iterations;

                            return (
                              <>
                                <p>
                                  Длина хода<br />
                                  <span style={{ color: "#736d6b" }}>
                                    {round((Number.isFinite(pointsForIteration) ? pointsForIteration : 0), 2) + " п."}
                                  </span>
                                </p>
                                <p>
                                  Вероятность взять ход<br/>
                                  <span style={{ color: "#bdb284" }}>
                                    {(() => {
                                      let chance = 100 - ((pointsForIteration * currentTool?.priceStep) / currentTool?.adrDay * 100);
                                      if (chance < 0) {
                                        chance = 0
                                      }
                                      return round((chance || 0), 2) + "%"
                                    })()}
                                  </span>
                                </p>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className={"add-btn-container"}>
                  <Button 
                    className="trade-log-button"
                    onClick={ e => {
                      const data = cloneDeep(state.data);
                      const expectedDeals = cloneDeep(data[currentRowIndex].expectedDeals);

                      let currentToolIndex = Tools.getToolIndexByCode(tools, "SBER");
                      let currentTool = tools[currentToolIndex];
                      let minStep = currentTool?.guarantee / 10_000 * 100;

                      expectedDeals.push({
                        currentToolCode: "SBER",
                        depo:        10_000,
                        iterations :      1,
                        load:       minStep,
                      });
                      data[currentRowIndex].expectedDeals = expectedDeals;
                      context.setState({ data });
                    }}
                  >
                    Добавить инструмент
                  </Button>
                  <Button 
                    className="trade-log-button"
                    disabled={expectedDeals.length === 1}
                    onClick={e => {
                      const data = cloneDeep(state.data);
                      let expectedDeals = cloneDeep(data[currentRowIndex].expectedDeals);
                      expectedDeals.splice(expectedDeals.length - 1, 1);
                      data[currentRowIndex].expectedDeals = expectedDeals;
                      context.setState({ data });
                    }}
                  >
                    Удалить инструмент
                  </Button>
                </div>
              </div>


              <div className="title">
                Регистр сделок
              </div>

                {(() => {
                  const validDealsNumber = () => {
                    let arr = [];
                    deals.map((item, index) => {
                      item.result !== 0 && arr.push(1)
                    })
                    return arr.length
                  }
                  const result = deals.reduce((acc, curr) => acc + curr.result, 0);
                  /** КОД */
                  const averageResult = result / (validDealsNumber() || 0);
                  const compliancingPlan = (result / (state.dailyRate || 0)) * 100;
                  return (
                    <div className="stats-container"> 
                      <p>
                        Общая дохолность<br />
                        <span className={clsx(result >= 0 ? (result == 0 ? "default" : "positive") : "negative")}>
                          {(round((result || 0), 2))} %
                        </span>
                      </p>
                      <p>
                        Выполнение плана<br />
                        <span className={
                          clsx((compliancingPlan || 0) >= 0 ? (compliancingPlan > 100 ? "positive" : "default") : "negative")
                        }>
                          {round((compliancingPlan || 0), 0)} %
                        </span>
                      </p>
                      <p>
                        Внутридневной КОД<br />
                        <span key={averageResult} className={
                          clsx(result >= 0 ? (result == 0 ? "default" : "positive") : "negative")}>
                          {round(averageResult || 0, 3)} %
                        </span>
                      </p>
                    </div>
                  )
                })()}


              <div className="transaction-register-table">
                {deals.map((item, index) => {
                  let {
                    currentToolCode, 
                    enterTime, 
                    isLong, 
                    impulse, 
                    postponed,
                    levels,
                    breakout,
                    result,
                  } = item;
                  return (
                    <div className="first-step-row" key={index}>
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
                            value={
                              toolsLoading && tools.length == 0
                                ? 0
                                : Tools.getToolIndexByCode(tools, currentToolCode)
                            }
                            onChange={currentToolIndex => {
                              const currentTool = tools[currentToolIndex];
                              const currentToolCode = currentTool.code;

                              const data = cloneDeep(state.data);
                              data[currentRowIndex].deals[index].currentToolCode  = currentToolCode;
                              data[currentRowIndex].deals[index].currentToolIndex = currentToolIndex;
                              context.setState({ data });
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
                                const data = cloneDeep(state.data);
                                data[currentRowIndex].deals[index].enterTime = value;
                                context.setState({ data });
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
                              checked={isLong === true}
                              onChange={ ()=> {
                                const data = cloneDeep(state.data);
                                if (isLong === true) {
                                  data[currentRowIndex].deals[index].isLong = null;
                                }
                                else {
                                  data[currentRowIndex].deals[index].isLong = true;
                                }
                                context.setState({ data });
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
                              checked={isLong === false}
                              onChange={() => {
                                const data = cloneDeep(state.data);
                                if (isLong === false) {
                                  data[currentRowIndex].deals[index].isLong = null;
                                }
                                else {
                                  data[currentRowIndex].deals[index].isLong = false;
                                }
                                context.setState({ data });
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
                              onChange={ val => {
                                let value = val.target.checked;
                                const data = cloneDeep(state.data);
                                data[currentRowIndex].deals[index].impulse = value;
                                context.setState({ data });
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
                              onChange={ val => {
                                let value = val.target.checked;
                                const data = cloneDeep(state.data);
                                data[currentRowIndex].deals[index].postponed = value;
                                context.setState({ data });
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
                              onChange={ val => {
                                let value = val.target.checked;
                                const data = cloneDeep(state.data);
                                data[currentRowIndex].deals[index].levels = value;
                                context.setState({ data });
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
                              key={breakout}
                              checked={breakout}
                              onChange={ val => {
                                let value = val.target.checked;
                                const data = cloneDeep(state.data);
                                data[currentRowIndex].deals[index].breakout = value;
                                context.setState({ data });
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

                        <div 
                          className={clsx(
                            "first-step-row-val first-step-row-val--final", 
                            result >= 0
                              ? (result == 0 ? "" : "positive")
                              : "negative"
                          )}
                        >
                          <NumericInput
                            defaultValue={result || 0}
                            onBlur={ val => {
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].deals[index].result = val;
                              context.setState({ data });
                            }}
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
                  className="trade-log-button"
                  disabled={state.limitUnprofitableDeals && deals.filter(deal => deal.result < 0).length >= state.allowedNumberOfUnprofitableDeals}
                  onClick={() => {
                    const data = cloneDeep(state.data);
                    const deals = cloneDeep(data[currentRowIndex].deals);
                    deals.push(cloneDeep(context.dealTemplate));
                    data[currentRowIndex].deals = deals;
                    context.setState({ data });
                  }}
                >
                  Добавить сделку
                </Button>
                <Button
                  className="trade-log-button"
                  disabled={
                    state.limitUnprofitableDeals && 
                    deals
                      .filter(deal => deal.result < 0).length >= state.allowedNumberOfUnprofitableDeals || deals.length == 1
                  }
                  onClick={() => {
                    const data = cloneDeep(state.data);
                    let deals = cloneDeep(data[currentRowIndex].deals);
                    deals.splice(deals.length - 1, 1);
                    data[currentRowIndex].deals = deals;
                    context.setState({ data });
                  }}
                >
                  Удалить сделку
                </Button>
              </div>
            </div>
          )
        }}
      </StateContext.Consumer>
    )
  }
}
