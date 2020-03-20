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
import SpeedometerWrap from "./Components/SpeedometerWrap"
import params from "./params";
import formatBigNumbers from "./format";

const { Option } = Select;
const { Group } = Radio;
const { Text, Title } = Typography;

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

function BigNumber(props) {
  var { val, format, threshold } = props;
  format    = format || formatNumber;
  let customSuffix = props.suffix || "";

  let originalValue = val;

  if (val > 1e12) {
    val = formatBigNumbers(val);

    return (
      <Tooltip title={ format(originalValue) + customSuffix }>
        <span>{ val + customSuffix }</span>
      </Tooltip>
    )
  }
  else return <span>{ format(val) + customSuffix }</span>
}

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      scaleData: [],

      mode: 0,
      // Начальный депозит
      depoStart: [
        +params.get("depoStart") || 1000000,
        +params.get("depoStart") || 1000000,
      ],
      // Целевой депозит
      depoEnd: +params.get("depoEnd") || 3000000,
      // Доходность в день
      incomePersantageCustom: 1,
      // Сумма на вывод
      withdrawal: [
        0,
        0
      ],
      // Торговых дней
      days: [
        +params.get("days") || 260,
        +params.get("days") || 260
      ],
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
        this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`),
        this.parseTool(`Палладий (PLD-6.20)	0,79537	0,0100	70	43 626,69	1 617,04	1`),
        this.parseTool(`Доллар/рубль (Si-6.20)	1,00000	1,0000	150	12 610,77	80 446	1 000`),
        this.parseTool(`Нефть (BR-4.20)	7,95374	0,0100	50	7 561,22	26,56	10	`),
        this.parseTool(`Индекс РТС (RTS-6.20)	15,90748	10,0000	700	38 030,35	88 480	1	`),
        this.parseTool(`Сбербанк (SBRF-6.20)	1,00000	1,0000	250	5 131,79	17 860	100	`),
        this.parseTool(`Магнит (MGNT-6.20)	1,00000	1,0000	50	806,15	2 976	1	`),
        this.parseTool(`APPLE	0,82000	0,0100	120	20 072,0	244,78	1	82`),
        this.parseTool(`PG&E	0,82000	0,0100	80	648,6	7,91	1	82`),
        this.parseTool(`NVIDIA	0,82000	0,0100	250	17 463,5	212,97	1	82`),
        this.parseTool(`MICRON	0,82000	0,0100	140	2 975,8	36,29	1	82`),
        this.parseTool(`Сбербанк	0,10000	0,0100	100	1 895,1	189,51	10	1`),
        this.parseTool(`Магнит	0,10000	0,5000	90	2 950,0	2 950,0	1	1`),
        this.parseTool(`МосБиржа	0,10000	0,0100	60	884,6	88,46	10	1`),
        this.parseTool(`СургутНефтеГаз	0,50000	0,0050	350	2 700,0	27,000	100	1`),
        this.parseTool(`Газпром	1,00000	0,0100	90	1 745,6	174,56	10	1`),
        this.parseTool(`Алроса	0,10000	0,0100	100	597,0	59,70	10	1`),
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

    this.state.showWithdrawal = this.state.withdrawal[this.state.mode] != 0;
    this.state.rowsNumber = (this.state.days[this.state.mode] < 10) ? this.state.days[this.state.mode] : 10;
    this.state.data      = this.buildData(this.state.days[this.state.mode]);
  }

  parseTool(str) {
    var arr = str
      .replace(/\,/g, ".")
      .split(/\t+/g)
      .map(n => (n + "").replace(/\"/g, "").replace(/(\d+)\s(\d+)/, "$1$2"));
    
    var obj = {
      name:             arr[0],
      stepPrice:       +arr[1],
      priceStep:       +arr[2],
      averageProgress: +arr[3],
      guaranteeValue:  +arr[4],
      currentPrice:    +arr[5],
      lotSize:         +arr[6],
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
    console.log(obj);
    return obj;
  }

  buildData(length = 0) {
    let {
      mode,
      tools,
      currentToolIndex,
      minDailyIncome,
      depoPersentageStart,
      incomePersantageCustom
    } = this.state;

    let depoStart  = this.state.depoStart[mode];
    let withdrawal = this.state.withdrawal[mode];

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
      minDailyIncome,
      incomePersantageCustom
    } = this.state;

    let depoStart  = this.state.depoStart[mode];
    let withdrawal = this.state.withdrawal[mode];

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

    chart.data.labels = new Array(this.state.days[this.state.mode]).fill().map((val, index) => index + 1);
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

      if (this.state.tools[i].points) {
        tool.points = this.state.tools[i].points;
      }
    });

    localStorage.setItem("tools-tr", JSON.stringify(tools));
    this.setState({ tools });
  }

  bindEvents() {
    var $modal = $(".modal");
    var $modalSmall = $(".js-config-small");
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
    
    $(".js-close-modal-small").click(e => {
      console.log(this.state.tools[this.state.currentToolIndex].points);
      this.setState({ toolPointsTemp: [...(this.state.tools[this.state.currentToolIndex].points)] }, () => {
        $modalSmall.removeClass("visible");
        $body.removeClass("scroll-disabled");
      });
    });
  }

  componentDidMount() {
    this.recalc();

    var chartCtx = document.getElementById("chart").getContext("2d");
    chart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels: new Array(this.state.days[this.state.mode]).fill().map((val, index) => index + 1),
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

    // Speedometer
    (function () {
      function ac_add_to_head(el) {
        var head = document.getElementsByTagName('head')[0];
        head.insertBefore(el, head.firstChild);
      }
      function ac_add_link(url) {
        var el = document.createElement('link');
        el.rel = 'stylesheet'; el.type = 'text/css'; el.media = 'all'; el.href = url;
        ac_add_to_head(el);
      }
      function ac_add_style(css) {
        var ac_style = document.createElement('style');
        if (ac_style.styleSheet) ac_style.styleSheet.cssText = css;
        else ac_style.appendChild(document.createTextNode(css));
        ac_add_to_head(ac_style);
      }
      ac_add_link('https://cdn.anychart.com/releases/8.7.1/css/anychart-ui.min.css?hcode=a0c21fc77e1449cc86299c5faa067dc4');
    })();
  }

  recalc() {
    var {
      mode,
      depoEnd,
      isSafe,
    } = this.state;

    let depoStart  = this.state.depoStart[mode];
    let withdrawal = this.state.withdrawal[mode];
    let days = this.state.days[mode];

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

  setWithdrawal(val = 0) {
    const { mode } = this.state;
    let withdrawal = [...this.state.withdrawal];

    withdrawal[mode] = val;
    this.setState({ withdrawal, showWithdrawal: val !== 0 }, this.recalc);
  }

  checkFn(withdrawal, depoStart, days, persentage) {
    const { mode } = this.state;

    if (!persentage) {
      console.log('!!!!!!!!');
      persentage = mode == 0 ? 15 : this.state.incomePersantageCustom;
    }
    persentage = persentage / 100;
    console.log(withdrawal, depoStart, persentage, "(" + (depoStart * persentage) +")" , days);

    var err = ["Слишком большой вывод!", "Слишком маленькая доходность!"];

    if (mode == 0) {
      if ((withdrawal > (depoStart * persentage)) || (withdrawal > (depoStart * 0.01) && days == 2600)) {
        return err;
      }
    }
    else {
      if (withdrawal > (depoStart * persentage)) {
        return err;
      }
    }

    return ["", ""];
  }

  checkFn2(dayilyIncome, days) {
    if (days >= 2600 && dayilyIncome > 1) {
      return "Слишком большая доходность!";
    }

    return "";
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
                  var { data } = this.state;
                  let days = this.state.days[value];

                  if (days > data.length) {
                    this.updateData(days);
                  }

                  this.setState({ mode: value }, this.recalc);
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
                      key={this.state.mode}
                      className="input-group__input"
                      defaultValue={this.state.depoStart[this.state.mode]}
                      min={10000}
                      max={this.state.mode == 0 ? this.state.depoEnd : null}
                      round
                      onBlur={val => {
                        let depoStart = [...this.state.depoStart];
                        const { mode } = this.state

                        depoStart[mode] = val == 0 ? 1 : val;
                        this.setState({ depoStart }, this.recalc)
                      }}
                      onChange={(e, val) => {
                        if (isNaN(val)) {
                          return;
                        }

                        const { mode } = this.state;
                        let withdrawal = this.state.withdrawal[mode];
                        let days = this.state.days[mode];

                        var errMessages = this.checkFn(withdrawal, val, days);
                        this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                                    this.withdrawalInput.setErrorMsg(errMessages[0]);
                      }}
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
                          min={this.state.depoStart[this.state.mode]}
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
                          key={this.state.days[this.state.mode]}
                          className="input-group__input"
                          defaultValue={this.state.incomePersantageCustom}
                          placeholder={(this.state.minDailyIncome).toFixed(3)}
                          // min={(this.state.minDailyIncome).toFixed(3)}
                          // max={this.state.days[this.state.mode] == 2600 ? 1 : null}
                          onBlur={val => this.setState({ incomePersantageCustom: val }, this.recalc) }
                          onChange={(e, val) => {
                            const { days, withdrawal, depoStart, mode } = this.state;

                            var persentage = +val;
                            if (isNaN(persentage)) {
                              persentage = undefined;
                            }

                            var errMessages = this.checkFn(withdrawal[mode], depoStart[mode], days[mode], persentage);

                            this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                                        this.withdrawalInput.setErrorMsg(errMessages[0]);
                          }}
                          onRef={ ref => this.incomePersantageCustomInput = ref }
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
                      key={this.state.mode}
                      className="input-group__input"
                      defaultValue={this.state.withdrawal[this.state.mode]}
                      round
                      format={formatNumber}
                      suffix="/день"
                      max={this.state.depoStart[this.state.mode] * .15}
                      onBlur={ val => this.setWithdrawal(val) }
                      onChange={ (e, val) => {
                        const { mode } = this.state;
                        let depoStart = this.state.depoStart[mode];
                        let days = this.state.days[mode];

                        var errMessages = this.checkFn(val, depoStart, days);

                        this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                                    this.withdrawalInput.setErrorMsg(errMessages[0]);
                      } }
                      onRef={ ref => this.withdrawalInput = ref }
                    />
                  </label>
                  
                  <label className="input-group">
                    <span className="input-group__title">Торговых дней</span>
                    <NumericInput
                      key={this.state.mode}
                      className="input-group__input" 
                      defaultValue={this.state.days[this.state.mode]}
                      placeholder={1}
                      round
                      min={1}
                      max={2600}
                      onBlur={val => {
                        let { mode } = this.state;
                        var days = [...this.state.days];
                        days[mode] = val;

                        var rowsFirstIndex = this.state.rowsFirstIndex + 10 < val ? this.state.rowsFirstIndex : val - 9;
                        if (rowsFirstIndex < 1) {
                          rowsFirstIndex = 1;
                        }

                        this.updateData(val);

                        this.setState({
                          days:           days,
                          rowsNumber:     (val < 10) ? val : 10,
                          rowsFirstIndex: rowsFirstIndex,
                        }, this.recalc);
                      }}
                      onChange={ (e, val) => {
                        const { mode } = this.state;
                        let withdrawal = this.state.withdrawal[mode];
                        let depoStart = this.state.depoStart[mode];

                        this.withdrawalInput.setErrorMsg(this.checkFn(withdrawal, depoStart, val)[0]);
                        // this.incomePersantageCustomInput.setErrorMsg(this.checkFn2(this.state.incomePersantageCustom, val));
                      } }
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
                    <Tooltip title="Максимальный объем входа в сделку">
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
                    <Tooltip title="Количество повторений сделки">
                      <img className="slider-block__info" src="dist/img/info.svg"/>
                    </Tooltip>
                  </span>

                  <CustomSlider
                    value={
                      this.state.directUnloading 
                      ? 
                        this.state.numberOfIterations 
                      : 
                        (this.state.numberOfIterations * 2 >= 100) ? 100 : this.state.numberOfIterations * 2
                    }
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
                      Депозит через<br /> {`${this.state.days[this.state.mode]} ${num2str(this.state.days[this.state.mode], ["день", "дня", "дней"])}`}
                    </span>
                  </div>
                  <div className="card-3__val" style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                    <span className={"".concat(this.state.mode == 0 ? "medium" : "big")}>
                      {
                        (() => {
                          let { mode, data, depoEnd } = this.state;
                          let withdrawal = this.state.withdrawal[mode];
                          let days = this.state.days[mode];

                          // console.log(data, days);

                          var val = mode == 0 ?
                            depoEnd
                            :
                            Math.round(data[days - 1].depoEnd - withdrawal)

                          return <BigNumber val={val} format={formatNumber} />
                        })()
                      }
                    </span>
                  </div>
                </div>
                <div className="card-3__row">
                  <div className="card-3__key">
                    Выведено за {`${this.state.days[this.state.mode]} ${num2str(this.state.days[this.state.mode], ["день", "дня", "дней"])}`}
                  </div>
                  <div className="card-3__val">
                    {
                      formatNumber(new Array(
                        isNaN(this.state.days[this.state.mode]) || this.state.days[this.state.mode] == 0 ? 1 : this.state.days[this.state.mode]
                      ).fill(this.state.withdrawal[this.state.mode]).reduce((prev, curr) => prev + curr))
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
                          let { mode, minDailyIncome, data } = this.state;
                          let depoStart = this.state.depoStart[mode];
                          let days = this.state.days[mode];

                          let val = (mode == 0) ?
                              +(minDailyIncome).toFixed(3)
                            :
                            Math.round((data[days - 1].depoEnd - depoStart) / depoStart * 100);
                          
                          if (isNaN(val) || val == Infinity) {
                            val = 0;
                          }

                          return <BigNumber val={val} threshold={1e9} suffix="%" />
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
                      this.setState({ currentToolIndex: val }, () => this.updateData(this.state.days[this.state.mode]))
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
                    {
                      (() => {
                        let {
                          data,
                          mode,
                          incomePersantageCustom,
                          rowsFirstIndex,
                          tools,
                          currentToolIndex,
                          directUnloading,
                          numberOfIterations
                        } = this.state;

                        function round(value, decimals) {
                          let dec = Math.pow(10, decimals);
                          return Math.round(value * dec) / dec;
                        }

                        let depoStart = this.state.depoStart[mode];
                        let tool = tools[currentToolIndex];

                        if (!numberOfIterations) {
                          numberOfIterations = 1;
                        }

                        let pointsForIteration = data[0].pointsForIteration / numberOfIterations;
                        if (!directUnloading && (numberOfIterations * 2) >= 100) {
                          pointsForIteration = (data[0].pointsForIteration * 2) / 100;
                        }
                        
                        return <tbody>
                          {
                            new Array(this.state.rowsNumber).fill().map((val, i) => {
                              
                              let day = i + rowsFirstIndex;

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
                                  <SpeedometerWrap
                                    key={pointsForIteration}
                                    chances={[
                                      tool.points.map(row => row[0]),
                                      tool.points.map(row => row[1])
                                    ]}
                                    value={pointsForIteration}
                                    directUnloading={directUnloading}
                                    numberOfIterations={numberOfIterations}
                                    tool={tool}
                                  />
                                  {/* Итераций */}
                                  <td className="table-td">
                                    {
                                      Math.min( numberOfIterations * (directUnloading ? 1 : 2), 100 )
                                    }
                                  </td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      })()
                    }
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
                            mode,
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
                                  formatNumber(Math.round( realData[day - 1].depoEnd ))
                                }
                              </td>
                              {/* Прирост */}
                              <td className="table-td profit">
                                {
                                  "+" + formatNumber(Math.round( realData[day - 1].income ))
                                }
                              </td>
                              {
                                this.state.showWithdrawal ?
                                  <td className="table-td">{this.state.withdrawal[this.state.mode]}</td>
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
                      let { mode, rowsNumber, rowsFirstIndex } = this.state;
                      let days = this.state.days[mode];

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
                    key={this.state.days[this.state.mode]}
                    defaultValue={this.state.days[this.state.mode]}
                    max={this.state.days[this.state.mode]}
                    onChange={val => {
                      var { mode, rowsNumber } = this.state;
                      let days = this.state.days[mode];

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

          <footer className="footer">
            <div className="container">
              <Button className="footer__link" type="link" onClick={e => {
                e.preventDefault();

                const { data, mode } = this.state;
                let days       = this.state.days[mode];
                let withdrawal = this.state.withdrawal[mode];

                let depoStart = this.state.depoStart[mode];
                let depoEnd   = mode == 0 ? this.state.depoEnd : data[days - 1].depoEnd - withdrawal;

                var href = `http://fani144.ru/kpd#
                  depoStart=${depoStart}&
                  depoEnd=${Math.round(depoEnd)}&
                  days=${Math.round(days)}
                `.replace(/[\s\n\t]+/g, "");

                window.open(href, "_blank");
              }}>
                Перейти к КПД
              </Button>
            </div>
          </footer>
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
                      <th className="table-th"></th>
                      <th className="table-th">Инструмент</th>
                      <th className="table-th">Цена шага</th>
                      <th className="table-th">Шаг цены</th>
                      <th className="table-th">Средний ход</th>
                      <th className="table-th">ГО</th>
                      <th className="table-th">Текущая цена</th>
                      <th className="table-th">Размер лота</th>
                      <th className="table-th">Курс доллара</th>
                    </tr>
                  </thead>
                  {
                    this.state.toolsTemp.map((tool, i) =>
                      <tr className="config-tr js-config-row" key={tool.id}>
                        <td className="table-td">
                          <button className="config-tr-settings" aria-label="Удалить инструмент"
                            onClick={e => {
                              $(".js-config-small").addClass("visible");
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                 width="1.5em" height="1.5em" fill="#1890ff"
                            >
                              <path d="M496.66 312.1l-47.06-36.8c.6-5.67 1.1-12.3 1.1-19.32s-.48-13.65-1.1-19.33l47.1-36.82c8.75-6.91 11.14-19.18 5.57-29.4l-48.94-84.67c-5.23-9.56-16.68-14.46-28.3-10.18l-55.54 22.3a190.39 190.39 0 00-33.34-19.35l-8.45-58.9C326.3 8.45 316.58 0 305.09 0h-98.14c-11.5 0-21.2 8.45-22.57 19.46l-8.47 59.11a196.27 196.27 0 00-33.28 19.35L86.95 75.56c-10.43-4.03-22.91.5-28.1 10l-49 84.79a22.94 22.94 0 005.55 29.54l47.06 36.8c-.74 7.2-1.1 13.44-1.1 19.31s.36 12.12 1.1 19.33l-47.1 36.82c-8.75 6.93-11.12 19.2-5.55 29.4l48.94 84.67c5.23 9.53 16.58 14.48 28.3 10.17l55.54-22.29a192.07 192.07 0 0033.32 19.35l8.45 58.88c1.39 11.22 11.1 19.67 22.61 19.67h98.14c11.5 0 21.22-8.45 22.59-19.46l8.47-59.09a197.19 197.19 0 0033.28-19.37l55.68 22.36a22.92 22.92 0 008.36 1.58c8.28 0 15.9-4.53 19.73-11.57l49.16-85.12a23.03 23.03 0 00-5.72-29.22zm-240.64 29.23c-47.06 0-85.33-38.27-85.33-85.33s38.27-85.33 85.33-85.33 85.33 38.27 85.33 85.33-38.27 85.33-85.33 85.33z" />
                            </svg>
                          </button>
                        </td>
                        {
                          Object.keys(tool).map((key, i) =>
                            key == "id" || key == "points" ? (
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

            <div className="config-small js-config-small">
              <h2 className="config__title">Настройка хода инструмента</h2>

              <Row type="flex" justify="space-between" style={{ marginBottom: "1em" }}>
                <Col span={11} style={{ textAlign: "center" }}>
                  <Title level={4}>Пункты</Title>
                </Col>
                <Col span={11} style={{ textAlign: "center" }}>
                  <Title level={4}>Шансы</Title>
                </Col>
              </Row>

              {
                (() => {
                  const { toolsTemp, currentToolIndex } = this.state;
                  let currentTool = toolsTemp[currentToolIndex];

                  return currentTool.points.map((n, i) =>
                    <Row key={i} type="flex" justify="space-between" style={{ marginBottom: "1em" }}>
                      <Col span={11}>
                        <NumericInput
                          defaultValue={n[0]}
                        />
                      </Col>
                      <Col span={11}>
                        <NumericInput
                          defaultValue={n[1]}
                        />
                      </Col>
                    </Row>
                  )
                })()
              }

              <Button
                className="config__add-btn"
                type="link"
                onClick={() => {
                  let toolsTemp = [...this.state.toolsTemp];
                  const { currentToolIndex } = this.state;
                  let currentTool = toolsTemp[currentToolIndex]; 
                  currentTool.points.push([ 0, 0 ]);

                  this.setState({ toolsTemp });
                }}
              >
                Добавить
              </Button>

              <footer className="config-footer">
                <Button className="config__cancel-btn js-close-modal-small">Отмена</Button>
                <Button
                  className="js-close-modal-small"
                  type="primary"
                  onClick={() => {
                    let toolPointsTemp = [...this.state.toolPointsTemp];
                    let tools = [...this.state.tools];
                    const { currentToolIndex } = this.state

                    console.log(tools[currentToolIndex]);
                    tools[currentToolIndex].points = toolPointsTemp;
                    this.setState({ tools });
                  }}
                >
                  Сохранить
                </Button>
              </footer>
            </div>
          </div>
          {/* /.modal-content */}
        </div>
        {/* /.modal */}
      </div>
    );
  }
}

export default App;