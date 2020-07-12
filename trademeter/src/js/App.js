
import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Switch,
  Typography,
  Progress,
  Statistic,
  Input
} from 'antd/es'
const { Title } = Typography;
const { Option } = Select;

import {
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons'

import "core-js/features/promise"
// import "whatwg-fetch"

import "antd/es/"
import "../sass/style.sass"

import $ from "jquery"
import round        from "./utils/round";
import roundUp      from "./utils/roundUp";
import params       from "./utils/params";
import num2str      from './utils/num2str'
import formatNumber from "./utils/format-number";
import extRate      from "./utils/rate";
import typeOf       from "./utils/type-of";

import BigNumber    from "./components/BigNumber"
import Value        from "./components/value"
import NumericInput from "./components/numeric-input"
import CustomSlider from "./components/custom-slider"
import CustomSelect from "./components/custom-select"
import Speedometer  from "./components/riskometer"
import { Dialog, dialogAPI } from "./components/dialog"

var chartData, chartData2, scale, scaleStart, scaleEnd;

export default class App extends React.Component {

  constructor(props) {
    super(props);

    // Данные из адресной строки
    const depoStart = Number( params.get("start") ) || 1000000;
    const depoEnd   = Number( params.get("end") )   || 3000000;
    const mode      = Number( params.get("mode") )  || 0;
    const days      = Number( params.get("days") )  || 260;

    this.state = {
      data:     [],
      realData: [],

      savePopupVisible:   false,
      deletePopupVisible: false,
      configVisible:      false,
      passiveIncomeConfigVisible: false,
      changed:            false,
      saved:              false,
      saves:              [],
      currentSaveIndex:   0,

      title: "Трейдометр",

      mode,

      // Начальный депозит
      depoStart: [ depoStart, depoStart ],

      // Целевой депозит
      depoEnd,

      // Доходность в день
      incomePersantageCustom: 1,

      // Сумма на вывод
      withdrawal: [ 0, 0 ],
      // Частота вывода
      withdrawalInterval: 20,

      // Сумма на пополнение
      payload: [ 0, 0 ],
      // Частота пополнения
      payloadInterval:    20,

      // Торговых дней
      days: [ days, days ],

      // Текущий день
      currentDay: 1,

      // Процент депозита на вход в сделку
      depoPersentageStart: 10,

      // Количество итераций в день
      numberOfIterations: 10,

      // Минимальная доходность в день
      minDailyIncome: 45,

      incomePersantageDaily: 0,

      // Tools
      propsToShowArray: [
        "shortName",
        "stepPrice",
        "priceStep",
        "averageProgress",
        "guaranteeValue",
        "currentPrice",
        "lotSize",
        "dollarRate"
      ],
      toolTemplate: {
        code:            "",
        shortName:       "",
        name:            "",
        stepPrice:       0,
        priceStep:       0,
        averageProgress: 0,
        guaranteeValue:  0,
        currentPrice:    0,
        lotSize:         0,
        dollarRate:      0,

        isFuters: false,

        points: [
          [70,  70],
          [156, 55],
          [267, 41],
          [423, 27],
          [692, 13],
          [960, 7 ],
        ]
      },
      tools: [],
      customTools: [],
      currentToolIndex:   0,
      isSafe: true,
      directUnloading: true,

      defaultPassiveIncomeTools: [
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
      customPassiveIncomeTools: [],
      currentPassiveIncomeToolIndex: -1,
      // Пассивный доход в месяц
      passiveIncomeMonthly: 0,
      pitError: "",
    };

    this.state.data     = this.buildData(this.state.days[this.state.mode]);
    this.state.realData = this.buildRealData(this.state.data);
  }

  componentDidMount() {
    // New chart
    anychart.onDocumentReady(() => {

      const { mode, days } = this.state;
      var data = [...this.state.data];
      var data2 = [...this.state.realData];

      // data
      chartData = anychart.data.set(
        new Array(days[mode]).fill().map((v, i) => ({
          x: String(i + 1),
          value: data[i].depoEnd
        }))
      );

      chartData2 = anychart.data.set(
        new Array(days[mode]).fill().map((v, i) => ({
          x: String(i + 1),
          value: data2[i].depoEnd
        }))
      );

      // set chart type
      var chart = anychart.line();
      chart.animation(true, 3000);
      chart.listen("click", e => {
        if (e.pointIndex) {
          this.setCurrentDay(e.pointIndex + 1);
        }
      });
      chart.tooltip().titleFormat(e => `День: ${Number(e.x)}`);

      // set data
      var series = chart.line(chartData);
      series.name("Фактический рост депо");
      series.tooltip().displayMode("separated");
      series.tooltip().useHtml(true);
      series.tooltip().format(e => {
        var svg = `
          <svg viewBox="0 0 10 10" width="1em" height="1em" 
               fill="#87d068" style="position: relative; top: 0.1em">
            <rect x="0" y="0" width="10" height="10" />
          </svg>
        `;
        return `${svg} ${e.seriesName}: ${formatNumber(Math.floor(e.value))}`
      });

      // Line color
      series.normal().stroke({
        color: "#87d068",
        thickness: "5%"
      });

      var series2 = chart.line(chartData2);
      series2.name("Планируемый рост депо");
      series2.tooltip().displayMode("separated");
      series2.tooltip().useHtml(true);
      series2.tooltip().format(e => {
        var svg = `
          <svg viewBox="0 0 10 10" width="1em" height="1em" 
               fill="#40a9ff" style="position: relative; top: 0.1em">
            <rect x="0" y="0" width="10" height="10" />
          </svg>
        `;

        return `${svg} ${e.seriesName}: ${formatNumber(Math.floor(e.value))}`
      });
      
      // Line color
      series2.normal().stroke({
        color: "#40a9ff",
        thickness: "5%"
      });

      scaleStart = 0;
      scaleEnd = 1;
      scale = anychart.scales.linear();
      scale.minimum(1);
      scale.maximum(260);
      scale.ticks().interval(1);

      if (false) {
        // turn on X Scroller
        chart.xScroller(true);
        chart.xScroller().thumbs(false);
        chart.xScroller().minHeight(40);
        chart.xScroller().fill('#40a9ff 0.1');
        chart.xScroller().selectedFill('#40a9ff 0.5');
        // adjusting the thumbs behavior and look
        chart.xScroller().listen("scrollerchange", e => {
          const { days, mode } = this.state;
          scaleStart = e.startRatio;
          scaleEnd = e.endRatio;

          var min = Math.max(Math.round(days[mode] * scaleStart) + 1, 1);
          var max = Math.min(Math.round(days[mode] * scaleEnd) + 1, days[mode]);
          scale.minimum(min);
          scale.maximum(max);
          scale.ticks().interval(
            (() => {
              var range = Math.abs(min - max);
              var breakpoints = new Array(10).fill(0).map((n, i) => 260 * (i + 1));
              for (var i = breakpoints.length; i--;) {
                var breakpoint = breakpoints[i];
                if (range >= breakpoint) {
                  return (breakpoint / 260) * 10;
                }
              }

              if (range > 100) {
                return 10;
              }
              if (range > 50) {
                return 5;
              }

              return 1;
            })()
          )
        });
      }

      // Genetal settings
      chart.xAxis().title("Номер дня");
      chart.yAxis().labels().format(e => formatNumber(e.value));

      // chart.xAxis().scale(scale);
      // chart.xAxis().ticks(true);

      // set container and draw chart
      chart.xScale().mode('continuous');
      chart.container("_chart").draw();

    });

    this.bindEvents();

    this.fetchDepoStart()
      .then(depo => {
        var { depoStart, depoEnd } = this.state;

        depo = depo || 10000;
        depo = (depo > 10000) ? depo : 10000;
        depoStart[0] = depo;
        depoStart[1] = depo;
        if (depo >= depoEnd) {
          depoEnd = depo * 2;
        }
        this.setState({ depoStart, depoEnd });
      })
      .catch(err => console.log(err));

    this.fetchTools()
      .then(tools => this.unpackTools(tools))
      .then(() => this.updateDepoPersentageStart())
      .catch(err => console.log(err));

    this.fetchSaves()
      .then(saves => {
        var pure = params.get("pure") === "true";
        if (!pure) {

          if (saves.length > 0) {
            var id = saves[0].id;
            this.fetchSaveById( id )
              .then(save => this.extractSave(Object.assign(save, { id })));
          }
          else {
            console.log('No saves found!');
          }

        }
      })
      .catch(err => console.log(err));
  }

  updateDepoPersentageStart() {
    const { mode, days, currentDay, data } = this.state;

    return new Promise((resolve, reject) => {
      var depoPersentageStart = this.getCurrentTool().guaranteeValue / data[currentDay - 1].depoStart * 100;
      this.setState({ depoPersentageStart }, () => {
        this.updateData(days[mode])
          .then(resolve);
      });
    });

  }

  unpackTools(tools) {
    var { toolTemplate } = this.state;

    return new Promise((resolve, reject) => {

      if (!tools || tools.length === 0) {
        reject("\"tools\" is not an array or it's simply empty!", tools);
      }
  
      let t = [];
      for (let tool of tools) {
        if (tool.price == 0 || !tool.volume) {
          continue;
        }

        var template = Object.assign({}, toolTemplate);
  
        let obj = Object.assign(template, {
          code:             tool.code            || "code",
          shortName:        tool.shortName       || "shortName",
          name:             tool.fullName        || "fullName",
          stepPrice:       +tool.stepPrice       || 0,
          priceStep:       +tool.priceStep       || 0,
          averageProgress: +tool.averageProgress || 0,
          guaranteeValue:  +tool.guarantee       || 0,
          currentPrice:    +tool.price           || 0,
          lotSize:         +tool.lotVolume       || 0,
          dollarRate:      +tool.dollarRate      || 0,
  
          isFuters: true,
  
          points: [
            [70,  70],
            [156, 55],
            [267, 41],
            [423, 27],
            [692, 13],
            [960, 7 ],
          ]
        });
        t.push(obj);
      }
      
      if (t.length > 0) {
        let { tools } = this.state;
        tools = tools.concat(t);
  
        this.setState({ tools }, resolve);
      }
      else {
        resolve();
      }

    });
  }

  fetchDepoStart() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/local/php_interface/s1/ajax/?method=getInvestorInfo",
        success: res => {
          var parsed = JSON.parse(res);
          var depo = Number(parsed.data.deposit);
          resolve(depo);
        },
        error: err => reject(err)
      });
    });
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/local/php_interface/s1/ajax/?method=getTrademeterSnapshots",
        success: (res) => {
          var res = JSON.parse(res);
          if (!res.error) {
            console.log("Downloaded all the saves:", res);
            var saves = res.data.map(save => ({
              id:   save.id,
              name: save.name,
            }));
            this.setState({ saves }, () => resolve(saves));
          }
          else {
            console.log("Couldn't download saves from server! res:", res);
            reject();
          }
        },
        error: (err) => console.error(err),
      });
    });
  }

  fetchSaveById(id) {
    return new Promise((resolve, reject) => {
      if (id) {
        $.ajax({
          url: `/local/php_interface/s1/ajax/?method=getTrademeterSnapshot\
            &id=${id}`.replace(/\s+/g, ""),
          method: "GET",
          success: res => {
            var save = JSON.parse(res);
            resolve(save);
          },
          error: err => reject(err)
        });
      }
      else {
        reject("ID is undefined!");
      }
    });
  }

  fetchTools() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures",
        success: res => {
          var data = JSON.parse(res).data;
          resolve(data);
        },
        error: (err) => reject(err),
      });
    })
  }

  // TODO:
  extractSave(save) {
    var title = save.data.name || "??";
    var _static = JSON.parse(save.data.static);
    var _dynamic = JSON.parse(save.data.dynamic);

    console.log(_static, _dynamic);

    const {
      depoStart,
      depoEnd,
      currentDay,
      days,
      incomePersantageCustom,
      withdrawal,
      withdrawalInterval,
      payload,
      payloadInterval,
      passiveIncomeTools,
      mode,
      customTools,
      defaultPassiveIncomeTools,
      currentToolIndex,
    } = this.state;

    var state = {
      title,
      depoStart,
      depoEnd,
      currentDay,
      days,
      incomePersantageCustom,
      withdrawal,
      withdrawalInterval,
      payload,
      payloadInterval,
      mode,
      customTools,
      passiveIncomeTools,
      currentToolIndex,
    };

    console.log(state);
    

    try {
      
      if (typeOf(_static.depoStart) === "array") {
        throw new Error();
      }

      console.log(_static);
      var m = _static.mode;

      state.depoStart[m]                  = _static.depoStart;
      state.depoEnd                       = m == 0 ? _static.depoEnd : state.depoEnd;
      state.currentDay                    = _static.currentDay;
      state.days[m]                       = _static.days;
      state.incomePersantageCustom        = _static.minDailyIncome;
      state.withdrawal[m]                 = _static.payment;
      state.withdrawalInterval            = _static.paymentInterval;
      state.payload[m]                    = _static.payload;
      state.payloadInterval               = _static.payloadInterval;
      state.passiveIncomeMonthly          = _static.passiveIncome      || 0;
      state.customTools                   = _static.customTools        || [];
      state.passiveIncomeTools            = _static.passiveIncomeTools || defaultPassiveIncomeTools;
      state.currentPassiveIncomeToolIndex = _static.currentPassiveIncomeToolIndex || -1;
      state.currentToolIndex              = _static.currentToolIndex || 0;
      state.mode                          = m;

      state.id = save.id;
      state.saved = true;
    }
    catch (e) {
      alert("Формат сохранения устарел. Пожалуйста, попробуйте другое сохранение");
      state = new Object();
      console.log(state);

      const { saves, currentSaveIndex } = this.state;
      saves[currentSaveIndex].corrupt = true;
      this.setState({ saves });
    }

    if (Object.keys(state).length) {

      console.log(state);
      this.setState(state, () => {
        this.recalc()
          .then(() => this.overrideData(_dynamic))
          .catch(err => console.error(err));
      });

    }
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
      withdrawalInterval,
      payloadInterval,
      depoPersentageStart,
      numberOfIterations,
    } = this.state;

    let depoStart   = this.state.depoStart[mode];
    let withdrawal  = this.state.withdrawal[mode];
    let payload     = this.state.payload[mode];
    let currentTool = this.getCurrentTool();

    // Calculating depoStart
    let _depoStart = depoStart;
    if (i > 0) {
      _depoStart = daysArray[i - 1].depoEnd;
    }

    let _scale  = round( this.getMinDailyIncome(), 3 );
    let _income = (_depoStart * _scale) / 100;

    var _incomePure = _income;

    if ((i + 1) > 0 && ((i + 1) % withdrawalInterval) == 0) {
      _income -= withdrawal;
    }
    if ((i + 1) > 0 && ((i + 1) % payloadInterval) == 0) {
      _income += payload;
    }

    let _depoEnd = _depoStart + _income;

    let _depoStartReal = _depoStart * (depoPersentageStart / 100);
    
    let _contractsStart = (round(_depoStartReal, 1) / currentTool.guaranteeValue);
    if (Math.ceil(_contractsStart) - _contractsStart < .00001) {
      _contractsStart = Math.ceil(_contractsStart);
    }
    else {
      _contractsStart = Math.floor(_contractsStart);
    }

    if (_contractsStart < 1) {
      _contractsStart = 1;
    }

    let _pointsForIteracion = _incomePure / currentTool.stepPrice / _contractsStart;

    return {
      day:                i + 1,
      scale:              _scale,
      depoStart:          _depoStart,
      depoStartReal:      _depoStartReal,
      income:             _income,
      incomePure:         _incomePure,
      depoEnd:            _depoEnd,
      contractsStart:     _contractsStart,
      pointsForIteration: _pointsForIteracion,

      iterations: numberOfIterations,
      payment:    0,
      payload:    0,

      collapsed: true,
      saved:     false,
      changed:   false
    }
  }

  buildData(length = 0) {
    let data = new Array(length).fill(0);
    data.forEach((val, i) => {
      data[i] = this.createDayData(data, i)
    });

    return data;
  }

  buildRealData(data = []) {
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

  updateData(length = 0) {
    return new Promise((resolve, reject) => {
      var data     = this.buildData(length);
      var realData = this.buildRealData(data);
      this.setState({ data, realData }, resolve);
    })
  }

  overrideData(override = []) {
    const { realData, data } = this.state;

    for (let i = 0; i < realData.length; i++) {
      let item = override[i];
      Object.assign(realData[i], item);
    }
    this.setState({ realData });
  }

  updateChart() {
    const { days, mode } = this.state;
    var data  = [...this.state.data];
    var data2 = [...this.state.realData];

    // append data
    chartData2.data(
      new Array(days[mode]).fill().map((v, i) => ({
        x:     String(i + 1),
        value: data[i].depoEnd
      }))
    );

    chartData.data(
      new Array(days[mode]).fill().map((v, i) => ({
        x:     String(i + 1),
        value: data2[i].depoEnd
      }))
    );

  }

  bindEvents() {
    if (window.history && window.history.pushState) {
      $(window).on('popstate', () => {
        var mode = Number( params.get("mode") ) || 0;
        this.setState({ mode });
      });
    }
  }

  recalc() {
    var { mode, days } = this.state;

    return new Promise((resolve, reject) => {
      this.updateData(days[mode])
        .then(() => this.updateChart())
        .then(resolve)
        .catch(err => reject(err));
    });

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
      if (
        (withdrawal > (depoStart * persentage)) || 
        (withdrawal > (depoStart * 0.01) && days == 2600)
      ) {
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

  recalcDepoEnd(val, passiveIncomeTool) {
    let rate = passiveIncomeTool.rate;
    let annualIncome = val * 12;
    let depoEnd = Math.round(annualIncome * 100 / rate);

    this.setState({ depoEnd }, this.recalc);
  }

  getJSON() {
    var { mode,
          data,
          realData,
          days,
          withdrawal,
          payload,
          depoStart,
          depoEnd,
          currentDay,
          passiveIncomeMonthly,
          withdrawalInterval,
          payloadInterval,
          directUnloading,
          currentToolIndex,
          customTools } = this.state;
    const { passiveIncomeTools, currentPassiveIncomeToolIndex } = this.state;

    var json = {
      static: {
        depoStart:                     this.getDepoStart(),
        depoEnd:                       this.getDepoEnd(),
        currentDay:                    currentDay, 
        days:                          days[mode],
        minDailyIncome:                round(this.getMinDailyIncome(), 3),
        payment:                       withdrawal[mode],
        paymentInterval:               withdrawalInterval,
        payload:                       payload[mode],
        payloadInterval:               payloadInterval,
        passiveIncome:                 passiveIncomeMonthly,
        passiveIncomeTools:            this.getPassiveIncomeTools(),
        currentPassiveIncomeToolIndex: currentPassiveIncomeToolIndex,
        mode:                          mode,
        customTools:                   customTools,
        currentToolIndex:              currentToolIndex,
        current_date:                  "#"
      },
      dynamic: data.slice().map((item, index) => ({
        scale:           item.scale,
        rateMoney:       0,
        payment:         item.payment,
        payload:         item.payload,
        iterations:      item.iterations,
        passiveIncome: (() => {
          var val = realData[index].depoEnd;
          var tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
          if (tool) {
            var persantage = tool.rate / 365 * (365 / 260) / 100;

            return Math.round(val * persantage)
          }

          return 0;
        })(),
        day:             index + 1,
        directUnloading: directUnloading
      }))
    };
    console.log('Packed json:', json);
    return json;
  }

  // API
  save(name = "", cb) {
    var json = this.getJSON();

    console.log("Sending SAVE resuest...");
    $.ajax({
      url: `/local/php_interface/s1/ajax/?method=addTrademeterSnapshot`,
      method: "POST",
      data: {
        name: name,
        static: JSON.stringify(json.static),
        dynamic: JSON.stringify(json.dynamic)
      },
      success: res => {
        var parsed = JSON.parse(res);
        var id = Number(parsed.id);
        if (id) {
          console.log( "Saved! Your id:", id );
          this.setState({ id });

          if (cb) {
            cb(id);
          }
        }
        else {
          console.error("Couldn't get id!");
        }
      },
      error: err => {
        console.log(err);
        if (cb) {
          cb();
        }
      }
    });
  }

  update(name = "", id = 0, cb) {
    var json = this.getJSON();

    console.log('Sending UPDATE request...');
    $.ajax({
      url: `/local/php_interface/s1/ajax/?method=updateTrademeterSnapshot`,
      method: "POST",
      data: {
        id,
        name,
        static: JSON.stringify(json.static),
        dynamic: JSON.stringify(json.dynamic)
      },
      success: res => {
        var parsed = JSON.parse(res);
        console.log( "Updated!", parsed );
        if (cb) {
          cb();
        }
      },
      error: err => {
        console.log(err);
      }
    });
  }

  delete(id = 0) {
    console.log(`Trying to dele the save with id = ${id}`);
    $.ajax({
      url: `/local/php_interface/s1/ajax/?method=deleteTrademeterSnapshot`,
      method: "POST",
      data: { id },
      success: res => {
        let { changed, saved, saves, currentSaveIndex } = this.state
        
        var parsed = JSON.parse(res);
        console.log( "Deleted!", parsed );

        saves.splice(currentSaveIndex, 1);
        currentSaveIndex = Math.min(Math.max(currentSaveIndex, 0), saves.length - 1);
        if (saves.length > 0) {
          var id = saves[currentSaveIndex].id;
          this.fetchSaveById(id)
            .then(save => this.extractSave(Object.assign(save, id)))
            .catch(err => console.log(err));
        }
        else {
          saved = changed = false;
        }

        this.setState({ 
          id,
          saves,
          currentSaveIndex,
          saved,
          changed,
        });
      },
      error: err => {
        console.log(err);
      }
    });
  }

  // ==================
  // Setters
  // ==================

  setWithdrawal(val = 0) {
    const { mode } = this.state;
    let withdrawal = [...this.state.withdrawal];

    withdrawal[mode] = val;
    this.setState({ withdrawal }, this.recalc);
  }

  setCurrentDay(currentDay = 1) {
    this.setState({ currentDay }, this.updateDepoPersentageStart);
  }
  
  // ==================
  // Getters
  // ==================

  /**
   * @returns {number} минимальная доходность в день
   */
  getMinDailyIncome(custom) {
    const {
      mode,
      depoEnd,
      withdrawalInterval,
      payloadInterval,
      incomePersantageCustom
    } = this.state;
    const depoStart = this.state.depoStart[mode];
    const withdrawal = this.state.withdrawal[mode];
    const payload = this.state.payload[mode];
    const days = this.state.days[mode];

    var rate = [
      extRate(
        depoStart,
        depoEnd,
        withdrawal,
        withdrawalInterval,
        payload,
        payloadInterval,
        days,
        withdrawalInterval,
        payloadInterval
      ) * 100,

      incomePersantageCustom
    ]

    return rate[custom || mode];
  }

  /**
   * Получить выбранный торговый инструмент
   */
  getCurrentTool() {
    const { tools, currentToolIndex } = this.state;
    return tools[currentToolIndex] || 
      // Fallback
      this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`);
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

  /**
   * @returns {number} начальный депозит
   */
  getDepoStart() {
    const { depoStart, mode } = this.state;

    return depoStart[mode];
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

  getPointsForIteration() {
    let { data, directUnloading, numberOfIterations } = this.state;
    numberOfIterations = numberOfIterations || 1;

    let pointsForIteration = data[0].pointsForIteration / numberOfIterations;
    if (!directUnloading && (numberOfIterations * 2) >= 100) {
      pointsForIteration = (data[0].pointsForIteration * 2) / 100;
    }

    pointsForIteration = Math.max(pointsForIteration, 1);

    if (isNaN(pointsForIteration)) {
      console.warn("pointsForIteration is NaN!");
      console.warn("pointsForIteration = data[0].pointsForIteration / numberOfIterations", 
        "data[0].pointsForIteration:", data[0].pointsForIteration + ", " +
        "numberOfIterations:", numberOfIterations);
      pointsForIteration = 1;
    }

    return roundUp(pointsForIteration);
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    var title = "Трейдометр";
    if (id && saves[currentSaveIndex]) {
      title = saves[currentSaveIndex].name;
    }

    return title;
  }

  getIncomeTools() {
    const { tools, customTools } = this.state;
    return []
      .concat(tools)
      .concat(customTools);
  }

  getPassiveIncomeTools() {
    const { passiveIncomeTools } = this.state;
    return []
      .concat(passiveIncomeTools)
  }

  render() {
    return (
      <div className="page">

        <main className="main">

          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">
                <Title className="main__h1" level={1}>
                  { this.getTitle() }
                  { this.state.id ? (
                    <Tooltip title="Удалить">
                      <button 
                        className="main-top__remove x-button" 
                        aria-label="Удалить"
                        onClick={e => dialogAPI.open("dialog4", e.target)}>
                        <span>&times;</span>
                      </button>
                    </Tooltip>
                  ) : null }
                </Title>

                {(() => {
                  const { saves, currentSaveIndex } = this.state;

                  return saves.length > 0 ? (
                    <label className="labeled-select main-top__strategy">
                      <span className="labeled-select__label labeled-select__label--hidden">
                        Сохраненный Трейдометр
                      </span>
                      <Select 
                        value={currentSaveIndex}
                        onSelect={val => {
                          const { saves } = this.state;

                          var id = saves[val].id;
                          this.fetchSaveById(id)
                            .then(save => this.extractSave(Object.assign(save, { id })))
                            .then(() => this.setState({ currentSaveIndex: val }))
                            .catch(err => console.log(err));
                        }}>
                        {saves.map(( save, index ) =>
                          <Option key={index} value={index} disabled={save.corrupt || false}>
                            {save.name}
                          </Option>
                        )}
                      </Select>
                    </label>
                  )
                  : null
                })()}

                <Radio.Group
                  key={this.state.mode}
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

                    var currentDay = this.state.currentDay;
                    if (currentDay > days) {
                      currentDay = days;
                      Object.assign(state, { currentDay });
                    }

                    this.setState(Object.assign(state, { mode: value }), () => {
                      params.set("mode", value);
                      this.recalc();
                    });
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

                <div className="main-top__footer">

                  <Button 
                    className={
                      [
                        "custom-btn",
                        "custom-btn--secondary",
                        "main-top__save",
                      ]
                        .concat(this.state.changed ? "main-top__new" : "")
                        .join(" ")
                        .trim()
                    }
                    onClick={e => {
                      const { saved, changed } = this.state;

                      if (saved && changed) {
                        const { id } = this.state;
                        this.update(this.getTitle(), id);
                        this.setState({ changed: false });
                      }
                      else {
                        dialogAPI.open("dialog1", e.target);
                      }

                    }}>
                    { (this.state.saved && !this.state.changed) ? "Изменить" : "Сохранить" }
                  </Button>
                  
                  {
                    this.state.saves.length > 0 ? (
                      <a
                        className="custom-btn custom-btn--secondary main-top__save"
                        href="#pure=true" 
                        target="_blank"
                      >
                        Добавить новый
                      </a>
                    )
                    : null
                  }

                </div>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
          {/* /.main-top */}

          <div className="container">
            <section className="controls">
              <Col className="controls-col1">
                <div className="card controls-card1">
                  <h2 className="visually-hidden">Ввод значений</h2>

                  {/* Начальный депозит */}
                  <label className="input-group">
                    <span className="input-group__label">Начальный депозит</span>
                    <NumericInput
                      key={this.state.mode + this.state.depoStart[this.state.mode]}
                      disabled={this.state.saved}
                      className="input-group__input"
                      defaultValue={this.state.depoStart[this.state.mode]}
                      min={10000}
                      max={this.state.mode == 0 ? this.state.depoEnd : null}
                      round="true"
                      unsigned="true"
                      onBlur={val => {
                        let depoStart = [...this.state.depoStart];
                        const { mode } = this.state

                        if (val == depoStart[mode]) {
                          return;
                        }

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
                        if (mode == 1) {
                          this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                        }
                        this.withdrawalInput.setErrorMsg(errMessages[0]);
                      }}
                      format={formatNumber}
                    />
                  </label>
                
                  {/* Целевой депозит */}
                  {
                    this.state.mode == 0 ? (
                      <label className="input-group">
                        <span className="input-group__label">Целевой депозит</span>
                        <NumericInput
                          key={this.state.depoEnd}
                          disabled={this.state.saved}
                          className="input-group__input"
                          defaultValue={this.state.depoEnd}
                          min={this.state.depoStart[this.state.mode]}
                          round="true"
                          unsigned="true"
                          onBlur={val => {
                            const { 
                              depoEnd,
                              passiveIncomeTools,
                              currentPassiveIncomeToolIndex,
                            } = this.state;
                            
                            if (val == depoEnd) {
                              return;
                            }

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
                      <label className="input-group">
                        <span className="input-group__label">Доходность в день</span>
                        <NumericInput
                          key={this.state.days[this.state.mode] + this.state.incomePersantageCustom}
                          disabled={this.state.saved}
                          className="input-group__input"
                          defaultValue={this.state.incomePersantageCustom}
                          placeholder={(this.state.minDailyIncome).toFixed(3)}
                          unsigned="true"
                          onBlur={val => {
                            this.setState({
                              incomePersantageCustom: val
                            }, () => {
                              this.recalc()
                                .then(() => {
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
                                })
                                .catch(err => console.error(err));

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
                  <label className="input-group">
                    <span className="input-group__label input-group__label--centered">
                      Дней
                    </span>
                    <CustomSelect 
                      key={this.state.mode}
                      disabled={this.state.saved}
                      options={
                        [50, 100].concat(new Array(10).fill(0).map((n, i) => 260 * (i + 1)))
                      }
                      format={val => {
                        var years = Number( (val / 260).toFixed(2) );
                        var suffix = "";
                        if (val >= 260) {
                          suffix = ` (${years} ${num2str(Math.floor(years), ["год", "года", "лет"])})`;
                        }

                        return `${val}${suffix}`;
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
                  <label className="input-group controls__passive-income">
                    <span className="input-group__label">Пассивный доход</span>
                    <NumericInput
                      className="input-group__input"
                      key={this.state.passiveIncomeMonthly}
                      disabled={this.state.saved}
                      defaultValue={this.state.passiveIncomeMonthly}
                      round="true"
                      unsigned="true"
                      suffix="/мес"
                      onBlur={val => {
                        const { 
                          passiveIncomeTools,
                          currentPassiveIncomeToolIndex,
                          saved
                        } = this.state;
                        var pitError = currentPassiveIncomeToolIndex < 0
                          ? "Выберете инструмент пассивного дохода"
                          : "";

                        var cb = () => {
                          this.setState({ pitError });

                          var currentPassiveIncomeTool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                          this.recalcDepoEnd(val, currentPassiveIncomeTool);
                        };

                        this.setState({ 
                          passiveIncomeMonthly: val,
                          changed: true
                        }, () => {
                          if (val == 0) {
                            return;
                          }

                          if (currentPassiveIncomeToolIndex < 0) {
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

                  <div className="input-group controls__tool-select">
                    <header className="controls__tool-select-header">
                      <Tooltip 
                        visible={this.state.pitError.length > 0}
                        title={this.state.pitError}
                      >
                        <label for="passive-tools" className="input-group__label">Инструмент пассивного дохода</label>
                      </Tooltip>

                      <Tooltip title="Настроить инструменты">
                        <button
                          aria-label="Инструменты"
                          className="settings-button controls__tool-select-icon"
                          onClick={e => dialogAPI.open("dialog3", e.target)}>
                          <SettingFilled className="settings-button__icon" />
                        </button>
                      </Tooltip>
                    </header>

                    <Select
                      id="passive-tools"
                      key={this.state.currentPassiveIncomeToolIndex}
                      defaultValue={this.state.currentPassiveIncomeToolIndex}
                      onChange={index => {
                        this.setState({
                          currentPassiveIncomeToolIndex: index,
                          pitError: "",
                          changed: true
                        }, () => {
                          const {
                            passiveIncomeMonthly,
                            passiveIncomeTools,
                            currentPassiveIncomeToolIndex
                          } = this.state;

                            if (index < 0) {
                              this.setState({ passiveIncomeMonthly: 0 });
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
                        this.getPassiveIncomeTools()
                          .map((tool, index) =>
                            <Option key={index} value={index}>
                              {`${tool.name} (${tool.rate}%/год)`}
                            </Option>
                          )
                      }
                    </Select>
                  </div>

                </div>
              </Col>

              <Col className="controls-col2">
                <div className="card card--secondary controls-card3">
                  {/* Вывод */}
                  <div className="controls-card4">

                    <label className="input-group">
                      <span className="input-group__label">Вывод</span>
                      <NumericInput
                        key={this.state.mode + this.state.withdrawal[this.state.mode]}
                        disabled={this.state.saved}
                        className="input-group__input"
                        defaultValue={this.state.withdrawal[this.state.mode]}
                        round="true"
                        unsigned="true"
                        format={formatNumber}
                        max={
                          this.state.mode == 0
                            ? this.state.depoStart[this.state.mode] * 0.15
                            : this.state.depoStart[this.state.mode] * (this.state.incomePersantageCustom / 100)
                        }
                        onBlur={val => {
                          this.setWithdrawal(val);

                          const { mode } = this.state;
                          let depoStart = this.state.depoStart[mode];
                          let days = this.state.days[mode];

                          var errMessages = this.checkFn(val, depoStart, days);
                          this.withdrawalInput.setErrorMsg(errMessages[0]);
                          if (mode == 1) {
                            this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                          }
                        }}
                        onChange={(e, val) => {
                          const { mode } = this.state;
                          let depoStart = this.state.depoStart[mode];
                          let days = this.state.days[mode];

                          var errMessages = this.checkFn(val, depoStart, days);

                          this.withdrawalInput.setErrorMsg(errMessages[0]);
                          if (mode == 1) {
                            this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                          }
                        }}
                        onRef={ref => this.withdrawalInput = ref}
                      />
                    </label>

                    {/* Частота */}
                    <label className="input-group">
                      <span className="input-group__label">Частота</span>
                      <CustomSelect
                        key={this.state.mode + this.state.withdrawalInterval}
                        value={this.state.withdrawalInterval}
                        disabled={this.state.saved}
                        options={[20, 50, 100]}
                        format={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                        min={1}
                        max={2600}
                        onChange={value => {
                          this.setState({ withdrawalInterval: value }, this.recalc);
                        }}
                      />
                    </label>

                  </div>
                  
                  {/* Пополнение */}
                  <div className="controls-card5" 
                       style={{ marginTop: "3.5em" }}>

                    <label className="input-group">
                      <span className="input-group__label">Пополнение</span>
                      <NumericInput
                        key={this.state.mode + this.state.payload[this.state.mode]}
                        disabled={this.state.saved}
                        className="input-group__input"
                        defaultValue={this.state.payload[this.state.mode]}
                        round="true"
                        unsigned="true"
                        format={formatNumber}
                        max={Infinity}
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
                    <label className="input-group">
                      <span className="input-group__label">Частота</span>
                      <CustomSelect
                        key={this.state.mode + this.state.payloadInterval}
                        value={this.state.payloadInterval}
                        disabled={this.state.saved}
                        options={[20, 50, 100]}
                        format={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                        min={1}
                        max={2600}
                        onChange={value => {
                          this.setState({ payloadInterval: value }, this.recalc);
                        }}
                      />
                    </label>

                  </div>
                </div>
              </Col>
            </section>
            {/* /.controls */}

            {(() => {
              let {
                days,
                mode,
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
                      <Col span={12} className="stats-footer-row">
                        <h3 className="stats-key main__h3">
                          <span aria-label="Доходность">Дох-ть</span> на конец периода
                        </h3>
                        <div className="stats-val">
                          {
                            (() => {
                              let { data } = this.state;
                              let depoStart = this.state.depoStart[mode];

                              let val = Math.round((this.getDepoEnd() - depoStart) / depoStart * 100);

                              if (isNaN(val) || val == Infinity) {
                                val = 0;
                              }

                              return (
                                <Value>
                                  <BigNumber val={val} threshold={1e9} suffix="%" />
                                </Value>
                              )
                            })()
                          }
                        </div>
                      </Col>

                      <Col span={12} className="stats-footer-row">
                        <h3 className="stats-key main__h3">
                          <span aria-label="Доходность">Дох-ть</span> за итерацию
                        </h3>
                        <div className="stats-val">
                          {
                            (() => {
                              var val = this.getMinDailyIncome() 
                                / (numberOfIterations * (directUnloading ? 1 : 2))
                              
                              return <Value format={val => val.toFixed(3) + "%"}>{ val }</Value>
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
                      <BigNumber val={round( this.getMinDailyIncome(), 3 )} threshold={1e9} suffix="%" />
                    </p>

                    <footer className="stats-footer">
                      {
                        true
                        ? (
                          <Col span={12} className="stats-footer-row">
                            <h3 className="stats-key main__h3">
                              { `Выведено за ${days[mode]} ${num2str(days[mode], ["день",   "дня", "дней"])}` }
                            </h3>
                            <div className="stats-val">
                              {
                                paymentTotal != 0
                                  ? "-"
                                  : null
                              }
                              <Value format={formatNumber}>{ paymentTotal }</Value>
                            </div>
                          </Col>
                         )
                        : null
                      }

                      {
                        true
                        ? (
                          <Col span={12} className="stats-footer-row">
                            <h3 className="stats-key main__h3">
                              { `Пополнено за ${days[mode]} ${num2str(days[mode], ["день", "дня", "дней"])}` }
                            </h3>
                            <div className="stats-val">
                              {
                                payloadTotal != 0
                                  ? "+"
                                  : null
                              }
                              <Value format={formatNumber}>{ payloadTotal }</Value>
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

              <Col className="section3-col1">
                <Row className="card">
                  <div className="slider-block" key={1}>
                    <span className="slider-block__label">
                      Процент депозита<br className="xs-only" /> на вход в сделку
                      <Tooltip title="Максимальный объем входа в сделку">
                        <QuestionCircleFilled className="slider-block__info" />
                      </Tooltip>
                    </span>

                    {(() => {
                      var step = 
                        this.getCurrentTool().guaranteeValue / this.state.depoStart[this.state.mode] * 100;
                      if (step > 100) {
                        for (var i = 0; i < this.state.tools.length; i++) {
                          var s = this.state.tools[i].guaranteeValue / this.state.depoStart[this.state.mode] * 100;
                          if (s < 100) {
                            
                            this.setState({ currentToolIndex: i });
                            step = s;
                            break;
                          }
                        }
                      }
                      var min = step;

                      return (
                        <CustomSlider
                          value={this.state.depoPersentageStart}
                          min={min}
                          max={100}
                          step={step}
                          precision={1}
                          filter={val => val + "%"}
                          onChange={val => {
                            const { mode, days } = this.state;
    
                            this.setState({ depoPersentageStart: val }, () => {
                              setTimeout(() => {
                                this.updateData(days[mode]);
                              }, 0);
                            });
                          }}
                        />
                      )
                    })()}
                  </div>
                  {/* /.slider-block */}

                  <div className="slider-block" key={2}>
                    <span className="slider-block__label">
                      Количество итераций<br className="xs-only" /> в день
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
                          numberOfIterations: this.state.directUnloading 
                            ? Math.round(val)
                            : Math.round(val / 2),
                          isSafe: false,
                        });
                      }}
                    />
                  </div>
                  {/* /.slider-block */}
                </Row>

                <Row className="card card--secondary section3__tool-block">

                  <div className="input-group section3__tool-select">
                    <header className="section3__tool-select-header">
                      <h2 className="input-group__label input-group__label--centered main__h2 section3__tool-title">
                        Торговый инструмент
                      </h2>
                      
                      <Tooltip title="Настроить инструменты">
                        <button
                          aria-label="Инструменты"
                          className="settings-button section3-icon"
                          onClick={e => dialogAPI.open("dialog2", e.target)}>
                          <SettingFilled className="settings-button__icon" />
                        </button>
                      </Tooltip>
                    </header>
                    <Select
                      value={this.state.currentToolIndex}
                      onChange={currentToolIndex => {
                        const { depoStart, days, mode } = this.state;

                        var toFind = this.state.depoPersentageStart;

                        var tools = this.getIncomeTools();
                        
                        var step = round(tools[currentToolIndex].guaranteeValue / depoStart[mode] * 100, 1);
                        if (step > 100) {
                          for (var i = 0; i < tools.length; i++) {
                            var s = tools[i].guaranteeValue / this.state.depoStart[this.state.mode] * 100;
                            if (s < 100) {
                              this.setState({ currentToolIndex: i });
                              step = s;
                              break;
                            }
                          }
                        }

                        var rangeLength = Math.floor(100 / step);
                        if (rangeLength < 1 || rangeLength == Infinity) {
                          rangeLength = 1;
                          console.warn("Range length is out of bounds!");
                        }
                        var range = new Array(rangeLength).fill(0).map((val, i) => step * (i + 1));

                        var depoPersentageStart = range.reduce(function (prev, curr) {
                          return (Math.abs(curr - toFind) < Math.abs(prev - toFind) ? curr : prev);
                        });
                        
                        depoPersentageStart = round(depoPersentageStart, 2);
                        depoPersentageStart = Math.max(depoPersentageStart, step);
                        depoPersentageStart = Math.min(depoPersentageStart, 100);

                        this.setState({ currentToolIndex, depoPersentageStart }, () => {
                          this.updateData(days[mode])
                        });
                      }}
                      disabled={this.getIncomeTools().length == 0}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      style={{ width: "100%" }}
                    >
                      {(() => {
                        const { tools, customTools } = this.state
                        var arr = []
                          .concat(tools)
                          .concat(customTools);
                        return arr.length > 0
                          ? (
                            arr
                              // Оставляем только фьючи
                              // .filter(el => el.isFuters)
                              .map(tool => this.getToolName(tool))
                              .map((value, index) => (
                                <Option key={index} value={index}>{value}</Option>
                              ))
                          )
                          : <Option key={0} value={0}>Загрузка...</Option>
                      })()}
                    </Select>
                  </div>
                </Row>
              </Col>

              <Col className="card card--column section3-col2">
                {
                  (() => {
                    let tool = this.getCurrentTool();
                    let pointsForIteration = this.getPointsForIteration();

                    return (
                      <Speedometer
                        key={pointsForIteration}
                        chances={[
                          tool.points.map(row => row[0]),
                          tool.points.map(row => row[1])
                        ]}
                        value={pointsForIteration}
                        tool={tool}
                      />
                    )
                  })()
                }

                {(() => {
                  let pointsForIteration = this.getPointsForIteration();
                  let currentTool = this.getCurrentTool();

                  return (
                    <Row 
                      className="main__h2"
                      type="flex" justify="center"
                      style={{
                        width:        "100%",
                        marginTop:    "auto",
                        marginBottom: "0.2em",
                        fontSize:     "1.6em"
                      }}
                    >
                      <span>
                        <b>{pointsForIteration}</b>
                        {" " + num2str(Math.floor(pointsForIteration), ["шаг", "шага", "шагов"]) + " цены"}
                      </span>
                      &nbsp;=&nbsp;
                      <span>
                        <b>
                          { round(pointsForIteration * currentTool.priceStep, 2)}
                          {" "}
                          <span className="currency">$/₽</span>
                        </b>
                        {" "}
                        изменения цены
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
                passiveIncomeTools,
                currentPassiveIncomeToolIndex,
                depoPersentageStart,
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

                  <Col className="section4-col">
                    <header className="section4-header section4-header--first">
                      <CustomSelect
                        key={this.state.currentDay}
                        className="section4__day-select"
                        options={
                          new Array(days).fill(0).map((val, index) => index + 1)
                        }
                        format={val => val}
                        value={this.state.currentDay}
                        min={1}
                        max={days}
                        onChange={value => this.setCurrentDay(value)}
                      />
                      /{days}
                    </header>
                    <div className="section4-content section4__content1 card">
                      <div className="section4-row">
                        <div className="section4-l">
                          Депо на вход
                        </div>
                        <div className="section4-r">
                          {
                            formatNumber(Math.round(data[currentDay - 1].depoStartReal))
                            +
                            ` (${ round(depoPersentageStart, 3) }%)`
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
                              if (_w !== 0) {
                                _w = `-${formatNumber(_w)}`;
                              }
                            }
                            if (_d !== 0 && _d % payloadInterval == 0) {
                              _p = payload[mode];
                              if (_p !== 0) {
                                _p =`+${formatNumber(_p)}`;
                              }
                            }

                            return `${_w} / ${_p}`
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

                  <div className="section4-col2">
                    <Col className="section4-col">
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
                              data[currentDay - 1].contractsStart
                            }
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section4-row">
                          <div className="section4-l">
                            Шагов цены
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
                            Торговая цель
                          </div>
                          <div className="section4-r">
                            {
                              formatNumber(Math.round(data[currentDay - 1].incomePure))
                            }
                          </div>
                        </div>
                        {/* /.row */}
                      </div>
                    </Col>

                    <Col className="section4-col">
                      <header className="section4-header">
                        До цели
                      </header>
                      {(() => {
                        
                        function getPeriods(present, future, rate) {

                          ///////////////////////////////////////////

                          // ( Начальный депозит, Целевой депозит, Ставка )
                          // Возвращает: Количество дней

                          var dart = future / present;
                          var rex = 1 + rate / 100;
                          rex = Math.log(rex);
                          var res = Math.log(dart) / rex;

                          return res;

                        }

                        var sum   = 0;
                        var total = 0;
                        var avg   = 0;
                        var atLeastOneChanged = false;

                        for (var dataItem of data) {
                          if (dataItem.changed) {
                            atLeastOneChanged = true;
                            sum += dataItem.scale;
                          }
                          else {
                            sum += this.getMinDailyIncome();
                          }
                          total++;
                        }

                        if (total > 0 && (sum / total) != 0) {
                          avg = sum / total;
                        }
                        else {
                          avg = round( this.getMinDailyIncome(), 3 );  
                        }

                        var realDaysLeft = atLeastOneChanged
                          ? roundUp( getPeriods(this.getDepoStart(), this.getDepoEnd(), avg) )
                          : days;
                        var difference = -(days - realDaysLeft);
                        var persentage = (currentDay) / (days + difference) * 100;

                        return (
                          <div className="section4-content section4-content--centered card">
                            
                            <div className="section4-progress-wrap">
                              <Progress 
                                className="section4-progress"
                                type="circle"
                                percent={
                                  (persentage > 3 && persentage < 100) 
                                    ? persentage - 2 
                                    : persentage
                                } 
                                format={val => `${realDaysLeft - currentDay} ${num2str(realDaysLeft - currentDay, ["день", "дня", "дней"])}`}
                              />

                              {
                                total > 0 && difference != 0
                                  ? (
                                    <span className="section4-progress__label">
                                      { difference > 0 ? "+" : null }
                                      {`${ difference } ${ num2str(difference, ["день", "дня", "дней"]) }` }
                                    </span>
                                  )
                                  : null
                              }
                            </div>

                            {(() => {
                              if (total > 0) {
                                var visible = round(avg, 3) < round(this.getMinDailyIncome(), 3);

                                return (
                                  <Statistic
                                    title={
                                      <span>
                                        средняя<br />
                                        <span aria-label="доходность">дох-ть</span>
                                      </span>
                                    }
                                    value={ round( avg, 3 ) }
                                    valueStyle={{ color: visible ? "#f5222d" : "#3f8600" }}
                                    prefix={
                                      visible ? <ArrowDownOutlined /> : <ArrowUpOutlined />
                                    }
                                    suffix="%"
                                  />
                                );
                              }

                            })()}
                          </div>
                        )
                      })()}
                    </Col>
                  </div>

                </section>
              );
            })()}
            {/* /.section4 */}

            {(() => {
              const {
                data,
                mode,
                realData,
                currentDay,
                withdrawalInterval,
                payloadInterval,
                directUnloading,
                passiveIncomeTools,
                currentPassiveIncomeToolIndex
              } = this.state;

              var numberOfIterations = Math.min(
                this.state.numberOfIterations * (directUnloading ? 1 : 2), 100
              );

              return (
                <section className="section5">
                  <h2 className="section5__title">Результат</h2>

                  {
                    (data[currentDay - 1].collapsed && !data[currentDay - 1].saved)
                    ? null
                    : (
                      <span className="section5-content-title">
                        {
                          data[currentDay - 1].changed
                            ? <Value format={val => formatNumber(round(val, 3))}>
                                { data[currentDay - 1].scale }
                              </Value>
                            : "—"
                        }
                        &nbsp;/&nbsp;
                        { round(this.getMinDailyIncome(), 3) }
                        &nbsp;
                        <span>
                          (
                          {(() => {
                            var value = Math.round(
                              data[currentDay - 1].depoStart * (data[currentDay - 1].scale / 100)
                            );

                            return data[currentDay - 1].changed
                              ? (
                                <Value format={val => val > 0 ? "+" + formatNumber(val) : formatNumber(val)}>
                                  { value }
                                </Value>
                              )
                              : "—"
                          })()}
                          {" "}/{" "}
                          {
                            "+" + formatNumber(Math.round(data[currentDay - 1].incomePure))
                          }
                          )
                        </span>
                      </span>
                    )
                  }

                  <Button
                    className={
                      "section5__save custom-btn"
                        .concat(
                          (data[currentDay - 1].changed || !data[currentDay - 1].collapsed)
                            ? " custom-btn--filled"
                            : ""
                        )
                    }
                    role="button"
                    aria-expanded={!data[currentDay - 1].collapsed}
                    aria-controls="result"
                    type={data[currentDay - 1].collapsed ? "primary" : "default"}
                    onClick={e => {
                      const { data, currentDay, saved } = this.state;

                      var state = {
                        data
                      };

                      // Сохранить / Изменить
                      if (!data[currentDay - 1].collapsed) {
                        var resultSaved = data[currentDay - 1].saved;
                        if (!data[currentDay - 1].collapsed) {
                          resultSaved = true;
                        }
                        state.data[currentDay - 1].saved = resultSaved;

                        if (!saved) {
                          Object.assign(state, { savePopupVisible: true });
                        }
                        else {
                          const { title, id } = this.state
                          this.update(title, id)
                        }
                      }

                      state.data[currentDay - 1].collapsed = !data[currentDay - 1].collapsed;
                      this.setState(state);
                    }}
                  >
                    {
                      data[currentDay - 1].collapsed
                        ? data[currentDay - 1].saved
                          ? "Изменить"
                          : "Добавить"
                        : "Сохранить"
                    }
                  </Button>

                  <div 
                    id="result"
                    className={"section5-collapse"}
                    hidden={data[currentDay - 1].collapsed}
                  >
                    <div className="section5-content">

                      <Col className="section5-col">
                        <div className="section5-row">
                          <div className="section5-l">
                            <span aria-label="Доходность">Дох-ть</span> за день
                          </div>
                          <div className="section5-r">
                            <NumericInput
                              defaultValue={
                                data[currentDay - 1].changed
                                  ? round(data[currentDay - 1].scale, 3)
                                  : ""
                              }
                              placeholder="—"
                              format={formatNumber}
                              onBlur={val => {
                                var data = [...this.state.data];
                                data[currentDay - 1].scale = val;
                                data[currentDay - 1].changed = true;
                                this.setState({ data }, () => {
                                  var realData = this.buildRealData(this.state.data);
                                  this.setState({ realData }, this.updateChart);
                                });
                              }}
                            />
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              {round(this.getMinDailyIncome(), 3)}%
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
                                data[currentDay - 1].changed
                                  ? data[currentDay - 1].payment
                                  : ""
                              }
                              placeholder="—"
                              format={formatNumber}
                              onBlur={val => {
                                var data = [...this.state.data];
                                data[currentDay - 1].payment = val;
                                // data[currentDay - 1].changed = true;
                                this.setState({ data });
                              }}
                            />
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
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
                                data[currentDay - 1].changed
                                  ? data[currentDay - 1].payload
                                  : ""
                              }
                              placeholder="—"
                              format={formatNumber}
                              onBlur={val => {
                                var data = [...this.state.data];
                                data[currentDay - 1].payload = val;
                                // data[currentDay - 1].changed = true;
                                this.setState({ data }, () => {
                                  // var realData = this.buildRealData(this.state.data);
                                  // this.setState({ realData }, this.updateChart);
                                });
                              }}
                            />
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
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

                      <Col className="section5-col">
                        <div className="section5-row">
                          <div className="section5-l">
                            Итераций:
                          </div>
                          <div className="section5-r">
                            <NumericInput
                              key={numberOfIterations}
                              defaultValue={
                                data[currentDay - 1].changed
                                  ? numberOfIterations
                                  : ""
                              }
                              placeholder="—"
                              format={formatNumber}
                              onBlur={val => {
                                var data = [...this.state.data];
                                data[currentDay - 1].iterations = val;
                                // data[currentDay - 1].changed = true;
                                this.setState({ data }, () => {
                                  // var realData = this.buildRealData(this.state.data);
                                  // this.setState({ realData }, this.updateChart);
                                });
                              }}
                            />
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              {numberOfIterations}
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section5-row">
                          <div className="section5-l">
                            Пассивный доход:
                          </div>
                          <div className="section5-r">
                            <Value>
                              {(() => {
                                var val = realData[currentDay - 1].depoEnd;
                                var tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
                                if (tool) {
                                  var persantage = tool.rate / 365 * (365 / 260) / 100;

                                  return formatNumber(Math.round(val * persantage))
                                }

                                return 0;
                              })()}
                            </Value>
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              день
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                        <div className="section5-row">
                          <div className="section5-l">
                            Депозит:
                          </div>
                          <div className="section5-r">
                            <span>
                              {
                                data[currentDay - 1].changed
                                  ? (
                                    <Value format={val => formatNumber(Math.round(val))}>
                                      { realData[currentDay - 1].depoEnd }
                                    </Value> 
                                  )
                                  : "—"
                              }
                            </span>
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              <BigNumber
                                val={Math.floor( this.getDepoEnd() )}
                                threshold={1e6}
                              />
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                      </Col>

                      <Col className="section5-col section5-col--centered">
                        {(() => {
                          var percentage = round(
                            data[currentDay - 1].scale / (round( this.getMinDailyIncome(), 3 )) * 100,
                            2
                          );

                          return (
                            <Progress
                              type="circle"
                              status={
                                data[currentDay - 1].changed
                                  ? percentage >= 100
                                    ? "success"
                                    : percentage < 0
                                      ? "exception"
                                      : "normal"
                                  : "normal"
                              }
                              trailColor={
                                percentage >= 100
                                  ? "#3f6b33"
                                  : percentage < 0
                                    ? "#f5222d"
                                    : "#4859b4"
                              }
                              percent={
                                data[currentDay - 1].changed
                                  ? percentage < 0
                                      ? 100
                                      : (percentage > 3 && percentage < 100)
                                          ? percentage - 2
                                          : percentage
                                  : 0
                              }
                            />
                          ) 
                        })()}
                      </Col>

                    </div>
                    {/* /.section5-content */}

                    {(() => {
                      var income  = data[currentDay - 1].depoStart * (data[currentDay - 1].scale / 100);
                      var percent = income / data[currentDay - 1].incomePure;

                      return (
                        <footer className="section5-footer">
                          <span className="section5-footer-title">Дневная цель</span>
                          <Progress 
                            status={
                              data[currentDay - 1].changed
                                ? percent >= 1 
                                  ? "success"
                                  : percent < 0
                                    ? "exception" 
                                    : "normal"
                                : "normal"
                            }
                            trailColor={
                              percent >= 1
                                ? "#3f6b33"
                                : percent < 0
                                  ? "#f5222d"
                                  : "#4859b4"
                            } 
                            percent={
                              data[currentDay - 1].changed
                                ? percent < 0
                                  ? 100
                                  : round(percent * 100, 2)
                                : 0
                            }
                          />
                          <span className="section5-footer__label">
                            {
                              data[currentDay - 1].changed
                                ? (
                                  <Value format={val => formatNumber(Math.round(val))}>
                                    { income }
                                  </Value>
                                )
                                : "—"
                            }
                            {" "}/{" "}
                            { formatNumber(Math.round(data[currentDay - 1].income)) }
                          </span>
                        </footer>
                      )
                    })()}

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

        {(() => {
          var { saves, id } = this.state;
          var namesTaken = saves.slice().map(save => save.name);
          var name = (id) ? this.getTitle() : "Новый трейдометр";

          function validate(str = "") {
            str = str.trim();

            var errors = [];

            var test = /[\!\?\@\#\$\%\^\&\*\+\=\`\'\"\;\:\<\>\{\}\~]/g.exec(str);
            if (str.length < 3) {
              errors.push("Имя должно содержать не меньше трех символов!");
            }
            else if (test) {
              errors.push(`Нельзя использовать символ "${test[0]}"!`);
            }
            if (!id) {
              if (namesTaken.indexOf(str) > -1) {
                errors.push(`Сохранение с таким именем уже существует!`);
              }
            }

            return errors;
          }

          class ValidatedInput extends React.Component {

            constructor(props) {
              super(props);

              let { defaultValue } = props;

              this.state = {
                error: "",
                value: defaultValue || ""
              }
            }

            vibeCheck() {
              const { validate } = this.props;
              var { value } = this.state;

              var errors = validate(value);
              this.setState({ error: (errors.length > 0) ? errors[0] : "" });
              return errors;
            }

            render() {
              const { validate, label } = this.props;
              const { value, error } = this.state;

              return (
                <label className="save-modal__input-wrap">
                  {
                    label
                      ? <span className="save-modal__input-label">{label}</span>
                      : null
                  }
                  <Input
                    className={
                      ["save-modal__input"]
                        .concat(error ? "error" : "")
                        .join(" ")
                        .trim()
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellcheck="false"
                    value={value}
                    maxLength={20}
                    onChange={e => {
                      var { value } = e.target;
                      var { onChange } = this.props;

                      this.setState({ value });

                      if (onChange) {
                        onChange(value);
                      }
                    }}
                    onKeyDown={e => {
                      // Enter
                      if (e.keyCode === 13) {
                        var { value } = e.target;
                        var { onBlur } = this.props;

                        var errors = validate(value);
                        if (errors.length === 0) {
                          if (onBlur) {
                            onBlur(value);
                          }
                        }

                        this.setState({ error: (errors.length > 0) ? errors[0] : "" });
                      }
                    }}
                    onBlur={e => {
                      this.vibeCheck();
                    }} />

                  <span className={
                    ["save-modal__error"]
                      .concat(error ? "visible" : "")
                      .join(" ")
                      .trim()
                  }>
                    {error}
                  </span>
                </label>
              )
            }
          }

          var onOk = () => {
            var { id, saves, currentSaveIndex } = this.state;

            if (id) {
              this.update(name, id, () => {
                saves[currentSaveIndex].name = name;
                this.setState({
                  saves:   saves,
                  changed: false,
                })
              });
            }
            else {
              this.save(name, id => {
                var index = saves.push({ name: name, id: id }) - 1;
                this.setState({
                  saves:   saves,
                  saved:   true,
                  changed: false,
                  currentSaveIndex: index,
                });
              });
            }
          }

          let inputJSX = (
            <ValidatedInput
              label="Введите название тредометра"
              validate={validate}
              defaultValue={name}
              onChange={val => name = val}
              onBlur={val => {}} />
          );
          let modalJSX = (
            <Dialog
              id="dialog1"
              className="save-modal"
              title={"Сохранение трейдометра"}
              onOk={e => {
                if (validate(name).length) {
                  console.error( validate(name)[0] );
                }
                else {
                  onOk();
                  return true;
                }
              }}
            >
              {inputJSX}
            </Dialog>
          );

          return modalJSX;
        })()}
        {/* Save Popup */}

        <Dialog
          id="dialog2"
          title="Инструменты"
          okContent="Добавить"
          onOk={e => {
            var { toolTemplate, customTools, propsToShowArray } = this.state;

            var template = Object.assign({}, toolTemplate);
            var tool = template;
            propsToShowArray.map((prop, index) => {
              tool[prop] = (index === 0) ? "Инструмент" : 0;
            });

            customTools.push(tool);
            this.setState({ customTools }, () => {
              $(".config-table-wrap").scrollTop(9999);
            });
          }}
          cancelContent="Закрыть"
        >
          <div className="config-table-wrap">
            {(() => {
              const { tools, customTools, propsToShowArray } = this.state;
              
              return (
                <table className="table">
                  <thead className="table-header">
                    <tr className="table-tr">
                      <th className="config-th table-th">Инструмент</th>
                      <th className="config-th table-th">Цена шага</th>
                      <th className="config-th table-th">Шаг цены</th>
                      <th className="config-th table-th">Средний ход</th>
                      <th className="config-th table-th">ГО</th>
                      <th className="config-th table-th">Текущая цена</th>
                      <th className="config-th table-th">Размер лота</th>
                      <th className="config-th table-th">Курс доллара</th>
                      {customTools && customTools.length ? (
                        <th className="config-th table-th"></th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {
                      tools && tools.map((tool, index) =>
                        <tr className="config-tr" key={index}>
                          {
                            this.state.propsToShowArray.map((prop, i) =>
                              <td
                                className="table-td"
                                style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                                key={i}>
                                {tool[prop]}
                              </td>
                            )
                          }
                        </tr>
                      )
                    }
                    {(() => {
                      var onBlur = (val, index, prop) => {
                        var { customTools } = this.state;
                        customTools[index][prop] = val;
                        this.setState({ customTools });
                      };

                      return customTools && customTools.map((tool, index) =>
                        <tr className="config-tr" key={index}>
                          {
                            propsToShowArray.map((prop, i) =>
                              <td
                                className="table-td"
                                style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                                key={i}>
                                {
                                  i === 0 ? (
                                    <Input
                                      defaultValue={tool[prop]}
                                      onBlur={e => onBlur(e.target.value, index, prop)}
                                      onKeyDown={e => {
                                        if (
                                          [
                                            13, // Enter
                                            27  // Escape
                                          ].indexOf(e.keyCode) > -1
                                        ) {
                                          e.target.blur();
                                          onBlur(e.target.value, index, prop);
                                        }
                                      }}
                                    />
                                  )
                                    : (
                                      <NumericInput
                                        defaultValue={tool[prop]}
                                        onBlur={val => onBlur(val, index, prop)}
                                      />
                                    )
                                }
                              </td>
                            )
                          }
                          <td className="table-td" key={index}>
                            <Tooltip title="Удалить">
                              <button
                                className="config__delete x-button"
                                aria-label="Удалить"
                                onClick={e => {
                                  var { customTools } = this.state;
                                  customTools.splice(index, 1);
                                  this.setState({ customTools });
                                }}>
                                <span>&times;</span>
                              </button>
                            </Tooltip>
                          </td>
                        </tr>
                      )
                    })()}
                  </tbody>
                </table>
              )
            })()}
          </div>
          {/* /.config-talbe-wrap */}
        </Dialog>
        {/* Инструменты */}

        <Dialog
          id="dialog3"
          className="pi-dialog"
          title={"Инструменты пассивного дохода"}
          okContent="Добавить"
          onOk={e => {
            var { passiveIncomeTools } = this.state;

            var tool = {
              name: "Инструмент",
              rate: 0
            };
            passiveIncomeTools.push(tool);
            this.setState({ passiveIncomeTools }, () => {
              $(".config-table-wrap").scrollTop(9999);
            });
          }}
          cancelContent="Закрыть"
        >
          <div className="config-table-wrap">
            <table className="table">
              <thead className="table-header">
                <tr className="table-tr">
                  <th className="config-th table-th pi-dialog-th">Название</th>
                  <th className="config-th table-th pi-dialog-th">Ставка</th>
                  <th className="config-th table-th pi-dialog-th"></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {(() => {
                  var onBlur = (val, index, prop) => {
                    var { passiveIncomeTools } = this.state;
                    passiveIncomeTools[index][prop] = val;
                    this.setState({ passiveIncomeTools });
                  };

                  return this.getPassiveIncomeTools().map((tool, index) =>
                    <tr className="config-tr" key={index}>
                      {
                        ["name", "rate"].map((prop, i) =>
                          <td
                            className="table-td"
                            style={{ width: (prop === "name") ? "15em" : "9em" }}
                            key={i}>
                            {
                              i === 0 ? (
                                <Input
                                  defaultValue={tool[prop]}
                                  onBlur={e => onBlur(e.target.value, index, prop)}
                                  onKeyDown={e => {
                                    if (
                                      [
                                        13, // Enter
                                        27  // Escape
                                      ].indexOf(e.keyCode) > -1
                                    ) {
                                      e.target.blur();
                                      onBlur(e.target.value, index, prop);
                                    }
                                  }}
                                />
                              )
                              : (
                                <NumericInput
                                  defaultValue={tool[prop]}
                                  onBlur={val => onBlur(val, index, prop)}
                                />
                              )
                            }
                          </td>
                        )
                      }
                      {this.getPassiveIncomeTools().length > 1 && (
                        <td className="table-td" key={index}>
                          <Tooltip title="Удалить">
                            <button
                              className="x-button config__delete"
                              aria-label="Удалить"
                              onClick={e => {
                                var { passiveIncomeTools } = this.state;
                                passiveIncomeTools.splice(index, 1);
                                this.setState({ passiveIncomeTools });
                              }}>
                              <span>&times;</span>
                            </button>
                          </Tooltip>
                        </td>
                      )}
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
          {/* /.config-talbe-wrap */}
        </Dialog>
        {/* Инструменты пассивного дохода */}
        
        <Dialog
          id="dialog4"
          title="Удаление трейдометра"
          okContent={"Удалить"}
          onOk={e => {
            const { id } = this.state;
            this.delete(id);
            return true;
          }}
        >
          Вы уверены, что хотите удалить {this.getTitle()}?
        </Dialog>
        {/* Delete Popup */}

      </div>
    );
  }
}