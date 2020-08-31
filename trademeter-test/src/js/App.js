import React from "react"
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Switch,
  Progress,
  Statistic,
  Input
} from "antd/es"
const { Option } = Select;

import {
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  WarningOutlined,
} from "@ant-design/icons"

import "core-js/features/promise"
// import "whatwg-fetch"

import "../sass/style.sass"

import { ajax } from "jquery";
import promiseWhile    from "./utils/promise-while";
import round           from "./utils/round";
import roundUp         from "./utils/round-up";
import params          from "./utils/params";
import num2str         from "./utils/num2str"
import formatNumber    from "./utils/format-number";
import extRate         from "./utils/rate";
import rateRequired    from "./utils/rate-required";
import fallbackBoolean from "./utils/fallback-boolean";
import typeOf          from "./utils/type-of";

import Stack        from "./components/stack"
import CrossButton  from "./components/cross-button"
import BigNumber    from "./components/BigNumber"
import Value        from "./components/value"
import NumericInput from "./components/numeric-input"
import CustomSlider from "./components/custom-slider"
import CustomSelect from "./components/custom-select"
import Speedometer  from "./components/riskometer"
import { Dialog, dialogAPI } from "./components/dialog"

let chartData, chartData2, scale, scaleStart, scaleEnd;
const version = "0.2";

const dev = false;
const chartVisible = true;

export default class App extends React.Component {

  constructor(props) {
    super(props);

    // Данные из адресной строки
    const depoStart = Number( params.get("start") ) || 1000000;
    const depoEnd   = Number( params.get("end") )   || 3000000;
    const mode      = Number( params.get("mode") )  || 0;
    const days      = Number( params.get("days") )  || 260;

    this.initial = {
      saved: false,
      // Начальный депозит
      depoStart: [ depoStart, depoStart ],

      // Целевой депозит
      depoEnd,

      // Доходность в день
      incomePersantageCustom: 1,

      // Сумма на вывод
      withdrawal: [ 0, 0 ],
      // Частота вывода
      withdrawalInterval: [20, 20],

      // Сумма на пополнение
      payload: [ 0, 0 ],
      // Частота пополнения
      payloadInterval: [20, 20],

      // Торговых дней
      days: [ days, days ],
      offset: 0,
      paginatorSelectedIndex: 0,

      // Текущий день
      currentDay: 1,

      // Процент депозита на вход в сделку
      depoPersentageStart: 10,

      // Количество итераций в день
      iterations: 10,

      // Минимальная доходность в день
      minDailyIncome: 45,

      incomePersantageDaily: 0,

      customTools: [],
      currentToolIndex:   0,
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
      customPassiveIncomeTools: [],
      currentPassiveIncomeToolIndex: [-1, -1],
      // Пассивный доход в месяц
      passiveIncomeMonthly: [0, 0],
    };

    this.state = Object.assign({
      ready: false,

      data: [],
      realData: {},

      changed:            false,
      saved:              false,
      saves:              [],
      currentSaveIndex:   0,

      // Режим
      mode,
      prevMode: mode,

      // Начальный депозит
      depoStart: [ depoStart, depoStart ],

      // Целевой депозит
      depoEnd,

      // Доходность в день
      incomePersantageCustom: 1,

      // Сумма на вывод
      withdrawal: [ 0, 0 ],
      // Частота вывода
      withdrawalInterval: [20, 20],

      // Сумма на пополнение
      payload: [ 0, 0 ],
      // Частота пополнения
      payloadInterval: [20, 20],

      // Торговых дней
      days: [ days, days ],

      // Текущий день
      currentDay: 1,

      // Процент депозита на вход в сделку
      depoPersentageStart: 10,

      // Количество итераций в день
      iterations: 10,

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
      currentPassiveIncomeToolIndex: [-1, -1],
      // Пассивный доход в месяц
      passiveIncomeMonthly: [0, 0],
      pitError: "",
      errorMessage: "",
    }, this.initial);

    if (dev) {
      this.state.saves = [{ id: 0, name: "test" }];
    }

    this.state.data = this.buildData(this.state.days[this.state.mode]);
  }

  componentDidMount() {

    if (chartVisible) {
      this.createChart();
    }

    const checkIfAuthorized = () => {
      return new Promise(resolve => {
        this.sendRequest("getAuthInfo")
          .then(res => {
            if (res.authorized) {
              this.fetchDepoStart()
                .then(depo => {
                  let { depoStart, depoEnd } = this.state;
  
                  // TODO: simplify
                  depo = depo || 10000;
                  depo = (depo > 10000) ? depo : 10000;
                  depoStart[0] = depo;
                  depoStart[1] = depo;
                  if (depo >= depoEnd) {
                    depoEnd = depo * 2;
                  }
  
                  return new Promise(resolve => {
                    this.setState({ depoStart, depoEnd }, () => resolve());
                  })
                })
                .then(() => this.recalc())
                .catch(err => this.showMessageDialog(`Не удалось получить начальный депозит! ${err}`));
  
              this.fetchTools()
                .then(tools => this.unpackTools(tools))
                .then(() => this.updateDepoPersentageStart())
                .catch(err => this.showMessageDialog(`Не удалось получить инстурменты! ${err}`));
  
              this.fetchSaves()
                .then(saves => {
                  if (saves.length) {
                    const pure = params.get("pure") === "true";
                    if (!pure) {
                      let found = false;
                      // Check if each save is corrupt
                      for (let index = 0, p = Promise.resolve(); index < saves.length; index++) {
                        p = p.then(_ => new Promise(resolve => {
                          const save = saves[index];
                          const id = save.id;
                          this.fetchSaveById(id)
                            .then(save => {
                              const corrupt = !this.validateSave(save);
                              if (!corrupt && !found) {
                                found = true;
                                // Try to load it
                                this.extractSave(Object.assign(save, { id }));
                                this.setState({ currentSaveIndex: index + 1 });
                              }
  
                              saves[index].corrupt = corrupt;
                              this.setState({ saves });
                              resolve();
                            });
                        }));
                      }
                    }
                  }
                  else {
                    console.log("No saves found!");
                  }
  
                  this.setState({ saves });
                })
                .catch(err => this.showMessageDialog(`Не удалось получить сохранения! ${err}`));
                
            }

            resolve(res.authorized);
          })
      })
    }

    promiseWhile(false, i => i != true, num => {
      return new Promise(resolve => {
        checkIfAuthorized().then(auth => {
          resolve(auth);
        });
      });
    });

  }

  // TODO: test
  setStatePromise(state = {}) {
    return new Promise(resolve => this.setState(state, () => resolve()))
  }

  createChart() {
    // New chart
    anychart && anychart.onDocumentReady(() => {

      // TODO: use updateChart()
      const { mode, days } = this.state;
      let data = [...this.state.data];

      // data
      chartData = anychart.data.set(
        new Array(days[mode]).fill().map((v, i) => ({
          x:     String(i + 1),
          value: data[i].depoEndPlan
        }))
      );

      chartData2 = anychart.data.set(
        new Array(days[mode]).fill().map((v, i) => ({
          x:     String(i + 1),
          value: data[i].depoEnd
        }))
      );

      // set chart type
      let chart = anychart.line();
      chart.animation(true, 3000);
      chart.listen("click", e => {
        if (e.pointIndex) {
          this.setCurrentDay(e.pointIndex + 1);
        }
      });
      chart.tooltip().titleFormat(e => `День: ${Number(e.x)}`);

      // set data
      let series = chart.line(chartData);
      series.name("Фактический рост депо");
      series.tooltip().displayMode("separated");
      series.tooltip().useHtml(true);
      series.tooltip().format(e => {
        let svg = `
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

      let series2 = chart.line(chartData2);
      series2.name("Планируемый рост депо");
      series2.tooltip().displayMode("separated");
      series2.tooltip().useHtml(true);
      series2.tooltip().format(e => {
        let svg = `
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
        chart.xScroller().fill("#40a9ff 0.1");
        chart.xScroller().selectedFill("#40a9ff 0.5");
        // adjusting the thumbs behavior and look
        chart.xScroller().listen("scrollerchange", e => {
          const { days, mode } = this.state;
          scaleStart = e.startRatio;
          scaleEnd = e.endRatio;

          let min = Math.max(Math.round(days[mode] * scaleStart) + 1, 1);
          let max = Math.min(Math.round(days[mode] * scaleEnd) + 1, days[mode]);
          scale.minimum(min);
          scale.maximum(max);
          scale.ticks().interval(
            (() => {
              let range = Math.abs(min - max);
              let breakpoints = new Array(10).fill(0).map((n, i) => 260 * (i + 1));
              for (let i = breakpoints.length; i--;) {
                let breakpoint = breakpoints[i];
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
      chart.xScale().mode("continuous");
      chart.container("_chart").draw();

    });
  }

  showMessageDialog(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  updateDepoPersentageStart() {
    const { mode, days, currentDay, data } = this.state;

    return new Promise((resolve, reject) => {
      let depoPersentageStart = this.getCurrentTool().guaranteeValue / data[currentDay - 1].depoStart * 100;
      this.setState({ depoPersentageStart }, () => {
        this.updateData(days[mode], false)
          .then(resolve)
          .catch(err => reject(err));
      });
    });

  }

  unpackTools(tools) {
    let { toolTemplate } = this.state;

    return new Promise((resolve, reject) => {

      if (!tools || tools.length === 0) {
        reject(`"tools" is not an array or it's simply empty!`, tools);
      }
  
      let t = [];
      for (let tool of tools) {
        if (tool.price == 0 || !tool.volume) {
          continue;
        }

        let template = Object.assign({}, toolTemplate);
  
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

  packSave() {
    let {
      mode,
      data,
      days,
      withdrawal,
      payload,
      currentDay,
      passiveIncomeMonthly,
      withdrawalInterval,
      payloadInterval,
      directUnloading,
      currentToolIndex,
      customTools,
      passiveIncomeTools,
      currentPassiveIncomeToolIndex,
    } = this.state;

    const json = {
      static: {
        version,
        depoStart:                     [ this.getDepoStart(0), this.getDepoStart(1) ],
        depoEnd:                       [ this.getDepoEnd(0), mode == 1 ? this.getDepoEnd(1) : null ],
        currentDay:                    currentDay, 
        days:                          [ days[0], days[1] ],
        minDailyIncome:                [
          round(this.getRate(0), 3),
          round(this.getRate(1), 3)
        ],
        payment:                       [ withdrawal[0], withdrawal[1] ],
        paymentInterval:               [ withdrawalInterval[0], withdrawalInterval[1] ],
        payload:                       [ payload[0], payload[1] ],
        payloadInterval:               [ payloadInterval[0], payloadInterval[1] ],
        passiveIncome:                 [ passiveIncomeMonthly[0], passiveIncomeMonthly[1] ],
        passiveIncomeTools:            this.getPassiveIncomeTools(),
        currentPassiveIncomeToolIndex: [ currentPassiveIncomeToolIndex[0], currentPassiveIncomeToolIndex[1] ],
        mode:                          mode,
        customTools:                   customTools,
        currentToolIndex:              currentToolIndex,
        current_date:                  "#"
      },
      dynamic: data
        .slice()
        .filter(item => item.changed)
        .map((item, index) => ({
          d:   item.day,
          s:   item.scale,
          ci:  item.customIncome,
          pmt: item.payment,
          pld: item.payload,
          i:   item.iterations,
          c:   item.changed,
          pi: (() => {
            let val = data[index].depoEnd;
            let tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
            if (tool) {
              let persantage = tool.rate / 365 * (365 / 260) / 100;
              return Math.round(val * persantage)
            }
            return 0;
          })(),
          du: directUnloading
        }))
    };

    console.log("Save packed!", json);
    return json;
  }

  validateSave(save) {
    let valid = true;

    try {
      
      const staticParsed = JSON.parse(save.data.static);
      const dynamicParsed = JSON.parse(save.data.dynamic);
      
      // if (Number(staticParsed.version) < Number(version)) {
      //   throw new Error();
      // }
      
    }
    catch (e) {
      valid = false;
    }

    return valid;
  }

  extractSave(save) {
    const onError = e => {
      this.showMessageDialog(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    const {
      depoEnd,
      defaultPassiveIncomeTools,
    } = this.state;

    let staticParsed;
    let dynamicParsed;

    let state = {};
    let failed = false;

    let currentDay = 1;

    try {
      
      staticParsed = JSON.parse(save.data.static);
      dynamicParsed = JSON.parse(save.data.dynamic);

      console.log("staticParsed", staticParsed);
      console.log("dynamicParsed", dynamicParsed);
      
      let m = staticParsed.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.mode = m;

      state.depoStart = staticParsed.depoStart;
      if (typeOf(state.depoStart) !== "array") {
        const temp = state.depoStart; 
        state.depoStart = this.initial.depoStart.slice();
        state.depoStart[m] = Number(temp);
      }

      
      state.depoEnd = staticParsed.depoEnd;
      if (typeOf(state.depoEnd) === "array") {
        state.depoEnd = (m === 0) ? Math.round(state.depoEnd[m]) : depoEnd;
      }
      else if (typeOf(state.depoEnd) === "number") {
        state.depoEnd = Math.round(state.depoEnd);
      }

      currentDay = staticParsed.currentDay;
      if (typeOf(currentDay) === "array") {
        currentDay = currentDay[m];
      }

      state.days = staticParsed.days;
      if (typeOf(state.days) !== "array") {
        const temp = state.days;
        state.days = this.initial.days.slice();
        state.days[m] = Number(temp);
      }

      state.incomePersantageCustom = staticParsed.minDailyIncome;
      if (typeOf(state.incomePersantageCustom) === "array") {
        state.incomePersantageCustom = state.incomePersantageCustom[1];
      }

      state.withdrawal = staticParsed.payment;
      if (typeOf(state.withdrawal) !== "array") {
        const temp = state.withdrawal;
        state.withdrawal = this.initial.withdrawal.slice();
        state.withdrawal[m] = Number(temp);
      }

      state.withdrawalInterval = staticParsed.paymentInterval;
      if (typeOf(state.withdrawalInterval) !== "array") {
        const temp = state.withdrawalInterval;
        state.withdrawalInterval = this.initial.withdrawalInterval.slice();
        state.withdrawalInterval[m] = Number(temp);
      }

      state.payload = staticParsed.payload;
      if (typeOf(state.payload) !== "array") {
        const temp = state.payload;
        state.payload = this.initial.payload.slice();
        state.payload[m] = Number(temp);
      }
      
      state.payloadInterval = staticParsed.payloadInterval;
      if (typeOf(state.payloadInterval) !== "array") {
        const temp = state.payloadInterval;
        state.payloadInterval = this.initial.payloadInterval.slice();
        state.payloadInterval[m] = Number(temp);
      }

      state.passiveIncomeMonthly = staticParsed.passiveIncome || [0, 0];
      if (typeOf(state.passiveIncomeMonthly) !== "array") {
        const temp = state.passiveIncomeMonthly;
        state.passiveIncomeMonthly = this.initial.passiveIncomeMonthly.slice();
        state.passiveIncomeMonthly[m] = Number(temp);
      }

      state.customTools        = staticParsed.customTools        || [];
      state.passiveIncomeTools = staticParsed.passiveIncomeTools || defaultPassiveIncomeTools;

      state.currentPassiveIncomeToolIndex = staticParsed.currentPassiveIncomeToolIndex || [-1, -1];
      if (typeOf(state.currentPassiveIncomeToolIndex) !== "array") {
        const temp = state.currentPassiveIncomeToolIndex;
        state.currentPassiveIncomeToolIndex = this.initial.currentPassiveIncomeToolIndex.slice();
        state.currentPassiveIncomeToolIndex[m] = Number(temp);
      }

      state.currentToolIndex = staticParsed.currentToolIndex || 0;

      state.id = save.id;
      state.saved = true;
    }
    catch (e) {
      failed = true;
      state = {
        id: save.id,
        saved: true
      };

      // onError(`Формат сохранения устарел. Пожалуйста, попробуйте другое сохранение`);
      onError(e);
    }

    this.setState(state, () => {
      if (!failed) {
        this.updateData(state.days[state.mode], true)
          .then(() => this.overrideData(dynamicParsed))
          .then(() => this.updateData(state.days[state.mode], false))
          .then(() => this.updateChart())
          .then(() => this.setState({ currentDay }))
          .catch(err => this.showMessageDialog(err));
      }
    });
  }

  parseTool(str) {
    let arr = str
      .replace(/\,/g, ".")
      .split(/\t+/g)
      .map(n => (n + "").replace(/\"/g, "").replace(/(\d+)\s(\d+)/, "$1$2"));
    
    let obj = {
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

  createDayData(daysArray, i, rebuild) {
    let {
      mode,
      data,
      withdrawalInterval,
      payloadInterval,
      depoPersentageStart,
      iterations,
    } = this.state;

    data[i] = data[i] || {};

    let depoStart   = this.state.depoStart[mode];
    let withdrawal  = this.state.withdrawal[mode];
    let payload     = this.state.payload[mode];
    let currentTool = this.getCurrentTool();

    // Calculating depoStart
    let _depoStart = depoStart;
    let depoStartTest = depoStart;
    if (i > 0) {
      _depoStart = depoStartTest = daysArray[i - 1].depoEnd;
    }

    let _depoStartPlan = depoStart;
    if (i > 0) {
      _depoStartPlan = daysArray[i - 1].depoEndPlan;
    }

    let _depoStartReal = _depoStart * (depoPersentageStart / 100);

    let customIncome;
    if (data && data[i] && data[i].customIncome != null) {
      customIncome = data[i].customIncome;
    }

    const scaleInitial = round(this.getRate(), 3);
    let _scale  = scaleInitial;
    if (!rebuild && data && data[i] && data[i].scale != null) {
      _scale = data[i].scale;
    }

    let _income     = (_depoStart * _scale) / 100;
    let _incomePlan = (_depoStartPlan * scaleInitial) / 100;
    let _incomeReal = (_depoStart * scaleInitial) / 100;
    
    if (!rebuild && customIncome != null) {
      _income = customIncome;
      // _incomePlan = data[i].customIncome;
      // _incomeReal = data[i].customIncome; 
    }

    if ((i + 1) > 0 && ((i + 1) % withdrawalInterval[mode]) == 0) {
      _income     -= withdrawal;
      _incomePlan -= withdrawal;
      _incomeReal -= withdrawal;
    }
    if ((i + 1) > 0 && ((i + 1) % payloadInterval[mode]) == 0) {
      _income     += payload;
      _incomePlan += payload;
      _incomeReal += payload;
    }

    let _depoEnd     = _depoStart     + _income;
    let _depoEndPlan = _depoStartPlan + _incomePlan;

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

    let _pointsForIteracion = _incomeReal / currentTool.stepPrice / _contractsStart;

    let { collapsed, saved, changed } = !rebuild ? data[i] : {
      collapsed: true,
      saved:     false,
      changed:   false
    };

    let res = {
      day:                i + 1,
      scale:              (!rebuild && data && data[i] && data[i].scale != null) ? data[i].scale : undefined,
      depoStartTest,
      depoStart:          _depoStart,
      depoStartPlan:      _depoStartPlan,
      depoStartReal:      _depoStartReal,
      customIncome,
      income:             _income,
      incomePlan:         _incomePlan,
      incomeReal:         _incomeReal,
      depoEnd:            _depoEnd,
      depoEndPlan:        _depoEndPlan,
      contractsStart:     _contractsStart,
      pointsForIteration: _pointsForIteracion,

      iterations: data[i].iterations,
      payment:    data[i].payment,
      payload:    data[i].payload,

      scaleChanged:        data[i].scaleChanged,
      paymentChanged:      data[i].paymentChanged,
      payloadChanged:      data[i].payloadChanged,
      customIncomeChanged: data[i].customIncomeChanged,
      iterationsChanged:   data[i].iterationsChanged,

      collapsed: fallbackBoolean(collapsed, true),
      saved:     fallbackBoolean(saved,     false),
      changed:   fallbackBoolean(changed,   false)
    };
    return res;
  }

  buildData(length = 0, rebuild) {
    let data = new Array(length).fill(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = this.createDayData(data, i, rebuild);
    }

    return data;
  }

  updateData(length = 0, rebuild) {
    return new Promise(resolve => {
      let { realData } = this.state;
      const data = this.buildData(length, rebuild);
      if (rebuild) {
        realData = {};
      }

      this.setState({ data, realData }, () => resolve());
    })
  }

  overrideData(override = []) {
    const { data } = this.state;

    return new Promise(resolve => {
      for (let i = 0; i < override.length; i++) {
        let item = override[i];
        let d = ((item.day != null) ? item.day : item.d) - 1;

        data[d].day             = d + 1;
        data[d].scale           = item.scale != null ? item.scale : item.s;
        data[d].customIncome    = item.customIncome != null ? item.customIncome : item.ci;
        data[d].payment         = item.payment != null ? item.payment : item.pmt;
        data[d].payload         = item.payload != null ? item.payload : item.pld;
        data[d].iterations      = item.iterations != null ? item.iterations : item.i;
        data[d].changed         = item.changed != null ? item.changed : item.c;
        data[d].passiveIncome   = item.passiveIncome != null ? item.passiveIncome : item.pi;
        data[d].directUnloading = item.directUnloading != null ? item.directUnloading : item.du;
      }

      this.setState({ data }, () => resolve());
    })
  }

  updateChart() {
    if (!chartVisible) {
      return;
    }

    const { days, mode } = this.state;
    const data  = [...this.state.data];
    if (data.length !== days[mode]) {
      return;
    }

    // append data
    chartData2.data(
      new Array(days[mode]).fill().map((v, i) => ({
        x:     String(i + 1),
        value: data[i].depoEndPlan
      }))
    );

    chartData.data(
      new Array(days[mode]).fill().map((v, i) => ({
        x:     String(i + 1),
        value: data[i].depoEnd
      }))
    );

  }

  bindEvents() {
    if (window.history && window.history.pushState) {
      window.addEventListener("popstate", () => {
        const mode = Number(params.get("mode")) || 0;
        this.setState({ mode });
      });
    }
  }

  recalc(rebuild = true) {
    let { mode, days } = this.state;

    const period = days[mode];
    return new Promise((resolve, reject) => {
      this.updateData(period, rebuild)
        .then(() => this.updateChart())
        .then(() => resolve())
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

    if (persentage > .3) {
      return ["", "Слишком большая доходность!"];
    }

    let err = ["Слишком большой вывод!", "Слишком маленькая доходность!"];

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

  getMaxPaymentValue(frequency) {
    const { data } = this.state;

    frequency = frequency || this.state.withdrawalInterval[this.state.mode];

    const max = data
      .slice(0, frequency)
      .map(d => d.incomePlan)
      .reduce((prev, curr) => prev + curr);
    return Math.round(max);
  }

  validatePayment(value, frequency) {
    const max = this.getMaxPaymentValue(frequency);
    
    if (value > max) {
      return "Слишком большой вывод";
    }
    return "";
  }

  recalcDepoEnd(val, passiveIncomeTool) {
    let rate = passiveIncomeTool.rate;
    let annualIncome = val * 12;
    let depoEnd = Math.round(annualIncome * 100 / rate);

    this.setState({ depoEnd }, this.recalc);
  }

  sendRequest(url = "", method = "GET", data = {}) {
    return new Promise((resolve, reject) => {
      console.log(`Sending ${url} request...`);
      ajax({
        url: `https://fani144.ru/local/php_interface/s1/ajax/?method=${url}`,
        method,
        data,
        success: res => {
          const parsed = JSON.parse(res);
          if (parsed.error) {
            reject(parsed.message);
          }
  
          resolve(parsed);
        },
        error: err => reject(err)
      });
    });
  }

  fetchTools() {
    return new Promise((resolve, reject) => {
      this.sendRequest("getFutures")
        .then(res => {
          const tools = res.data;
          resolve(tools);
        })
        .catch(err => reject(err));
    })
  }

  fetchDepoStart() {
    return new Promise((resolve, reject) => {
      this.sendRequest("getInvestorInfo")
        .then(res => {
          const depo = Number(res.data.deposit);
          resolve(depo);
        })
        .catch(err => reject(err));
    })
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      this.sendRequest("getTrademeterSnapshots")
        .then(res => {
          const saves = res.data.map(save => ({
            name: save.name,
            id:   save.id,
          }));
          resolve(saves);
        })
        .catch(err => reject(err));
    });
  }

  fetchSaveById(id) {
    return new Promise((resolve, reject) => {
      if (typeof id === "number") {
        this.sendRequest("getTrademeterSnapshot", "GET", { id })
          .then(res => {
            console.log(res);
            resolve(res);
          })
          .catch(err => reject(err));
      }
      else {
        reject("id must be a number!", id);
      }
    });
  }

  // API

  reset() {
    return new Promise(resolve => {
      this.setState(this.initial, () => {
        // Check if depoStart is more than depoEnd
        let { mode, depoStart, depoEnd } = this.state;
        if (depoStart[mode] >= depoEnd) {
          depoEnd = depoStart[mode] * 2;
        }

        this.setState({ depoEnd, id: null }, () => resolve());
      });
    })
  }
  
  save(name = "") {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject("Name is empty!");
      }

      const json = this.packSave();
      const data = {
        name,
        static: JSON.stringify(json.static),
        dynamic: JSON.stringify(json.dynamic)
      };

      this.sendRequest("addTrademeterSnapshot", "POST", data)
        .then(res => {
          console.log(res);

          let id = Number(res.id);
          if (id) {
            console.log("Saved with id = ", id);
            this.setState({ id }, () => resolve(id));
          }
          else {
            reject(`Произошла незвестная ошибка! Пожалуйста, повторите действие позже еще раз`);
          }
        })
        .catch(err => reject(err));
    });
  }

  update(name = "") {
    const { id } = this.state;
    return new Promise((resolve, reject) => {
      if (!id) {
        reject("id must be present!");
      }

      const json = this.packSave();
      const data = {
        id,
        name,
        static: JSON.stringify(json.static),
        dynamic: JSON.stringify(json.dynamic)
      };
      this.sendRequest("updateTrademeterSnapshot", "POST", data)
        .then(res => {
          console.log("Updated!", res);
          resolve();
        })
        .catch(err => console.log(err));
    })
  }

  delete(id = 0) {
    console.log(`Deleting id: ${id}`);

    return new Promise((resolve, reject) => {
      this.sendRequest("deleteTrademeterSnapshot", "POST", { id })
        .then(() => {
          let {
            id,
            saves,
            saved,
            changed,
            currentSaveIndex,
          } = this.state
  
          saves.splice(currentSaveIndex - 1, 1);

          currentSaveIndex = Math.min(Math.max(currentSaveIndex, 1), saves.length);
  
          if (saves.length > 0) {
            id = saves[currentSaveIndex - 1].id;
            this.fetchSaveById(id)
              .then(save => this.extractSave(Object.assign(save, { id })))
              .then(() => this.setState({ id }))
              .catch(err => this.showMessageDialog(err));
          }
          else {
            this.reset()
              .then(() => this.recalc())
              .catch(err => this.showMessageDialog(err));

            saved = changed = false;
          }
  
          this.setState({
            saves,
            saved,
            changed,
            currentSaveIndex,
          }, resolve);
        })
        .catch(err => reject(err));
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
  getRate(mode) {
    const {
      depoEnd,
      payloadInterval,
      withdrawalInterval,
      incomePersantageCustom,
    } = this.state;
    mode = mode || this.state.mode;

    const depoStart  = this.state.depoStart[mode];
    const withdrawal = this.state.withdrawal[mode];
    const payload    = this.state.payload[mode];
    const days       = this.state.days[mode];

    let rate = [
      extRate(
        depoStart,
        depoEnd,
        withdrawal,
        withdrawalInterval[mode],
        payload,
        payloadInterval[mode],
        days,
        withdrawalInterval[mode],
        payloadInterval[mode]
      ) * 100,

      incomePersantageCustom
    ]

    return rate[mode];
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
    let name = "";
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
  getDepoStart(mode) {
    const { depoStart } = this.state;
    mode = mode || this.state.mode;

    return depoStart[mode];
  }

  /**
   * Депо через N дней
   */
  getDepoEnd(mode) {
    const { data, depoStart, depoEnd } = this.state;
    mode = mode || this.state.mode;

    if (mode === 0) {
      return depoEnd;
    }
    else {
      let depo = depoStart[mode];
      if (data.length) {
        depo += data.map(d => d.incomePlan).reduce((prev, curr) => prev + curr);
      }
      return depo;
    }
  }

  getPointsForIteration() {
    let { data, directUnloading, iterations } = this.state;
    iterations = iterations || 1;

    if (!data.length) {
      return iterations;
    }

    let pointsForIteration = data[0].pointsForIteration / iterations;
    if (!directUnloading && (iterations * 2) >= 100) {
      pointsForIteration = (data[0].pointsForIteration * 2) / 100;
    }

    pointsForIteration = Math.max(pointsForIteration, 1);

    if (isNaN(pointsForIteration)) {
      pointsForIteration = iterations;
    }

    return roundUp(pointsForIteration);
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "Трейдометр";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  getTools() {
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

  getPayment(d) {
    const { mode, withdrawal, withdrawalInterval } = this.state;
    return (d !== 0 && d % withdrawalInterval[mode] == 0)
      ? withdrawal[mode]
      : 0 
  }

  getPayload(d) {
    const { mode, payload, payloadInterval } = this.state;
    return (d !== 0 && d % payloadInterval[mode] == 0)
      ? payload[mode]
      : 0 
  }

  render() {
    if (!this.state.data.length) {
      return;
    }

    return (
      <div className="page">

        <main className="main">

          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">

                {/* Select */}
                {(() => {
                  const { saves, currentSaveIndex } = this.state;

                  return (dev || saves.length > 0) && (
                    <label className="labeled-select main-top__select stack-exception">
                      <span className="labeled-select__label labeled-select__label--hidden">
                        Сохраненный трейдометр
                      </span>
                      <Select
                        value={currentSaveIndex}
                        onSelect={val => {
                          const { saves } = this.state;

                          this.setState({ currentSaveIndex: val });

                          if (val === 0) {
                            this.reset()
                              .then(() => this.recalc())
                              .catch(err => console.warn(err));
                          }
                          else {
                            const id = saves[val - 1].id;
                            this.fetchSaveById(id)
                              .then(save => this.extractSave(Object.assign(save, { id })))
                              .catch(err => this.showMessageDialog(err));
                          }

                        }}>
                        <Option key={0} value={0}>Не выбрано</Option>
                        {saves.map((save, index) =>
                          <Option key={index + 1} value={index + 1}>
                            {save.name}
                            {save.corrupt && (
                              <WarningOutlined style={{
                                marginLeft: ".25em",
                                color: "var(--danger-color)"
                              }}/>
                            )}
                          </Option>
                        )}
                      </Select>
                    </label>
                  )
                })()}

                <Stack>

                  <h1 className="page__title">
                    { this.getTitle() }

                    { (dev || this.state.id) && (
                      <CrossButton
                        className="main-top__remove"
                        onClick={e => dialogAPI.open("dialog4", e.target)}/>
                    )}
                  </h1>

                  <Radio.Group
                    key={this.state.mode}
                    className="tabs"
                    name="radiogroup"
                    defaultValue={this.state.mode}
                    onChange={e => {
                      let { value } = e.target;
                      let { data, mode } = this.state;
                      let days = this.state.days[value];
                      let state = {};

                      if (days > data.length) {
                        const data = this.buildData(days);
                        Object.assign(state, { data });
                      }

                      let currentDay = this.state.currentDay;
                      if (currentDay > days) {
                        currentDay = days;
                        Object.assign(state, { currentDay });
                      }

                      this.setState(Object.assign(state, {
                        prevMode: mode,
                        mode: value,
                      }), () => {
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
                          this.update(this.getTitle());
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

                </Stack>

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
                        const { mode } = this.state;

                        if (val === depoStart[mode]) {
                          return;
                        }

                        if (val === "") {
                          val = 10000;
                        }

                        depoStart[mode] = Number(val);
                        this.setState({ depoStart }, this.recalc)
                      }}
                      onChange={(e, val) => {
                        if (isNaN(val)) {
                          return;
                        }

                        const { mode } = this.state;
                        let withdrawal = this.state.withdrawal[mode];
                        let days = this.state.days[mode];

                        let errMessages = this.checkFn(withdrawal, val, days);
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
                              mode,
                              depoEnd,
                              passiveIncomeTools,
                              currentPassiveIncomeToolIndex,
                            } = this.state;
                            
                            if (val === depoEnd) {
                              return;
                            }

                            if (val === "") {
                              val = this.state.depoStart[this.state.mode];
                            }

                            let passiveIncomeMonthly = this.state.passiveIncomeMonthly;
                            if (currentPassiveIncomeToolIndex[mode] > -1) {
                              let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                              let persantage = tool.rate / 365 * (365 / 260) / 100;
                              passiveIncomeMonthly[mode] = Math.round(persantage * depoEnd * 21.6667);
                            }

                            this.setState({ depoEnd: val, passiveIncomeMonthly }, this.recalc);
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
                          max={30}
                          className="input-group__input"
                          defaultValue={this.state.incomePersantageCustom}
                          placeholder={(this.state.minDailyIncome).toFixed(3)}
                          unsigned="true"
                          onBlur={val => {
                            const { days, withdrawal, depoStart, mode } = this.state;

                            let persentage = +val;
                            if (isNaN(persentage)) {
                              persentage = undefined;
                            }

                            let errMessages = this.checkFn(withdrawal[mode], depoStart[mode], days[mode], persentage);

                            if (mode == 1) {
                              this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                            }
                            this.withdrawalInput.setErrorMsg(errMessages[0]);

                            this.setState({
                              incomePersantageCustom: val
                            }, () => {
                              this.recalc()
                                .then(() => {
                                  const {
                                    mode,
                                    passiveIncomeTools,
                                    currentPassiveIncomeToolIndex,
                                  } = this.state;

                                  let depoEnd = this.getDepoEnd();

                                  let passiveIncomeMonthly = this.state.passiveIncomeMonthly;
                                  if (currentPassiveIncomeToolIndex[mode] > -1) {
                                    let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                                    let persantage = tool.rate / 365 * (365 / 260) / 100;
                                    passiveIncomeMonthly[mode] = Math.round(persantage * depoEnd * 21.6667);
                                  }
                                  this.setState({ passiveIncomeMonthly });
                                })
                                .catch(err => console.error(err));

                            });
                          }}
                          onChange={(e, val) => {
                            const { days, withdrawal, depoStart, mode } = this.state;

                            let persentage = +val;
                            if (isNaN(persentage)) {
                              persentage = undefined;
                            }

                            let errMessages = this.checkFn(withdrawal[mode], depoStart[mode], days[mode], persentage);

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
                      key={this.state.mode + this.state.days[this.state.mode]}
                      disabled={this.state.saved}
                      options={
                        [50, 100].concat(new Array(10).fill(0).map((n, i) => 260 * (i + 1)))
                      }
                      format={val => {
                        let years = Number( (val / 260).toFixed(2) );
                        let suffix = "";
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
                        let currentDay = Math.min(value, this.state.currentDay);
                        const data = this.buildData(value);

                        this.setState({ days, currentDay, data }, this.recalc);

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
                      key={this.state.mode + this.state.passiveIncomeMonthly[this.state.mode]}
                      disabled={this.state.saved}
                      defaultValue={this.state.passiveIncomeMonthly[this.state.mode]}
                      round="true"
                      unsigned="true"
                      suffix="/мес"
                      onBlur={val => {
                        const {
                          mode,
                          passiveIncomeTools,
                          passiveIncomeMonthly,
                          currentPassiveIncomeToolIndex,
                        } = this.state;

                        if (val === passiveIncomeMonthly[mode]) {
                          return;
                        }

                        if (val === "") {
                          val = 0;
                        }

                        let pitError = currentPassiveIncomeToolIndex[mode] < 0
                          ? "Выберете инструмент пассивного дохода"
                          : "";

                        let cb = () => {
                          this.setState({ pitError });

                          let currentPassiveIncomeTool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                          this.recalcDepoEnd(val, currentPassiveIncomeTool);
                        };

                        passiveIncomeMonthly[mode] = val;
                        this.setState({ 
                          passiveIncomeMonthly,
                          changed: true
                        }, () => {
                          if (val == 0) {
                            return;
                          }

                          if (currentPassiveIncomeToolIndex[mode] < 0) {
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
                        <label htmlFor="passive-tools" className="input-group__label">Инструмент пассивного дохода</label>
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
                      key={this.state.mode + this.state.currentPassiveIncomeToolIndex[this.state.mode]}
                      defaultValue={this.state.currentPassiveIncomeToolIndex[this.state.mode]}
                      onChange={index => {
                        let { mode, currentPassiveIncomeToolIndex } = this.state;
                        currentPassiveIncomeToolIndex[mode] = index;
                        this.setState({
                          currentPassiveIncomeToolIndex,
                          pitError: "",
                          changed: true
                        }, () => {
                          const {
                            mode,
                            passiveIncomeMonthly,
                            passiveIncomeTools,
                            currentPassiveIncomeToolIndex
                          } = this.state;

                          if (index < 0) {
                            passiveIncomeMonthly[mode] = 0;
                            this.setState({ passiveIncomeMonthly });
                            return;
                          }

                          let depoEnd = this.getDepoEnd();
                          let currentPassiveIncomeTool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                          let persantage = currentPassiveIncomeTool.rate / 365 * (365 / 260) / 100;
                          passiveIncomeMonthly[mode] = Math.round(persantage * depoEnd * 21.6667);
                          this.setState({ passiveIncomeMonthly })
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

                    {(() => {
                      return (
                        <label className="input-group">
                          <span className="input-group__label">Вывод</span>
                          <NumericInput
                            key={this.state.mode + this.state.withdrawal[this.state.mode] + Math.random()}
                            disabled={this.state.saved}
                            className="input-group__input"
                            defaultValue={this.state.withdrawal[this.state.mode]}
                            round="true"
                            unsigned="true"
                            format={formatNumber}
                            min={0}
                            max={
                              this.state.mode == 0
                                ? this.state.depoStart[this.state.mode] * 0.15
                                : this.state.depoStart[this.state.mode] * (this.state.incomePersantageCustom / 100)
                            }
                            onBlur={val => {
                              const { mode } = this.state;
                              let depoStart = this.state.depoStart[mode];
                              let days = this.state.days[mode];

                              if (val === this.state.withdrawal[mode]) {
                                return;
                              }

                              if (val === "") {
                                val = 0;
                              }

                              this.setWithdrawal(val);

                              let errMessages = this.checkFn(val, depoStart, days);
                              this.withdrawalInput.setErrorMsg(errMessages[0]);
                              if (mode == 1) {
                                this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                              }

                              const frequency = this.state.withdrawalInterval[mode];
                              const paymentOverflowMsg = this.validatePayment(val, frequency);
                              if (paymentOverflowMsg) {
                                const max = this.getMaxPaymentValue(frequency);
                                let withdrawal = this.state.withdrawal;
                                withdrawal[mode] = max - 1;
                                this.setState({ withdrawal });
                              }
                            }}
                            onChange={(e, val) => {
                              const { mode } = this.state;
                              let depoStart = this.state.depoStart[mode];
                              let days = this.state.days[mode];

                              let errMessages = this.checkFn(val, depoStart, days);
                              this.withdrawalInput.setErrorMsg(errMessages[0]);
                              if (mode == 1) {
                                this.incomePersantageCustomInput.setErrorMsg(errMessages[1]);
                              }

                              const frequency = this.state.withdrawalInterval[mode];
                              const paymentOverflowMsg = this.validatePayment(val, frequency);
                              if (paymentOverflowMsg) {
                                this.withdrawalInput.setErrorMsg(paymentOverflowMsg);
                              }
                            }}
                            onRef={ref => this.withdrawalInput = ref}
                          />
                        </label>
                      )
                    })()}


                    {/* Частота */}
                    <label className="input-group">
                      <span className="input-group__label">Частота</span>
                      <CustomSelect
                        key={this.state.mode + this.state.withdrawalInterval[this.state.mode]}
                        value={this.state.withdrawalInterval[this.state.mode]}
                        disabled={this.state.saved}
                        options={[20, 50, 100]}
                        format={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                        min={1}
                        max={2600}
                        onChange={value => {
                          let { mode, withdrawalInterval } = this.state;

                          // if (value === withdrawalInterval) {
                          //   return;
                          // }
                          
                          const frequency = value;
                          const payment = this.state.withdrawal[this.state.mode];
                                                    
                          const paymentOverflowMsg = this.validatePayment(payment, frequency);

                          if (paymentOverflowMsg) {
                            this.withdrawalInput.setErrorMsg(paymentOverflowMsg);
                          }

                          withdrawalInterval[mode] = value;
                          this.setState({ withdrawalInterval }, this.recalc);
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
                        key={this.state.mode + this.state.payload[this.state.mode] + Math.random()}
                        disabled={this.state.saved}
                        className="input-group__input"
                        defaultValue={this.state.payload[this.state.mode]}
                        round="true"
                        unsigned="true"
                        format={formatNumber}
                        min={0}
                        max={99999999}
                        onBlur={val => {
                          let { mode, payload } = this.state;

                          if (val === payload[mode]) {
                            return;
                          }

                          if (val === "") {
                            val = 0;
                          }
                          
                          payload[mode] = val;

                          this.setState({ payload }, this.recalc);
                        }}
                        onChange={() => {
                          
                        }}
                      />
                    </label>

                    {/* Частота */}
                    <label className="input-group">
                      <span className="input-group__label">Частота</span>
                      <CustomSelect
                        key={this.state.mode + this.state.payloadInterval[this.state.mode]}
                        value={this.state.payloadInterval[this.state.mode]}
                        disabled={this.state.saved}
                        options={[20, 50, 100]}
                        format={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                        min={1}
                        max={2600}
                        onChange={value => {
                          let { mode, payloadInterval } = this.state;
                          payloadInterval[mode] = value;
                          this.setState({ payloadInterval }, this.recalc);
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
                directUnloading,
                iterations,
                withdrawal,
                withdrawalInterval,
                payloadInterval,
                payload,
              } = this.state;

              let paymentTotal = 0;
              let payloadTotal = 0;

              if (days[mode] > withdrawalInterval[mode]) {
                // Вывод
                paymentTotal = new Array( +Math.floor(days[mode] / withdrawalInterval[mode]) )
                  .fill(withdrawal[mode] - withdrawal[mode] * 0.18)
                  .reduce((prev, curr) => prev + curr);
              }

              if (days[mode] > payloadInterval[mode]) {
                // Пополнение
                payloadTotal = new Array( +Math.floor(days[mode] / payloadInterval[mode]) )
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
                      <BigNumber val={Math.round(this.getDepoEnd())} format={formatNumber} />
                    </p>

                    <footer className="stats-footer">
                      <Col span={12} className="stats-footer-row">
                        <h3 className="stats-key main__h3">
                          <span aria-label="Доходность">Дох-ть</span> на конец периода
                        </h3>
                        <div className="stats-val">
                          {
                            (() => {
                              let depoStart = this.state.depoStart[mode];

                              let val = Math.round((this.getDepoEnd() - depoStart) / depoStart * 100);

                              if (isNaN(val) || val == Infinity) {
                                val = 0;
                              }

                              return (
                                <Value>
                                  <BigNumber 
                                    val={val} 
                                    format={formatNumber} 
                                    threshold={1e9} 
                                    suffix="%" />
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
                              const val = this.getRate() / (iterations * (directUnloading ? 1 : 2));
                              return <Value format={val => +val.toFixed(3) + "%"}>{val}</Value>
                            })()
                          }
                        </div>
                      </Col>
                    </footer>
                  </Col>
                  {/* /.stats-col */}

                  <Col span={12} className="stats-col">
                    <h2 className="main__h2 stats-title">
                      <span aria-label="Минимальная">Мин.</span> доходность в день
                    </h2>
                    <p className="stats-subtitle">
                      <BigNumber val={round( this.getRate(), 3 )} threshold={1e9} suffix="%" />
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
                              <Value format={formatNumber}>{ Math.round(paymentTotal) }</Value>
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
                              <Value format={formatNumber}>{ Math.round(payloadTotal) }</Value>
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
                      let step = 
                        this.getCurrentTool().guaranteeValue / this.state.depoStart[this.state.mode] * 100;
                      if (step > 100) {
                        for (let i = 0; i < this.state.tools.length; i++) {
                          let s = this.state.tools[i].guaranteeValue / this.state.depoStart[this.state.mode] * 100;
                          if (s < 100) {
                            
                            this.setState({ currentToolIndex: i });
                            step = s;
                            break;
                          }
                        }
                      }
                      let min = step;

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
                          this.state.iterations
                          :
                          (this.state.iterations * 2 >= 100) ? 100 : this.state.iterations * 2
                      }
                      min={1}
                      max={100}
                      step={1}
                      onChange={val => {
                        this.setState({
                          iterations: this.state.directUnloading 
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

                        let toFind = this.state.depoPersentageStart;

                        let tools = this.getTools();
                        
                        let step = round(tools[currentToolIndex].guaranteeValue / depoStart[mode] * 100, 1);
                        if (step > 100) {
                          for (let i = 0; i < tools.length; i++) {
                            let s = tools[i].guaranteeValue / this.state.depoStart[this.state.mode] * 100;
                            if (s < 100) {
                              this.setState({ currentToolIndex: i });
                              step = s;
                              break;
                            }
                          }
                        }

                        let rangeLength = Math.floor(100 / step);
                        if (rangeLength < 1 || rangeLength == Infinity) {
                          rangeLength = 1;
                          console.warn("Range length is out of bounds!");
                        }
                        let range = new Array(rangeLength).fill(0).map((val, i) => step * (i + 1));

                        let depoPersentageStart = range.reduce(function (prev, curr) {
                          return (Math.abs(curr - toFind) < Math.abs(prev - toFind) ? curr : prev);
                        });
                        
                        depoPersentageStart = round(depoPersentageStart, 2);
                        depoPersentageStart = Math.max(depoPersentageStart, step);
                        depoPersentageStart = Math.min(depoPersentageStart, 100);

                        this.setState({ currentToolIndex, depoPersentageStart }, () => {
                          this.updateData(days[mode])
                        });
                      }}
                      disabled={this.getTools().length == 0}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      style={{ width: "100%" }}
                    >
                      {(() => {
                        const { tools, customTools } = this.state
                        let arr = []
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
                iterations
              } = this.state;

              let days = this.state.days[this.state.mode];
              
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
                            formatNumber(Math.round(data[currentDay - 1] && (data[currentDay - 1].depoStartReal || 0)))
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
                          {(() => {
                            return (
                              formatNumber(Math.round(
                                data[currentDay - 1].depoStartTest +
                                data[currentDay - 1].incomeReal
                              ))
                            )
                          })()}
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

                            if (_d !== 0 && _d % withdrawalInterval[mode] == 0) {
                              _w = withdrawal[mode];
                              if (_w !== 0) {
                                _w = `-${formatNumber(_w)}`;
                              }
                            }
                            if (_d !== 0 && _d % payloadInterval[mode] == 0) {
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
                        const { mode } = this.state;
                        let val = data[currentDay - 1].depoEnd;
                        let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                        if (tool) {
                          let persantage = tool.rate / 365 * (365 / 260) / 100;

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
                          <div className="section4-l">Шагов цены</div>
                          <div className="section4-r">{formatNumber(pointsForIteration)}</div>
                        </div>
                        {/* /.row */}
                        <div className="section4-row">
                          <div className="section4-l">
                            Итераций
                          </div>
                          <div className="section4-r">
                            {
                              Math.min(iterations * (directUnloading ? 1 : 2), 100)
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
                              formatNumber(
                                Math.round(data[currentDay - 1].incomeReal)
                              )
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
                        const {
                          mode,
                          depoEnd,
                          realData,
                          payloadInterval,
                          withdrawalInterval,
                          incomePersantageCustom,
                        } = this.state;

                        const depoStart = this.state.depoStart[mode];
                        const withdrawal = this.state.withdrawal[mode];
                        const payload = this.state.payload[mode];
                        const days = this.state.days[mode];
                        
                        function getPeriods(rate, present, future, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1, comission = 0, realdata = {}) {

                          // ( Ставка, Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1), комиссия на вывод, массив данных по реальным дням  )
                          // Возвращает: Дней до цели
                          const rateRounded = round(rate * 100, 3);

                          var res = present;
                          var p1 = dayoffirstpayment;
                          var p2 = dayoffirstpayload;
                          var day = 1;
                          var x = 0;
                          rate += 1;
                          payment = payment * (1 + comission);

                          while (res < future) {
                            if (realdata[x] !== undefined) {

                              realdata[x].scale   = realdata[x].scale != null ? realdata[x].scale : rateRounded;
                              realdata[x].payload = realdata[x].payload != null ? realdata[x].payload : 0;
                              realdata[x].payment = realdata[x].payment != null ? realdata[x].payment : 0;

                              res = res * (1 + (realdata[x].scale / 100));
                              p1--; p2--;
                              res += realdata[x].payload;
                              res -= realdata[x].payment;
                              if (!p2) { p2 = payloadper; }
                              if (!p1) { p1 = paymentper; }
                            } else {
                              res = res * rate;
                              p1--; p2--;
                              if (!p2) { p2 = payloadper; res += payload; }
                              if (!p1) { p1 = paymentper; res -= payment; }
                            }
                            x++;
                          }
                          return x;
                        }

                        const rate = this.getRate();
                        let sum   = 0;
                        let total = 0;
                        let avg   = 0;
                        let atLeastOneChanged = false;

                        for (let dataItem of data) {
                          if (dataItem.changed) {
                            atLeastOneChanged = true;
                            sum += (dataItem.scale != null) ? dataItem.scale : rate;
                          }
                          else {
                            sum += rate;
                          }
                          total++;
                        }

                        if (total > 0 && (sum / total) != 0) {
                          avg = sum / total;
                        }
                        else {
                          avg = round(rate, 3);  
                        }

                        const periods = getPeriods(
                          rate / 100,
                          depoStart,
                          this.getDepoEnd(),
                          withdrawal,
                          withdrawalInterval[mode],
                          payload,
                          payloadInterval[mode],
                          withdrawalInterval[mode],
                          payloadInterval[mode],
                          0,
                          realData
                        );
                        // console.log(
                        //   rate / 100,
                        //   depoStart,
                        //   depoEnd,
                        //   withdrawal,
                        //   withdrawalInterval[mode],
                        //   payload,
                        //   payloadInterval[mode],
                        //   withdrawalInterval[mode],
                        //   payloadInterval[mode],
                        //   0,
                        //   realData,
                        //   "=",
                        //   periods
                        // );

                        let realDaysLeft = atLeastOneChanged
                          ? roundUp( periods )
                          : days;
                        let difference = -(days - realDaysLeft);
                        let persentage = (currentDay) / (days + difference) * 100;

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
                                format={() => `${realDaysLeft - currentDay} ${num2str(realDaysLeft - currentDay, ["день", "дня", "дней"])}`}
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

                            <Stack className="section4__stats">
                              {(() => {
                                if (total > 0) {
                                  let visible = round(avg, 3) < round(this.getRate(), 3);

                                  return (
                                    <Statistic
                                      title={
                                        <span>
                                          средняя<br />
                                          <span aria-label="доходность">дох-ть</span>
                                        </span>
                                      }
                                      value={ round( avg, 3 ) }
                                      valueStyle={{
                                        color: `var( ${visible ? "--danger-color" : "--success-color"} )`
                                      }}
                                      prefix={
                                        visible ? <ArrowDownOutlined /> : <ArrowUpOutlined />
                                      }
                                      suffix="%"
                                    />
                                  );
                                }

                              })()}
                            </Stack>

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
                currentDay,
                withdrawalInterval,
                payloadInterval,
                directUnloading,
                passiveIncomeTools,
                currentPassiveIncomeToolIndex
              } = this.state;

              let iterations = Math.min(
                this.state.iterations * (directUnloading ? 1 : 2),
                100
              );

              const payment = this.getPayment(currentDay);
              const payload = this.getPayload(currentDay);

              const rate  = this.getRate();
              const scale = (data[currentDay - 1].scale != null) ? data[currentDay - 1].scale : 0;

              const placeholder = "—";
              const onBlur = (prop, val) => {
                let {
                  data,
                  mode,
                  realData,
                  currentDay,
                  payloadInterval,
                  withdrawalInterval,
                } = this.state;

                let changed = false;
                
                // console.log(val);
                if (val === "") {
                  val = undefined;
                }
                
                if (!data[currentDay - 1][`${prop}Changed`]) {
                  data[currentDay - 1][`${prop}Changed`] = true;
                }

                if (!realData[currentDay]) {
                  realData[currentDay] = {};
                }

                if (prop === "customIncome") {
                  realData[currentDay].scale = (val / data[currentDay - 1].depoStartTest) * 100;
                }
                else {
                  realData[currentDay][prop] = val;
                }

                data[currentDay - 1][prop] = val;

                if (!val) {
                  for (const p of ["scale", "payment", "payload", "iterations"]) {
                    changed = changed || (!!data[currentDay - 1][p]);
                  }
                }

                data[currentDay - 1].changed = (!val) ? changed : true;

                // console.log(data[currentDay - 1]);

                this.setState({ data, realData }, () => {
                  const { days, mode } = this.state;
                  this.updateData(days[mode], false)
                    .then(() => this.updateChart());
                });

              };

              return (
                <section className="section5">
                  <h2 className="section5__title">Результат</h2>

                  <div className="section5-controls">
                    <button 
                      disabled={currentDay == 1} 
                      data-type="link"
                      onClick={() => this.setCurrentDay(currentDay - 1)}>
                      <span aria-hidden="true">&lt;&lt; </span>
                      Предыдущий день
                    </button>

                    День {currentDay}

                    <button 
                      disabled={currentDay == this.state.days[this.state.mode]}
                      data-type="link"
                      onClick={() => this.setCurrentDay(currentDay + 1)}>
                      Следующий день
                      <span aria-hidden="true"> &gt;&gt;</span>
                    </button>
                  </div>

                  <div className="section5-quick-select">
                    {(() => {
                      let page = roundUp(currentDay / 5) - 1;
                      let paginatorSelectedIndex = (currentDay % 5) - 1;
                      if ((currentDay % 5) === 0) {
                        paginatorSelectedIndex = 5 - 1;
                      }

                      return data.slice(page * 5, (page * 5) + 5).map((el, index) => {
                        const day = (page * 5) + index + 1;
                        const title = `Выбрать день номер ${day}`;

                        
                        let success = el.scale >= round(this.getRate(), 3);
                        let failed = el.scale <= 0;
                        if (el.customIncome != null) {
                          success = el.customIncome >= Math.round(el.incomeReal);
                          failed = el.customIncome <= 0;
                        }

                        return (
                          <button
                            title={title}
                            data-selected={paginatorSelectedIndex === index}
                            data-success={success}
                            data-failed={failed}
                            data-changed={el.changed}
                            onClick={() => this.setCurrentDay(day)}
                          >
                            <span className="visually-hidden">{title}</span>
                          </button>
                        )
                      }
                      );
                    })()}
                  </div>

                  {
                    (data[currentDay - 1].collapsed && !this.state.saved)
                    ? null
                    : (
                      <span className="section5-content-title">
                        {(() => {
                          let value = scale;
                          if (data[currentDay - 1].customIncome != null) {
                            value = data[currentDay - 1].customIncome / data[currentDay - 1].depoStartTest * 100;
                          }

                          return (
                            data[currentDay - 1].changed
                              ? <Value format={val => formatNumber(round(val, 3))}>{value}</Value>
                              : "—"
                          )
                        })()}
                        &nbsp;/&nbsp;
                        { round(rate, 3) }
                        &nbsp;
                        <span>
                          (
                          {(() => {
                            let value = Math.round(data[currentDay - 1].depoStart * (round(scale, 3) / 100));

                            if (data[currentDay - 1].customIncome != null) {
                              value = data[currentDay - 1].customIncome;
                            }

                            value += data[currentDay - 1].payload ? data[currentDay - 1].payload : 0;
                            value -= data[currentDay - 1].payment ? data[currentDay - 1].payment : 0;

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
                            "+" + formatNumber(Math.round(data[currentDay - 1].incomeReal))
                          }
                          )
                        </span>
                      </span>
                    )
                  }

                  <div className="section5-save-wrap">

                    <button
                      disabled={currentDay <= 5}
                      data-type="link"
                      onClick={() => this.setCurrentDay(currentDay - 5)}>
                      <span aria-hidden="true">&lt;&lt; </span>
                      Предыдущая неделя
                    </button>

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
                        let { data, currentDay, saved } = this.state;
                        const collapsed = data[currentDay - 1].collapsed;
                        
                        if (!collapsed) {

                          if (!saved) {
                            dialogAPI.open("dialog1", e.target);
                          }
                          else {
                            this.update(this.getTitle());
                            data[currentDay - 1].collapsed = !collapsed;
                          }
                          
                        }
                        else {
                          data[currentDay - 1].collapsed = !collapsed;
                        }
                        
                        this.setState(data);
                      }}
                    >
                      {
                        data[currentDay - 1].collapsed
                          ? data[currentDay - 1].changed
                            ? "Изменить"
                            : "Добавить"
                          : "Сохранить"
                      }
                    </Button>

                    <button
                      disabled={this.state.days[this.state.mode] - currentDay < 5}
                      data-type="link"
                      onClick={() => this.setCurrentDay(currentDay + 5)}>
                      Следующая неделя
                      <span aria-hidden="true"> &gt;&gt;</span>
                    </button>

                  </div>

                  <div 
                    id="result"
                    className="section5-collapse"
                    hidden={data[currentDay - 1].collapsed}
                  >
                    <div className="section5-content">

                      <Col className="section5-col">
                        <div className="section5-row">
                          <div className="section5-l">
                            <span aria-label="Доходность">Дох-ть</span> за день
                          </div>
                          <div className="section5-r">
                            {(() => {
                              const prop = "scale";
                              const value = data[currentDay - 1][prop];
                              const disabled = data[currentDay - 1].customIncome != null;
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  disabled={disabled}
                                  defaultValue={
                                    data[currentDay - 1].changed && !disabled && value != null
                                      ? round(value, 3) 
                                      : ""
                                  }
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onBlur={val => onBlur(prop, val)}
                                />
                              )
                            })()}
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              {round(this.getRate(), 3)}%
                            </span>
                          </div>
                        </div>
                        {/* /.row */}

                        <div className="section5-row">
                          <div className="section5-l">Вывод</div>
                          <div className="section5-r">
                            {(() => {
                              const prop = "payment";
                              const value = data[currentDay - 1][prop];
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null
                                      ? value
                                      : ""
                                  }
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onBlur={val => onBlur(prop, val)}
                                />
                              );
                            })()}
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              {
                                formatNumber(this.getPayment(currentDay))
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
                            {(() => {
                              const prop = "payload";
                              const value = data[currentDay - 1][prop];
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null 
                                      ? value 
                                      : ""
                                  }
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onBlur={val => onBlur(prop, val)}
                                />
                              )
                            })()}
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              {
                                formatNumber(this.getPayload(currentDay))
                              }
                            </span>
                          </div>
                        </div>
                        {/* /.row */}
                      </Col>

                      <Col className="section5-col">
                        <div className="section5-row">
                          <div className="section5-l">
                            <span aria-label="Доходность">Дох-ть</span>
                            {" "}
                            в
                            {" "}
                            <span aria-label="рублях">руб.</span>
                          </div>
                          <div className="section5-r">
                            {(() => {
                              const prop = "customIncome";
                              const value = data[currentDay - 1][prop];
                              const disabled = data[currentDay - 1].changed && data[currentDay - 1].scale != null && value == null;
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  disabled={disabled}
                                  defaultValue={
                                    data[currentDay - 1].changed && !disabled && value != null
                                      ? value
                                      : ""
                                  }
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onBlur={val => onBlur(prop, val)}
                                />
                              )
                            })()}
                            <span className="section5-r-suffix">
                              &nbsp;
                              руб.
                            </span>
                          </div>
                        </div>
                        {/* /.row */}

                        <div className="section5-row">
                          <div className="section5-l">
                            Итераций:
                          </div>
                          <div className="section5-r">
                            {(() => {
                              const prop = "iterations";
                              const value = data[currentDay - 1][prop];
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null
                                      ? value
                                      : ""
                                  }
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onBlur={val => onBlur(prop, val)}
                                />
                              )
                            })()}
                            <span className="section5-r-suffix">
                              <span className="section5-r-suffix__separator">/</span>
                              {formatNumber(iterations)}
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
                                const { mode } = this.state;
                                let val = data[currentDay - 1].depoEnd;
                                let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                                if (tool) {
                                  let persantage = tool.rate / 365 * (365 / 260) / 100;

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
                      </Col>

                      <Col className="section5-col section5-col--centered">
                        {(() => {
                          let percentage = round(
                            data[currentDay - 1].scale / (round( this.getRate(), 3 )) * 100,
                            2
                          );

                          if (data[currentDay - 1].customIncome != null) {
                            percentage = round(
                              data[currentDay - 1].customIncome / 
                              Math.round(data[currentDay - 1].incomeReal)
                              * 100,
                              2
                            );
                          }

                          return (
                            <Progress
                              type="circle"
                              status={
                                data[currentDay - 1].changed
                                  ? percentage >= 100
                                    ? "success"
                                    : percentage <= 0
                                      ? "exception"
                                      : "normal"
                                  : "normal"
                              }
                              trailColor={
                                percentage >= 100
                                  ? "#3f6b33"
                                  : percentage <= 0
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
                      let income = Math.round(data[currentDay - 1].depoStart * (round(scale, 3) / 100));
                      if (data[currentDay - 1].customIncome != null) {
                        income = data[currentDay - 1].customIncome;
                      }
                      let percent = income / Math.round(data[currentDay - 1].incomeReal);
                      if (income <= 0) {
                        percent = 0;
                      }

                      const depoEnd = Math.round(
                        data[currentDay - 1].depoStartTest +
                        data[currentDay - 1].incomeReal
                      );

                      return (
                        <footer className="section5-footer">
                          <h3 className="section5-footer-title">Дневная цель</h3>

                          {(() => {
                            let real = income;
                            real += data[currentDay - 1].payload ? data[currentDay - 1].payload : 0;
                            real -= data[currentDay - 1].payment ? data[currentDay - 1].payment : 0;

                            const plan = data[currentDay - 1].incomeReal;

                            return (
                              <div className="section5-footer-subtitle">
                                {
                                  data[currentDay - 1].changed
                                    ? (
                                      <Value format={val => formatNumber(Math.round(val))}>
                                        {real}
                                      </Value>
                                    )
                                    : "—"
                                }
                                {" "}
                                /
                                {" "}
                                <Value 
                                  format={val => formatNumber(Math.round(val))} 
                                  neutral={true}
                                >
                                  {plan}
                                </Value>
                              </div>
                            )
                          })()}

                          <Progress 
                            status={
                              data[currentDay - 1].changed
                                ? percent >= 1 
                                  ? "success"
                                  : percent <= 0
                                    ? "exception" 
                                    : "normal"
                                : "normal"
                            }
                            trailColor={
                              percent >= 1
                                ? "#3f6b33"
                                : percent <= 0
                                  ? "#f5222d"
                                  : "#4859b4"
                            } 
                            percent={
                              data[currentDay - 1].changed
                                ? percent <= 0
                                  ? 100
                                  : round(percent * 100, 2)
                                : 0
                            }
                          />
                          <span className="section5-footer__label">
                            <h4 className="section5-footer__label-title">Депозит:</h4>
                            {" "}
                            {(() => {
                              let value = data[currentDay - 1].depoStartTest + income;
                              value += data[currentDay - 1].payload ? data[currentDay - 1].payload : 0;
                              value -= data[currentDay - 1].payment ? data[currentDay - 1].payment : 0;

                              return (
                                data[currentDay - 1].changed
                                  ? (
                                    <Value
                                      format={val => formatNumber(Math.round(val))}
                                      neutral={value <= data[currentDay - 1].depoStartTest}>
                                      {value}
                                    </Value>
                                  )
                                  : placeholder
                              )
                            })()}
                            {" "}/{" "}
                            {
                              formatNumber(depoEnd)
                            }
                          </span>

                        </footer>
                      )
                    })()}

                  </div>
                  {/* section5-content */}

                </section>
              )
            })()}
            {/* /.section5 */}

            {/* График */}
            {
              chartVisible && (
                <div id="_chart" style={{ height: "58em" }}></div>
              )
            }

          </div>
          {/* /.container */}
        </main>
        {/* /.main */}

        {(() => {
          let { saves, id } = this.state;
          let namesTaken = saves.slice().map(save => save.name);
          let name = (id) ? this.getTitle() : "Новый трейдометр";

          function validate(str = "") {
            str = str.trim();

            let errors = [];

            let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(str);
            if (str.length < 3) {
              errors.push("Имя должно содержать не меньше трех символов!");
            }
            else if (test) {
              errors.push(`Нельзя использовать символ "${test[0]}"!`);
            }
            if (namesTaken.indexOf(str) > -1) {
              errors.push(`Сохранение с таким именем уже существует!`);
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
              let { value } = this.state;

              let errors = validate(value);
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
                    spellCheck="false"
                    value={value}
                    maxLength={20}
                    onChange={e => {
                      let { value } = e.target;
                      let { onChange } = this.props;

                      this.setState({ value });

                      if (onChange) {
                        onChange(value);
                      }
                    }}
                    onKeyDown={e => {
                      // Enter
                      if (e.keyCode === 13) {
                        let { value } = e.target;
                        let { onBlur } = this.props;

                        let errors = validate(value);
                        if (errors.length === 0) {
                          if (onBlur) {
                            onBlur(value);
                          }
                        }

                        this.setState({ error: (errors.length > 0) ? errors[0] : "" });
                      }
                    }}
                    onBlur={() => {
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

          let onConfirm = () => {
            let { id, data, currentDay, saves, currentSaveIndex } = this.state;

            if (id) {
              this.update(name)
                .then(() => {
                  saves[currentSaveIndex - 1].name = name;
                  this.setState({
                    saves,
                    changed: false,
                  })
                })
                .catch(err => this.showMessageDialog(err));
            }
            else {
              const onResolve = (id) => {
                const collapsed = data[currentDay - 1].collapsed;
                // Сохранение
                if (!collapsed) {
                  data[currentDay - 1].collapsed = true;
                }

                let index = saves.push({ id, name });
                
                this.setState({
                  data,
                  saves,
                  saved: true,
                  changed: false,
                  currentSaveIndex: index,
                });
              };
              
              this.save(name)
                .then(onResolve)
                .catch(err => this.showMessageDialog(err));

              if (dev) {
                onResolve();
              }
            }
          }

          let inputJSX = (
            <ValidatedInput
              label="Введите название тредометра"
              validate={validate}
              defaultValue={name}
              onChange={val => name = val}
              onBlur={() => {}} />
          );
          let modalJSX = (
            <Dialog
              id="dialog1"
              className="save-modal"
              title={"Сохранение трейдометра"}
              onConfirm={() => {
                if (validate(name).length) {
                  console.error( validate(name)[0] );
                }
                else {
                  onConfirm();
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
          confirmText="Добавить"
          onConfirm={() => {
            let { toolTemplate, customTools, propsToShowArray } = this.state;

            const nameExists = (value, tools) => {
              let found = 0;
              for (const tool of tools) {
                if (value === tool.shortName) {
                  found++;
                }
              }

              return found > 1;
            };

            let template = Object.assign({}, toolTemplate);
            let tool = template;
            propsToShowArray.map((prop, index) => {
              tool[prop] = toolTemplate[prop];
              if (index === 0) {
                const suffix = customTools.length + 1;
                tool[prop] = `Инструмент ${suffix > 1 ? suffix : ""}`;
              }
            });

            customTools.push(tool);
            
            while (nameExists(tool.shortName, this.getTools())) {
              const end = tool.shortName.match(/\d+$/g)[0];
              tool.shortName = tool.shortName.replace(end, Number(end) + 1);
            }

            this.setState({ customTools }, () => {
              document.querySelector(".config-table-wrap").scrollTop = 99999;
            });
          }}
          cancelText="Закрыть"
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
                      const nameExists = (value, tools) => {
                        let found = 0;
                        for (const tool of tools) {
                          if (value === tool.shortName) {
                            found++;
                          }
                        }

                        return found > 1;
                      };

                      let onBlur = (val, index, prop) => {
                        let { customTools } = this.state;
                        customTools[index][prop] = val;
                        if (prop === "shortName") {
                          while (nameExists(customTools[index][prop], this.getTools())) {
                            const end = customTools[index][prop].match(/\d+$/g)[0];
                            customTools[index][prop] = customTools[index][prop].replace(end, Number(end) + 1);
                          }
                        }
                        
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
                                className="config__delete cross-button"
                                aria-label="Удалить"
                                onClick={() => {
                                  let { customTools } = this.state;
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
          confirmText="Добавить"
          onConfirm={() => {
            let { passiveIncomeTools } = this.state;

            let tool = {
              name: "Инструмент",
              rate: 0
            };
            passiveIncomeTools.push(tool);
            this.setState({ passiveIncomeTools }, () => {
              document.querySelector(".config-table-wrap").scrollTop = 99999;
            });
          }}
          cancelText="Закрыть"
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
                  let onBlur = (val, index, prop) => {
                    let { passiveIncomeTools } = this.state;
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
                              className="cross-button config__delete"
                              aria-label="Удалить"
                              onClick={() => {
                                let { passiveIncomeTools } = this.state;
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
          confirmText={"Удалить"}
          onConfirm={() => {
            const { id } = this.state;
            this.delete(id)
              .then(() => console.log("Deleted!"))
              .catch(err => console.warn(err));
            return true;
          }}
        >
          Вы уверены, что хотите удалить {this.getTitle()}?
        </Dialog>
        {/* Delete Popup */}
        
        {(() => {
          const { errorMessage } = this.state;
          return (
            <Dialog
              id="dialog-msg"
              title="Сообщение"
              hideConfirm={true}
              cancelText="ОК"
            >
              { errorMessage }
            </Dialog>
          )
        })()}
        {/* Error Popup */}

      </div>
    );
  }
}