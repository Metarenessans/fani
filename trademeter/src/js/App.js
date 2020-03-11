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
      data: [],
      scaleData: [],

      mode: 0,
      // Начальный депозит
      depoStart: +params.get("depoStart") || 1000000,
      // Целевой депозит
      depoEnd: +params.get("depoEnd") || 3000000,
      // Доходность в день
      incomePersantageCustom: 1,
      // Сумма на вывод
      withdrawal: 0,
      // Торговых дней
      days: +params.get("days") || 260,
      // Процент депозита на вход в сделку
      depoPersentageStart: 10,
      // Кол-во итераций в день
      numberOfIterations: 0,

      // Минимальная доходность в день
      minDailyIncome: 45,
      // 
      incomePersantageDaily: 0,

      rowsNumber:     10,
      rowsFirstIndex: 1,

      configLoaded: false,
      tools: this.loadConfig() || [
        {
          name:            "Золото (GDZ9)",
          stepPrice:       6.37,
          guaranteeValue:  7194.1,
          averageProgress: 50,
          currentPrice:    1495,
          lotSize:         1.0,
          dollarRate:      0
        }
        , {
          name:            "Палладий (PDZ9)",
          stepPrice:       0.64,
          guaranteeValue:  17600.0,
          averageProgress: 50,
          currentPrice:    2400,
          lotSize:         1.0,
          dollarRate:      0
        }
        , {
          name: "Индекс РТС (RIZ9)",
          stepPrice: 12.74,
          guaranteeValue: 22301.4,
          averageProgress: 200,
          currentPrice: 141520,
          lotSize:    1.0,
          dollarRate: 0
        }
        , {
          name: "Доллар/рубль (SIZ9)",
          stepPrice: 1.00,
          guaranteeValue: 4296.5,
          averageProgress: 100,
          currentPrice: 64226,
          lotSize:    1.0,
          dollarRate: 0
        }
        , {
          name: "Сбербанк (SRZ9)",
          stepPrice: 1.00,
          guaranteeValue: 4448.5,
          averageProgress: 100,
          currentPrice: 24413,
          lotSize:    1.0,
          dollarRate: 0
        }
        , {
          name: "APPLE",
          stepPrice: 0.64,
          guaranteeValue: 19709.8,
          averageProgress: 100,
          currentPrice: 310,
          lotSize:    1.0,
          dollarRate: 63.58
        }
        , {
          name: "PG&E",
          stepPrice: 0.64,
          guaranteeValue: 381.5,
          averageProgress: 100,
          currentPrice: 17,
          lotSize:    1.0,
          dollarRate: 63.58
        }
        , {
          name: "NVIDIA",
          stepPrice: 0.64,
          guaranteeValue: 13004.7,
          averageProgress: 100,
          currentPrice: 204.54,
          lotSize:    1.0,
          dollarRate: 63.58
        }
        , {
          name: "MICRON",
          stepPrice: 0.64,
          guaranteeValue: 3053.7,
          averageProgress: 100,
          currentPrice: 48.03,
          lotSize:    1.0,
          dollarRate: 63.58
        }
        , {
          name: "Сбербанк",
          stepPrice: 0.10,
          guaranteeValue: 2525.0,
          averageProgress: 100,
          currentPrice: 252.5,
          lotSize:    10.0,
          dollarRate: 0
        }
        , {
          name: "Магнит",
          stepPrice: 0.10,
          guaranteeValue: 3199.5,
          averageProgress: 50,
          currentPrice: 3199.5,
          lotSize:    1.0,
          dollarRate: 0
        }
        , {
          name: "МосБиржа",
          stepPrice: 0.10,
          guaranteeValue: 936.0,
          averageProgress: 100,
          currentPrice: 93.6,
          lotSize:    10.0,
          dollarRate: 0
        }
        , {
          name: "СургутНефтеГаз",
          stepPrice: .50,
          guaranteeValue: 4646.6,
          averageProgress: 200,
          currentPrice: 46.455,
          lotSize:    100.0,
          dollarRate: 0
        }
        , {
          name: "Газпром",
          stepPrice: 1.00,
          guaranteeValue: 4183.0,
          averageProgress: 50,
          currentPrice: 418.3,
          lotSize:    10.0,
          dollarRate: 0
        }
        , {
          name: "Алроса",
          stepPrice: .10,
          guaranteeValue: 705.8,
          averageProgress: 100,
          currentPrice: 70.58,
          lotSize:    10.0,
          dollarRate: 0
        }
      ],
      currentToolIndex: 0,
      isSafe: true,
      directUnloading: true
    };

    this.state.tools.map((tool, i) => Object.assign( tool, { id: i } ));
    this.state.toolsTemp = [...this.state.tools];

    if (this.state.currentToolIndex > this.state.tools.length - 1) {
      this.state.currentToolIndex = this.state.tools.length - 1;
    }

    this.state.showWithdrawal = this.state.withdrawal != 0;
    this.state.rowsNumber = (this.state.days < 10) ? this.state.days : 10;
    this.state.data      = this.buildData(this.state.days);
  }

  buildData(length = 0) {
    let {
      mode,
      tools,
      depoStart,
      withdrawal,
      currentToolIndex,
      minDailyIncome,
      depoPersentageStart,
      incomePersantageCustom
    } = this.state;

    let currentTool = tools[currentToolIndex];

    let data = new Array(length).fill(0);
    data.forEach((val, i) => {
      // Calculating depoStart
      let _depoStart = depoStart;
      if (i > 0) {
        _depoStart = data[i - 1].depoEnd - withdrawal;
      }

      let _scale = 1;
      let _income = 0;
      if (mode == 0) {
        _scale = minDailyIncome;
        _income = _depoStart * (minDailyIncome / 100);
      }
      else {
        _scale = incomePersantageCustom;
        _income = Math.round(_depoStart * incomePersantageCustom) / 100;
      }
      let _depoEnd = _depoStart + _income;

      let _depoStartReal = _depoStart * (depoPersentageStart / 100);

      let _contractsStart = _depoStartReal / currentTool.guaranteeValue;

      let _pointsForIteracion = _income / currentTool.stepPrice / _contractsStart;

      data[i] = {
        day:                i + 1,
        scale:              _scale,
        depoStart:          _depoStart,
        depoStartReal:      _depoStartReal,
        income:             _income,
        depoEnd:            _depoEnd,
        contractsStart:     _contractsStart,
        pointsForIteration: _pointsForIteracion
      }
    });

    return data;
  }

  buildRealData() {
    let {
      mode,
      data,
      depoStart,
      withdrawal,
      minDailyIncome,
      incomePersantageCustom
    } = this.state;

    let realData = new Array(data.length).fill(0);
    realData.forEach((val, i) => {
      // Calculating depoStart
      let _depoStart = depoStart;
      if (i > 0) {
        _depoStart = realData[i - 1].depoEnd - withdrawal;
      }

      let _income = _depoStart;
      _income *= data[i].scale / 100;

      let _depoEnd = _depoStart + _income;

      realData[i] = {
        day:                i + 1,
        depoStart:          _depoStart,
        income:             _income,
        depoEnd:            _depoEnd,
      }
    });

    return realData;
  }

  updateData(length = 0, fn) {
    var data = this.buildData(length);
    this.setState({ data }, fn);
  }

  updateChart() {
    let data  = [ ...this.state.data ];
    data = data.map(val => Math.round(val.depoEnd));
    var data2 = this.buildRealData();
    data2 = data2.map(val => Math.round(val.depoEnd));

    chart.data.labels = new Array(this.state.days).fill().map((val, index) => index + 1);
    chart.data.datasets[0].data = data;
    chart.data.datasets[1].data = data2;
    chart.update();
  }

  loadConfig() {
    // Read localStorage
    var config = localStorage.getItem("tools-tr");
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

    localStorage.setItem("tools-tr", JSON.stringify(tools));
    this.setState({ tools });
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
    this.recalc();

    var chartCtx = document.getElementById("chart").getContext("2d");
    chart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels: new Array(this.state.days).fill().map((val, index) => index + 1),
        datasets: [
          {
            label: "Планируемый рост депо",
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "#40a9ff",
            data: [2, 4, 6, 10, 2, 1, 0],
          },
          {
            label: "Фактический рост депо",
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "green",
            data: [3, 5, 6, 7, 9, 8],
          },
        ]
      },
      options: {
        animation: {
          duration: 500,
          easing: "easeInQuad"
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Номер дня'
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return formatNumber(value);
              }
            }
          }],
        },
        tooltips: {
          bodyFontSize:  16,
          titleFontSize: 18,
          callbacks: {
            title: (items, data) => {
              for (let item of items) {
                item.value = formatNumber(item.value);
              }
              return "День " + items[0].label;
            },
            labelColor: function (tooltipItem, chart) {
              var color = chart.data.datasets[tooltipItem.datasetIndex].borderColor;
              return {
                borderColor:     color,
                backgroundColor: color
              }
            }
          }
        }
      }
    });

    this.bindEvents();
  }

  recalc() {
    var { 
      depoStart,
      depoEnd,
      days,
      withdrawal,
      isSafe,
    } = this.state;

    var guess = withdrawal / depoStart;
    if (isNaN(guess) || guess == 0) {
      guess = .000000001;
    }

    var rate = extRate(depoStart, depoEnd, withdrawal, days);

    this.setState({
      minDailyIncome: this.state.mode == 0 ?
        rate * 100
      :
        (withdrawal / depoStart) * 100,
    }, () => this.updateData(days, () => {
      var {
        tools,
        currentToolIndex,
        minDailyIncome
      } = this.state;

      let currentTool = tools[currentToolIndex];
      let numberOfIterations = Math.round(+(this.state.data[0].pointsForIteration / currentTool.averageProgress).toFixed(2));
      if (numberOfIterations < 1) {
        numberOfIterations = 1;
      }

      var stateObject = {};
      if (isSafe) {
        Object.assign(stateObject, { numberOfIterations });
      }
      
      this.setState(stateObject);

      this.updateChart();
    }));
  }

  render() {
    return (
      <div className="page">
        <Header />

        <main className="main">
          <div className="container">
            <h1 className="main__title">Трейдометр</h1>

            <div className="main-top">
              <Radio.Group
                name="radiogroup"
                defaultValue={this.state.mode}
                onChange={e => {
                  var { value } = e.target;
                  this.setState({ mode: value }, this.recalc)
                }}
              >
                <Radio value={0}>Расчет от желаемой суммы</Radio>
                <Radio value={1}>Расчет от желаемой доходности</Radio>
              </Radio.Group>

              <Tooltip title="Настройка">
                <button className="main-settings js-open-modal" aria-label="Открыть меню">
                  <svg className="main-settings__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M496.66 312.1l-47.06-36.8c.6-5.67 1.1-12.3 1.1-19.32s-.48-13.65-1.1-19.33l47.1-36.82c8.75-6.91 11.14-19.18 5.57-29.4l-48.94-84.67c-5.23-9.56-16.68-14.46-28.3-10.18l-55.54 22.3a190.39 190.39 0 00-33.34-19.35l-8.45-58.9C326.3 8.45 316.58 0 305.09 0h-98.14c-11.5 0-21.2 8.45-22.57 19.46l-8.47 59.11a196.27 196.27 0 00-33.28 19.35L86.95 75.56c-10.43-4.03-22.91.5-28.1 10l-49 84.79a22.94 22.94 0 005.55 29.54l47.06 36.8c-.74 7.2-1.1 13.44-1.1 19.31s.36 12.12 1.1 19.33l-47.1 36.82c-8.75 6.93-11.12 19.2-5.55 29.4l48.94 84.67c5.23 9.53 16.58 14.48 28.3 10.17l55.54-22.29a192.07 192.07 0 0033.32 19.35l8.45 58.88c1.39 11.22 11.1 19.67 22.61 19.67h98.14c11.5 0 21.22-8.45 22.59-19.46l8.47-59.09a197.19 197.19 0 0033.28-19.37l55.68 22.36a22.92 22.92 0 008.36 1.58c8.28 0 15.9-4.53 19.73-11.57l49.16-85.12a23.03 23.03 0 00-5.72-29.22zm-240.64 29.23c-47.06 0-85.33-38.27-85.33-85.33s38.27-85.33 85.33-85.33 85.33 38.27 85.33 85.33-38.27 85.33-85.33 85.33z" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div className="card-1 card main__card-1">
              <Row type="flex" justify="space-between" align="middle">
                <Row className="card-1-label-group" type="flex" justify="space-between" align="middle">
                  <label className="input-group">
                    <span className="input-group__title">Начальный депозит</span>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={this.state.depoStart}
                      min={10000}
                      max={this.state.depoEnd}
                      round
                      onBlur={val => this.setState({
                        depoStart: val == 0 ? 1 : val 
                      }, this.recalc)}
                      format={formatNumber}
                    />
                  </label>

                  <img className="card-1-label-group__arrow" src="dist/img/arrow.svg"/>

                  {
                    this.state.mode == 0 ? (
                      <label className="input-group">
                        <span className="input-group__title">Целевой депозит</span>
                        <NumericInput
                          key={1}
                          className="input-group__input"
                          defaultValue={this.state.depoEnd}
                          min={this.state.depoStart}
                          round
                          onBlur={val => this.setState({ depoEnd: val == 0 ? 1 : val }, this.recalc)}
                          format={formatNumber}
                        />
                      </label>
                    )
                    : (
                      <label className="input-group">
                        <span className="input-group__title">Доходность в день</span>
                        <NumericInput
                          key={this.state.days}
                          className={"input-group__input ".concat(this.state.days == 2600 && this.state.incomePersantageCustom > 1 ? "error" : "")}
                          defaultValue={this.state.incomePersantageCustom}
                          placeholder={(this.state.minDailyIncome).toFixed(3)}
                          min={(this.state.minDailyIncome).toFixed(3)}
                          max={this.state.days == 2600 ? 1 : null}
                          onBlur={val => this.setState({
                            incomePersantageCustom: val
                          }, this.recalc)}
                          onInvalid={val => {
                            let { days } = this.state;

                            if (days == 2600 && val > 1) {
                              return "Вывод больше 1% депозита";
                            }

                            return "";
                          }}
                          onChange={(e, value) => console.log(e, value)}
                          format={formatNumber}
                          suffix="%"
                        />
                      </label>
                    )
                  }
                </Row>

                <Row className="card-1-label-group" type="flex" justify="space-between" align="middle">
                  <label className="input-group">
                    <span className="input-group__title">Сумма на вывод</span>
                    <NumericInput 
                      className="input-group__input"
                      defaultValue={this.state.withdrawal}
                      round
                      format={formatNumber}
                      suffix="/день"
                      max={this.state.depoStart}
                      onBlur={val => {
                        this.setState({
                          withdrawal:     val,
                          showWithdrawal: val !== 0
                        }, this.recalc)
                      }}
                      onInvalid={val => {
                        let { depoStart } = this.state;

                        if (val > (depoStart * 0.15)) {
                          return "Слишком большой вывод!";
                        }

                        return "";
                      }}
                    />
                  </label>
                  
                  <label className="input-group">
                    <span className="input-group__title">Торговых дней</span>
                    <NumericInput 
                      className="input-group__input" 
                      defaultValue={this.state.days}
                      placeholder={1}
                      round
                      min={1}
                      max={2600}
                      onBlur={val => {
                        var days = val;
                        var rowsFirstIndex = this.state.rowsFirstIndex + 10 < days ? this.state.rowsFirstIndex : days - 9;
                        if (rowsFirstIndex < 1) {
                          rowsFirstIndex = 1;
                        }

                        this.updateData(days);

                        this.setState({
                          days:                   days,
                          rowsNumber:             (days < 10) ? days : 10,
                          rowsFirstIndex:         rowsFirstIndex,
                          incomePersantageCustom: days == 2600 ? 1 : this.state.incomePersantageCustom
                        }, this.recalc);
                      }}
                      format={formatNumber}
                    />
                  </label>
                </Row>
                
              </Row>
              {/* /Row */}
            </div>
            {/* /.card-1 */}

            <Row type="flex" style={{ flexWrap: "nowrap" }}>
              <div className="card-2 card main__card-2">

                <div className="slider-block" key={1}>
                  <span className="slider-block__label">
                    Процент депозита на вход в сделку
                    <Tooltip title="Всплывающая подсказка">
                      <img className="slider-block__info" src="dist/img/info.svg"/>
                    </Tooltip>
                  </span>

                  <CustomSlider
                    value={this.state.depoPersentageStart}
                    min={1}
                    max={100}
                    step={1}
                    filter={val => val + "%"}
                    onChange={val => this.setState({ depoPersentageStart: val }, this.recalc)}
                  />
                </div>
                {/* /.slider-block */}
                
                <div className="slider-block" key={2}>
                  <span className="slider-block__label">
                    Количество итераций в день
                    <Tooltip title="Всплывающая подсказка">
                      <img className="slider-block__info" src="dist/img/info.svg"/>
                    </Tooltip>
                  </span>

                  <CustomSlider
                    value={this.state.directUnloading ? this.state.numberOfIterations : this.state.numberOfIterations * 2}
                    min={1}
                    max={100}
                    step={1}
                    onChange={val => {
                      this.setState({ 
                        isSafe: false,
                        numberOfIterations: this.state.directUnloading ? Math.round(val) : Math.round(val / 2) 
                      })}
                    }
                  />
                </div>
                {/* /.slider-block */}

              </div>
              {/* /.card-2 */}

              <div className="card-3 card main__card-3">
                <div className="card-3__row">
                  <div className="card-3__key" style={{ fontWeight: "bold" }}>
                    <span className={"".concat(this.state.mode == 0 ? "medium" : "big")}>
                      Депозит через<br /> {`${this.state.days} ${num2str(this.state.days, ["день", "дня", "дней"])}`}
                    </span>
                  </div>
                  <div className="card-3__val" style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                    <span className={"".concat(this.state.mode == 0 ? "medium" : "big")}>
                      {
                        (() => {
                          let { mode, data, days, depoEnd, withdrawal } = this.state;

                          var val = mode == 0 ?
                            depoEnd
                            :
                            Math.round(data[days - 1].depoEnd - withdrawal)
                          
                          // if (val > 1e12) {
                          //   console.log('trillion');
                          //   val = val.toExponential(2).replace("+", "^")
                          // }

                          return formatNumber(val)
                        })()
                      }
                    </span>
                  </div>
                </div>
                <div className="card-3__row">
                  <div className="card-3__key">
                    Выведено за {`${this.state.days} ${num2str(this.state.days, ["день", "дня", "дней"])}`}
                  </div>
                  <div className="card-3__val">
                    {
                      formatNumber(new Array(
                        isNaN(this.state.days) || this.state.days == 0 ? 1 : this.state.days
                      ).fill(this.state.withdrawal).reduce((prev, curr) => prev + curr))
                    }
                  </div>
                </div>
                <div className="card-3__row">
                  <div className="card-3__key" style={{ fontWeight: "bold" }}>
                    <span className={"".concat(this.state.mode == 0 ? "big" : "medium")}>
                      {
                        this.state.mode == 0 ?
                          <span>
                            Минимальная<br />
                            доходность в день
                          </span>
                          :
                          <span>
                            Доходность на конец<br />
                            периода
                          </span>
                      }
                    </span>
                  </div>
                  <div className="card-3__val card-3__val--big profit">
                    <span className={"".concat(this.state.mode == 0 ? "big" : "medium")}>
                      {
                        (() => {
                          let { mode, minDailyIncome, data, days, depoStart } = this.state;

                          let val = (mode == 0) ?
                              +(minDailyIncome).toFixed(3)
                            :
                            Math.round((data[days - 1].depoEnd - depoStart) / depoStart * 100);
                          
                          if (isNaN(val) || val == Infinity) {
                            val = 0;
                          }

                          return `${val}%`;
                        })()
                      }
                    </span>
                  </div>
                </div>
                <div className="card-3__row">
                  <div className="card-3__key">Доходность за итерацию</div>
                  <div className="card-3__val profit">
                    {
                      this.state.mode == 0 ?
                        `${+(this.state.minDailyIncome / (this.state.numberOfIterations * (this.state.directUnloading ? 1 : 2))).toFixed(3)}%`
                        :
                        `${+(this.state.incomePersantageCustom / (this.state.numberOfIterations * (this.state.directUnloading ? 1 : 2))).toFixed(3)}%`
                    }
                  </div>
                </div>
              </div>
              {/* /.card-3 */}
            </Row>

            <div className="card-4 card main__card-4">
              <header className="card-4__header">
                <div className="search card-4__search">
                  <span className="search__title">Торговый инструмент</span>
                  <Select
                    defaultValue={0}
                    onChange={val => {
                      this.setState({ currentToolIndex: val }, () => this.updateData(this.state.days))
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

                <label className="switch card-4__switch">
                  <Switch 
                    className="switch__input" 
                    defaultChecked={this.state.directUnloading} 
                    onChange={val => this.setState({ directUnloading: val }, this.recalc)} />
                  <span className="switch__label">Прямая разгрузка</span>
                </label>
              </header>
              {/* /.card-4__header */}

              <Row type="flex" style={{ flexWrap: "nowrap" }}>

                <Col style={{ marginRight: "1.25em", flexShrink: 1 }} span={12}>
                  <h3 className="table-title">Вход в сделку</h3>
                  <table className="table">
                    <thead className="table-header">
                      <tr className="table-row">
                        <th className="table-th table-th--small">День</th>
                        <th className="table-th">Депозит на вход</th>
                        <th className="table-th">Контрактов</th>
                        <th className="table-th">Пунктов<br/> за итерацию</th>
                        <th className="table-th">Итераций</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        new Array(this.state.rowsNumber).fill().map((val, i) => {
                          let { 
                            data,
                            depoStart,
                            incomePersantageCustom,
                            rowsFirstIndex,
                            tools,
                            currentToolIndex,
                            directUnloading,
                            numberOfIterations
                          } = this.state;
                          let day = i + rowsFirstIndex;
                          let tool = tools[currentToolIndex];

                          function round(value, decimals) {
                            let dec = Math.pow(10, decimals);
                            return Math.round(value * dec) / dec;
                          }

                          return (
                            <tr className="table-row" key={i}>
                              {/* День */}
                              <td className="table-td">{day}</td>
                              {/* Депозит на вход */}
                              <td className="table-td">
                                {
                                  formatNumber( Math.round( data[day - 1].depoStartReal ) )
                                }
                              </td>
                              {/* Контрактов */}
                              <td className="table-td">
                                {
                                  (data[day - 1].contractsStart).toFixed(1)
                                }
                              </td>
                              {/* Пунктов за итерацию */}
                              <td className={
                                "table-td"
                                  .concat((data[0].pointsForIteration / numberOfIterations) > tool.averageProgress  ? " danger" : "")
                              }
                              >
                                {
                                  round((data[0].pointsForIteration / numberOfIterations).toFixed(2), 1)
                                }
                              </td>
                              {/* Итераций */}
                              <td className="table-td">
                                {
                                  numberOfIterations * (directUnloading ? 1 : 2)
                                }
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                </Col>
                
                <Col span={12}>
                  <h3 className="table-title">Результат на конец дня</h3>
                  <table className="table">
                    <thead className="table-header">
                      <tr className="table-row">
                        <th className="table-th">Депозит</th>
                        <th className="table-th">Прирост</th>
                        {
                          this.state.showWithdrawal ? (
                            <th className="table-th">Вывод</th>
                          ) : null
                        }
                        <th className="table-th">Факт. доходность</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        // new Array(n) - n = number of lines
                        new Array(this.state.rowsNumber).fill().map((val, i) => {
                          var { 
                            data,
                            scaleData,
                            minDailyIncome,
                            rowsFirstIndex,
                          } = this.state;
                          var day = i + rowsFirstIndex;

                          var realData = this.buildRealData();

                          return (
                            <tr className="table-row" key={day}>
                              {/* Депо на конец дня */}
                              <td className="table-td">
                                {
                                  formatNumber(Math.round(data[day - 1].depoEnd))
                                }
                              </td>
                              {/* Прирост */}
                              <td className="table-td profit">
                                {
                                  "+" + formatNumber(Math.round(data[day - 1].income * data[day - 1].scale))
                                }
                              </td>
                              {
                                this.state.showWithdrawal ?
                                  <td className="table-td">{this.state.withdrawal}</td>
                                : 
                                  null
                              }
                              <td className="table-td">
                                {
                                  <div>
                                    <NumericInput
                                      key={data[day - 1].scale}
                                      defaultValue={(data[day - 1].scale).toFixed(3)}
                                      format={formatNumber}
                                      onBlur={val => {
                                        var data = [...this.state.data];
                                        data[day - 1].scale = val;
                                        this.setState({ data }, this.updateChart);
                                      }}
                                    />
                                  </div>
                                }
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                </Col>
                
              </Row>

              <footer className="card-4-footer">
                <Col span={8}>
                </Col>
                
                <Col span={8} style={{ textAlign: "center" }}>
                  {
                    (() => {
                      let { rowsNumber, days, rowsFirstIndex } = this.state;

                      return rowsFirstIndex < days - rowsNumber ? (
                        <Button
                          className="card-4__more-btn"
                          type="link"
                          onClick={() => {
                            rowsNumber = (rowsNumber + 10 < days) ? rowsNumber + 10 : days;

                            if (rowsNumber + rowsFirstIndex > days) {
                              rowsNumber = days - rowsFirstIndex + 1;
                            }
                            this.setState({ rowsNumber: rowsNumber }
                            )
                          }}
                        >
                          показать еще 10
                        </Button>
                      )
                      :
                        null

                    })()
                  }
                </Col>
                
                <Col span={8} style={{ textAlign: "right" }}>
                  <Paginator
                    key={this.state.days}
                    defaultValue={this.state.days}
                    max={this.state.days}
                    onChange={val => {
                      var { days, rowsNumber } = this.state;
                      var rowsFirstIndex = val < days - rowsNumber ? val : (days + 1) - rowsNumber;
                      if (days < rowsNumber) {
                        rowsFirstIndex = 1;
                      }
                      this.setState({ rowsFirstIndex: rowsFirstIndex })
                    }}
                    format={formatNumber}
                  />
                </Col>

              </footer>
              {/* /.card-4-footer */}
            </div>
            {/* /.card-4 */}

            <div className="card-5 card">
              <canvas id="chart"></canvas>
            </div>
            {/* /.card-5 */}
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
                      <th className="table-th">Средний ход<br/> инструмента</th>
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
                                  const { currentToolIndex } = this.state;

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