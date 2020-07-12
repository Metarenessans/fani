import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Switch,
  Typography,
  Tag
} from "antd/es"

import {
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons'

import $ from "jquery"

import NumericInput from "./numeric-input"
import Value        from "./value"
import Info         from "./info"

import formatNumber from "../utils/formatNumber"
import round        from "../utils/round"

const { Option } = Select;
const { Group } = Radio;
const { Text } = Typography;

export default class Item extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      // Контрактов
      contracts: 40,
      // Просадка

      // Догрузка (в процентах)
      additionalLoading: 20,
      // Ожидаемый ход (в долларах)
      stepExpected: 1,

      directUnloading: true,
      
      // ===================
      // Вычисляемые значения
      // ===================

      // Свободные деньги
      freeMoney: 0,
      // Прошло пунктов против
      pointsAgainst: 0,
      // 
      incomeExpected: 0,

      currentToolIndex: 0,
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
      guaranteeValue:  +arr[4] || 0,
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
    const { tools } = this.props;
    const { currentToolIndex } = this.state;
    return tools[currentToolIndex] || 
      this.parseTool(`Золото (GOLD-6.20)	7,72011	0,1000	70	12 723,89	1 637,4	1	1`);
  }

  recalc() {
    // console.log("!");
    
    // const { depo, drawdown } = this.props;
    // const {
    //   contracts,
    //   stepExpected,
    //   additionalLoading,
    // } = this.state;

    // let currentTool = this.getCurrentTool();
    // let rubbles = contracts * currentTool.guaranteeValue;

    // var additionalLoading2 = this.state.additionalLoading2 || additionalLoading;
    // var stepExpected2      = this.state.stepExpected2      || stepExpected;

    // this.setState({
    //   freeMoney:      depo - drawdown - rubbles,
    //   pointsAgainst:  drawdown / (contracts * currentTool.stepPrice),
    //   incomeExpected: ((depo * (additionalLoading / 100)) / currentTool.guaranteeValue) * (stepExpected / currentTool.priceStep * currentTool.stepPrice),
    //   incomeExpected2: ((depo * (additionalLoading2 / 100)) / currentTool.guaranteeValue) * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice)
    // });
  }

  componentDidMount() {
    this.recalc();
  }

  getToolName(tool = {}) {
    var name = "";
    if (tool.shortName) {
      name += `${tool.shortName}`;
    }
    if (tool.code) {
      name += ` (${tool.code})`;
    }

    return name;
  }

  render() {
    const { index, onDelete, onCopy, onOpenConfig, depo, drawdown } = this.props;
    const {
      contracts,
      stepExpected,
      additionalLoading,
      directUnloading,
    } = this.state;

    let currentTool = this.getCurrentTool();
    let rubbles = contracts * currentTool.guaranteeValue;

    var additionalLoading2 = this.state.additionalLoading2 || additionalLoading;
    var stepExpected2 = this.state.stepExpected2 || stepExpected;

    console.log(currentTool);

    const freeMoney = depo - drawdown - rubbles;
    const pointsAgainst = drawdown / (contracts * currentTool.stepPrice);
    const incomeExpected = ((depo * (additionalLoading / 100)) / currentTool.guaranteeValue) * (stepExpected / currentTool.priceStep * currentTool.stepPrice) + contracts * (stepExpected / currentTool.priceStep * currentTool.stepPrice);
    const incomeExpected2 = ((depo * (additionalLoading2 / 100)) / currentTool.guaranteeValue) * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice) + contracts * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice);

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
          onClick={e => {
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
            onClick={e => {
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
                value={this.state.currentToolIndex}
                disabled={this.props.tools.length == 0}
                onChange={val => {
                  this.setState({ currentToolIndex: val }, this.recalc)
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
              >
                {
                  this.props.tools.length > 0 ? (
                    this.props.tools
                      .map(tool => this.getToolName(tool))
                      .map((toolName, index) => (
                        <Option key={index} value={index}>{toolName}</Option>
                      ))
                  ) 
                  : (
                    <Option key={0} value={0}>Загрузка...</Option>
                  )
                }
              </Select>
            </label>

            <label className="input-group">
              <Tooltip title="Фактический убыток позиции">
                <span className="input-group__title">Просадка</span>
              </Tooltip>
              <NumericInput
                className="input-group__input tool__drawdown"
                key={this.props.drawdown}
                defaultValue={this.props.drawdown}
                round
                min={1}
                onBlur={val => {
                  if (this.props.onDrawdownChange) {
                    this.props.onDrawdownChange(val, this.recalc.bind(this));
                  }
                }}
                format={formatNumber}
              />
            </label>

            <label className="input-group">
              <span className="input-group__title">Контрактов</span>
              <NumericInput
                className="input-group__input"
                defaultValue={this.state.contracts}
                round
                min={1}
                onBlur={val => this.setState({ contracts: val }, this.recalc)}
                format={formatNumber}
              />
            </label>

            {
              index == 0 && (
                <div className="tool-header-top-tail">
                  <div className="tool-header-top-tail__wrap">
                    <AddButton />

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
                  </div>
                </div>
              )
            }

          </div>

          <div className="tool-header-bottom">
            <div className="tool-header-bottom__wrap">

              <div className="tool-pair">
                <h3 className="tool-pair-key">Загрузка:</h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + `%`}>
                    {(() => {
                      var value = (drawdown + this.getCurrentTool().guaranteeValue * contracts) / depo * 100;
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
                      var value = depo - (drawdown + contracts * this.getCurrentTool().guaranteeValue);
                      return round(value, 1);
                    })()}
                  </Value>
                </span>
              </div>
              
              <div className="tool-pair">
                <h3 className="tool-pair-key">Средняя цена:</h3>
                <span className="tool-pair-val">
                  {(() => {
                    let currentTool = this.getCurrentTool();
                    var val = (
                      currentTool.currentPrice - (pointsAgainst * currentTool.priceStep)
                    ).toFixed(1);

                    return <Value format={formatNumber} isDefault="true">{val}</Value>
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
                    defaultChecked={directUnloading}
                    onChange={val => this.setState({ directUnloading: val })} 
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

                      <label className="input-group">
                        <span className="input-group__title input-group__title--left">
                          Догрузка
                        </span>
                        <Select
                          defaultValue={2}
                          onChange={(val, i) => this.setState({ additionalLoading: +i.props.children.match(/\d+/g)[0] }, this.recalc)}
                          style={{ width: "100%" }}
                        >
                          {
                            [5].concat(
                              new Array(7).fill(0).map((val, i) => 10 * (i + 1))
                            )
                              .map(val => val + "% от депо")
                              .map((value, index) => (
                                <Option key={index} value={index}>{value}</Option>
                              ))
                          }
                        </Select>
                      </label>

                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">Итераций</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(iterations) }
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row">

                      <label className="input-group">
                        <span className="input-group__title input-group__title--left">
                          Ожидаемый ход (руб/$)
                        </span>
                        <NumericInput
                          className="input-group__input"
                          key={this.state.stepExpected}
                          defaultValue={this.state.stepExpected}
                          onBlur={val => {
                            if (val == 0) {
                              val = 0.1;
                            }
                            this.setState({ stepExpected: val }, this.recalc)
                          }}
                          format={formatNumber}
                        />
                      </label>

                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          Прибыль <br className="hide-xs" />
                          за итерацию
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={formatNumber}>{incomeForIteration}</Value>
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Итераций</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(iterations) }
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
                var depo = Math.round(
                  freeMoney - (incomeExpected2 ? incomeExpected2 : incomeExpected)
                );

                var loss = (
                  incomeExpected2
                    ? -incomeExpected2
                    : -incomeExpected
                ).toFixed(1) - this.props.drawdown;

                return (
                  <div className="tool-main-card-body">

                    <div className="tool-main-card-body__row">

                      <label className="input-group">
                        <span className="input-group__title input-group__title--left">
                          Догрузка
                        </span>
                        <Select
                          defaultValue={2}
                          onChange={(val, i) => this.setState({ additionalLoading2: +i.props.children.match(/\d+/g)[0] }, this.recalc)}
                          style={{ width: "100%" }}
                        >
                          {
                            [5].concat(
                              new Array(7).fill(0).map((val, i) => 10 * (i + 1))
                            )
                              .map(val => val + "% от депо")
                              .map((value, index) => (
                                <Option key={index} value={index}>{value}</Option>
                              ))
                          }
                        </Select>
                      </label>

                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">Депозит</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(depo) }
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row">

                      <label className="input-group">
                        <span className="input-group__title input-group__title--left">
                          Ожидаемый ход (руб/$)
                        </span>
                        <NumericInput
                          className="input-group__input"
                          key={stepExpected2 || stepExpected}
                          defaultValue={stepExpected2 || stepExpected}
                          onBlur={val => {
                            if (val == 0) {
                              val = 0.1;
                            }
                            this.setState({ stepExpected2: val }, this.recalc)
                          }}
                          format={formatNumber}
                        />
                      </label>

                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          Убыток <br className="hide-xs" />
                          на догрузку
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={formatNumber}>{loss}</Value>
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Депозит</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(depo) }
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