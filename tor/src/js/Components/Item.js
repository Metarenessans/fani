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
} from 'antd/es'
import $ from "jquery"
import NumericInput from "../Components/NumericInput"

import formatNumber from "../formatNumber"

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
      drawdown: 200000,
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

  recalc() {
    const { depo, tools } = this.props;
    const {
      currentToolIndex,
      drawdown,
      contracts,
      stepExpected,
      additionalLoading,
    } = this.state;

    let currentTool = tools[currentToolIndex];
    let rubbles = contracts * currentTool.guaranteeValue;

    var additionalLoading2 = this.state.additionalLoading2 || additionalLoading;
    var stepExpected2      = this.state.stepExpected2      || stepExpected;

    this.setState({
      freeMoney:      depo - drawdown - rubbles,
      pointsAgainst:  drawdown / (contracts * currentTool.stepPrice),
      incomeExpected: ((depo * (additionalLoading / 100)) / currentTool.guaranteeValue) * (stepExpected / currentTool.priceStep * currentTool.stepPrice),
      incomeExpected2: ((depo * (additionalLoading2 / 100)) / currentTool.guaranteeValue) * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice)
    });
  }

  componentDidMount() {
    this.recalc();
  }

  render() {
    return (
      <div className="item">
        <Tooltip title="Добавить инструмент">
          <button className="item-add" aria-label="Добавить инструмент" onClick={e => {
            if (this.props.onCopy) {
              this.props.onCopy(this, this.props.index);
            }
          }}>
            &times;
          </button>
        </Tooltip>

        {
          this.props.index > 0 ? (
            <Tooltip title="Удалить инструмент">
              <button className="item-delete" aria-label="Удалить инструмент" onClick={e => {
                if (this.props.onDelete) {
                  this.props.onDelete(this, this.props.index);
                }
              }}>
                &times;
              </button>
            </Tooltip>
          )
          :
            null
        }

        <div className="card card-1 main__card-1">
          <div className="card-1__wrap">
            <Col span={11}>
              <div className="search">
                <span className="search__title">Торговый инструмент</span>
                <Select
                  value={this.state.currentToolIndex}
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
                    this.props.tools.map(el => el.name).map((value, index) => (
                      <Option key={index} value={index}>{value}</Option>
                    ))
                  }
                </Select>
              </div>
            </Col>

            <Col span={11}>
              <div className="card-1-right">
                <label className="input-group">
                  <Tooltip title="Фактический убыток позиции">
                    <span className="input-group__title">Просадка</span>
                  </Tooltip>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={this.state.drawdown}
                    round
                    onBlur={val => this.setState({ drawdown: val }, this.recalc)}
                    format={formatNumber}
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__title">Контрактов</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={this.state.contracts}
                    round
                    onBlur={val => this.setState({ contracts: val }, this.recalc)}
                    format={formatNumber}
                  />
                </label>
              </div>
              {/* /.card-1-right */}
            </Col>
          </div>
          {/* /.card-1__wrap */}

          <div className="card-1__wrap">
            <Col span={11}>
              <Row type="flex" justify="space-between">

                <Col span={11}>
                  <Col span={12}>
                    <Text>
                      Свободные<br />
                      деньги
                    </Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold", textAlign: "right" }}>
                    <Text>{formatNumber(Math.round(this.state.freeMoney))}</Text>
                  </Col>
                </Col>

                <Col span={11}>
                  <Col span={12}>
                    <Text>Просадка</Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold", textAlign: "right" }}>
                    {
                      (() => {
                        let val = ((this.state.drawdown / this.props.depo) * 100);
                        if (val > 100) {
                          val = 100;
                        }

                        return (
                          <Text>{"-" + val + "%"}</Text>
                        )
                      })()
                    }
                  </Col>
                </Col>

              </Row>
            </Col>

            <Col span={11}>
              <Row type="flex" justify="space-between">

                <Col span={11}>
                  <Col span={12}>
                    <Text>Средняя цена</Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold", textAlign: "right" }}>
                    {
                      (() => {
                        const { currentToolIndex, pointsAgainst } = this.state;
                        const { tools } = this.props;

                        let currentTool = tools[currentToolIndex];

                        return (
                          <Text>
                            {formatNumber((currentTool.currentPrice - (pointsAgainst * currentTool.priceStep)).toFixed(1))}
                          </Text>
                        )
                      })()
                    }
                  </Col>
                </Col>

                <Col span={11}>
                  <Col span={12}>
                    <Text>Пунктов</Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold", textAlign: "right" }}>
                    <Text>{formatNumber(Math.round(-this.state.pointsAgainst))}</Text>
                  </Col>
                </Col>

              </Row>
            </Col>
          </div>
          {/* /.card-1__wrap */}
        </div>
        {/* /.card-1 */}

        <Row type="flex" justify="space-between">
          <Col span={11}>
            <div className="card card-2 main__card-2">
              <header className="card-2-header">
                <Col span={6}></Col>
                <Col span={12} style={{ textAlign: "center", fontWeight: "bold" }}>
                  <Text>Позитивный сценарий</Text>
                </Col>
                <Col span={6}>
                  <label className="switch card-2__switch">
                    <Switch
                      className="switch__input"
                      defaultChecked={this.state.directUnloading}
                      onChange={val => this.setState({ directUnloading: val })} />
                    <span className="switch__label">Прямая</span>
                  </label>
                </Col>
              </header>
              <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                <Col span={11} style={{ textAlign: "center" }}>
                  <div className="days-select">
                    <span className="days-select__label">Догрузка</span>
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
                  </div>
                </Col>
                <Col span={11}>
                  <Col span={12}>
                    <Text>Итераций</Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold" }}>
                    <Text>
                      {
                        +(this.state.drawdown / this.state.incomeExpected).toFixed(1) *
                         (this.state.directUnloading ? 1 : 2)
                      }
                    </Text>
                  </Col>
                </Col>
              </Row>
              <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                <Col span={11} style={{ textAlign: "center" }}>
                  <div className="days-select">
                    <label className="input-group">
                      <span className="input-group__title">Ожидаемый ход (руб/$)</span>
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
                  </div>
                </Col>
                <Col span={11}>
                  <Col span={12}>
                    <Text>
                      Прибыль<br />
                      за итерацию
                    </Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold" }}>
                    <Text>{formatNumber((
                      this.state.incomeExpected / (this.state.directUnloading ? 1 : 2 )
                    ).toFixed(1))}</Text>
                  </Col>
                </Col>
              </Row>
            </div>
            {/* /.card-2 */}
          </Col>

          <Col span={11}>
            <div className="card card-2 card-2--negative main__card-2">
              <header className="card-2-header">
                <Col span={6}></Col>
                <Col span={12} style={{ textAlign: "center", fontWeight: "bold" }}>
                  <Text>Негативный сценарий</Text>
                </Col>
                <Col span={6}></Col>
              </header>
              <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                <Col span={11} style={{ textAlign: "center" }}>
                  <div className="days-select">
                    <span className="days-select__label">Догрузка</span>
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
                  </div>
                </Col>
                <Col span={11}>
                  <Col span={12}>
                    <Text>Депозит</Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold" }}>
                    <Text>
                      { 
                        formatNumber(Math.round(
                          this.state.freeMoney - 
                          (this.state.incomeExpected2 ? this.state.incomeExpected2 : this.state.incomeExpected)
                        )) 
                      }
                    </Text>
                  </Col>
                </Col>
              </Row>
              <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                <Col span={11} style={{ textAlign: "center" }}>
                  <label className="input-group">
                    <span className="input-group__title">Ожидаемый ход (руб/$)</span>
                    <NumericInput
                      className="input-group__input"
                      key={this.state.stepExpected2 || this.state.stepExpected}
                      defaultValue={this.state.stepExpected2 || this.state.stepExpected}
                      onBlur={val => {
                        if (val == 0) {
                          val = 0.1;
                        }
                        this.setState({ stepExpected2: val }, this.recalc)
                      }}
                      format={formatNumber}
                    />
                  </label>
                </Col>
                <Col span={11}>
                  <Col span={12}>
                    <Text>
                      Убыток<br />
                      на догрузку
                    </Text>
                  </Col>
                  <Col span={12} style={{ fontWeight: "bold" }}>
                    <Text>
                      {
                        formatNumber(
                          (
                            this.state.incomeExpected2
                              ? -this.state.incomeExpected2
                              : -this.state.incomeExpected
                          ).toFixed(1) - this.state.drawdown
                        )
                      }
                    </Text>
                  </Col>
                </Col>
              </Row>
            </div>
            {/* /.card-2 */}
          </Col>
        </Row>
      </div>
    )
  }
}