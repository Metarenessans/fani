import React from 'react'
import {
  Select,
  Button,
  Tooltip,
  Switch
} from "antd/es"

import {
  SettingFilled,
  LoadingOutlined,
} from '@ant-design/icons'

import { Tools, template } from "../../../../common/tools"

import NumericInput from "../../../../common/components/numeric-input"
import CustomSelect from "../../../../common/components/custom-select"
import Value        from "../../../../common/components/value"
import Info         from "./info"

import formatNumber from "../../../../common/utils/format-number"
import round        from "../../../../common/utils/round"
import num2str      from "../../../../common/utils/num2str"

const { Option } = Select;

export default class Item extends React.Component {
  constructor(props) {
    super(props);

    const { data } = this.props;
    
    this.state = {
      drawdown: (data.drawdown != null) ? data.drawdown : this.props.depo * 0.1,
    };

    if (this.props.onRef) {
      this.props.onRef(this, this.props.index);
    }
  }

  parseTool(str) {
    var arr = str
      .replace(/\,/g, ".")
      .split(/\t/g)
      .map(n => (n + "").replace(/\"/g, "").replace(/(\d+)\s(\d+)/, "$1$2"));
    
    var obj = {
      name:             arr[0],
      stepPrice:       +arr[1] || 0,
      priceStep:       +arr[2] || 0,
      averageProgress: +arr[3] || 0,
      guarantee:       +arr[4] || 0,
      currentPrice:    +arr[5] || 0,
      lotSize:         +arr[6] || 0,
      dollarRate:      +arr[7] || 0,

      points: [
        [ 70,  70 ],
        [ 156, 55 ],
        [ 267, 41 ],
        [ 423, 27 ],
        [ 692, 13 ],
        [ 960,  7 ],
      ]
    };
    return obj;
  }

  getCurrentTool() {
    const { tools, data } = this.props;

    const selectedToolName = data.selectedToolName;

    let selectedToolIndex = 0;
    if (selectedToolName != null) {
      for (let i = 0; i < tools.length; i++) {
        let tool = tools[i];
        if (tool.getSortProperty() === selectedToolName) {
          selectedToolIndex = i;
          break;
        }
      }
    }

    return { ...tools[selectedToolIndex] } || { ...template };
  }

  getCurrentToolIndex() {
    const { tools, data } = this.props;

    const selectedToolName = data.selectedToolName;

    let selectedToolIndex = 0;
    if (selectedToolName != null) {
      for (let i = 0; i < tools.length; i++) {
        let tool = tools[i];
        if (tool.getSortProperty() === selectedToolName) {
          return i;
        }
      }
    }

    return 0;
  }

  componentDidMount() {

  }

  render() {
    const { 
      index,
      onDelete,
      onCopy,
      onOpenConfig,
      onChange,
      depo,
      data,
      investorInfo,
    } = this.props;

    const drawdown           = this.state.drawdown;
    const contracts          = data.contracts;
    const stepExpected       = data.stepExpected;
    const additionalLoading  = data.additionalLoading;
    const directUnloading    = data.directUnloading;
    const isLong             = data.isLong;

    let currentTool = this.getCurrentTool();
    currentTool.update != null && currentTool.update(investorInfo);

    let currentToolIndex = this.getCurrentToolIndex();

    let selectedToolName = data.selectedToolName;
    if (selectedToolName == null && this.props.tools.length) {
      selectedToolName = this.props.tools[0].getSortProperty();
    }

    let rubbles = contracts * currentTool.guarantee;

    var additionalLoading2 = data.additionalLoading2 || additionalLoading;
    var stepExpected2 = data.stepExpected2 || stepExpected;

    const freeMoney = depo - drawdown - rubbles;
    const pointsAgainst = drawdown / (contracts * currentTool.stepPrice);
    const incomeExpected = ((depo * (additionalLoading / 100)) / currentTool.guarantee) * (stepExpected / currentTool.priceStep * currentTool.stepPrice) + contracts * (stepExpected / currentTool.priceStep * currentTool.stepPrice);
    const incomeExpected2 = ((depo * (additionalLoading2 / 100)) / currentTool.guarantee) * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice) + contracts * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice);

    function AddButton(props) {
      var className = props.className || ""; 

      return (
        <Button
          className={"custom-btn tool-header__add-btn"
            .split(/\s+/g)
            .concat(className)
            .join(" ")
            .trim()
          }
          onClick={() => {
            if (onCopy) {
              onCopy();
            }
          }}>
          + инструмент
        </Button>
      )
    }

    return (
      <div className="tool">
        <Tooltip title="Удалить">
          <button
            className="tool__delete delete-btn"
            aria-label="Удалить"
            onClick={() => {
              if (onDelete) {
                onDelete();
              }
            }}>
            <span>&times;</span>
          </button>
        </Tooltip>

        <header className="card tool-header">

          <div className="tool-header-top">

            <label className="tool-header__select">
              <span className="input-group__title search__title">Торговый инструмент</span>
              <Select
                value={currentToolIndex}
                disabled={this.props.tools.length == 0}
                onChange={index => {
                  console.log(index, this.props.tools[index]);
                  let name = this.props.tools[index].getSortProperty();
                  onChange("selectedToolName", name);
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
              >
                {(() => {
                  let tools = this.props.tools;
                  if (tools.length) {
                    return tools
                      .map(tool => String(tool))
                      .map((value, index) => <Option key={index} value={index}>{value}</Option>)
                  }
                  else {
                    return (
                      <Option key={0} value={0}>
                        <LoadingOutlined style={{ marginRight: ".2em" }} />
                        Загрузка...
                      </Option>
                    )
                  }
                })()}
              </Select>
            </label>

            <label className="input-group">
              <Tooltip title="Фактический убыток позиции">
                <span className="input-group__title">Просадка</span>
              </Tooltip>
              <NumericInput
                className="input-group__input tool__drawdown"
                key={drawdown}
                defaultValue={drawdown}
                round
                min={1}
                onBlur={val => {
                  onChange("drawdown", val);

                  // if (this.props.onDrawdownChange) {
                  //   this.props.onDrawdownChange(val, this.recalc.bind(this));
                  // }
                }}
                format={formatNumber}
              />
            </label>

            <label className="input-group">
              <span className="input-group__title">Контрактов</span>
              <NumericInput
                className="input-group__input"
                key={contracts}
                defaultValue={contracts}
                round
                min={1}
                onBlur={val => {
                  onChange("contracts", val);
                  // this.setState({ contracts: val }, this.recalc)
                }}
                format={formatNumber}
              />
            </label>

            <div className="tool-header-top-tail">
              <div className="tool-header-top-tail__wrap">
                <AddButton />

                <label className="switch tool-header__long-short">
                  <Switch
                    className="switch__input"
                    key={isLong + Math.random()}
                    checkedChildren="LONG"
                    unCheckedChildren="SHORT"
                    defaultChecked={isLong}
                    onChange={val => {
                      onChange("isLong", val);
                    }}
                  />
                  {/* <span className="switch__label">SHORT</span> */}
                </label>

                {index == 0 && (
                  <Tooltip title="Настройки">
                    <button
                      className="settings-button tool-header__settings"
                      onClick={e => {
                        if (onOpenConfig) {
                          onOpenConfig(e);
                        }
                      }}>
                      <span className="visually-hidden">Открыть конфиг</span>
                      <SettingFilled className="settings-button__icon" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
            {
              
            }

          </div>

          <div className="tool-header-bottom">
            <div className="tool-header-bottom__wrap">

              <div className="tool-pair">
                <h3 className="tool-pair-key">Загрузка:</h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + `%`}>
                    {(() => {
                      var value = (drawdown + this.getCurrentTool().guarantee * contracts) / depo * 100;
                      return round(value, 1);
                    })()}
                  </Value>
                </span>
              </div>

              <div className="tool-pair">
                <h3 className="tool-pair-key">Просадка:</h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + "%"}>
                    {(() => {
                      let val = (drawdown / depo) * 100;
                      val = Math.min(val, 100);

                      return -round(val, 3)
                    })()}
                  </Value>
                </span>
              </div>

              <div className="tool-pair">
                <h3 className="tool-pair-key">Депозит:</h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + " руб."}>
                    {(() => {
                      var value = depo - (drawdown + contracts * this.getCurrentTool().guarantee);
                      return round(value, 1);
                    })()}
                  </Value>
                </span>
              </div>
              
              <div className="tool-pair">
                <h3 className="tool-pair-key">Средняя цена:</h3>
                <span className="tool-pair-val">
                  {(() => {
                    const search = /\.\d+$/g.exec(String(currentTool.currentPrice));
                    const fractionLength = search ? search[0].slice(1).length : 0;

                    const value = currentTool.currentPrice + (pointsAgainst * currentTool.priceStep) * (isLong ? 1 : -1);

                    return <Value format={formatNumber} isDefault="true">{(value).toFixed(fractionLength)}</Value>
                  })()}
                </span>
              </div>

              <div className="tool-pair">
                <h3 className="tool-pair-key">Пунктов:</h3>
                <span className="tool-pair-val">
                  <Value format={formatNumber} isDefault="true">
                    {Math.round(-pointsAgainst)}
                  </Value>
                </span>
              </div>

            </div>
          </div>
        </header>
        {/* top horizontal card */}

        <div className="tool-main">
          <div className="tool-main__wrap">

            <div className="tool-main-card card">
              <header className="tool-main-card-header">
                <h2 className="tool-main-card__title">Позитивный сценарий</h2>

                <label className="switch tool-main-card-header__switch">
                  <Switch
                    className="switch__input"
                    key={directUnloading}
                    defaultChecked={directUnloading}
                    onChange={val => {
                      onChange("directUnloading", val);
                      // this.setState({ directUnloading: val });
                    }} 
                  />
                  <Info tooltip="Прямая разгрузка позиции">
                    <span className="switch__label">Прямая</span>
                  </Info>
                </label>
              </header>
              
              {(() => {
                var iterations = 
                  +(drawdown / incomeExpected).toFixed(1) *
                   (directUnloading ? 1 : 2);
                var incomeForIteration =
                  (incomeExpected / (directUnloading ? 1 : 2))
                    .toFixed(1);
                  
                return (
                  <div className="tool-main-card-body">

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            Догрузка
                          </span>
                          <CustomSelect
                            key={additionalLoading}
                            options={
                              [5].concat(new Array(7).fill(0).map((val, i) => 10 * (i + 1)))
                            }
                            format={val => val + "% от депо"}
                            value={additionalLoading}
                            min={1}
                            max={100}
                            onChange={value => onChange("additionalLoading", value)}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const contracts = depo * (additionalLoading / 100) / currentTool.guarantee;
                            return `${additionalLoading}% = ${formatNumber(round(contracts, 2))} контрактов`;
                          })()}
                        </p>
                      </div>
                      
                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">Итераций:</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(iterations, 2)) }
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            Ожидаемый ход (руб/$)
                          </span>
                          <NumericInput
                            className="input-group__input"
                            key={stepExpected}
                            defaultValue={stepExpected}
                            onBlur={val => {
                              if (val == 0) {
                                val = 0.1;
                              }

                              onChange("stepExpected", val);
                              // this.setState({ stepExpected: val }, this.recalc)
                            }}
                            format={formatNumber}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const steps = round(stepExpected / currentTool.priceStep, 2);
                            return `${stepExpected} ₽/$ = ${steps} ${num2str(Math.floor(steps), ["шаг", "шага", "шагов"])} цены`;
                          })()}
                        </p>
                      </div>

                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          Прибыль <br className="hide-xs" />
                          за итерацию:
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={val => formatNumber(round(val, 3))}>
                            {incomeForIteration}
                          </Value>
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Итераций</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(iterations, 2)) }
                        </span>
                      </div>
                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">
                          Прибыль за итерацию
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={formatNumber}>{incomeForIteration}</Value>
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })()}
            </div>
            
            <div className="tool-main-card card">
              <header className="tool-main-card-header">
                <h2 className="tool-main-card__title">Негативный сценарий</h2>
              </header>

              {(() => {
                var deposit = Math.round(freeMoney - (incomeExpected2 ? incomeExpected2 : incomeExpected));

                var loss = (
                  incomeExpected2
                    ? -incomeExpected2
                    : -incomeExpected
                ).toFixed(1) - drawdown;

                return (
                  <div className="tool-main-card-body">

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            Догрузка
                          </span>
                          <CustomSelect
                            key={additionalLoading2}
                            options={
                              [5].concat(new Array(7).fill(0).map((val, i) => 10 * (i + 1)))
                            }
                            format={val => val + "% от депо"}
                            value={additionalLoading2}
                            min={1}
                            max={100}
                            onChange={value => onChange("additionalLoading2", value)}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const contracts = depo * (additionalLoading2 / 100) / currentTool.guarantee;
                            return `${additionalLoading2}% = ${formatNumber(round(contracts, 2))} контрактов`;
                          })()}
                        </p>
                      </div>


                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">Депозит:</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(deposit, 2)) }
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            Ожидаемый ход (руб/$)
                          </span>
                          <NumericInput
                            className="input-group__input"
                            key={stepExpected2 != null ? stepExpected2 : stepExpected}
                            defaultValue={stepExpected2 != null ? stepExpected2 : stepExpected}
                            onBlur={val => {
                              if (val == 0) {
                                val = 0.1;
                              }

                              onChange("stepExpected2", val);
                              // this.setState({ stepExpected2: val }, this.recalc)
                            }}
                            format={formatNumber}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const steps = round((stepExpected2 != null ? stepExpected2 : stepExpected) / currentTool.priceStep, 2);
                            return `${(stepExpected2 != null ? stepExpected2 : stepExpected)} ₽/$ = ${steps} ${num2str(Math.floor(steps), ["шаг", "шага", "шагов"])} цены`;
                          })()}
                        </p>
                      </div>


                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          Убыток <br className="hide-xs" />
                          на догрузку:
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={val => formatNumber(round(val, 3))}>{loss}</Value>
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Депозит</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(deposit, 2)) }
                        </span>
                      </div>
                    </div>
                    
                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Убыток на догрузку</h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={formatNumber}>{loss}</Value>
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })()}
              
            </div>
          
          </div>
        </div>
        {/* main */}

        <footer className="tool-footer">
          <AddButton className="tool-header__add-btn--mobile" />
        </footer>
        {/* footer */}
      </div>
    )
  }
}