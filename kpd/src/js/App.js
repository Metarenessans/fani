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
  Tag
} from 'antd/es'
const { Option } = Select;

import Header       from "./Components/Header/Header"
import CustomSelect from "./Components/CustomSelect/CustomSelect"
import NumericInput from "./Components/NumericInput"

import $ from "jquery"
import params from "./params"
import num2str from "./num2str"

import "chart.js"
import "chartjs-plugin-annotation"

import "../sass/main.sass"

var formatNumber = (val) => (val + "").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");

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
  return rate;
}

var chart;
var data = [];

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // Начальный депозит
      depoStart:    +params.get("depoStart") || 1000000,
      // Доход в месяц
      income:       1000000,
      // Требуемый депозит
      depoRequired: +params.get("depoEnd") || null,
      // Месяцев
      months:       12,
      // Дней
      days:         +params.get("days") || 260,

      // Если true, то происходит автоматический пересчет depoRequired
      safe: true,
      
      tools: this.loadConfig() || [
        {
          name: "Сбербанк-п",
          couponIncome: 19.56,
          rate: 6.5,
          frequency: 3,
          date: "15.05.2020"
        }
        ,{
          name: "Другой",
          couponIncome: 22.12,
          rate: 4.9,
          frequency: 2,
          date: "10.04.2020"
        }
      ],
      currentTool: 0
    };

    let { depoRequired, depoStart } = this.state;

    this.state.tools.map((tool, i) => Object.assign(tool, { id: i }));
    this.state.toolsTemp = [...this.state.tools];

    if (depoRequired) {
      console.log('DR exists!');
      var persantage = this.state.tools[this.state.currentTool].rate / 365 * (365 / 260) / 100;

      this.state.income = Math.round( persantage * depoRequired * 21.6667 );
      this.state.safe = false;
    }
    else {
      this.state.safe = true;
    }

  }

  buildData() {
    let {
      days,
      depoStart,
      minDailyIncome,
    } = this.state;

    let data = new Array(Math.round(days + (days * .1))).fill(0);
    data.forEach((val, i) => {
      // Calculating depoStart
      let _depoStart = depoStart;
      if (i > 0) {
        _depoStart = data[i - 1].depoEnd;
      }

      let _income = _depoStart * minDailyIncome;  
      let _depoEnd = _depoStart + _income;

      data[i] = {
        day:       i + 1,
        depoStart: _depoStart,
        income:    _income,
        depoEnd:   _depoEnd
      }
    });

    return data;
  }

  recalc(fn) {
    let { depoStart, depoRequired, days, income, tools, currentTool, safe } = this.state;

    var tool = tools[currentTool];
    var yearIncome = income * 12;

    if (safe) {
      console.log('recalc');
      depoRequired = yearIncome * 100 / tool.rate;
    }

    var rate = extRate(depoStart, depoRequired, 0, days);

    this.setState({
      depoRequired:   depoRequired,
      minDailyIncome: rate,
      safe:           true
    }, () => {
      if (fn) {
        fn.call(this);
      }

      data = this.buildData();
      this.updateChart();
    });
  }

  loadConfig() {
    // Read localStorage
    var config = localStorage.getItem("tools-kpd");
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

    localStorage.setItem("tools-kpd", JSON.stringify(tools));
    this.setState({ tools });
  }

  updateChart() {
    let { days, depoRequired, tools, currentTool } = this.state;
    let chartData = data.map(val => Math.round(val.depoEnd));
    
    chart.data.labels = new Array(Math.round(days + (days * .1))).fill().map((val, index) => index + 1);
    chart.data.datasets[0].data = chartData;
    chart.data.datasets[1].data = chartData;

    var ann = [1, 1];
    var ann_labels = [formatNumber(Math.round(depoRequired)), tools[currentTool].rate+"%"];

    let annotations_array = ann.map(function (value, index) {
      return {
        type:        'line',
        id:          'vline' + index,
        mode:        index == 0 ? 'vertical' : 'horizontal',
        scaleID:     index == 0 ? 'x-axis-0' : 'y-axis-0',
        value:       index == 0 ? days : depoRequired,
        borderColor: 'green',
        borderDash: [2, 2],
        borderWidth:  2,
        label: {
          enabled:  true,
          position: index == 0 ? "bottom" : "left",
          content:  ann_labels[index]
        }
      }
    });

    chart.options.annotation.annotations = [];
    chart.update();
    
    chart.options.annotation.annotations = annotations_array;
    
    chart.update();
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

  componentDidMount() {
    let { tools, currentTool } = this.state;

    var chartCtx = document.getElementById("chart").getContext("2d");
    chart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels: new Array(5).fill().map((val, index) => index + 1),
        datasets: [
          {
            label: null,
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "#1890ff",
            data: [],
          },
          {
            label: null,
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "white",
            data: [],
          }
        ]
      },
      options: {
        responsive: true,
        legend: {
          display: false
        },
        animation: {
          duration: 500,
          easing: "easeInQuad"
        },
        scales: {
          xAxes: [{
            id: 'x-axis-0',
            display: true,
            position: "right",
            scaleLabel: {
              display: true,
              labelString: 'Депозит'
            }
          }],
          yAxes: [{
            id: 'y-axis-0',
            display: true,
            position: "left",
            scaleLabel: {
              display: true,
              labelString: "Ставка % годовых"
            },
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return formatNumber(value);
              }
            }
          }],
        },
        tooltips: {
          bodyFontSize: 16,
          titleFontSize: 18,
          width:  32,
          height: 32,

          callbacks: {
            title: (item, data) => {
              var val1 = item[0].value;
              
              item[0].value = "Планируемый депо: " + formatNumber(item[0].value);

              var persantage = tools[currentTool].rate / 365 * (365 / 260) / 100;

              item[1].value = "Пассивный доход: " + formatNumber(Math.round(val1 * persantage)) + " / в день";
              return "День " + item[0].label
            },
            labelColor: function (tooltipItem, chart) {
              var color = chart.data.datasets[tooltipItem.datasetIndex].borderColor;
              return {
                borderColor:     color,
                backgroundColor: color
              };
            },
          }
        },
        annotation: {
          drawTime: 'afterDatasetsDraw',
          annotations: [],
        },
      },
      plugins: ["annotation"]
    });

    this.recalc();
    this.bindEvents();
  }

  render() {
    return (
      <div className="page">
        <Header />

        <main className="main">
          <div className="container">
            <h1 className="main__title">Калькулятор Пассивного Дохода</h1>

            <div className="main-top">
              <Tooltip title="Настройка">
                <button className="main-settings js-open-modal" aria-label="Открыть меню">
                  <svg className="main-settings__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M496.66 312.1l-47.06-36.8c.6-5.67 1.1-12.3 1.1-19.32s-.48-13.65-1.1-19.33l47.1-36.82c8.75-6.91 11.14-19.18 5.57-29.4l-48.94-84.67c-5.23-9.56-16.68-14.46-28.3-10.18l-55.54 22.3a190.39 190.39 0 00-33.34-19.35l-8.45-58.9C326.3 8.45 316.58 0 305.09 0h-98.14c-11.5 0-21.2 8.45-22.57 19.46l-8.47 59.11a196.27 196.27 0 00-33.28 19.35L86.95 75.56c-10.43-4.03-22.91.5-28.1 10l-49 84.79a22.94 22.94 0 005.55 29.54l47.06 36.8c-.74 7.2-1.1 13.44-1.1 19.31s.36 12.12 1.1 19.33l-47.1 36.82c-8.75 6.93-11.12 19.2-5.55 29.4l48.94 84.67c5.23 9.53 16.58 14.48 28.3 10.17l55.54-22.29a192.07 192.07 0 0033.32 19.35l8.45 58.88c1.39 11.22 11.1 19.67 22.61 19.67h98.14c11.5 0 21.22-8.45 22.59-19.46l8.47-59.09a197.19 197.19 0 0033.28-19.37l55.68 22.36a22.92 22.92 0 008.36 1.58c8.28 0 15.9-4.53 19.73-11.57l49.16-85.12a23.03 23.03 0 00-5.72-29.22zm-240.64 29.23c-47.06 0-85.33-38.27-85.33-85.33s38.27-85.33 85.33-85.33 85.33 38.27 85.33 85.33-38.27 85.33-85.33 85.33z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
            {/* /.main-top */}

            <Row type="flex" style={{ marginBottom: "1.25em" }}>
              <Col span={12}>
                <div className="card-1 card main__card-1">
                  <div className="card-1__content">
                    <label className="input card-1__input">
                      <span className="input-label">Начальный депозит</span>
                      <NumericInput
                        className="card-1-input-group__input"
                        defaultValue={this.state.depoStart}
                        onBlur={val => this.setState({ depoStart: val }, this.recalc)}
                        format={formatNumber}
                        />
                    </label>
                    
                    <label className="input">
                      <span className="input-label">Пассивный доход в месяц</span>
                      <NumericInput
                        className="card-1-input-group__input"
                        defaultValue={this.state.income}
                        onBlur={val => this.setState({ income: val }, this.recalc)}
                        format={formatNumber}
                      />
                    </label>
                  </div>
                  {/* /.card-1__content */}
                  <footer className="card-footer">
                    <div className="card-footer__left">
                      <span>Требуемый депозит:</span>
                    </div>
                    <div className="card-footer__right">
                      <span>{formatNumber(Math.round(this.state.depoRequired))}</span>
                    </div>
                  </footer>
                </div>
                {/* /.card-1 */}
              </Col>
              <Col span={12}>
                <div className="card-2 card">
                  <div className="card-2__content">
                    <div className="input">
                      <span className="input-label">Инструмент пассивного дохода</span>
                      <Select
                        defaultValue={0}
                        onChange={val => {
                          this.setState({ currentTool: val }, this.recalc)
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
                  </div>
                  {/* /.card-2__content */}
                  <span className="card-2__rate">
                    Ставка: {this.state.tools[this.state.currentTool].rate}%
                  </span>
                  <footer className="card-footer">
                    <div className="card-footer__left">
                      <span>Доход в месяц: </span>
                    </div>
                    <div className="card-footer__right">
                      {
                        (() => {
                          const { income } = this.state

                          return formatNumber(Math.round( income ))
                        })()
                      }
                    </div>
                  </footer>
                  {/* /.card-2__footer */}
                </div>
                {/* /.card-2 */}
              </Col>
            </Row>

            <canvas id="chart"></canvas>

            <div className="main-bottom">
              <label className="days-select">
                <span className="days-select__label">
                  Дней до цели
                  <Tooltip overlayClassName="days-info-wrap" title="365 календарный дней = 260 рабочих">
                    <img className="info-icon" src="dist/img/info.svg" />
                  </Tooltip>
                </span>
                <CustomSelect
                  optionsDefault={
                    [50, 100].concat(new Array(10).fill(0).map((n, i) => 260 * (i + 1)))
                  }
                  formatOption={val => {
                    var years = +(val / 260).toFixed(2);
                    var suffix = "";
                    if (val >= 260) {
                      suffix = ` (${years} ${num2str(years, ["год", "года", "лет"])})`;
                    }
                    return `${val}` + suffix;
                  }}
                  value={this.state.days}
                  min={1}
                  max={2600}
                  onChange={value => {
                    let { days } = this.state;
                    days = value;

                    this.setState({ days }, this.recalc);
                  }}
                />
              </label>

              <Button type="link" className="main-link"
                onClick={e => {
                  e.preventDefault();

                  const { depoStart, depoRequired, days } = this.state;

                  var href = `https://fani144.ru/trademeter/#
                    depoStart=${depoStart}&
                    depoEnd=${Math.round(depoRequired)}&
                    days=${days}
                  `.replace(/[\s\n\t]+/g, "");
                  window.location = href;
                }}
              >
                Открыть трейдометр
              </Button>
            </div>
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
                      <th className="table-th">Купонный доход</th>
                      <th className="table-th">Ставка</th>
                      <th className="table-th">Частота</th>
                      <th className="table-th">Дата выплаты</th>
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

                                  var i = $(e.target).parents("tr").index() - 1;

                                  tools.splice(i, 1);
                                  // console.log(tools);

                                  this.setState({ toolsTemp: tools });
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
                    name:         "Акция",
                    couponIncome: 0,
                    rate:         0,
                    frequency:    0,
                    date:         "01.01.2020",
                    id:           Math.random()
                  });
                  
                  this.setState({ toolsTemp: tools }, () => $(".config-table-wrap").scrollTop(999999) );
                }}
              >
                Добавить акцию
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