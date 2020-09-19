import React from "react"
import {
  Button,
  Col,
  Input,
  Progress,
  Row,
  Select,
  Statistic,
  Switch,
  Tooltip,
} from "antd/es"
const { Option } = Select;

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  QuestionCircleFilled,
  SettingFilled,
  WarningOutlined,
} from "@ant-design/icons"

import "core-js/features/promise"
import { merge } from "lodash";
import { cloneDeep as clone } from "lodash";
import objToPlainText from "object-plain-string";

import { ajax } from "jquery";
import round               from "./utils/round";
import roundUp             from "./utils/round-up";
import params              from "./utils/params";
import num2str             from "./utils/num2str"
import formatNumber        from "./utils/format-number";
import extRate             from "./utils/rate";
import rateRecommended     from "./utils/rate-recommended";
import fallbackBoolean     from "./utils/fallback-boolean";
import typeOf              from "./utils/type-of";
import promiseWhile        from "./utils/promise-while";
import { Tools, template } from "./tools";

import BigNumber    from "./components/BigNumber"
import Config       from "./components/config";
import CrossButton  from "./components/cross-button"
import CustomSelect from "./components/custom-select"
import CustomSlider from "./components/custom-slider"
import NumericInput from "./components/numeric-input"
import Speedometer  from "./components/riskometer"
import Stack        from "./components/stack"
import Value        from "./components/value"
import Header       from "./components/header";
import ModeToggle   from "./components/mode-toggle";
import { Dialog, dialogAPI } from "./components/dialog"

import "../sass/style.sass"

let chartData, chartData2, chartData3, scale, scaleStart, scaleEnd;
let lastRealData = {};
let saveToDonwload;

const chartVisible = true;

export default class App extends React.Component {
  
  constructor(props) {
    super(props);

    // Считываем значения из адресной строки
    const depoStart = Number( params.get("start") ) || 1000000;
    const depoEnd   = Number( params.get("end") )   || 3000000;
    const mode      = Number( params.get("mode") )  || 0;
    const days      = Number( params.get("days") )  || 260;
    
    /**
     * Дефолтный стейт
     */
    this.initialState = {

      // TODO: в идеале realData не нужна, все значения из факта можно хранить в data
      realData: {},
      
      /**
       * Начальный депозит
       * @type {Array<Number>}
       */
      depoStart: [ depoStart, depoStart ],
      
      /**
       * Целевой депозит
       * @type {Number}
       */
      depoEnd,
      
      /**
       * Торговых дней
       * @type {Array<Number>}
       */
      days: [days, days],
      
      /**
       * Индекс режима расчета целевого депо
       * 
       * 0 - от желаемой суммы
       * 
       * 1 - от желаемой доходности
       */
      mode,

      // TODO: rename to "customRate"
      /**
       * Доходность в день (используется только во второй вкладке вместо rate)
       */
      incomePersantageCustom: 1,

      // Минимальная доходность в день
      // TODO: удалить и использовать вместо нее incomePersantageCustom, тк по факту это одно и то же
      minDailyIncome: 45,

      // TODO: reaname to payment
      /**
       * Вывод
       */
      withdrawal: [ 0, 0 ],
      
      /**
       * Частота вывода
       */
      withdrawalInterval: [20, 20],

      /**
       * Пополнение
       */
      payload: [ 0, 0 ],

      /**
       * Частота пополнения
       */
      payloadInterval: [20, 20],

      
      // TODO: rename into something that makes more sense
      /**
       * Индекс текущей выбранной страницы в секции "результат"
       * Используется как оффсет
       */
      paginatorSelectedIndex: 0,
      
      /**
       * Номер текущиго дня (начиная с 1)
       * 
       * Если, к примеру, у нас 260 дней, то последний день тоже будет равен 260
       */
      currentDay: 1,

      /**
       * Процент депозита на вход в сделку
       */
      depoPersentageStart: 10,

      /**
       * Количество итераций в день
       */
      iterations: 10,

      // -----
      // Tools
      // -----
      toolsInfo: [
        { name: "Инструмент",   prop: "shortName"       },
        { name: "Цена шага",    prop: "stepPrice"       },
        { name: "Шаг цены",     prop: "priceStep"       },
        { name: "Средний ход",  prop: "averageProgress" },
        { name: "ГО",           prop: "guaranteeValue"  },
        { name: "Текущая цена", prop: "currentPrice"    },
        { name: "Размер лота",  prop: "lotSize"         },
        { name: "Курс доллара", prop: "dollarRate"      },
      ],
      tools: [],
      customTools: [],
      currentToolCode: "",
      
      // --------------------
      // Passive income tools
      // --------------------
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

      // -----
      // Сейвы
      // -----

      /**
       * Идентификатор сохранения
       */
      id: null,

      // -----
      // Flags
      // -----
      saved: false,
      changed: false,

      daysInOrder: true,
      directUnloading: true,

      // TODO: remove?
      isSafe: true,

      // ------
      // Ошибки
      // ------

      // TODO: удалить, тк теперь ошибку и инпута можно вывести внутри onChange
      pitError: "",

      errorMessage: "",
    };

    this.state = merge(
      clone(this.initialState),
      // Здесь находятся только те дефолтные значения, которые не должны сбрасываться
      {
        /**
         * Массив с данными для каждого дня
         * @type {Array<{}>}
         */
        data: [],
        
        /**
         * Массив с сохранениям
         * @type {Array<{}>}
         */
        saves: [],
        
        /**
         * Индекс текущего сохранения
         */
        currentSaveIndex: 0,
      }
    );

    if (dev) {
      this.state.saves = [{ id: 0, name: "test" }];
    }

    this.state.data = this.buildData(this.state.days[this.state.mode]);
  }

  componentDidMount() {
    this.bindEvents();

    if (chartVisible) {
      this.createChart();
    }

    if (dev) {
      this.fetchTools();
      setTimeout(() => this.loadFakeSave(), 1500);
      return;
    }

    const checkIfAuthorized = () => {
      return new Promise((resolve, reject) => {
        this.sendRequest("getAuthInfo")
          .then(res => {
            if (res.authorized) {
              resolve();
            }
            else {
              reject();
            }
          })
          .catch(() => reject())
      })
    };

    let counter = 0;
    promiseWhile(false, i => !i, () => {
      return new Promise(resolve => {
        counter++;
        checkIfAuthorized()
          .then(() => {
            this.fetchInitialData();
            resolve(true);
          })
          .catch(() => {
            if (counter >= 10) {
              this.showMessageDialog("Не удалось получить статус авторизации, попробуйте обновить страницу с кэшем через Сtrl+F5 или обратитесь в техподдержку");
              resolve(true);
            }
            else {
              setTimeout(() => resolve(false), 1000);
            }
          });
      });
    });
  }

  loadFakeSave() {
    let { saves } = this.state;
    let save = {
      error: false,
      data: {
        id: 567,
        name: 'Testovy trademeter',
        dateCreate: 1600359585,
        static: '{"depoStart":[1000000,1000000],"depoEnd":[3000000,null],"currentDay":8,"days":[260,260],"minDailyIncome":[0.2,1],"payment":[1000,0],"paymentInterval":[10,20],"payload":[20000,0],"payloadInterval":[5,20],"passiveIncome":[14450,0],"passiveIncomeTools":[{"name":"ОФЗ 26214","rate":4.99},{"name":"ОФЗ 26205","rate":5.78},{"name":"ОФЗ 26217","rate":5.99},{"name":"ОФЗ 26209","rate":6.26},{"name":"ОФЗ 26220","rate":6.41}],"currentPassiveIncomeToolIndex":[1,-1],"mode":0,"customTools":[],"currentToolCode":"AFZ0","current_date":"#"}',
        dynamic: '[{"d":1,"s":2,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":2,"s":0.1,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":3,"s":-1,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":4,"s":3,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":5,"s":1,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":6,"s":0.2,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":7,"s":0.2,"pmt":0,"pld":0,"il":[],"c":true,"pi":0,"du":true},{"d":8,"s":0.2,"il":[],"c":true,"pi":0,"du":true}]',
      },
      id: 567,
    };

    const index = 0;
    this.extractSave(save);
    this.setState({ currentSaveIndex: index + 1 });

    saves[index] = {
      id: save.data.id,
      name: save.data.name,
      corrupt: false
    };
    this.setState({ saves });
  }

  // ----------
  // Fetch
  // ----------

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchInvestorInfo();
    this.fetchTools();

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

  fetchTools() {
    this.sendRequest("getFutures")
      .then(res => new Promise(resolve => resolve(res.data)))
      .then(tools => Tools.parse(tools))
      .then(tools => this.state.tools.concat(tools))
      .then(tools => tools.sort((a, b) => a.shortName.localeCompare(b.shortName)))
      .then(tools => new Promise(resolve => this.setState({ tools }, resolve)))
      .then(() => this.updateDepoPersentageStart())
      .catch(err => this.showMessageDialog(`Не удалось получить инстурменты! ${err}`))

    // this.sendRequest("getTrademeterInfo")
    //   .then(res => new Promise(resolve => resolve(res.data)))
    //   .then(tools => Tools.parse(tools))
    //   .then(tools => this.state.tools.concat(tools))
    //   .then(tools => tools.sort((a, b) => a.shortName.localeCompare(b.shortName)))
    //   .then(tools => new Promise(resolve => this.setState({ tools }, resolve)))
    //   .then(() => this.updateDepoPersentageStart())
    //   .catch(err => this.showMessageDialog(`Не удалось получить инстурменты! ${err}`))
  }

  fetchInvestorInfo() {
    this.sendRequest("getInvestorInfo")
      .then(res => {
        const { status, skill, deposit } = res.data;
        return new Promise(resolve => this.setState({ status, skill }, () => resolve(deposit)));
      })
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

        return new Promise(resolve => this.setState({ depoStart, depoEnd }, resolve));
      })
      .then(() => this.recalc())
      .catch(err => this.showMessageDialog(`Не удалось получить начальный депозит! ${err}`));
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      this.sendRequest("getTrademeterSnapshots")
        .then(res => {
          const saves = res.data.map(save => ({
            name: save.name,
            id: save.id,
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
          .then(res => resolve(res))
          .catch(err => reject(err));
      }
      else {
        reject("id must be a number!", id);
      }
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

      this.updateChart(true);

      // set chart type
      let chart = anychart.line();
      chart.animation(true, 3000);
      chart.listen("click", e => {
        if (e.pointIndex) {
          this.setCurrentDay(e.pointIndex + 1);
        }
      });
      chart.tooltip().titleFormat(e => {
        let index = e.x;
        if (index == null) {
          index = e.points[0].index + 1;
        }

        return `День: ${Number(index)}`;
      });

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
        return `${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}`
      });

      // Line color
      series.normal().stroke({
        color: "#87d068",
        thickness: "5%"
      });

      let series3 = chart.line(chartData3);
      series3.name("Рекомендуемый рост депо");
      series3.tooltip().displayMode("separated");
      series3.tooltip().useHtml(true);
      series3.tooltip().format(e => {
        const lastFilledDay = this.getLastFilledDayNumber() - 1;
        if (e.index > lastFilledDay) {
          let svg = `
            <svg viewBox="0 0 10 10" width="1em" height="1em" 
                 fill="#c46d1a" style="position: relative; top: 0.1em">
              <rect x="0" y="0" width="10" height="10" />
            </svg>
          `;

          return `${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}`
        }
        else return `<span class="empty-tooltip-row"></span>`;
      });

      // Line color
      series3.normal().stroke({
        color: "#c46d1a",
        dash: '3 5',
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

        return `${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}`
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

  updateChart(isInit = false) {
    if (!chartVisible) {
      return;
    }

    const { days, daysInOrder, mode, realData } = this.state;
    const data = [...this.state.data];
    if (data.length !== days[mode]) {
      return;
    }

    // План
    const planData = new Array(days[mode]).fill().map((v, i) => ({
      x:     String(i + 1),
      value: data[i].depoEndPlan
    }));
    if (isInit) {
      chartData2 = anychart.data.set(planData);
    }
    else {
      chartData2.data(planData);
    }

    // Факт
    // ~~
    const factDays = this.getFilledDays();
    const factArray = [];
    let factData = [];
    if (daysInOrder) {
      if (factDays.length) {
        factArray[0] = data[0].depoStartTest + this.getRealIncome(1);
        for (let i = 1; i < factDays.length; i++) {
          factArray[i] = factArray[i - 1] + this.getRealIncome(i + 1, data, factArray[i - 1]);
        }
  
        factData = factArray.map((value, index) => {
          return {
            x: String(index + 1),
            value: value
          }
        });
      }
    }
    else {
      factData = new Array(days[mode]).fill().map((v, i) => ({
        x:     String(i + 1),
        // value: data[i].depoEnd
        value: data[i].depoStartTest + this.getRealIncome(i + 1)
      }));
    }

    if (isInit) {
      chartData = anychart.data.set(factData);
    }
    else {
      chartData.data(factData);
    }

    // Рекоммендуемый план
    let recommendData = [];
    // Не отрисовываем, если мы все это время шли по плану
    // const followingPlan = daysInOrder && factDays.every(day => realData[day].scale == rate);
    if (factDays.length) {
      const { withdrawal, withdrawalInterval, payload, payloadInterval } = this.state;

      const rateRecommended = this.getRateRecommended();

      const factLastDay = this.getLastFilledDayNumber() - 1;
      recommendData = new Array(days[mode] - factLastDay).fill(0);
      recommendData[0] = factArray[factArray.length - 1];

      for (let i = 1; i < recommendData.length; i++) {
        recommendData[i] = recommendData[i - 1] + (recommendData[i - 1] * rateRecommended / 100);

        if ((factLastDay + i + 1) % withdrawalInterval[mode] == 0) {
          recommendData[i] -= withdrawal[mode];
        }
        
        if ((factLastDay + i + 1) % payloadInterval[mode] == 0) {
          recommendData[i] += payload[mode];
        }
      }

      recommendData = recommendData.map((value, index) => {
        return {
          x:     String(factLastDay + index + 1),
          value: value
        }
      });
    }

    if (isInit) {
      chartData3 = anychart.data.set(recommendData);
    }
    else {
      if (!daysInOrder) {
        recommendData = null;
      }
      chartData3.data(recommendData);
    }
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
      let depoPersentageStart = this.getCurrentTool().guaranteeValue / data[currentDay - 1].depoStartTest * 100;
      this.setState({ depoPersentageStart }, () => {
        this.updateData(days[mode], false)
          .then(resolve)
          .catch(err => reject(err));
      });
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
      customTools,
      passiveIncomeTools,
      currentPassiveIncomeToolIndex,
    } = this.state;

    const json = {
      static: {
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
        currentToolCode:               this.getCurrentTool().code,
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
          il:  item.iterationsList,
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
    }
    catch (e) {
      valid = false;
    }

    return valid;
  }

  extractSave(save) {
    saveToDonwload = clone(save);

    const onError = e => {
      this.showMessageDialog(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    const { depoEnd } = this.state;

    let staticParsed;
    let dynamicParsed;

    let state = {};
    let failed = false;

    let currentDay = 1;

    try {
      
      staticParsed = JSON.parse(save.data.static);
      dynamicParsed = JSON.parse(save.data.dynamic);

      if (dev) {
        console.log("staticParsed", staticParsed);
        console.log("dynamicParsed", dynamicParsed);
      }

      const initialState = clone(this.initialState);

      let m = staticParsed.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.mode = m;

      state.depoStart = staticParsed.depoStart;
      if (typeOf(state.depoStart) !== "array") {
        const temp = state.depoStart; 
        state.depoStart = initialState.depoStart;
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
        state.days = initialState.days;
        state.days[m] = Number(temp);
      }

      state.incomePersantageCustom = staticParsed.minDailyIncome;
      if (typeOf(state.incomePersantageCustom) === "array") {
        state.incomePersantageCustom = state.incomePersantageCustom[1];
      }

      state.withdrawal = staticParsed.payment;
      if (typeOf(state.withdrawal) !== "array") {
        const temp = state.withdrawal;
        state.withdrawal = initialState.withdrawal;
        state.withdrawal[m] = Number(temp);
      }

      state.withdrawalInterval = staticParsed.paymentInterval;
      if (typeOf(state.withdrawalInterval) !== "array") {
        const temp = state.withdrawalInterval;
        state.withdrawalInterval = initialState.withdrawalInterval;
        state.withdrawalInterval[m] = Number(temp);
      }

      state.payload = staticParsed.payload;
      if (typeOf(state.payload) !== "array") {
        const temp = state.payload;
        state.payload = initialState.payload;
        state.payload[m] = Number(temp);
      }
      
      state.payloadInterval = staticParsed.payloadInterval;
      if (typeOf(state.payloadInterval) !== "array") {
        const temp = state.payloadInterval;
        state.payloadInterval = initialState.payloadInterval;
        state.payloadInterval[m] = Number(temp);
      }

      state.passiveIncomeMonthly = staticParsed.passiveIncome || [0, 0];
      if (typeOf(state.passiveIncomeMonthly) !== "array") {
        const temp = state.passiveIncomeMonthly;
        state.passiveIncomeMonthly = initialState.passiveIncomeMonthly;
        state.passiveIncomeMonthly[m] = Number(temp);
      }

      state.customTools        = staticParsed.customTools        || [];
      state.passiveIncomeTools = staticParsed.passiveIncomeTools || initialState.passiveIncomeTools;

      state.currentPassiveIncomeToolIndex = staticParsed.currentPassiveIncomeToolIndex || [-1, -1];
      if (typeOf(state.currentPassiveIncomeToolIndex) !== "array") {
        const temp = state.currentPassiveIncomeToolIndex;
        state.currentPassiveIncomeToolIndex = initialState.currentPassiveIncomeToolIndex;
        state.currentPassiveIncomeToolIndex[m] = Number(temp);
      }

      // В старых сейвах указан currentToolIndex (number)
      state.currentToolCode = staticParsed.currentToolCode;
      if (staticParsed.currentToolIndex != null) {
        state.currentToolIndex = staticParsed.currentToolIndex || 0;
      }

      state.currentDay = 1;
      state.data     = this.buildData(state.days[m]);
      state.realData = [];

      state.id = save.id;
      state.saved = true;
    }
    catch (e) {
      // console.log("Failed!");

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
          .then(() => this.setCurrentDay(currentDay))
          .catch(err => this.showMessageDialog(err));
      }
    });
  }

  extractRealData(dynamic) {
    let realData = {};

    return new Promise(resolve => {
      for (let i = 0; i < dynamic.length; i++) {
        let item = dynamic[i];
        let d = (item.day != null) ? item.day : item.d;

        if (!realData[d]) {
          realData[d] = {};
        }

        const scale = item.scale != null ? item.scale : item.s != null ? item.s : 0;
        realData[d].scale = scale;

        const payment = item.payment != null ? item.payment : item.pmt != null ? item.pmt : 0;
        realData[d].payment = payment;

        const payload = item.payload != null ? item.payload : item.pld != null ? item.pld : 0;
        realData[d].payload = payload;
      }

      resolve(realData);
    })
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
      currentDay,
      mode,
      data,
      realData,
      withdrawalInterval,
      payloadInterval,
      depoPersentageStart,
    } = this.state;

    data[i] = data[i] || {};

    let depoStart   = this.state.depoStart[mode];
    let withdrawal  = this.state.withdrawal[mode];
    let payload     = this.state.payload[mode];
    let currentTool = this.getCurrentTool();

    let { collapsed, saved, changed } = !rebuild ? data[i] : {
      collapsed: true,
      saved:     false,
      changed:   false
    };

    const rate = this.getRate();
    const rateRecommended = this.getRateRecommended({ realData });
    let _scale = rate;
    if (!rebuild && data && data[i] && data[i].scale != null) {
      _scale = data[i].scale;
    }

    let rateFallback = rateRecommended;
    if (Object.keys(realData).length) {
      const currentRealData = realData[i + 1];
      // Заполнен факт
      if (currentRealData && Object.keys(currentRealData).length && Object.keys(currentRealData).map(prop => currentRealData[prop]).filter(val => val != null).length) {
        // В плане на день данные о дне должны остаться неизменными
        rateFallback = rate;

        rebuild = false;
        changed = true;
        data[i].scale   = currentRealData.scale;
        data[i].payment = currentRealData.payment;
        data[i].payload = currentRealData.payload;
      }
    }

    let _depoStart     = depoStart;
    let  depoStartTest = depoStart;
    if (i > 0) {
      // _depoStart = depoStartTest = daysArray[i - 1].depoEnd;
      // _depoStart = depoStartTest = daysArray[i - 1].depoStartTest + this.getRealIncome(i, daysArray, daysArray[i - 1].depoStartTest, null, 0);

      // Доход предыдущего дня
      let income = this.getRealIncome(i, daysArray, daysArray[i - 1].depoStartTest, null, rate);
      _depoStart = depoStartTest = daysArray[i - 1].depoStartTest + income;
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

    let goal = depoStartTest * (rate / 100 );
    let _income     = (_depoStart * _scale) / 100;
    let _incomePlan = (_depoStartPlan * rate) / 100;
    let _incomeReal = (_depoStart * rate) / 100;
    
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

    let _pointsForIteracion = goal / currentTool.stepPrice / _contractsStart;

    let res = {
      day:                i + 1,
      scale:              (!rebuild && data && data[i] && data[i].scale != null) ? data[i].scale : undefined,
      depoStartTest,
      goal,
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

      iterations:     data[i].iterations,
      iterationsList: (!rebuild && data && data[i] && data[i].iterationsList != null) ? data[i].iterationsList : [],
      payment:        data[i].payment,
      payload:        data[i].payload,

      scaleChanged:        data[i].scaleChanged,
      paymentChanged:      data[i].paymentChanged,
      payloadChanged:      data[i].payloadChanged,
      customIncomeChanged: data[i].customIncomeChanged,
      iterationsChanged:   data[i].iterationsChanged,

      collapsed: fallbackBoolean(collapsed, true),
      // collapsed: false,
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
      let { days, realData } = this.state;
      const data = this.buildData(length, rebuild);
      if (rebuild) {
        realData = {};
      }

      this.setState({ data, realData, days }, () => resolve());
    })
  }

  overrideData(override = []) {
    const { data, realData } = this.state;

    const isConsequent = arr => {
      if (arr.length == 0) {
        return true;
      }

      if (arr[0] != 1) {
        return false;
      }

      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i + 1] - arr[i] != 1) {
          return false;
        }
      }

      return true;
    };

    return new Promise(resolve => {
      for (let i = 0; i < override.length; i++) {
        let item = override[i];
        let d = (item.day != null) ? item.day : item.d;

        if (!realData[d]) {
          realData[d] = {};
        }  

        const scale = item.scale != null ? item.scale : item.s != null ? item.s : 0;
        data[d - 1].scale = scale;
        realData[d].scale = scale;

        const payment = item.payment != null ? item.payment : item.pmt != null ? item.pmt : 0;
        data[d - 1].payment = payment;
        realData[d].payment = payment;

        const payload = item.payload != null ? item.payload : item.pld != null ? item.pld : 0;
        data[d - 1].payload = payload;
        realData[d].payload = payload;

        data[d - 1].day = d;
        data[d - 1].customIncome    = item.customIncome    != null ? item.customIncome    : item.ci;
        data[d - 1].iterations      = item.iterations      != null ? item.iterations      : item.i;
        data[d - 1].iterationsList  = item.iterationsList  != null ? item.iterationsList  : item.il;
        data[d - 1].changed         = item.changed         != null ? item.changed         : item.c;
        data[d - 1].passiveIncome   = item.passiveIncome   != null ? item.passiveIncome   : item.pi;
        data[d - 1].directUnloading = item.directUnloading != null ? item.directUnloading : item.du;
      }

      const daysInOrder = isConsequent(Object.keys(realData).map(value => Number(value)));
      this.setState({ data, realData, daysInOrder }, () => resolve());
    })
  }

  bindEvents() {
    if (window.history && window.history.pushState) {
      window.addEventListener("popstate", () => {
        const mode = Number(params.get("mode")) || 0;
        this.setState({ mode });
      });
    }

    window.addEventListener("keyup", e => {
      if (e.ctrlKey && e.shiftKey && e.keyCode == 191) {
        const file = new Blob([objToPlainText(saveToDonwload)], { type: 'text/plain' });
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.setAttribute('download', "easter_egg.txt");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    });
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

  // API

  reset() {
    return new Promise(resolve => {
      this.setState(clone(this.initialState), () => { // TODO: do we need this callback at all?
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
          let id = Number(res.id);
          if (id) {
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

  getLastFilledDay() {
    const { realData } = this.state;
    let lastFilledDay = Object.keys(realData)
      .map(prop => realData[prop])
      .filter(day => 
        day != null &&
        Object.keys(day).length &&
        Object.keys(day)
          .map(prop => day[prop])
          .filter(value => value != null)
          .length
      )
      .pop();

    if (!lastFilledDay) {
      lastFilledDay = 0;
    }

    return lastFilledDay;
  }

  getFilledDays() {
    const { realData } = this.state;
    let arr = [];
    for (let n of Object.keys(realData).map(value => Number(value))) {
      if (
        realData[n] &&
        Object.keys(realData[n])
          .map(prop => realData[n][prop])
          .filter(value => value != null)
          .length
      ) {
        arr.push(n);
      }
    }
    return arr;
  }

  getLastFilledDayNumber() {
    const { realData } = this.state;
    let number = 0;
    for (let n of Object.keys(realData).map(value => Number(value))) {
      if (
        realData[n] &&
        Object.keys(realData[n])
          .map(prop => realData[n][prop])
          .filter(value => value != null)
          .length
      ) {
        number = n;
      }
    }
    return number;
  }

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

    return round(rate[mode], 3);
  }

  getRateRecommended(options = {}) {
    const {
      mode,
      payloadInterval,
      withdrawalInterval,
    } = this.state;

    const depoStart  = this.state.depoStart[mode];
    const withdrawal = this.state.withdrawal[mode];
    const payload    = this.state.payload[mode];
    const days       = this.state.days[mode];

    const rate = this.getRate();

    let realData = clone(options.realData || this.state.realData);
    realData = Object.keys(realData)
      .map(prop => realData[prop])
      // Удаляем все пустые ячейки
      // За пустые ячейки считаются пустой объект {}
      // И объект, в котором все поля равны null или undefined
      .filter(data =>
        Object.keys(data).length &&
        Object.keys(data).map(prop => data[prop]).every(val => val != null)
      )
      .map(item => {
        item.scale = (item.scale != null ? item.scale : rate) / 100;
        item.payment = item.payment != null ? item.payment : 0;
        item.payload = item.payload != null ? item.payload : 0;
        return item;
      })

    let value = rateRecommended(
      depoStart,
      this.getDepoEnd(),
      withdrawal,
      withdrawalInterval[mode],
      payload,
      payloadInterval[mode],
      days,
      withdrawalInterval[mode],
      payloadInterval[mode],
      0,
      realData
    ) * 100;

    if (Math.abs(rate - value) < .0008) {
      value = rate;
    }

    return value;
  }

  /**
   * Возвращает все инструменты в одном массиве 
   * (полученные с бэка и кастомные)
   */
  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  getToolIndexByCode(code) {
    const tools = this.getTools();
    if (!code || !tools.length) {
      return 0;
    }

    // Проблема: выбранный инструмент в конце месяца может пропасть из списка
    // -- нужно подставлять следующий по алфавиту, то есть был ...9.20, стал 10.20
    let alike = {};

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      if (tool.code == code) {
        return i;
      }

      // Мы нашли инструмент, код которого начинается с тех же 2ух символов
      // if (tool.code.toLowerCase().slice(0, 2) == code.toLowerCase().slice(0, 2)) {
      //   console.log("you look like me! sweet", tool);
      //   alike[i] = tool;
      // }
    }

    // У нас есть список инструментов с похожими кодами, теперь надо найти след по алфавиту

    return Object.keys(alike).pop() || 0;
  }

  getCurrentToolIndex() {
    let { currentToolCode, currentToolIndex } = this.state;
    const tools = this.getTools();
    // Обратная совместимость для сейвов, где указан только currentSaveIndex
    if (currentToolIndex != null) {
      // Если индекс выбранного инструмента превышает кол-во инструментов
      // -- выбираем последний возможный инструмент
      return Math.min(currentToolIndex, tools.length - 1);
    }
    return this.getToolIndexByCode(currentToolCode);
  }

  /**
   * Получить выбранный торговый инструмент
   */
  getCurrentTool() {
    // TODO: simplify or delete
    const fallbackTool = this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`)

    const tools = this.getTools();
    return tools[this.getCurrentToolIndex()] || fallbackTool;
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
    let { data, directUnloading, iterations, currentDay } = this.state;
    iterations = iterations || 1;

    if (!data.length) {
      return iterations;
    }

    let pointsForIteration = data[currentDay - 1].pointsForIteration / iterations;
    if (!directUnloading && (iterations * 2) >= 100) {
      pointsForIteration = (data[currentDay - 1].pointsForIteration * 2) / 100;
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

  getPassiveIncomeTools() {
    const { passiveIncomeTools } = this.state;
    return passiveIncomeTools;
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

  getIterationsList(day, data) {
    if (data == null) {
      data = this.state.data;
    }
    
    const { currentDay } = this.state;
    if (day == null) {
      day = currentDay;
    }

    if (!data[day - 1].iterationsList) {
      return;
    }

    return data[day - 1].iterationsList.filter(v => v.percent != null || v.income != null);
  }

  getRealIncome(day, data, depoStart, rate, fallbackRate = this.getRate()) {
    if (data == null) {
      data = this.state.data;
    }
    
    const { realData, currentDay } = this.state;
    if (day == null) {
      day = currentDay;
    }
    if (depoStart == null) {
      depoStart = data[day - 1].depoStart;
    }
    
    const scale = rate != null 
      ? rate 
      : (data[day - 1].scale != null) 
        ? data[day - 1].scale 
        : fallbackRate;

    let value = Math.round(depoStart * round(scale, 3) / 100);

    if (data[day - 1].customIncome != null) {
      value = data[day - 1].customIncome;
    }

    const iterationsList = this.getIterationsList(day, data);
    if (iterationsList && iterationsList.length) {
      value = iterationsList.map(el => el.income).reduce((prev, curr) => prev + curr);
    }

    value += realData[day] && realData[day].payload != null ? realData[day].payload : 0;
    value -= realData[day] && realData[day].payment != null ? realData[day].payment : 0;

    // value += data[day - 1].payload ? data[day - 1].payload : 0;
    // value -= data[day - 1].payment ? data[day - 1].payment : 0;
    return value;
  }

  render() {
    if (!this.state.data.length) {
      return;
    }

    let {
      mode,
      data,
      realData,
      saved,
      currentDay
    } = this.state; 

    const getNthDayRealIncome = day => {
      const { data, realData } = this.state;
      let factArray = [];
      factArray[0] = data[0].depoStartTest + this.getRealIncome(1, null, null, null, 0);
      for (let i = 1; i < Object.keys(realData).length; i++) {
        factArray[i] = factArray[i - 1] + this.getRealIncome(i + 1, data, factArray[i - 1], null, 0);
        if (i == day - 1) {
          return factArray[i];
        }
      }

      return factArray[0];
    };

    return (
      <div className="page">

        <main className="main">

          <Header
            id={this.state.id}
            title={this.getTitle()}
            changed={this.state.changed}
            saved={this.state.saved}
            saves={this.state.saves}
            currentSaveIndex={this.state.currentSaveIndex}
            onSaveChange={val => {
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
            }}
            onSave={e => {
              const { saved, changed } = this.state;

              if (saved && changed) {
                this.update(this.getTitle());
                this.setState({ changed: false });
              }
              else {
                dialogAPI.open("dialog1", e.target);
              }
            }}
          >
            <ModeToggle
              mode={mode}
              saved={saved}
              onChange={mode => {
                let { data, realData, currentDay } = this.state;
                // TODO: looks weird. simplify it?
                let days = this.state.days[mode];
                let state = {};

                if (Object.keys(lastRealData).length) {
                  const tempRealData = clone(realData);
                  realData = clone(lastRealData);
                  lastRealData = clone(tempRealData);
                }
                else {
                  lastRealData = clone(realData);
                  realData = {};
                }

                // В новой вкладке меньше дней, чем в предыдущей
                if (days < data.length) {
                  // Текущий день больше, чем макс кол-во дней в новой вкладке
                  if (currentDay > days) {
                    // Текущий день становится последним
                    currentDay = days;
                    Object.assign(state, { currentDay });
                  }
                }


                this.setState(Object.assign(state, { mode, realData }), () => {
                  // TODO: вернуть?
                  // params.set("mode", value);

                  // TODO: optimize because this.recalc() already uses this.updateChart()
                  this.recalc()
                    .then(() => this.setState({ realData }))
                    .then(() => this.updateChart());
                });
              }}
            />
          </Header>

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
                          onClick={e => dialogAPI.open("passive-income-config", e.target)}>
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
                            key={this.state.withdrawal[this.state.mode]}
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
                        key={this.state.payload[this.state.mode]}
                        disabled={this.state.saved}
                        className="input-group__input"
                        defaultValue={this.state.payload[this.state.mode]}
                        round="true"
                        unsigned="true"
                        format={formatNumber}
                        min={0}
                        max={99999999}
                        onBlur={val => {
                          let { mode, days, payload, payloadInterval } = this.state;
                          const depoEnd = this.getDepoEnd();
                          const periodicity = days[mode] / payloadInterval[mode];

                          if (val === payload[mode]) {
                            return;
                          }

                          if (val === "") {
                            val = 0;
                          }
                          
                          payload[mode] = val;

                          this.setState({ payload }, this.recalc);
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
                          let { mode, days, payload, payloadInterval } = this.state;
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
                      const { mode, depoStart, depoPersentageStart } = this.state;
                      const tools = this.getTools();
                      let step = this.getCurrentTool().guaranteeValue / data[currentDay - 1].depoStartTest * 100;
                      if (step > 100) {
                        console.warn('step is more than 100');
                        for (let i = 0; i < tools.length; i++) {
                          let s = tools[i].guaranteeValue / depoStart[mode] * 100;
                          if (s < 100) {
                            this.setState({
                              currentToolCode: tools[i].code,
                              // Очищаем currentToolIndex, чтобы отдать приоритет currentToolCode
                              currentToolIndex: null,
                            });
                            step = s;
                            break;
                          }
                        }
                      }
                      let min = step;

                      return (
                        <CustomSlider
                          value={depoPersentageStart}
                          min={min}
                          max={100}
                          step={step}
                          precision={2}
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
                          onClick={e => dialogAPI.open("config", e.target)}>
                          <SettingFilled className="settings-button__icon" />
                        </button>
                      </Tooltip>
                    </header>
                    <Select
                      value={this.getCurrentToolIndex()}
                      onChange={currentToolIndex => {
                        const { depoStart, days, mode } = this.state;
                        let tools = this.getTools();
                        const currentTool = tools[currentToolIndex]; 

                        // Искомое значение на ползунке, к котором мы хотим прижаться
                        let toFind = this.state.depoPersentageStart;
                        let step = currentTool.guaranteeValue / data[currentDay - 1].depoStartTest * 100;
                        if (step > 100) {
                          // Тут ищем инстурмент, с которым нам хватит на 1 контракт
                          for (let i = 0; i < tools.length; i++) {
                            let s = tools[i].guaranteeValue / depoStart[mode] * 100;
                            if (s < 100) {
                              this.setState({ currentToolIndex: i });
                              step = s;
                              break;
                            }
                          }
                        }

                        // Определяю кол-во шагов
                        let rangeLength = Math.floor(100 / step);
                        if (rangeLength < 1 || rangeLength == Infinity) {
                          rangeLength = 1;
                          console.warn("Range length is out of bounds!");
                        }
                        // Заполняю массив шагами типа 0.2, 0.4, 0.6 итд
                        let range = new Array(rangeLength).fill(0).map((val, i) => step * (i + 1));

                        // Пытаюсь найти ближайшее значение к предыдущему значеню ползунка "процент депозита на вход в сделку"
                        let depoPersentageStart = range.reduce(function (prev, curr) {
                          return (Math.abs(curr - toFind) < Math.abs(prev - toFind) ? curr : prev);
                        });
                        
                        depoPersentageStart = round(depoPersentageStart, 2);
                        depoPersentageStart = Math.max(depoPersentageStart, step);
                        depoPersentageStart = Math.min(depoPersentageStart, 100);

                        this.setState({ 
                          currentToolCode: currentTool.code,
                          // Очищаем currentToolIndex, чтобы отдать приоритет currentToolCode
                          currentToolIndex: null,
                          depoPersentageStart
                        }, () => {
                          this.updateData(days[mode])
                            .then(() => this.updateDepoPersentageStart())
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
                        key={this.state.currentDay + Math.random()}
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
                      /
                      {" "}
                      {days}
                    </header>
                    
                    <div className="section4-content section4__content1 card">
                      <div className="section4-row">
                        <div className="section4-l">
                          Депо на вход
                        </div>
                        <div className="section4-r">
                          {
                            formatNumber(Math.round(data[currentDay - 1].depoStartTest * (depoPersentageStart / 100)))
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
                            let value = data[currentDay - 1].depoStartTest + data[currentDay - 1].goal;

                            return formatNumber(Math.round(value));
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
                            onChange={directUnloading => this.setState({ directUnloading }, () => {
                              this.recalc(false);
                            })}
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
                              formatNumber(Math.round(data[currentDay - 1].goal))
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
                          realData,
                          daysInOrder,
                          payloadInterval,
                          withdrawalInterval,
                        } = this.state;

                        const depoStart = this.state.depoStart[mode];
                        const withdrawal = this.state.withdrawal[mode];
                        const payload = this.state.payload[mode];
                        const days = this.state.days[mode];
                        
                        function getPeriods(rate, present, future, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1, comission = 0, realdata = {}) {
                          realdata = JSON.parse(JSON.stringify(realdata));
                          // ( Ставка, Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1), комиссия на вывод, массив данных по реальным дням  )
                          // Возвращает: Дней до цели
                          const rateRounded = round(rate * 100, 3);

                          var res = present;
                          var p1 = dayoffirstpayment;
                          var p2 = dayoffirstpayload;
                          var x = 0;
                          rate += 1;
                          payment = payment * (1 + comission);

                          while (res < future) {
                            if (realdata[x] !== undefined) {

                              realdata[x].scale   = realdata[x].scale   != null ? realdata[x].scale   : rateRounded;
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
                            total++;
                          }
                          else {
                            // sum += rate;
                          }
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
                                      value={round(avg, 3)}
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

                              {(() => {
                                const value = this.getRateRecommended();
                                const valid = value >= rate;

                                return (
                                  <Statistic
                                    title={
                                      <span>
                                        рекомендуемая<br />
                                        <span aria-label="доходность">дох-ть</span>
                                      </span>
                                    }
                                    value={round(value, 3)}
                                    // formatter={node =>
                                    //   // TODO: подставить значение из рекомендованного графика
                                    //   <Tooltip title={<span>Рекомендуется заработать<br /> {2} руб.</span>}>
                                    //     {node}
                                    //   </Tooltip>
                                    // }
                                    valueStyle={{
                                      color: `var( ${valid ? "--success-color" : "--danger-color"} )`
                                    }}
                                    prefix={
                                      valid ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                                    }
                                    suffix="%"
                                  />
                                );
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
                realData,
                daysInOrder,
                currentDay,
                directUnloading,
                passiveIncomeTools,
                currentPassiveIncomeToolIndex
              } = this.state;

              let iterations = Math.min(this.state.iterations * (directUnloading ? 1 : 2), 100);

              const lastFilledDay = this.getLastFilledDayNumber();
              const rate  = this.getRate();
              const rateRecommended  = this.getRateRecommended();
              
              const getRealRate = () => {
                let value = (data[currentDay - 1].scale != null) ? data[currentDay - 1].scale : 0;
                
                if (data[currentDay - 1].customIncome != null) {
                  value = data[currentDay - 1].customIncome / data[currentDay - 1].depoStartTest * 100;
                }
                
                const iterationsList = this.getIterationsList();
                if (iterationsList && iterationsList.length) {
                  value = iterationsList.map(el => el.percent).reduce((prev, curr) => prev + curr);
                }

                return value;
              };

              const isChanged = dayData => {
                let changed = false;
                for (const p of ["scale", "customIncome", "payment", "payload", "iterations"]) {
                  changed = changed || (dayData[p] != null);
                }
                return changed;
              };

              const placeholder = "—";
              const onBlur = (prop, val) => {
                console.log(prop, val);
                if (val === "") {
                  val = undefined;
                }

                if (!realData[currentDay]) {
                  realData[currentDay] = {};
                }

                realData[currentDay][prop] = val;

                if (prop === "customIncome") {
                  let scale = val;
                  if (val != null) {
                    scale = (val / data[currentDay - 1].depoStartTest) * 100;
                  }

                  data[currentDay - 1].scale = scale;
                  realData[currentDay].scale = scale;
                }
                else if (prop === "scale") {
                  if (val != null) {
                    data[currentDay - 1].customIncome = Math.round(data[currentDay - 1].depoStartTest * val / 100);
                  }
                }

                data[currentDay - 1][prop] = val;
                
                // Если заполнен хотя бы один инпут, то считаем, что день изменен 
                const changed = isChanged(data[currentDay - 1]);
                data[currentDay - 1].changed = !val ? changed : true;

                // console.log(data[currentDay - 1], realData[currentDay]);
                
                this.setState({ data, realData }, () => {
                  const { days, mode } = this.state;
                  this.updateData(days[mode], false)
                    .then(() => this.updateChart());
                });

              };

              const ArrowRight = props => {
                const reversed = Boolean(props.reversed);
                return (
                  <svg 
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                    style={{ transform: `scaleX(${reversed ? 1 : -1})` }}
                    fill="currentColor"
                  >
                    <defs/>
                    <path d="M492 236H68.4l70.2-69.8a20 20 0 10-28.2-28.4L5.9 241.8a20 20 0 000 28.4l104.5 104a20 20 0 0028.2-28.4L68.4 276H492a20 20 0 100-40z"/>
                  </svg>
                );
              }

              return (
                <section className="section5">
                  <h2 className="section5__title">Результат</h2>

                  <div className="section5-controls">
                    <button 
                      disabled={currentDay == 1} 
                      data-type="link"
                      onClick={() => this.setCurrentDay(currentDay - 1)}>
                      <ArrowRight reversed />
                      Предыдущий день
                    </button>

                    День {currentDay}

                    <button 
                      disabled={currentDay == this.state.days[this.state.mode]}
                      data-type="link"
                      onClick={() => this.setCurrentDay(currentDay + 1)}>
                      Следующий день
                      <ArrowRight />
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

                        const income = this.getRealIncome(day, data, null, null, 0);
                        let success = income >= Math.round(data[day - 1].goal);
                        let failed = income <= 0;

                        // let success = el.scale >= round(rate, 3);
                        // let failed = el.scale <= 0;
                        
                        // if (el.customIncome != null) {
                        //   success = el.customIncome >= Math.trunc(data[day - 1].goal);
                        //   failed = el.customIncome <= 0;
                        // }

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
                        <span>
                          {(() => {
                            const value = getRealRate();

                            return (
                              data[currentDay - 1].changed
                                ? <Value format={val => formatNumber(round(val, 3))}>{value}</Value>
                                : "—"
                            )
                          })()}
                          &nbsp;/&nbsp;
                          { round(rate, 3) }
                        </span>
                        &nbsp;
                        <span>
                          (
                          {(() => {
                            const value = this.getRealIncome(null, null, null, null, 0);

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
                            "+" + formatNumber(Math.round(data[currentDay - 1].goal))
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
                      <ArrowRight reversed />
                      Предыдущая неделя
                    </button>

                    <Button
                      className={
                        []
                          .concat("section5__save")
                          .concat(daysInOrder && (currentDay > lastFilledDay + 1) ? "section5__save--hidden" : "")
                          .concat("custom-btn")
                          .concat(
                            (data[currentDay - 1].changed || !data[currentDay - 1].collapsed)
                              ? "custom-btn--filled"
                              : ""
                          )
                          .join(" ")
                          .trim()
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
                      <ArrowRight />
                    </button>

                  </div>

                  <div 
                    id="result"
                    className="section5-collapse"
                    hidden={data[currentDay - 1].collapsed}
                  >
                    <div className="section5-content">

                      <Col className="card section5-col">
                        <div className="section5-row">
                          <div className="section5-l">
                            <span aria-label="Доходность">Дох-ть</span> за день
                          </div>
                          <div className="section5-r">
                            {(() => {
                              const prop = "scale";
                              let value = data[currentDay - 1][prop];
                              if (value == null) {
                                value = (data[currentDay - 1].customIncome / data[currentDay - 1].depoStartTest) * 100;
                              }

                              const disabled = false;
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  disabled={disabled}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null
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
                              {round(rate, 3)}%
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
                              const max = Math.trunc(data[currentDay - 1].depoStartTest * .8);
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null
                                      ? value
                                      : ""
                                  }
                                  round="true"
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onChange={(e, val, jsx) => {
                                    let errMsg = "";
                                    if (Number(val) >= max) {
                                      errMsg = "Вывод не может превышать 80% от текущего депозита";
                                    }
                                    jsx.setState({ errMsg });
                                  }}
                                  onBlur={val => {
                                    if (val) {
                                      if (Number(val) >= max) {
                                        val = max;
                                      }
                                    }
                                    onBlur(prop, typeof val == "string" ? val : Number(val));
                                  }}
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
                              const max = Math.trunc(this.getDepoEnd() - data[currentDay - 1].depoStartTest);
                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null 
                                      ? value 
                                      : ""
                                  }
                                  round="true"
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onChange={(e, val, jsx) => {
                                    let errMsg = "";
                                    if (val >= max) {
                                      errMsg = "Пополнение не может превышать разницу между текущим и целевым депозитом";
                                    }
                                    jsx.setState({ errMsg });
                                  }}
                                  onBlur={val => {
                                    if (val) {
                                      if (Number(val) >= max) {
                                        val = max;
                                      }
                                    }
                                    onBlur(prop, typeof val == "string" ? val : Number(val));
                                  }}
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

                      <Col className="card section5-col">
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
                              let value = data[currentDay - 1][prop];
                              if (value == null) {
                                value = Math.round(data[currentDay - 1].depoStartTest * data[currentDay - 1].scale / 100);
                              }
                                
                              const min = -data[currentDay - 1].depoStartTest;
                              const disabled = false;

                              return (
                                <NumericInput
                                  key={value + Math.random()}
                                  disabled={disabled}
                                  defaultValue={
                                    data[currentDay - 1].changed && value != null
                                      ? value
                                      : ""
                                  }
                                  round="true"
                                  placeholder={placeholder}
                                  format={formatNumber}
                                  onChange={(e, val, jsx) => {
                                    let errMsg = "";
                                    if (val <= min && mode == 0) {
                                      errMsg = "Нельзя вывести больше, чем депозит на начало дня";
                                    }
                                    jsx.setState({ errMsg });
                                  }}
                                  onBlur={val => {
                                    if (val) {
                                      if (mode == 0) {
                                        val = Math.max(Number(val), min + 1);
                                      }
                                    }
                                    onBlur(prop, typeof val == "string" ? val : Number(val));
                                  }}
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
                                    value != null
                                      ? value
                                      : ""
                                  }
                                  round="true"
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

                      <Col className="card section5-col section5-col--no-padding">
                        {/* {(() => {
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
                        })()} */}

                        <div className="iterations">
                          <ol className="iterations-list">
                            {(() => {
                              const onChange = (iterationsList = []) => {
                                const iterations = iterationsList.filter(v => v.percent != null || v.income != null);

                                let scale;
                                let iterationsLength;
                                if (iterations.length) {
                                  scale = iterations.map(el => el.percent).reduce((prev, curr) => prev + curr);
                                  iterationsLength = iterations.length
                                }

                                data[currentDay - 1].scale = scale;
                                if (!realData[currentDay]) {
                                  realData[currentDay] = {};
                                }
                                realData[currentDay].scale = scale;
                                data[currentDay - 1].iterations = iterationsLength;
                                
                                const changed = isChanged(data[currentDay - 1]);
                                data[currentDay - 1].changed = changed;

                                this.setState({ data, realData }, () => {
                                  const { days, mode } = this.state;
                                  this.updateData(days[mode], false)
                                    .then(() => this.updateChart());
                                });
                              };

                              const iterationsList = data[currentDay - 1].iterationsList;

                              return iterationsList && iterationsList
                                .map((listItem, index) =>
                                  <li key={index} className="iterations-list-item">
                                    <span className="iterations-list-item__number">
                                      {index + 1}.
                                    </span>
                                    <NumericInput
                                      className="iterations-list-item__input-left"
                                      key={Math.random()}
                                      defaultValue={listItem.percent != null ? listItem.percent : ""}
                                      suffix="%"
                                      format={formatNumber}
                                      onBlur={val => {
                                        // if (val === "") {
                                        //   val = 0;
                                        // }

                                        if (!data[currentDay - 1].iterationsList[index]) {
                                          data[currentDay - 1].iterationsList[index] = {};
                                        }
                                        
                                        let income;
                                        let percent;
                                        if (val !== "") {
                                          income  = Math.round(data[currentDay - 1].depoStart * (val / 100));
                                          percent = val;
                                        }
                                        
                                        data[currentDay - 1].iterationsList[index].income  = income;
                                        data[currentDay - 1].iterationsList[index].percent = percent;
                                        this.setState({ data });
                                        onChange(data[currentDay - 1].iterationsList);
                                      }}
                                    />
                                    <span className="iterations-list-item__separator">
                                      /
                                  </span>
                                    <NumericInput
                                      className="iterations-list-item__input-right"
                                      key={Math.random()}
                                      defaultValue={listItem.income != null ? listItem.income : ""}
                                      format={formatNumber}
                                      round="true"
                                      onBlur={val => {
                                        // if (val === "") {
                                        //   val = 0;
                                        // }

                                        if (!data[currentDay - 1].iterationsList[index]) {
                                          data[currentDay - 1].iterationsList[index] = {};
                                        }

                                        let income;
                                        let percent;
                                        if (val !== "") {
                                          income  = val;
                                          percent = round((val / data[currentDay - 1].depoStart) * 100, 3);
                                        }

                                        data[currentDay - 1].iterationsList[index].income  = income;
                                        data[currentDay - 1].iterationsList[index].percent = percent;
                                        this.setState({ data });
                                        onChange(data[currentDay - 1].iterationsList);
                                      }}
                                    />
                                    <CrossButton 
                                      className="iterations-list-item__delete"
                                      onClick={e => {
                                        data[currentDay - 1].iterationsList.splice(index, 1);
                                        this.setState({ data });
                                        onChange(data[currentDay - 1].iterationsList);
                                      }}
                                    />
                                  </li>
                                )
                            })()}
                          </ol>
                          <button 
                            className="iterations-button" 
                            aria-label="Добавить итерацию"
                            onClick={() => {
                              data[currentDay - 1].iterationsList.push(0);
                              this.setState({ data }, () => {
                                const list = document.querySelector(".iterations-list");
                                list.scrollTop = 9999;
                              });
                            }}
                          >
                            + итерация
                          </button>
                        </div>
                      </Col>

                    </div>
                    {/* /.section5-content */}

                    {(() => {
                      const income = this.getRealIncome(null, null, null, null, 0);;
                      let percent = income / Math.round(data[currentDay - 1].goal);
                      if (income <= 0) {
                        percent = 0;
                      }

                      const depoEnd = Math.round(data[currentDay - 1].depoStartTest + data[currentDay - 1].goal);

                      return (
                        <footer className="section5-footer">
                          <h3 className="section5-footer-title">Дневная цель</h3>

                          {(() => {
                            let real = income;

                            const plan = data[currentDay - 1].goal;

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
                              const value = getNthDayRealIncome(currentDay);

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
              label="Введите название сохранения"
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

        <Config
          id="config"
          title="Инструменты"
          template={template}
          tools={this.state.tools}
          toolsInfo={this.state.toolsInfo}
          customTools={this.state.customTools}
          onChange={customTools => this.setState({ customTools })}
        />
        {/* Инструменты */}

        <Config
          id="passive-income-config"
          title="Инструменты пассивного дохода"
          template={{
            name: "Инструмент",
            rate: 0
          }}
          tools={[]}
          currentToolIndex={this.state.currentPassiveIncomeToolIndex[this.state.mode]}
          toolsInfo={[
            { name: "Название", prop: "name", defaultValue: "Инструмент" },
            { name: "Ставка",   prop: "rate", defaultValue: 0            },
          ]}
          customTools={this.state.passiveIncomeTools}
          onChange={passiveIncomeTools => this.setState({ passiveIncomeTools })}
        />
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