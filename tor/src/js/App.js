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
import "chart.js"
import CustomSlider from "./Components/CustomSlider"
import NumericInput from "./Components/NumericInput"
import Paginator from "./Components/Paginator"
import Header from "./Components/Header"
import params from "./params";

const { Option } = Select;
const { Group } = Radio;
const { Text } = Typography;

var formatNumber = (val) => (val + "").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");
var chart;

function num2str(n, text_forms) {
  n = Math.abs(n) % 100; var n1 = n % 10;
  if (n > 10 && n < 20) { return text_forms[2]; }
  if (n1 > 1 && n1 < 5) { return text_forms[1]; }
  if (n1 == 1) { return text_forms[0]; }
  return text_forms[2];
}

function extRate(present, future, payment, periods) {

  ///////////////////////////////////////////

  // ( Начальный депозит, Целевой депозит, Сумма на вывод, Торговых дней )
  // Возвращает: Минимальная доходность в день

  // точность в процентах от итоговой суммы
  var delataMaxPercent = 0.1;

  // максимальное количество итераций
  var iterMax = 200;

  ///////////////////////////////////////////
  function ff(rate, periods, present, payment) {
    var res = present;
    rate += 1;
    for (var x = 0; x < periods; x++) res = res * rate - payment;
    return res;
  }
  function ff2(rate, periods, present, payment) {
    var k1 = (1 + rate) ** periods;
    return present * k1 + payment * (k1 - 1) / rate;
  }

  var deltaMax = future * delataMaxPercent / 100;
  var guess = (((future + periods * (payment)) / present) ** (1 / periods)) - 1;
  var guess2 = (periods * payment) ** (1 / (periods * 2)) - 1;

  var delta = guess;

  var rate = guess;
  var minrate = 0;
  var maxrate = 0;

  var current = ff(rate, periods, present, payment);

  while (((current > (future + deltaMax)) || (current < future)) && (iterMax > 0)) {
    current = ff(rate, periods, present, payment);
    if (current > (future + deltaMax)) {

      maxrate = rate;
      rate = minrate + (maxrate - minrate) / 2;
    }
    if (current < future) {

      minrate = rate;
      if (maxrate === 0) rate = rate * 2;
      else rate = minrate + (maxrate - minrate) * 2;
    }
    iterMax--;
  }
  //console.log('Точность ' + (current+future)/2/future);
  return rate;
} 

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // ==================
      // Заполняется руками
      // ==================

      // Депозит
      depo: 2000000,
      // Контрактов
      contracts: 40,
      // Просадка
      drawdown: 200000,

      // ===================
      // Вычисляемые значения
      // ===================

      // Свободные деньги
      freeMoney: 0,
      // Прошло пунктов против
      pointsAgainst: 0,

      tools: this.loadConfig() || [
        {
          name: "Золото (GDZ9)",
          stepPrice: 6.37,
          guaranteeValue: 7194.1,
          averageProgress: 50,
          currentPrice: 1495,
          lotSize: 1.0,
          dollarRate: 0
        }
        , {
          name: "Палладий (PDZ9)",
          stepPrice: 0.64,
          guaranteeValue: 17600.0,
          averageProgress: 50,
          currentPrice: 2400,
          lotSize: 1.0,
          dollarRate: 0
        }
        , {
          name: "Индекс РТС (RIZ9)",
          stepPrice: 12.74,
          guaranteeValue: 22301.4,
          averageProgress: 200,
          currentPrice: 141520,
          lotSize: 1.0,
          dollarRate: 0
        }
        , {
          name: "Доллар/рубль (SIZ9)",
          stepPrice: 1.00,
          guaranteeValue: 4296.5,
          averageProgress: 100,
          currentPrice: 64226,
          lotSize: 1.0,
          dollarRate: 0
        }
        , {
          name: "Сбербанк (SRZ9)",
          stepPrice: 1.00,
          guaranteeValue: 4448.5,
          averageProgress: 100,
          currentPrice: 24413,
          lotSize: 1.0,
          dollarRate: 0
        }
        , {
          name: "APPLE",
          stepPrice: 0.64,
          guaranteeValue: 19709.8,
          averageProgress: 100,
          currentPrice: 310,
          lotSize: 1.0,
          dollarRate: 63.58
        }
        , {
          name: "PG&E",
          stepPrice: 0.64,
          guaranteeValue: 381.5,
          averageProgress: 100,
          currentPrice: 17,
          lotSize: 1.0,
          dollarRate: 63.58
        }
        , {
          name: "NVIDIA",
          stepPrice: 0.64,
          guaranteeValue: 13004.7,
          averageProgress: 100,
          currentPrice: 204.54,
          lotSize: 1.0,
          dollarRate: 63.58
        }
        , {
          name: "MICRON",
          stepPrice: 0.64,
          guaranteeValue: 3053.7,
          averageProgress: 100,
          currentPrice: 48.03,
          lotSize: 1.0,
          dollarRate: 63.58
        }
        , {
          name: "Сбербанк",
          stepPrice: 0.10,
          guaranteeValue: 2525.0,
          averageProgress: 100,
          currentPrice: 252.5,
          lotSize: 10.0,
          dollarRate: 0
        }
        , {
          name: "Магнит",
          stepPrice: 0.10,
          guaranteeValue: 3199.5,
          averageProgress: 50,
          currentPrice: 3199.5,
          lotSize: 1.0,
          dollarRate: 0
        }
        , {
          name: "МосБиржа",
          stepPrice: 0.10,
          guaranteeValue: 936.0,
          averageProgress: 100,
          currentPrice: 93.6,
          lotSize: 10.0,
          dollarRate: 0
        }
        , {
          name: "СургутНефтеГаз",
          stepPrice: .50,
          guaranteeValue: 4646.6,
          averageProgress: 200,
          currentPrice: 46.455,
          lotSize: 100.0,
          dollarRate: 0
        }
        , {
          name: "Газпром",
          stepPrice: 1.00,
          guaranteeValue: 4183.0,
          averageProgress: 50,
          currentPrice: 418.3,
          lotSize: 10.0,
          dollarRate: 0
        }
        , {
          name: "Алроса",
          stepPrice: .10,
          guaranteeValue: 705.8,
          averageProgress: 100,
          currentPrice: 70.58,
          lotSize: 10.0,
          dollarRate: 0
        }
      ],
      currentToolIndex: 2,
    };

    this.state.tools.map((tool, i) => Object.assign(tool, { id: i }));
    this.state.toolsTemp = [...this.state.tools];
    
    if (this.state.currentToolIndex > this.state.tools.length - 1) {
      this.state.currentToolIndex = this.state.tools.length - 1;
    }
  }

  bindEvents() {
    var $modal = $(".modal");
    var $body = $("body");
    $(".js-open-modal").click(e => {
      this.setState({ toolsTemp: [...this.state.tools] }, () => {
        $modal.addClass("visible");
        $body.addClass("scroll-disabled");
      });
    });

    $(".js-close-modal").click(e => {
      $modal.removeClass("visible");
      $body.removeClass("scroll-disabled");
    });
  }

  loadConfig() {
    // Read localStorage
    var config = localStorage.getItem("tools-tor");
    if (config) {
      try {
        config = JSON.parse(config);
      }
      catch (e) {
        console.error(e);
      }
    }

    return config;
  }

  saveConfig() {
    var tools = [];
    $(".js-config-row").each((i, row) => {
      let tool = {};
      tools[i] = tool;
      $(row).find("input").each((i, input) => {
        let key = input.getAttribute("data-name");
        let val = input.value;

        let pair = {};
        pair[key] = val;
        Object.assign(tool, pair);
      });
    });

    localStorage.setItem("tools-tor", JSON.stringify(tools));
    this.setState({ tools });
  }

  componentDidMount() {
    this.bindEvents();
    this.recalc();
  }

  recalc() {
    const { depo, drawdown, contracts, tools, currentToolIndex } = this.state
    
    let currentTool = tools[currentToolIndex];
    let rubbles = contracts * currentTool.guaranteeValue;

    this.setState({ 
      freeMoney:     depo - drawdown - rubbles,
      pointsAgainst: drawdown / (contracts * currentTool.stepPrice),
    });
  }

  render() {
    return (
      <div className="page">
        <Header />

        <main className="main">
          <div className="container">
            <h1 className="main__title">Калькулятор ТОР</h1>

            <div className="main-top">
              <label className="input-group">
                <span className="input-group__title">Депозит</span>
                <NumericInput
                  className="input-group__input"
                  defaultValue={this.state.depo}
                  round
                  onBlur={val => this.setState({ depo: val })}
                  format={formatNumber}
                />
              </label>

              <Tooltip title="Настройка">
                <button className="main-settings js-open-modal" aria-label="Открыть меню">
                  <svg className="main-settings__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M496.66 312.1l-47.06-36.8c.6-5.67 1.1-12.3 1.1-19.32s-.48-13.65-1.1-19.33l47.1-36.82c8.75-6.91 11.14-19.18 5.57-29.4l-48.94-84.67c-5.23-9.56-16.68-14.46-28.3-10.18l-55.54 22.3a190.39 190.39 0 00-33.34-19.35l-8.45-58.9C326.3 8.45 316.58 0 305.09 0h-98.14c-11.5 0-21.2 8.45-22.57 19.46l-8.47 59.11a196.27 196.27 0 00-33.28 19.35L86.95 75.56c-10.43-4.03-22.91.5-28.1 10l-49 84.79a22.94 22.94 0 005.55 29.54l47.06 36.8c-.74 7.2-1.1 13.44-1.1 19.31s.36 12.12 1.1 19.33l-47.1 36.82c-8.75 6.93-11.12 19.2-5.55 29.4l48.94 84.67c5.23 9.53 16.58 14.48 28.3 10.17l55.54-22.29a192.07 192.07 0 0033.32 19.35l8.45 58.88c1.39 11.22 11.1 19.67 22.61 19.67h98.14c11.5 0 21.22-8.45 22.59-19.46l8.47-59.09a197.19 197.19 0 0033.28-19.37l55.68 22.36a22.92 22.92 0 008.36 1.58c8.28 0 15.9-4.53 19.73-11.57l49.16-85.12a23.03 23.03 0 00-5.72-29.22zm-240.64 29.23c-47.06 0-85.33-38.27-85.33-85.33s38.27-85.33 85.33-85.33 85.33 38.27 85.33 85.33-38.27 85.33-85.33 85.33z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
            {/* /.main-top */}

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
                        this.state.tools.map(el => el.name).map((value, index) => (
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
                        onBlur={val => this.setState({ drawdown: val })}
                        format={formatNumber}
                      />
                    </label>
                    
                    <label className="input-group">
                      <span className="input-group__title">Контрактов</span>
                      <NumericInput
                        className="input-group__input"
                        defaultValue={this.state.contracts}
                        round
                        onBlur={val => this.setState({ contracts: val })}
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
                        <Text>{"-" + ((this.state.drawdown / this.state.depo) * 100) + "%"}</Text>
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
                            const { tools, currentToolIndex, pointsAgainst } = this.state;

                            let currentTool = tools[currentToolIndex];

                            return (
                              <Text>
                                { formatNumber(currentTool.currentPrice - (pointsAgainst * currentTool.stepPrice)) }
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
                        <Text>{ formatNumber(Math.round(this.state.pointsAgainst)) }</Text>
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
                          defaultChecked={false}
                          onChange={val => {}} />
                        <span className="switch__label">Прямая</span>
                      </label>
                    </Col>
                  </header>
                  <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                    <Col span={11} style={{ textAlign: "center" }}>
                      <div className="days-select">
                        <span className="days-select__label">Догрузка</span>
                        <Select
                          defaultValue={0}
                          onChange={(val, i) => { }}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
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
                        <Text>4</Text>
                      </Col>
                    </Col>
                  </Row>
                  <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                    <Col span={11} style={{ textAlign: "center" }}>
                      <div className="days-select">
                        <span className="days-select__label">Ожидаемый ход (пп)</span>
                        <Select
                          defaultValue={100}
                          onChange={(val, i) => { }}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
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
                        <Text>
                          Прибыль<br/>
                          за итерацию
                        </Text>
                      </Col>
                      <Col span={12} style={{ fontWeight: "bold" }}>
                        <Text>8 243</Text>
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
                          defaultValue={0}
                          onChange={(val, i) => { }}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          style={{ width: "100%" }}
                        >
                          {
                            ["50", "100"].map((value, index) => (
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
                        <Text>920.3k</Text>
                      </Col>
                    </Col>
                  </Row>
                  <Row className="card-2__row" type="flex" justify="space-between" align="bottom">
                    <Col span={11} style={{ textAlign: "center" }}>
                      <div className="days-select">
                        <span className="days-select__label">Ход против (пп)</span>
                        <Select
                          defaultValue={0}
                          onChange={(val, i) => { }}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          style={{ width: "100%" }}
                        >
                          {
                            ["50", "100"].map((value, index) => (
                              <Option key={index} value={index}>{value}</Option>
                            ))
                          }
                        </Select>
                      </div>
                    </Col>
                    <Col span={11}>
                      <Col span={12}>
                        <Text>
                          Убыток<br/>
                          на догрузку
                        </Text>
                      </Col>
                      <Col span={12} style={{ fontWeight: "bold" }}>
                        <Text>-8 243</Text>
                      </Col>
                    </Col>
                  </Row>
                </div>
                {/* /.card-2 */}
              </Col>
            </Row>
          </div>
          {/* /.container */}
        </main>
        {/* /.main */}

        <div className={"modal".concat(`${this.state.configLoaded ? "" : " loading"}`)}>
          <div className="modal-content">
            <div className="config card">
              <h2 className="config__title">Настройка инструментов</h2>

              <div className="config-table-wrap">
                <table className="table">
                  <thead className="table-header">
                    <tr className="table-tr">
                      <th className="table-th">Инструмент</th>
                      <th className="table-th">Цена шага</th>
                      <th className="table-th">ГО</th>
                      <th className="table-th">Средний ход<br /> инструмента</th>
                      <th className="table-th">Текущая цена</th>
                      <th className="table-th">Размер лота</th>
                      <th className="table-th">Курс доллара</th>
                    </tr>
                  </thead>
                  {
                    this.state.toolsTemp.map((tool, i) =>
                      <tr className="config-tr js-config-row" key={tool.id}>
                        {
                          Object.keys(tool).map((key, i) =>
                            key == "id" ? (
                              null
                            )
                              :
                              <td className="table-td">
                                <Input
                                  className="config__input"
                                  defaultValue={tool[key]}
                                  placeholder={tool[key]}
                                  data-name={key}
                                />
                              </td>
                          )
                        }
                        <td className="table-td">
                          {
                            this.state.toolsTemp.length > 1 ? (
                              <button className="config-tr-delete" aria-label="Удалить инструмент"
                                onClick={e => {
                                  let tools = [...this.state.toolsTemp];
                                  let { currentToolIndex } = this.state;

                                  var i = $(e.target).parents("tr").index() - 1;

                                  tools.splice(i, 1);

                                  this.setState({ 
                                    toolsTemp:        tools,
                                    currentToolIndex: (currentToolIndex > tools.length - 1) ? tools.length - 1 : currentToolIndex
                                  }, this.recalc);
                                }}
                              >
                                <Tag color="magenta">Удалить</Tag>
                              </button>
                            )
                              :
                              null
                          }
                        </td>
                      </tr>
                    )
                  }
                </table>
              </div>
              {/* /.config-talbe-wrap */}

              <Button
                className="config__add-btn"
                type="link"
                onClick={() => {
                  let tools = [...this.state.toolsTemp];

                  tools.push({
                    name:            "Инструмент",
                    stepPrice:       0,
                    guaranteeValue:  0,
                    averageProgress: 0,
                    currentPrice:    0,
                    lotSize:         0,
                    dollarRate:      0,
                    id:              Math.random()
                  });
                  
                  this.setState({ toolsTemp: tools }, () => $(".config-table-wrap").scrollTop(999999) );
                }}
              >
                Добавить инструмент
              </Button>

              <footer className="config-footer">
                <Button className="config__cancel-btn js-close-modal">Отмена</Button>
                <Button
                  className="js-close-modal"
                  type="primary"
                  onClick={() => this.saveConfig()}
                >
                  Сохранить
                </Button>
              </footer>
            </div>
            {/* /.config */}
          </div>
          {/* /.modal-content */}
        </div>
        {/* /.modal */}
      </div>
    );
  }
}

export default App;