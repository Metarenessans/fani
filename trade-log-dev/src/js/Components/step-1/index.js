import React, { useContext } from "react";
import { Button, Tooltip, Select, Progress, Checkbox, TimePicker } from "antd/es";
import moment from "moment";

import { LoadingOutlined } from "@ant-design/icons";

import { Tools, Tool, template, parseTool } from "../../../../../common/tools";

import parseEmotionalState from "../../utils/parse-emotional-state";
import CustomSlider from "../../../../../common/components/custom-slider";


import NumericInput from "../../../../../common/components/numeric-input";
import sortToolsBySearchValue from "../../../../../common/utils/sort-tools-by-search-value";
import CrossButton from "../../../../../common/components/cross-button";
import ToolSelect from "../../../../../common/components/tool-select";

import TimeRangePicker from "../time-range-picker";

import round from "../../../../../common/utils/round";
import num2str from "../../../../../common/utils/num2str";
import formatNumber from "../../../../../common/utils/format-number";
import clsx from "clsx";
import { data } from "jquery";

import { StateContext } from "../../App";

import "./style.scss";
import { cloneDeep } from "lodash";
import countPointsForDay from "../../utils/count-points-for-day";

const { Option } = Select;

export default class FirstStep extends React.Component {

  getOptions() {
    let { tools } = this.props;
    return tools.map((tool, idx) => {
      return {
        idx: idx,
        label: String(tool)
      };
    });
  }

  getCurrentToolIndex(currentToolCode) {
    let { tools } = this.props;
    return Tools.getToolIndexByCode(tools, currentToolCode);
  }

  getSortedOptions() {
    let { searchVal, tools } = this.props;
    return sortToolsBySearchValue(searchVal, tools);
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
            currentRowIndex 
          } = state;
          const { expectedDeals, deals } = data[currentRowIndex];

          return (
            <div className="first-step">

              <div className="title">
                Инструменты предварительной выборки
              </div>

              <div className="pages-link-buttons">
                
                <a className="trade-log-button" target="_blank" href="https://fani144.ru/trademeter/" rel="noreferrer">
                  Трейдометр
                </a>

                <a className="trade-log-button" target="_blank" href="https://fani144.ru/intraday/" rel="noreferrer">
                  Интрадей портфель
                </a>

                <a className="trade-log-button" target="_blank" href="https://fani144.ru/mts/" rel="noreferrer">
                  Мтс
                </a>

                <a className="trade-log-button" target="_blank" href="https://fani144.ru/ksd/" rel="noreferrer">
                  Ксд
                </a>
              </div>


              <div className="title">
                Интрадей Трейдометр
              </div>

              <div className="first-step-combine-table">
                {expectedDeals.map((deal, index) => {
                  let { currentToolCode, load, iterations, depo } = deal;
                  depo = depo == null ? (state.investorDepo || 0) : depo;
                  return (
                    <div className="combine-table-row" key={index}>
                      <div className="combine-table-row-col">
                        <div className="combine-table-row-key">
                          Инструмент
                        </div>
                        <div className="combine-table-row-val combine-table-row-val--tool">
                          <NumericInput
                            defaultValue={depo}
                            format={formatNumber}
                            unsigned="true"
                            round="true"
                            min={10_000}
                            onBlur={val => {
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].expectedDeals[index].depo = val;

                              if (index === 0) {
                                data[currentRowIndex].expectedDeals.map((item, index) => {
                                  item.depo = val;
                                });
                                context.setState({ data });
                              }
                              else context.setState({ data });
                            }}
                          />
                          {/* Торговый инструмент */}
                          {(() => {
                            let currentToolIndex = Tools.getToolIndexByCode(tools, currentToolCode);
                            let currentTool = tools[currentToolIndex] ?? Tools.createArray()[0];

                            let depoPersentageStart = currentTool.guarantee / depo * 100;
                            if (depoPersentageStart < 0) {
                              depoPersentageStart = 0;
                            }

                            return (
                              <ToolSelect
                                tooltipPlacement="right"
                                errorMessage={depoPersentageStart > 100 && "Недостаточный депозит для покупки 1 контракта!"}
                                value={Tools.getToolIndexByCode(tools, currentToolCode)}
                                onChange={currentToolIndex => {
                                  const currentTool = tools[currentToolIndex];
                                  const currentToolCode = currentTool.code;
    
                                  const data = cloneDeep(state.data);
                                  data[currentRowIndex].expectedDeals[index].currentToolCode = currentToolCode;
                                  context.setState({ data });
                                }}
                              />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="combine-table-row-col">
                        <div className="combine-table-row-key">
                          Калибровка
                        </div>
                        <div className="combine-table-row-val combine-table-row-val-slider">
                          <div className="combine-table-row-val-row">
                            <span>Загрузка</span>
                            <div className="slider-container">
                              {(() => {
                                let currentToolIndex = Tools.getToolIndexByCode(tools, currentToolCode);
                                let currentTool = tools[currentToolIndex];
                                
                                let step = currentTool.guarantee / depo * 100;
                                let depoPersentageStart = currentTool.guarantee / depo * 100;
                                let min = step;
                                let max = 100;
                                let disabled = false;

                                // Прижимает ползунок к правому краю, дизейблит его и ставит значение 100%
                                if (depoPersentageStart > 100) {
                                  disabled = true;
                                  step = 100;
                                  min = 0;
                                }

                                // Прижимает ползунок к правому краю и дизейблит его
                                if (step * 2 > 100) {
                                  disabled = true;
                                  min = 0;
                                  max = depoPersentageStart;
                                }

                                return (
                                  <CustomSlider
                                    disabled={disabled}
                                    value={load}
                                    min={min}
                                    max={max}
                                    step={step}
                                    precision={2}
                                    filter={val => val + "%"}
                                    onChange={val => {
                                      const data = cloneDeep(state.data);
                                      data[currentRowIndex].expectedDeals[index].load = val;
                                      context.setState({ data });
                                    }}
                                  />
                                );
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
                        <div className="combine-table-row-key">
                          Выходные данные
                        </div>
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
                                    {Math.ceil((Number.isFinite(pointsForIteration) ? pointsForIteration : 0)) + " п."}
                                  </span>
                                </p>
                                <p>
                                  Вероятность взять ход<br/>
                                  <span style={{ color: "#bdb284" }}>
                                    {(() => {
                                      let chance = 100 - ((pointsForIteration * currentTool?.priceStep) / currentTool?.adrDay * 100);
                                      if (chance < 0) {
                                        chance = 0;
                                      }
                                      return round((chance || 0), 1) + "%";
                                    })()}
                                  </span>
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="add-btn-container">
                  <Button 
                    className="trade-log-button"
                    onClick={e => {
                      const data = cloneDeep(state.data);
                      const expectedDeals = cloneDeep(data[currentRowIndex].expectedDeals);

                      let currentToolIndex = Tools.getToolIndexByCode(tools, "SBER");
                      let currentTool = tools[currentToolIndex];
                      let minStep = currentTool?.guarantee / 10_000 * 100;

                      expectedDeals.push({
                        currentToolCode: "SBER",
                        depo:        10_000,
                        iterations:      1,
                        load:       minStep
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
                      item.result !== 0 && arr.push(1);
                    });
                    return arr.length;
                  };
                  const result = deals.reduce((acc, curr) => acc + curr.result, 0);
                  /** КОД */
                  const averageResult = result / (validDealsNumber() || 0);
                  const compliancingPlan = (result / (state.dailyRate || 0)) * 100;
                  return (
                    <div className="stats-container"> 
                      <p>
                        Общая доходность<br />
                        <span className={clsx(result >= 0 ? (result == 0 ? "default" : "positive") : "negative")}>
                          {(round((result || 0), 2))} %
                        </span>
                      </p>
                      <p>
                        Выполнение плана<br />
                        <span className={
                          clsx((compliancingPlan || 0) >= 0 ? (compliancingPlan > 100 ? "positive" : "default") : "negative")
                        }
                        >
                          {round((compliancingPlan || 0), 0)} %
                        </span>
                      </p>
                      <p>
                        Внутридневной КОД<br />
                        <span key={averageResult} className={
                          clsx(result >= 0 ? (result == 0 ? "default" : "positive") : "negative")}
                        >
                          {round(averageResult || 0, 3)} %
                        </span>
                      </p>
                    </div>
                  );
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
                    result
                  } = item;
                  return (
                    <div className="first-step-row" key={index}>
                      {/* col */}
                      <div className="first-step-row-col">
                        <div className="first-step-row-key">
                          Инструмент
                        </div>

                        <div className="first-step-row-val first-step-row-val--base first-step-row-val-tool">
                          {/* Торговый инструмент */}
                          <ToolSelect
                            value={Tools.getToolIndexByCode(tools, currentToolCode)}
                            onChange={currentToolIndex => {
                              const currentTool = tools[currentToolIndex];
                              const currentToolCode = currentTool.code;

                              const data = cloneDeep(state.data);
                              data[currentRowIndex].deals[index].currentToolCode  = currentToolCode;
                              data[currentRowIndex].deals[index].currentToolIndex = currentToolIndex;
                              context.setState({ data });
                            }}
                          />
                        </div>
                      </div>
                      {/* col */}

                      {/* col */}
                      <div className="first-step-row-col">
                        <div className="first-step-row-key">
                          Время входа
                        </div>

                        <div className="first-step-row-val first-step-row-val--base first-step-row-val-time">
                          <div className="time-picker-container">
                            {state.viewportWidth <= 768
                              ?
                                <input
                                  type="time"
                                  value={
                                    enterTime != null
                                      ? moment(new Date(enterTime)).format("HH:mm")
                                      : null
                                  }
                                  onChange={e => {
                                    const { value } = e.target;
                                    const h = +value.split(":")[0];
                                    const m = +value.split(":")[1];

                                    const date = new Date(0);
                                    date.setHours(h);
                                    date.setMinutes(m);

                                    const enterTime = +date;

                                    const data = cloneDeep(state.data);
                                    data[currentRowIndex].deals[index].enterTime = enterTime;
                                    context.setState({ data });
                                  }}
                                />
                              :
                                <TimePicker 
                                  key={currentRowIndex}
                                  format="HH:mm"
                                  allowClear
                                  defaultValue={
                                    enterTime != null 
                                      ? moment(new Date(enterTime), "HH:mm")
                                      : null
                                  }
                                  placeholder="Введите время"
                                  onChange={time => {
                                    let value = +time;
                                    const data = cloneDeep(state.data);
                                    data[currentRowIndex].deals[index].enterTime = value;
                                    context.setState({ data });
                                  }}
                                />
                            }
                          </div>
                        </div>
                      </div>
                      {/* col */}

                      {/* col */}
                      <div className="first-step-row-col">
                        <div className="first-step-row-key">
                          Направление
                        </div>
                        <div className="first-step-row-row">
                          <div className="first-step-row-val first-step-row-val--first first-step-row-val--long">
                            Long
                          </div>
                          <div className="check-box-container check-box-container--first">
                            <Checkbox
                              className="green"
                              key={currentRowIndex}
                              checked={isLong === true}
                              onChange={()=> {
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
                              className="red"
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
                        <div className="first-step-row-key">
                          Метод входа
                        </div>
                        <div className="first-step-row-row">
                          <div className="first-step-row-val first-step-row-val--first">
                            Импульс
                          </div>
                          <div className="check-box-container check-box-container--first">
                            <Checkbox
                              checked={impulse}
                              onChange={val => {
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
                              onChange={val => {
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
                        <div className="first-step-row-key">
                          Сигнал
                        </div>
                        <div className="first-step-row-row">
                          <div className="first-step-row-val first-step-row-val--first">
                            Уровни
                          </div>
                          <div className="check-box-container check-box-container--first">
                            <Checkbox
                              checked={levels}
                              onChange={val => {
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
                              onChange={val => {
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
                        <div className="first-step-row-key first-step-row-key--final">
                          Итог
                        </div>

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
                            onBlur={async val => {
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].deals[index].result = val;
                              await context.setStateAsync({ data });
                              context.checkForLockingDeals();
                            }}
                            suffix="%"
                          />
                        </div>

                      </div>
                      {/* col */}
                    </div>
                  );
                })}
              </div>
              <div className="add-btn-container">
                {(() => {
                  let reachedLimitOfUnprofitableDeals =
                    state.limitUnprofitableDeals && 
                    deals.filter(deal => deal.result < 0).length >= state.allowedNumberOfUnprofitableDeals;

                  const { timeoutMinutes } = state;
                  const timeout = timeoutMinutes[currentRowIndex];

                  return (
                    <Tooltip
                      title={timeout > 0 &&
                        <span>
                          {reachedLimitOfUnprofitableDeals
                            ? "Достигнут лимит отрицательных сделок"
                            : "Негативный эмоциональный фон"
                          }
                          <br />
                          Ограничение сделок {timeout === 9999 
                            ? "до конца дня" 
                            : `на ${formatNumber(timeout)} мин`
                          }
                        </span>
                      }
                    >
                      <div>
                        <Button
                          className="trade-log-button"
                          disabled={timeout > 0}
                          onClick={() => {
                            const data = cloneDeep(state.data);
                            const deals = cloneDeep(data[currentRowIndex].deals);
                            deals.push(cloneDeep(context.dealTemplate));
                            data[currentRowIndex].deals = deals;

                            data[currentRowIndex].reportMonitor.push(
                              { result: true, baseTrendDirection: null, momentDirection: null, doubts: null }
                            );
                            
                            context.setState({ data });
                          }}
                        >
                          Добавить сделку
                        </Button>
                      </div>
                    </Tooltip>
                  );
                })()}
                <Button
                  className="trade-log-button"
                  disabled={
                    (state.limitUnprofitableDeals && deals.filter(deal => deal.result < 0).length >= state.allowedNumberOfUnprofitableDeals) || 
                    deals.length == 1
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
          );
        }}
      </StateContext.Consumer>
    );
  }
}
