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
  Tag,
  Progress,
  Collapse 
} from 'antd/es'

import {
  SettingFilled,
  DeleteOutlined,
  InfoCircleOutlined,
  QuestionCircleFilled
} from '@ant-design/icons'

import $ from "jquery"
import "jquery.nicescroll"
import "chart.js"
import round from "./round";
import params from "./params";
import num2str from './num2str'
import formatBigNumbers from "./format";

import "../sass/main.sass"

import BigNumber       from "./Components/BigNumber"
import Header          from "./Components/Header/Header"
import NumericInput    from "./Components/NumericInput"
import CustomSlider    from "./Components/CustomSlider/CustomSlider"
import CustomSelect    from './Components/CustomSelect/CustomSelect'
import Paginator       from "./Components/Paginator/Paginator"
import SpeedometerWrap from "./Components/Speedometer/SpeedometerWrap"
import Chances         from "./Components/Chances/Chances"

const { Group } = Radio;
const { Option } = Select;
const { Panel } = Collapse;
const { Text, Title } = Typography;

var formatNumber = val => (val + "").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");
var chart, chart2, chartData, chartData2, scale, scaleStart, scaleEnd;

function extRate(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment = 0, dayoffirstpayload = 0) {

  ///////////////////////////////////////////

  // ( Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1) )
  // Возвращает: Минимальная доходность в день

  // точность в процентах от итоговой суммы
  var delataMaxPercent = 0.1;

  // максимальное количество итераций
  var iterMax = 250;

  var showday = [];

  ///////////////////////////////////////////
  function ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1) {
    var res = present;
    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    rate += 1;

    for (var x = 0; x < periods; x++) {
      res = res * rate;
      p1--; p2--;
      if (!p2) { p2 = payloadper; res += payload; }
      if (!p1) { p1 = paymentper; res -= payment; }
    }
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

  var current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);

  while (((current > (future + deltaMax)) || (current < future)) && (iterMax > 0)) {
    current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);
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

// HTML Elemets
var $body;
var $modal;
var $modalSmall;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data:     [],
      realData: [],

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
      // Сумма на пополнение
      payload: [
        0,
        0
      ],
      // Торговых дней
      days: [
        +params.get("days") || 260,
        +params.get("days") || 260
      ],
      daysOptions: [50, 100].concat( new Array(10).fill(0).map((n, i) => 260 * (i + 1)) ),
      daysOptionsIndex: [2, 2],
      currentDay: 1,

      // Частота вывода
      withdrawalInterval: 20,
      // Частота пополнения
      payloadInterval:    20,

      // Процент депозита на вход в сделку
      depoPersentageStart: 10,
      // Кол-во итераций в день
      numberOfIterations: 0,

      // Минимальная доходность в день
      minDailyIncome: 45,
      // 
      incomePersantageDaily: 0,

      configVisible: false,
      // defaults
      tools: [],
      currentToolIndex:   0,
      toolToConfigIndex: -1,
      isSafe: true,
      directUnloading: true,

      passiveIncomeTools: [
        {
          name: "ОФЗ 26214",
          rate: 4.99,
        },
        {
          name: "ОФЗ 26205",
          rate: 5.78,
        },
        {
          name: "ОФЗ 26217",
          rate: 5.99,
        },
        {
          name: "ОФЗ 26209",
          rate: 6.26,
        },
        {
          name: "ОФЗ 26220",
          rate: 6.41,
        },
      ],
      currentPassiveIncomeToolIndex: -1,
      // Пассивный доход в месяц
      passiveIncomeMonthly: 0,
      pitError: "",

      resultCollapsed: true,
      resultSaved:     false,
      resultChanged:   false,
    };

    // Default tools
    this.state.tools.map((tool, i) => Object.assign(tool, { id: i }));
    
    if (this.state.currentToolIndex > this.state.tools.length - 1) {
      this.state.currentToolIndex = this.state.tools.length - 1;
    }

    this.state.data     = this.buildData(this.state.days[this.state.mode]);
    this.state.realData = this.buildRealData(this.state.data);
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
    return obj;
  }

  createDayData(daysArray, i) {
    let {
      mode,
      tools,
      withdrawalInterval,
      payloadInterval,
      currentToolIndex,
      minDailyIncome,
      depoPersentageStart,
      incomePersantageCustom
    } = this.state;

    let depoStart   = this.state.depoStart[mode];
    let withdrawal  = this.state.withdrawal[mode];
    let payload     = this.state.payload[mode];
    let currentTool = tools[currentToolIndex] || this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`);

    // Calculating depoStart
    let _depoStart = depoStart;
    if (i > 0) {
      _depoStart = daysArray[i - 1].depoEnd;
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

    if ((i + 1) > 0 && ((i + 1) % withdrawalInterval) == 0) {
      _income -= withdrawal;
    }
    if ((i + 1) > 0 && ((i + 1) % payloadInterval) == 0) {
      _income += payload;
    }

    let _depoEnd = _depoStart + _income;

    let _depoStartReal = _depoStart * (depoPersentageStart / 100);

    let _contractsStart = _depoStartReal / currentTool.guaranteeValue;

    let _pointsForIteracion = _income / currentTool.stepPrice / _contractsStart;

    return {
      day:                i + 1,
      scale:              _scale,
      depoStart:          _depoStart,
      depoStartReal:      _depoStartReal,
      income:             _income,
      depoEnd:            _depoEnd,
      contractsStart:     _contractsStart,
      pointsForIteration: _pointsForIteracion
    }
  }

  buildData(length = 0) {
    console.error('Building data');
    let data = new Array(length).fill(0);
    data.forEach((val, i) => {
      data[i] = this.createDayData(data, i)
    });

    return data;
  }

  buildRealData(data = []) {
    console.error('Building real data');
    let { mode, withdrawalInterval, payloadInterval } = this.state;
    let withdrawal = this.state.withdrawal[mode];
    let payload    = this.state.payload[mode];
    
    let realData = new Array(data.length).fill(0);
    realData.forEach((val, i) => {
      var dayData = this.createDayData(realData, i);

      dayData.income = dayData.depoStart;
      dayData.income *= data[i].scale / 100;

      if ((i + 1) > 0 && ((i + 1) % withdrawalInterval) == 0) {
        dayData.income -= withdrawal;
      }
      if ((i + 1) > 0 && ((i + 1) % payloadInterval) == 0) {
        dayData.income += payload;
      }

      dayData.depoEnd = dayData.depoStart + dayData.income;

      realData[i] = dayData;
    });

    return realData;
  }

  updateData(length = 0, fn) {
    var data     = this.buildData(length);
    var realData = this.buildRealData(data);
    this.setState({ data, realData }, fn);
  }

  updateChart() {
    const { days, mode } = this.state
    console.error('Updating chart');

    let data  = [ ...this.state.data ];
    data = data.map(val => Math.round(val.depoEnd));

    var data2 = [ ...this.state.realData ];
    data2 = data2.map(val => Math.round(val.depoEnd));

    // chart.data.labels = new Array(days[mode]).fill().map((v, i) => i + 1);
    // chart.data.datasets[0].data = data;
    // chart.data.datasets[1].data = data2;
    // chart.update();

    if (chart2) {
      chartData2.data( new Array(days[mode]).fill().map((v, i) => [i + 1,  data[i]] ) );
       chartData.data( new Array(days[mode]).fill().map((v, i) => [i + 1, data2[i]] ) );

      scale.minimum(Math.floor(days[mode] * scaleStart) + 1);
      scale.maximum(Math.floor(days[mode] * scaleEnd));
    }
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
    this.setState({ tools }, this.recalc);
  }

  openModal() {
    this.setState({ configVisible: true });
    $modal.addClass("visible");
     $body.addClass("scroll-disabled");
  }
  
  closeModal() {
    this.setState({ configVisible: false });
    $modal.removeClass("visible");
     $body.removeClass("scroll-disabled");
  }

  bindEvents() {
    $body = $(document.body);
    $modal = $(".m");
    $modalSmall = $(".js-config-small");

    $(".js-open-modal").click(e => {
      this.openModal();
    });

    $(".js-close-modal").click(e => this.closeModal());
    
    $(".js-close-modal-small").click(e => {
      this.setState({ toolPointsTemp: [...(this.state.tools[this.state.currentToolIndex].points)] }, () => {
        $modalSmall.removeClass("visible");
        $body.removeClass("scroll-disabled");
      });
    });

    $modal.click(e => {
      if ($(e.target).is($modal)) {
        this.closeModal();
      }
    });

    $(document.body).on("keydown", e => {
      // Esc
      if ( e.keyCode == 27 ) {
        this.closeModal();
      }
    })
  }

  componentDidMount() {
    this.recalc();
    this.bindEvents();

    $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures",
      success: (res) => {
        let data = JSON.parse(res).data;

        var t = [];
        for (let tool of data) {
          if (tool.price == 0 || !tool.volume) {
            continue;
          }

          var obj = {
            shortName:        tool.shortName       || "default name",
            name:             tool.fullName        || tool.shortName,
            stepPrice:       +tool.stepPrice       || 0,
            priceStep:       +tool.priceStep       || 0,
            averageProgress: +tool.averageProgress || 0,
            guaranteeValue:  +tool.guarantee       || 0,
            currentPrice:    +tool.price           || 0,
            lotSize:         +tool.lotSize         || 0,
            dollarRate:      +tool.dollarRate      || 0,

            points: [
              [70, 70],
              [156, 55],
              [267, 41],
              [423, 27],
              [692, 13],
              [960, 7],
            ]
          };
          t.push(obj);
        }

        if (t.length > 0) {
          let { tools } = this.state;
          tools = tools.concat(t);
          
          this.setState({ tools }, this.recalc);
        }
      },
      error: (err) => console.error(err),
    });

    // New chart
    anychart.onDocumentReady(() => {
      // create data
      chartData = anychart.data.set(
        new Array(5).fill(0).map((number, index) => [index + 1, index + 1])
        );
        
      chartData2 = anychart.data.set(
        new Array(5).fill(0).map((number, index) => [index + 1, index + 1])
      );

      chart2 = anychart.line();

      scaleStart = 0;
      scaleEnd   = 1;
      scale = anychart.scales.linear();
      scale.minimum(1);
      scale.maximum(260);
      scale.ticks().interval(1);
      console.log(scale.ticks());

      // turn on X Scroller
      chart2.xScroller(true);
      // adjusting the thumbs behavior and look
      chart2.xScroller().listen("scrollerchange", e => {
        const { days, mode } = this.state;
        scaleStart = e.startRatio;
        scaleEnd   = e.endRatio;
        console.log(scaleStart, scaleEnd);

        scale.minimum(Math.max(Math.round(days[mode] * scaleStart) + 1, 1));
        scale.maximum(Math.min(Math.round(days[mode] * scaleEnd)   + 1, days[mode]));
      });
      chart2.tooltip().titleFormat(e => `День: ${e.name}`);

      var series = chart2.line(chartData);
      series.name("Фактический рост депо");
      series.tooltip().format(e => `${e.seriesName}:  ${formatNumber( e.value )}`);
      // Line color
      series.normal().stroke({
        color:     "#87d068",
        thickness: "5%"
      });
      
      var series2 = chart2.line(chartData2);
      series2.name("Планируемый рост депо");
      series2.tooltip().format(e => `${e.seriesName}: ${formatNumber( e.value )}`);
      // Line color
      series2.normal().stroke({
        color:     "#40a9ff",
        thickness: "5%"
      });
      
      chart2.xAxis().title("Номер дня");
      chart2.yAxis().labels().format((e) => formatNumber( e.value ));

      chart2.xAxis().scale(scale);
      chart2.xAxis().ticks(true);
      
      // chart2.xAxis().labels().fontSize(14);
      // chart2.xAxis().labels().position('center');
      
      chart2.xScale().mode('continuous');

      chart2.container("_chart");
      chart2.draw();
    });
  }

  recalc(cb) {
    console.error("Recalc");
    
    var {
      mode,
      depoEnd,
      isSafe,
      withdrawalInterval,
      payloadInterval,
      passiveIncomeMonthly
    } = this.state;

    let depoStart  = this.state.depoStart[mode];
    let withdrawal = this.state.withdrawal[mode];
    let payload    = this.state.payload[mode];
    let days       = this.state.days[mode];

    var rate = extRate(
      depoStart,
      depoEnd,
      withdrawal,
      withdrawalInterval,
      payload,
      payloadInterval,
      days,
      withdrawalInterval,
      payloadInterval
    );
    
    this.setState({
      minDailyIncome: 
        mode == 0 
          ? rate * 100
          : (withdrawal / depoStart) * 100,
    }, () => this.updateData(days, () => {
      var {
        tools,
        currentToolIndex,
      } = this.state;

      let currentTool = tools[currentToolIndex] || this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`);
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
      if (cb) {
        cb.call(this);
      }
    }));
  }

  setWithdrawal(val = 0) {
    const { mode } = this.state;
    let withdrawal = [...this.state.withdrawal];

    withdrawal[mode] = val;
    this.setState({ withdrawal }, this.recalc);
  }

  checkFn(withdrawal, depoStart, days, persentage) {
    const { mode } = this.state;
    depoStart  = +depoStart;
    withdrawal = +withdrawal;

    if (!persentage) {
      persentage = mode == 0 ? 15 : this.state.incomePersantageCustom;
    }
    persentage = +(persentage / 100);

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

  recalcPassiveIncome() {
    
  }

  recalcDepoEnd(val, passiveIncomeTool) {
    let rate = passiveIncomeTool.rate;
    let annualIncome = val * 12;
    let depoEnd = Math.round(annualIncome * 100 / rate);

    this.setState({ depoEnd }, this.recalc);
  }

  // ==================
  // Getters
  // ==================

  /**
   * Получить текущий торговый инструмент
   */
  getCurrentTool() {
    const { tools, currentToolIndex } = this.state;
    return tools[currentToolIndex] || this.parseTool(`default	7,95374	0,1000	70	13 638,63	1 482,9	1`);
  }

  /**
   * Депо через N дней
   */
  getDepoEnd() {
    const {
      data,
      mode,
      depoEnd
    } = this.state;

    // TODO: do we need withdrawal here??
    let withdrawal = this.state.withdrawal[mode];
    let days = this.state.days[mode];

    return (mode == 0)
      ? depoEnd
      : data[days - 1].depoEnd - withdrawal
  }

  getDailyIncome() {
    const { mode, minDailyIncome, incomePersantageCustom } = this.state;
    return (mode == 0)
      ? minDailyIncome
      : incomePersantageCustom;
  }

  getPointsForIteration() {
    const { data, directUnloading, numberOfIterations } = this.state;

    let pointsForIteration = data[0].pointsForIteration / (numberOfIterations || 1);
    if (!directUnloading && (numberOfIterations * 2) >= 100) {
      pointsForIteration = (data[0].pointsForIteration * 2) / 100;
    }

    return round(pointsForIteration, 1);
  }

  render() {
    return (
      <div className="page">
        <Header />

        <main className="main">

          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">
                <Title className="main__h1" level={1}>Трейдометр</Title>
                
                <Radio.Group
                  className="tabs"
                  name="radiogroup"
                  defaultValue={this.state.mode}
                  onChange={e => {
                    var { value } = e.target;
                    var { data } = this.state;
                    let days = this.state.days[value];
                    var state = {};

                    if (days > data.length) {
                      var data     = this.buildData(days);
                      var realData = this.buildRealData(data);
                      Object.assign(state, { data, realData });
                    }

                    this.setState(Object.assign(state, { mode: value }), this.recalc);
                  }}
                >
                  <span className="tabs__centerline"></span>
                  <Radio className="tabs__label tabs__label--1" value={0}>
                    <span className="prefix">Расчет</span>
                    от желаемой суммы
                  </Radio>
                  <Radio className="tabs__label tabs__label--2" value={1}>
                    <span className="prefix">Расчет</span>
                    от желаемой доходности
                  </Radio>
                </Radio.Group>

                <Button 
                  className="custom-btn custom-btn--secondary" 
                  style={{ display: "none", marginTop: "2.5em" }}
                  onClick={() => alert("It works!")}
                >
                  Сохранить
                </Button>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
          {/* /.main-top */}

          <div className="container">
            <section className="controls">
              <Col span={14}>
                <div className="card controls-card1">
                  <h2 className="visually-hidden">Ввод значений</h2>

                  {/* Начальный депозит */}
                  <label className="input-group" style={{ width: "20em" }}>
                    <span className="input-group__label">Начальный депозит</span>
                    <NumericInput
                      key={this.state.mode}
                      className="input-group__input"
                      defaultValue={this.state.depoStart[this.state.mode]}
                      min={10000}
                      max={this.state.mode == 0 ? this.state.depoEnd : null}
                      round
                      unsigned
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
                
                  {/* Целевой депозит */}
                  {
                    this.state.mode == 0 ? (
                      <label className="input-group" style={{ width: "20em" }}>
                        <span className="input-group__label">Целевой депозит</span>
                        <NumericInput
                          key={this.state.depoEnd}
                          className="input-group__input"
                          defaultValue={this.state.depoEnd}
                          min={this.state.depoStart[this.state.mode]}
                          round
                          unsigned
                          onBlur={val => {
                            const { 
                              depoEnd,
                              passiveIncomeTools,
                              currentPassiveIncomeToolIndex,
                            } = this.state;

                            var passiveIncomeMonthly = this.state.passiveIncomeMonthly;
                            if (currentPassiveIncomeToolIndex > -1) {
                              var tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                              var persantage = tool.rate / 365 * (365 / 260) / 100;
                              passiveIncomeMonthly = Math.round(persantage * depoEnd * 21.6667);
                            }

                            this.setState({
                              depoEnd: val == 0 ? 1 : val,
                              passiveIncomeMonthly
                            }, this.recalc);
                          }}
                          format={formatNumber}
                        />
                      </label>
                    )
                    : (
                      <label className="input-group" style={{ width: "20em" }}>
                        <span className="input-group__label">Доходность в день</span>
                        <NumericInput
                          key={this.state.days[this.state.mode]}
                          className="input-group__input"
                          defaultValue={this.state.incomePersantageCustom}
                          placeholder={(this.state.minDailyIncome).toFixed(3)}
                          unsigned
                          onBlur={val => {
                            this.setState({
                              incomePersantageCustom: val
                            }, () => {
                              this.recalc(() => {
                                const {
                                  data,
                                  days,
                                  mode,
                                  passiveIncomeTools,
                                  currentPassiveIncomeToolIndex,
                                } = this.state;

                                var depoEnd = this.getDepoEnd();

                                var passiveIncomeMonthly = this.state.passiveIncomeMonthly;
                                if (currentPassiveIncomeToolIndex > -1) {
                                  var tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                                  var persantage = tool.rate / 365 * (365 / 260) / 100;
                                  passiveIncomeMonthly = Math.round(persantage * depoEnd * 21.6667);
                                }
                                this.setState({ passiveIncomeMonthly });
                              });

                            });
                          }}
                          onChange={(e, val) => {
                            const { days, withdrawal, depoStart, mode } = this.state;

                            var persentage = +val;
                            if (isNaN(persentage)) {
                              persentage = undefined;
                            }

                            var errMessages = this.checkFn(withdrawal[mode], depoStart[mode], days[mode], persentage);

                            if (mode == 1) {
                              this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                            }
                            this.withdrawalInput.setErrorMsg(errMessages[0]);
                          }}
                          onRef={ref => this.incomePersantageCustomInput = ref}
                          format={formatNumber}
                          suffix="%"
                        />
                      </label>
                    )
                  }

                  {/* Дней */}
                  <label className="input-group" style={{ width: "20em" }}>
                    <span className="input-group__label input-group__label--centered">
                      Дней
                    </span>
                    <CustomSelect 
                      key={this.state.mode}
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
                      value={this.state.days[this.state.mode]}
                      min={1}
                      max={2600}
                      onChange={value => {
                        let { mode } = this.state;
                        let days = [...this.state.days];
                        
                        days[mode] = value;
                        var currentDay = Math.min(value, this.state.currentDay);
                        var data       = this.buildData(value);
                        var realData   = this.buildRealData(data);

                        this.setState({ days, currentDay, data, realData }, this.recalc);

                        // validation
                        let withdrawal = this.state.withdrawal[mode];
                        let depoStart  = this.state.depoStart[mode];

                        if (mode == 1) {
                          this.incomePersantageCustomInput.setErrorMsg(
                            this.checkFn2(this.state.incomePersantageCustom, value)
                          );
                        }
                        this.withdrawalInput.setErrorMsg(this.checkFn(withdrawal, depoStart, value)[0]);
                      }}
                    />
                  </label>
                </div>

                <div className="card controls-card2 controls__card2">
                  <h2 className="visually-hidden">Пассивный доход</h2>
                  
                  {/* Пассивный доход */}
                  <label className="input-group" style={{ width: "20em" }}>
                    <span className="input-group__label">Пассивный доход</span>
                    <NumericInput
                      className="input-group__input"
                      key={this.state.passiveIncomeMonthly}
                      defaultValue={this.state.passiveIncomeMonthly}
                      round
                      unsigned
                      suffix="/мес"
                      onBlur={val => {
                        const { passiveIncomeTools, currentPassiveIncomeToolIndex } = this.state;
                        var pitError = currentPassiveIncomeToolIndex < 0
                          ? "Выберете инструмент пассивного дохода"
                          : "";

                        var cb = () => {
                          this.setState({ pitError });

                          var currentPassiveIncomeTool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                          this.recalcDepoEnd(val, currentPassiveIncomeTool);
                        };

                        this.setState({ passiveIncomeMonthly: val }, () => {
                          if (val == 0) {
                            return;
                          }

                          if (currentPassiveIncomeToolIndex < 0) {
                            console.warn("Tool is not selected!")
                            this.setState({ pitError });
                          }
                          else {
                            cb();
                          }
                        });

                      }}
                      onChange={(e, val) => {
                        if (isNaN(val)) {
                          return;
                        } 
                      }}
                      format={formatNumber}
                    />
                  </label>

                  <label className="input-group" style={{ width: "42em" }}>
                    <Tooltip 
                      visible={this.state.pitError.length > 0}
                      title={this.state.pitError}
                    >
                      <span className="input-group__label">Инструмент пассивного дохода</span>
                    </Tooltip>
                    <Select
                      defaultValue={this.state.currentPassiveIncomeToolIndex}
                      onChange={index => {
                        this.setState({
                          currentPassiveIncomeToolIndex: index,
                          pitError: ""
                        }, () => {
                          const {
                            passiveIncomeMonthly,
                            passiveIncomeTools,
                            currentPassiveIncomeToolIndex
                          } = this.state;

                          if (index < 0) {
                            return;
                          }

                          var depoEnd = this.getDepoEnd();
                          var currentPassiveIncomeTool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                          var persantage = currentPassiveIncomeTool.rate / 365 * (365 / 260) / 100;
                          this.setState({ passiveIncomeMonthly: Math.round(persantage * depoEnd * 21.6667) })
                        })
                      }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      style={{ width: "100%" }}
                    >
                      <Option key={-1} value={-1}>Не выбран</Option>
                      {
                        this.state.passiveIncomeTools
                          .map((tool, index) =>
                            <Option key={index} value={index}>
                              {`${tool.name} (${tool.rate}%/год)`}
                            </Option>
                          )
                      }
                    </Select>
                  </label>

                </div>
              </Col>

              <Col span={10} style={{ marginLeft: "1.5em" }}>
                <div className="card card--secondary controls-card3">
                  {/* Вывод */}
                  <Row type="flex" justify="space-between" align="middle">

                    <label className="input-group" style={{ width: "20em" }}>
                      <span className="input-group__label">Вывод</span>
                      <NumericInput
                        key={this.state.mode}
                        className="input-group__input"
                        defaultValue={this.state.withdrawal[this.state.mode]}
                        round
                        format={formatNumber}
                        max={this.state.depoStart[this.state.mode] * .15}
                        onBlur={val => this.setWithdrawal(val)}
                        onChange={(e, val) => {
                          const { mode } = this.state;
                          let depoStart = this.state.depoStart[mode];
                          let days = this.state.days[mode];

                          var errMessages = this.checkFn(val, depoStart, days);

                          if (mode == 1) {
                            this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                          }
                          this.withdrawalInput.setErrorMsg(errMessages[0]);
                        }}
                        onRef={ref => this.withdrawalInput = ref}
                      />
                    </label>

                    {/* Частота */}
                    <label className="input-group" style={{ width: "20em" }}>
                      <span className="input-group__label">Частота</span>
                      <CustomSelect
                        value={0}
                        optionsDefault={[20, 50, 100]}
                        formatOption={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                        min={1}
                        max={2600}
                        onChange={value => {
                          this.setState({ withdrawalInterval: value }, this.recalc);
                        }}
                      />
                    </label>

                  </Row>
                  
                  {/* Пополнение */}
                  <Row type="flex" justify="space-between" align="middle" 
                       style={{ marginTop: "3em" }}>

                    <label className="input-group" style={{ width: "20em" }}>
                      <span className="input-group__label">Пополнение</span>
                      <NumericInput
                        key={this.state.mode}
                        className="input-group__input"
                        defaultValue={this.state.payload[this.state.mode]}
                        round
                        format={formatNumber}
                        max={9999999}
                        onBlur={val => {
                          let { mode, payload } = this.state;
                          payload[mode] = val;

                          this.setState({ payload }, this.recalc);
                        }}
                        onChange={(e, val) => {
                          
                        }}
                      />
                    </label>

                    {/* Частота */}
                    <label className="input-group" style={{ width: "20em" }}>
                      <span className="input-group__label">Частота</span>
                      <CustomSelect
                        value={0}
                        optionsDefault={[20, 50, 100]}
                        formatOption={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                        min={1}
                        max={2600}
                        onChange={value => {
                          this.setState({ payloadInterval: value }, this.recalc);
                        }}
                      />
                    </label>

                  </Row>
                </div>
              </Col>
            </section>
            {/* /.controls */}

            {(() => {
              let {
                days,
                data,
                mode,
                depoEnd,
                minDailyIncome,
                directUnloading,
                numberOfIterations,
                incomePersantageCustom,
                withdrawal,
                withdrawalInterval,
                payloadInterval,
                payload,
              } = this.state;

              var paymentTotal = 0;
              var payloadTotal = 0;

              if (days[mode] > withdrawalInterval) {
                // Вывод
                paymentTotal = new Array( +Math.floor(days[mode] / withdrawalInterval) )
                  .fill(withdrawal[mode])
                  .reduce((prev, curr) => prev + curr);
              }

              if (days[mode] > payloadInterval) {
                // Пополнение
                payloadTotal = new Array( +Math.floor(days[mode] / payloadInterval) )
                  .fill(payload[mode])
                  .reduce((prev, curr) => prev + curr);
              }

              return (
                <section className="stats main__stats">
                  <h2 className="visually-hidden">Статистика</h2>

                  <Col span={12} className="stats-col">
                    <h2 className="main__h2 stats-title">
                      Депозит через {`${days[mode]} ${num2str(days[mode], ["день", "дня", "дней"])}`}
                    </h2>
                    <p className="stats-subtitle">
                      <BigNumber val={Math.round( this.getDepoEnd() )} format={formatNumber} />
                    </p>

                    <footer className="stats-footer">
                      <Col span={12}>
                        <h3 className="stats-key main__h3">
                          <span aria-label="Доходность">Дох-ть</span> на конец периода
                        </h3>
                        <div className="stats-val b">
                          {
                            (() => {
                              let { data } = this.state;
                              let depoStart = this.state.depoStart[mode];

                              let val = Math.round((data[days[mode] - 1].depoEnd - depoStart) / depoStart * 100);

                              if (isNaN(val) || val == Infinity) {
                                val = 0;
                              }

                              return <BigNumber val={val} threshold={1e9} suffix="%" />
                            })()
                          }
                        </div>
                      </Col>

                      <Col span={12}>
                        <h3 className="stats-key main__h3">
                          <span aria-label="Доходность">Дох-ть</span> за итерацию
                        </h3>
                        <div className="stats-val b">
                          {
                            (() => {


                              return mode == 0 ?
                                `${+(minDailyIncome / (numberOfIterations * (directUnloading ? 1 : 2))).toFixed(3)}%`
                                :
                                `${+(incomePersantageCustom / (numberOfIterations * (directUnloading ? 1 : 2))).toFixed(3)}%`
                            })()
                          }
                        </div>
                      </Col>
                    </footer>
                  </Col>
                  {/* /.stats-col */}

                  <Col span={12} className="stats-col">
                    <h2 className="main__h2 stats-title">
                      <span arial-label="Минимальная">Мин.</span> доходность в день
                    </h2>
                    <p className="stats-subtitle">
                      {
                        (() => {
                          let val = mode == 0
                            ? +(minDailyIncome).toFixed(3)
                            : incomePersantageCustom;

                          if (isNaN(val) || val == Infinity) {
                            val = 0;
                          }

                          return <BigNumber val={val} threshold={1e9} suffix="%" />
                        })()
                      }
                    </p>

                    <footer className="stats-footer">
                      {
                        paymentTotal !== 0
                        ? (
                          <Col span={12}>
                            <h3 className="stats-key main__h3">
                              { `Выведено за ${days[mode]} ${num2str(days[mode], ["день",   "дня", "дней"])}` }
                            </h3>
                            <div className="stats-val b">
                              -{ formatNumber( paymentTotal ) }
                            </div>
                          </Col>
                         )
                        : null
                      }

                      {
                        payloadTotal !== 0
                        ? (
                          <Col span={12}>
                            <h3 className="stats-key main__h3">
                              { `Пополнено за ${days[mode]} ${num2str(days[mode], ["день", "дня", "дней"])}` }
                            </h3>
                            <div className="stats-val b">
                              +{ formatNumber(payloadTotal) }
                            </div>
                          </Col>
                        )
                        : null
                      }
                    </footer>
                  </Col>
                </section>
              )
            })()}
            {/* /.stats */}

            <section className="section3">
              <h2 className="visually-hidden">Сделка</h2>

              <Col span={12} style={{ marginRight: "1.5em" }}>
                <Row className="card">
                  <div className="slider-block" key={1}>
                    <span className="slider-block__label">
                      Процент депозита на вход в сделку
                      <Tooltip title="Максимальный объем входа в сделку">
                        <QuestionCircleFilled className="slider-block__info" />
                      </Tooltip>
                    </span>

                    <CustomSlider
                      value={this.state.depoPersentageStart}
                      min={1}
                      max={100}
                      step={1}
                      filter={val => val + "%"}
                      onChange={val => {
                        this.setState({ depoPersentageStart: val }, () => {
                          this.updateData(this.state.days[this.state.mode], () => {
                            this.updateChart();
                          });
                        });
                      }}
                    />
                  </div>
                  {/* /.slider-block */}

                  <div className="slider-block" key={2}>
                    <span className="slider-block__label">
                      Количество итераций в день
                      <Tooltip title="Количество повторений сделки">
                        <QuestionCircleFilled className="slider-block__info" />
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
                        });
                      }}
                    />
                  </div>
                  {/* /.slider-block */}
                </Row>

                <Row className="card card--secondary" style={{ position: "relative", marginTop: "1.5em" }}>
                  <Tooltip title="Настройки">
                    <button 
                      className="settings-button js-open-modal"
                      style={{ position: "absolute", right: "1.5em", top: "1em", zIndex: 0 }}
                    >
                      <span className="visually-hidden">Открыть конфиг</span>
                      <SettingFilled className="settings-button__icon" />
                    </button>
                  </Tooltip>

                  <label className="input-group">
                    <h2 className="input-group__label input-group__label--centered main__h2">
                      Торговый инструмент
                    </h2>
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
                  </label>
                </Row>
              </Col>

              <Col span={12} className="card card--column">
                {
                  (() => {
                    const { 
                      data,
                      tools,
                      currentToolIndex,
                      mode,
                      directUnloading 
                    } = this.state;
                    let { numberOfIterations } = this.state;

                    let tool = tools[currentToolIndex] || this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`);

                    if (!numberOfIterations) {
                      numberOfIterations = 1;
                    }

                    let pointsForIteration = this.getPointsForIteration();

                    return (
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
                    )
                  })()
                }

                {(() => {
                  const { tools, currentToolIndex } = this.state
                  let pointsForIteration = this.getPointsForIteration();
                  let currentTool = tools[currentToolIndex] || this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`);

                  return (
                    <Row 
                      className="main__h2"
                      type="flex" justify="center"
                      style={{ width: "100%", marginTop: "auto" }}
                    >
                      <span>
                        <b>{pointsForIteration}</b>
                        {" " + num2str(Math.floor(pointsForIteration), ["пункт", "пункта", "пунктов"])}
                      </span>
                      =
                      <span>
                        <b>{ round(pointsForIteration * currentTool.priceStep, 2)}$/₽</b> Изменения цены
                      </span>
                    </Row>
                  )
                })()}
              </Col>
            </section>
            {/* /.section3 */}

            {(() => {
              let {
                data,
                mode,
                withdrawal,
                payload,
                incomePersantageCustom,
                passiveIncomeTools,
                currentPassiveIncomeToolIndex,
                depoPersentageStart,
                tools,
                currentToolIndex,
                directUnloading,
                numberOfIterations
              } = this.state;

              let days = this.state.days[this.state.mode];
              let realData = this.state.realData;
              
              const { currentDay } = this.state;

              let pointsForIteration = this.getPointsForIteration();

              return (
                <section className="section4 main__section4">
                  <h2 className="section4__title">План на день</h2>

                  <Col span={8} style={{ marginRight: "1.5em" }}>
                    <header className="section4-header" style={{ textAlign: "right" }}>
                      <CustomSelect
                        key={this.state.currentDay}
                        className="section4__day-select"
                        optionsDefault={
                          new Array(days).fill(0).map((val, index) => index + 1)
                        }
                        formatOption={val => val}
                        value={this.state.currentDay}
                        min={1}
                        max={days}
                        onChange={value => {
                          this.setState({ currentDay: value, resultSaved: false });
                        }}
                      />
                      /{days}
                    </header>
                    <div className="section4-content card">
                      <div className="section4-row">
                        <div className="section4-l">
                          Депо на вход
                        </div>
                        <div className="section4-r">
                          {
                            formatNumber(Math.round(data[currentDay - 1].depoStartReal))
                            +
                            ` (${depoPersentageStart}%)`
                          }
                        </div>
                      </div>
                      {/* /.row */}
                      <div className="section4-row">
                        <div className="section4-l">
                          Целевой депо
                        </div>
                        <div className="section4-r">
                          {
                            formatNumber(Math.round(realData[currentDay - 1].depoEnd))
                          }
                        </div>
                      </div>
                      {/* /.row */}
                      <div className="section4-row">
                        <div className="section4-l">
                          Вывод / Пополнение
                        </div>
                        <div className="section4-r">
                          {(() => {
                            const {
                              mode,
                              withdrawal,
                              withdrawalInterval,
                              payload,
                              payloadInterval
                            } = this.state;

                            let _w = 0;
                            let _p = 0;
                            let _d = currentDay;

                            if (_d !== 0 && _d % withdrawalInterval == 0) {
                              _w = withdrawal[mode];
                            }
                            if (_d !== 0 && _d % payloadInterval == 0) {
                              _p = payload[mode];
                            }

                            return `${-_w} / +${_p}`
                          })()}
                        </div>
                      </div>
                      {/* /.row */}

                      {/* Show if we have passive income */}
                      {(() => {
                        var val = data[currentDay - 1].depoEnd;
                        var tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                        if (tool) {
                          var persantage = tool.rate / 365 * (365 / 260) / 100;

                          val = formatNumber(Math.round(val * persantage))
                        }
                        else {
                          val = 0;
                        }

                        return val == 0
                          ? null
                          : (
                            <div className="section4-row">
                              <div className="section4-l">
                                Пассивный доход
                              </div>
                              <div className="section4-r">
                                { val } / день
                              </div>
                            </div>
                          )
                          {/* /.row */}
                      })()}
                    </div>
                  </Col>

                  <Col span={8} style={{ marginRight: "1.5em" }}>
                    <header className="section4-header">
                      <label className="switch section4__switch">
                        <span>Прямая разгрузка</span>
                        <Switch
                          className="switch__input"
                          defaultChecked={this.state.directUnloading}
                          onChange={val => this.setState({ directUnloading: val }, this.recalc)}
                        />
                      </label>
                    </header>
                    <div className="section4-content card">
                      <div className="section4-row">
                        <div className="section4-l">
                          Контрактов
                        </div>
                        <div className="section4-r">
                          {
                            (data[currentDay - 1].contractsStart).toFixed(1)
                          }
                        </div>
                      </div>
                      {/* /.row */}
                      <div className="section4-row">
                        <div className="section4-l">
                          Пунктов
                        </div>
                        <div className="section4-r">
                          {pointsForIteration}
                        </div>
                      </div>
                      {/* /.row */}
                      <div className="section4-row">
                        <div className="section4-l">
                          Итераций
                        </div>
                        <div className="section4-r">
                          {
                            Math.min(numberOfIterations * (directUnloading ? 1 : 2), 100)
                          }
                        </div>
                      </div>
                      {/* /.row */}
                      <div className="section4-row">
                        <div className="section4-l">
                          Дневная цель
                        </div>
                        <div className="section4-r">
                          {
                            "+" + formatNumber(Math.round(data[currentDay - 1].income))
                          }
                        </div>
                      </div>
                      {/* /.row */}
                    </div>
                  </Col>

                  <Col span={8}>
                    <header className="section4-header">
                      До цели
                    </header>
                    {(() => {
                      var persentage = currentDay / days * 100;
                      var daysLeft = days - currentDay;

                      return (
                        <div className="section4-content section4-content--centered card">
                          <Progress 
                            className="section4-progress"
                            type="circle"
                            percent={
                              (persentage > 3 && persentage < 100) 
                                ? persentage - 2 
                                : persentage
                            } 
                            format={val => `${daysLeft} ${num2str(daysLeft, ["день", "дня", "дней"])}`}
                          />
                          <span className="section4-progress__label">
                            -{daysLeft} дней
                          </span>
                        </div>
                      )
                    })()}
                  </Col>
                </section>
              );
            })()}
            {/* /.section4 */}

            {(() => {
              const {
                data,
                mode,
                depoEnd,
                realData,
                currentDay,
                withdrawalInterval,
                payloadInterval,
                minDailyIncome,
                directUnloading,
                resultCollapsed,
                passiveIncomeMonthly,
                passiveIncomeTools,
                currentPassiveIncomeToolIndex
              } = this.state;

              var numberOfIterations = Math.min(
                this.state.numberOfIterations * (directUnloading ? 1 : 2), 100
              );

              var realIncome = 0;

              return (
                <section className="section5" style={{ margin: "1.5em 0" }}>
                  <h2 className="section5__title">Результат</h2>

                  {
                    (resultCollapsed && !this.state.resultSaved)
                    ? null
                    : (
                      <span className="section5-content-title">
                        <b className="b">
                          {
                            this.state.resultChanged
                              ? round(data[currentDay - 1].scale, 3)
                              : "—"
                          }
                        </b> /
                          { round(this.getDailyIncome(), 3) } (
                        <b className="b">
                          {
                            this.state.resultChanged
                              ? formatNumber(
                                  Math.round(
                                    data[currentDay - 1].depoStart * (data[currentDay - 1].scale / 100)
                                  )
                                )
                                : "—"
                          }
                        </b> /
                        {
                        "+" + formatNumber(Math.round(data[currentDay - 1].income))
                        }
                        )
                      </span>
                    )
                  }

                  <Button
                    className="custom-btn"
                    type={resultCollapsed ? "primary" : "default"}
                    onClick={e => {
                      var resultSaved = this.state.resultSaved;
                      if (!resultCollapsed) {
                        resultSaved = true;
                      }
                      this.setState({ resultCollapsed: !resultCollapsed, resultSaved });
                    }}
                  >
                    {
                      resultCollapsed
                        ? this.state.resultSaved
                          ? "Изменить"
                          : "Добавить"
                        : "Сохранить"
                    }
                  </Button>

                  <div className={"section5-collapse".concat(
                    resultCollapsed ? " section5-collapse--collapsed" : ""
                  )}>
                    <div className="section5-content">

                      <Col span={8} style={{ marginRight: "5em" }}>
                        <div className="section5-row">
                          <div className="section5-l">
                            <span aria-label="Доходность">Дох-ть</span> за день
                          </div>
                          <div className="section5-r">
                            <NumericInput
                              style={{ padding: ".3em .1em" }}
                              key={data[currentDay - 1].scale}
                              defaultValue={
                                this.state.resultChanged
                                  ? round(data[currentDay - 1].scale, 3)
                                  : "—"
                              }
                              format={formatNumber}
                              onBlur={val => {
                                var data = [...this.state.data];
                                data[currentDay - 1].scale = val;
                                this.setState({
                                  data,
                                  resultChanged: true
                                }, () => {
                                  var realData = this.buildRealData(this.state.data);
                                  this.setState({ realData }, this.updateChart);
                                });
                              }}
                            />
                            <span className="section5-r-suffix">
                              / {round(this.getDailyIncome(), 3)}%
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section5-row">
                          <div className="section5-l">
                            Вывод
                          </div>
                          <div className="section5-r">
                            <NumericInput
                              defaultValue={
                                this.state.resultChanged
                                  ? 0
                                  : "—"
                              }
                              format={formatNumber}
                              onBlur={val => {
                                // var data = [...this.state.data];
                                // data[day - 1].scale = val;
                                // this.setState({ data }, this.updateChart);
                              }}
                            />
                            <span className="section5-r-suffix">
                              /
                              {
                                (currentDay !== 0 && currentDay % withdrawalInterval == 0)
                                  ? formatNumber( this.state.withdrawal[mode] )
                                  : 0
                              }
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section5-row">
                          <div className="section5-l">
                            Пополнение
                          </div>
                          <div className="section5-r">
                            <NumericInput
                              defaultValue={
                                this.state.resultChanged
                                  ? 0
                                  : "—"
                              }
                              format={formatNumber}
                              onBlur={val => {
                                // var data = [...this.state.data];
                                // data[day - 1].scale = val;
                                // this.setState({ data }, this.updateChart);
                              }}
                            />
                            <span className="section5-r-suffix">
                              /
                              {
                                (currentDay !== 0 && currentDay % payloadInterval == 0)
                                  ? formatNumber(this.state.payload[mode])
                                  : 0
                              }
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                      </Col>

                      <Col span={8} style={{ marginRight: "5em" }}>
                        <div className="section5-row">
                          <div className="section5-l">
                            Итераций:
                          </div>
                          <div className="section5-r">
                            <NumericInput
                              key={numberOfIterations}
                              defaultValue={
                                this.state.resultChanged
                                  ? numberOfIterations
                                  : "—"
                              }
                              format={formatNumber}
                              onBlur={val => {
                                
                              }}
                            />
                            / { numberOfIterations }
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section5-row">
                          <div className="section5-l">
                            Пассивный доход:
                          </div>
                          <div className="section5-r">
                            <b className="b">
                              {(() => {
                                var val = realData[currentDay - 1].depoEnd;
                                var tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                                if (tool) {
                                  var persantage = tool.rate / 365 * (365 / 260) / 100;

                                  return formatNumber(Math.round(val * persantage))
                                }

                                return 0;
                              })()}
                            </b>/день
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section5-row">
                          <div className="section5-l">
                            Депозит:
                          </div>
                          <div className="section5-r">
                            <b className="b">
                              {
                                this.state.resultChanged
                                  ? formatNumber(Math.round(realData[currentDay - 1].depoEnd))
                                  : "—"
                              }
                            </b>
                            /
                            <BigNumber
                              val={Math.floor( this.getDepoEnd() )}
                              threshold={1e6}
                              format={formatNumber}
                            />
                          </div>
                        </div>
                        {/* /.row */}
                      </Col>

                      <Col span={8} style={{ textAlign: "center" }}>
                        {(() => {
                          var persentage = round(data[currentDay - 1].scale / this.getDailyIncome() * 100, 2);

                          return (
                            <Progress
                              type="circle"
                              trailColor="white"
                              percent={
                                this.state.resultChanged
                                  ? (persentage > 3 && persentage < 100)
                                      ? persentage - 2
                                      : persentage
                                  : 0
                              }
                            />
                          ) 
                        })()}
                        <span style={{ display: "none", fontSize: "1.8em" }}>- 100 дней</span>
                      </Col>

                    </div>
                    {/* /.section5-content */}

                    <footer className="section5-footer">
                      <span className="section5__title">Дневная цель</span>
                      <Progress 
                        trailColor="white" 
                        percent={
                          this.state.resultChanged
                            ?
                              round(
                                (data[currentDay - 1].depoStart * (data[currentDay - 1].scale / 100)) /
                                 data[currentDay - 1].income * 100
                              , 2)
                            : 0
                        }
                      />
                      <span className="section5-footer__label">
                        <b className="b">
                          {
                            this.state.resultChanged
                              ?
                                formatNumber(
                                  Math.round(
                                    data[currentDay - 1].depoStart * (data[currentDay - 1].scale / 100)
                                  )
                                )
                              : "—"
                          }
                        </b>
                        /
                        { formatNumber(Math.round(data[currentDay - 1].income)) }
                      </span>
                    </footer>

                  </div>

                </section>
              )
            })()}
            {/* /.section5 */}

            {/* График */}
            <div id="_chart" style={{ height: "58em" }}></div>

          </div>
          {/* /.container */}
        </main>
        {/* /.main */}

        <div className="m">
          <div className="m-content">
            <div className="config card">
              <Title className="config__title" level={2} style={{ textAlign: "center" }}>
                Инструменты
              </Title>
              {/* <h2 className="config__title">Настройка инструментов</h2> */}

              <div className="config-table-wrap js-nice-scroll">
                {
                  this.state.configVisible
                  ? (
                    <table className="table">
                      <thead className="table-header">
                        <tr className="table-tr">
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
                      <tbody className="table-body">
                        {
                          this.state.tools.map((tool, i) =>
                            <tr className="config-tr js-config-row" key={i}>
                              {
                                Object.keys(tool).map((key, i) =>
                                  // Don't show these fields
                                  ["id", "points", "name"].indexOf(key) > -1
                                    ? null
                                    : (
                                      <td 
                                        className="table-td" 
                                        style={{ width: (key == "shortName") ? "15em" : "9em" }}
                                        key={i + 1}
                                      >
                                        { tool[key] }
                                      </td>
                                    )
                                )
                              }
                            </tr>
                          )
                        }
                      </tbody>
                    </table>
                  )
                  : null
                }
              </div>
              {/* /.config-talbe-wrap */}
            </div>
            {/* /.config */}

            {
              this.state.toolToConfigIndex > -1 ? (
                <Chances 
                  key={this.state.toolsTemp[this.state.toolToConfigIndex].name}
                  data={this.state.toolsTemp[this.state.toolToConfigIndex].points}
                  onCancel={() => {
                    this.setState({ toolToConfigIndex: -1 });
                  }}
                  onSave={(data) => {
                    let { toolsTemp, toolToConfigIndex } = this.state;
                    toolsTemp[toolToConfigIndex].points = data.slice();
    
                    this.setState({ toolsTemp, toolToConfigIndex: -1 });
                  }}
                />
              )
              : null
            }
          </div>
          {/* /.modal-content */}
        </div>
        {/* /.modal */}

      </div>
    );
  }
}

export default App;