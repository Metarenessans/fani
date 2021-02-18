import React, { Component } from "react"
const { Provider, Consumer } = React.createContext();
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
  SettingFilled} from "@ant-design/icons"

import {
  merge,
  cloneDeep as clone
} from "lodash"
import objToPlainText from "object-plain-string"

/* API */
import fetch             from "../../../common/api/fetch"
import { applyTools }    from "../../../common/api/fetch/tools"
import { fetchInvestorInfo, applyInvestorInfo } from "../../../common/api/fetch/investor-info"
import fetchSavesFor     from "../../../common/api/fetch-saves"
import fetchSaveById     from "../../../common/api/fetch/fetch-save-by-id"

import extRate             from "../../../common/utils/rate"
import rateRecommended     from "../../../common/utils/rate-recommended"
import fallbackProp        from "../../../common/utils/fallback-prop"
import formatNumber        from "../../../common/utils/format-number"
import num2str             from "../../../common/utils/num2str"
import params              from "../../../common/utils/params"
import round               from "../../../common/utils/round"
import roundUp             from "../../../common/utils/round-up"
import typeOf              from "../../../common/utils/type-of"
import { Tools, template } from "../../../common/tools"

import Iteration from "./utils/iteration"
import Data      from "./utils/data"

import Stack           from "./components/stack"
import BigNumber       from "./components/BigNumber"
import Config          from "../../../common/components/config";
import CustomSelect    from "../../../common/components/custom-select"
import CustomSlider    from "./components/custom-slider"
import Header          from "./components/header"
import ModeToggle      from "./components/mode-toggle"
import NumericInput    from "../../../common/components/numeric-input"
import Riskometer      from "./components/riskometer"
import Value           from "./components/value"
import ToolSelect      from "./components/tool-select"
import {
  Chart,
  createChart,
  updateChart,
  updateChartTicks,
} from "./components/chart"
import { Dialog, dialogAPI } from "../../../common/components/dialog"

import "../sass/style.sass"

import IterationsContainer from "./components/iterations-container"

let lastRealData = {};
let saveToDonwload;

const shouldLoadFakeSave = false;
const chartVisible       = true;

class App extends Component {
  
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

      loading: false,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },

      // TODO: в идеале realData не нужна, все значения из факта можно хранить в data
      realData: {},

      /**
       * Начальный депозит
       * @type {Array<Number>}
       */
      depoStart: [ depoStart, depoStart ],

      // НДФЛ
      tax: 13,
      
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

      // Реальная длина date
      dataLength: days,

      extraDays:  0,
      daysDiff:   null,
      
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

      customTools: [],
      currentToolCode: "SBER",
      
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

      /**
       * Режим масштаба графика в днях
       */
      chartScaleMode: 260,

      // -----
      // Flags
      // -----
      saved: false,
      changed: false,

      directUnloading: true,

      // TODO: remove?
      isSafe: true,

      /**
       * Включен ли режим LONG TODO: узнать получше о том, что это и как это назвать на английском
       */
      isLong: true,

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
        
        // -----
        // Tools
        // -----
        tools: [],

        /**
         * Индекс текущего сохранения
         */
        currentSaveIndex: 0,
      }
    );

    this.state.data = new Data();
    this.state.data.build(this.getDataOptions());

    this.state.loading = true;

    // Bindings
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.applyTools        = applyTools.bind(this);
    if (dev) {
      this.fetchSaveById = () => {
        console.log('executing custom fetchSaveById');
        return new Promise((resolve) => {
          resolve({
            data: {
              id: 1122,
              name: '0.89',
              dateCreate: 1610349649,
              static: '{"depoStart":[7480000,7480000],"depoEnd":[74888180,74888180],"tax":13,"currentDay":6,"days":[260,260],"dataLength":260,"dataExtendedFrom":null,"minDailyIncome":[0.89,0.89],"payment":[0,0],"paymentInterval":[20,20],"payload":[0,0],"payloadInterval":[20,20],"passiveIncome":[0,0],"passiveIncomeTools":[{"name":"ОФЗ 26214","rate":4.99},{"name":"ОФЗ 26205","rate":5.78},{"name":"ОФЗ 26217","rate":5.99},{"name":"ОФЗ 26209","rate":6.26},{"name":"ОФЗ 26220","rate":6.41}],"currentPassiveIncomeToolIndex":[-1,-1],"mode":1,"customTools":[],"currentToolCode":"MMM","current_date":"#"}',
              dynamic: '[{"d":1,"rr":null,"pmt":0,"pld":0,"c":true,"i":9,"il":[{"percent":0.04},{"percent":0.481},{"percent":0.735},{"percent":0.107},{"percent":0.187},{"percent":0.281},{"percent":0.307},{"percent":0.053},{"percent":0.08}],"pi":0,"du":true},{"d":2,"s":-1.307,"rr":null,"pmt":0,"pld":0,"c":true,"i":1,"il":[{"percent":-1.307}],"pi":0,"du":true},{"d":3,"rr":null,"pmt":0,"pld":0,"c":true,"i":8,"il":[{"percent":1.404},{"percent":0.053},{"percent":0.053},{"percent":0.053},{"percent":0.093},{"percent":0.119},{"percent":0.106},{"percent":0.159}],"pi":0,"du":true},{"d":4,"rr":null,"pmt":0,"pld":0,"c":true,"i":4,"il":[{"percent":0.389},{"percent":0.415},{"percent":0.13},{"percent":0.234}],"pi":0,"du":true},{"d":5,"rr":null,"ci":71000,"c":true,"i":9,"il":[{"percent":1.2830573305940915},{"percent":0.2566114661188183},{"percent":0.02566114661188183},{"percent":0.23095031950693648},{"percent":0.05132229322376366},{},{"percent":0.10264458644752732},{"percent":0.06415286652970457},{"percent":-1.1034293043109187}],"pi":0,"du":true},{"d":6,"rr":null,"ci":47000,"c":true,"i":12,"il":[{"percent":0.038144237092371615},{"percent":0.06357372848728601},{"percent":0.07628847418474323},{"percent":0.038144237092371615},{"percent":0.02542949139491441},{"percent":0.02542949139491441},{"percent":0.05085898278982882},{"percent":0.02542949139491441},{"percent":0.10171796557965763},{"percent":0.12714745697457203},{"percent":0.02542949139491441},{}],"pi":0,"du":true}]',
            }
          })
        })
      };
    }
    else {
      this.fetchSaveById = fetchSaveById.bind(this, "Trademeter");
    }

    this.incomePersantageCustomInput = React.createRef();
    this.withdrawalInput             = React.createRef();
  }

  getDataOptions() {
    const {
      mode,
      depoStart,
      dataLength,
      withdrawal,
      withdrawalInterval,
      payload,
      payloadInterval,
      depoPersentageStart
    } = this.state;
    const rate = this.getRate();

    return {
      $start:           depoStart[mode],
      $percent:         depoPersentageStart,
      $length:          dataLength,
      $rate:            rate,
      $rateRequired:    null,
      $payment:         withdrawal[mode],      // Вывод
      $paymentInterval: withdrawalInterval[mode],
      $payload:         payload[mode],         // Пополнение
      $payloadInterval: payloadInterval[mode],
      $tool:            this.getCurrentTool()
    };
  }

  componentDidMount() {
    this.bindEvents();

    if (chartVisible) {
      createChart.call(this);
    }

    this.fetchInitialData();
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

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  loadFakeSave() {
    this.setState({ loading: true });

    setTimeout(() => {
      let { saves } = this.state;
      let save = require("./api/fake-save.js").default;
  
      const index = 0;
      this.extractSave(save);
  
      saves[index] = {
        id:      save.id,
        name:    save.name,
      };
      this.setState({ 
        saves, 
        currentSaveIndex: index + 1,
        loading: false
      });
    }, 1500);
  }

  fetchInvestorInfo() {
    fetchInvestorInfo()
      .then(this.applyInvestorInfo)
      .then(response => {
        let { deposit } = response.data;
        let { depoStart, depoEnd } = this.state;

        // TODO: simplify
        deposit = deposit || 10000;
        deposit = (deposit > 10000) ? deposit : 10000;
        depoStart[0] = deposit;
        depoStart[1] = deposit;
        if (deposit >= depoEnd) {
          depoEnd = deposit * 2;
        }

        return this.setStateAsync({ depoStart, depoEnd });
      })
      .then(this.recalc)
      .catch(error => console.error(error))
  }

  fetchTools() {
    for (let request of [
      "getFutures",
      "getTrademeterInfo"
    ]) {
      fetch(request)
        .then(this.applyTools)
        .then(() => this.updateDepoPersentageStart())
        .catch(error => console.error(error));
    }
  }

  fetchSaves() {
    fetchSavesFor("trademeter")
      .then(response => {
        const saves = response.data;
        return new Promise(resolve => this.setState({ saves, loading: false }, () => resolve(saves)))
      })
      .then(saves => {
        if (saves.length) {
          const pure = params.get("pure") === "true";
          if (!pure) {
            const save = saves[0];
            const { id } = save;

            this.setState({ loading: true });
            this.fetchSaveById(id).then(response => this.extractSave(response.data));
          }
        }
      })
      .catch(reason => this.showAlert(`Не удалось получить сохранения! ${reason}`));
  }

  fetchInitialData() {
    this.fetchInvestorInfo();
    this.fetchTools();
    if (dev) {
      if (shouldLoadFakeSave) {
        this.loadFakeSave();
      }
      return;
    }
    this.fetchSaves();
  }

  showAlert(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  updateDepoPersentageStart() {
    const { currentDay, data } = this.state;

    const nearest = (n, step) => step * Math.round(n / step);

    return new Promise((resolve, reject) => {
      let depoPersentageStart = this.getCurrentTool().guarantee / data[currentDay - 1].depoStart * 100;
      if (this.state.depoPersentageStart) {
        depoPersentageStart = nearest(this.state.depoPersentageStart, depoPersentageStart);
      }

      if (depoPersentageStart > 100) {
        depoPersentageStart = 100;
      }
      else if (depoPersentageStart < 0) {
        depoPersentageStart = 0;
      }

      this.setState({ depoPersentageStart }, () => {
        this.updateData()
          .then(resolve)
          .catch(reject);
      });
    });

  }

  packSave() {
    let {
      tax,
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
      currentToolCode
    } = this.state;

    const json = {
      static: {
        depoStart:                     [ this.getDepoStart(0), this.getDepoStart(1) ],
        depoEnd:                       [ this.getDepoEnd(0), mode == 1 ? this.getDepoEnd(1) : null ],
        tax,
        currentDay:                    currentDay, 
        days:                          [ days[0], days[1] ],
        dataLength:                    Math.max( days[mode], data.length ),
        dataExtendedFrom:              data.extendedFrom,
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
        currentToolCode,
        // TODO: do we need this?
        current_date:                  "#"
      },
      dynamic: data
        .slice()
        .filter(item => item.changed)
        .map((item, index) => ({
          d:   item.day,
          s:   item.rate,
          rr:  item.rateRequired,
          ci:  item.income,
          pmt: item.payment,
          pld: item.payload,
          c:   item.changed,
          i:   item.iterations.length,
          il:  item.iterations,
          pi: (() => {
            let val = data[index].depoEnd;
            let tool = passiveIncomeTools[currentPassiveIncomeToolIndex];
            if (tool) {
              let percent = tool.rate / 365 * (365 / 260) / 100;
              return Math.round(val * percent)
            }
            return 0;
          })(),
          du: directUnloading
        }))
    };

    console.log("Save packed!", json);
    return json;
  }

  validateSave() {
    let valid = true;

    try {
    }
    catch (e) {
      valid = false;
    }

    return valid;
  }

  extractSave(save) {
    const onError = e => {
      this.showAlert(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    const { depoEnd, saves } = this.state;

    const getSaveIndex = save => {
      for (let i = 0; i < saves.length; i++) {
        let currentSave = saves[i];
        if (Object.keys(currentSave).every(key => currentSave[key] == save[key])) {
          return i;
        }
      }
      return -1;
    };

    saveToDonwload = { ...save };

    const savePure = clone(save);
    delete savePure.static;
    delete savePure.dynamic;

    let staticParsed;
    let dynamicParsed;

    let state = {};
    let failed = false;

    let currentDay = 1;

    try {
      staticParsed = JSON.parse(save.static);
      dynamicParsed = JSON.parse(save.dynamic);

      if (true) {
        console.log("parsed static", staticParsed);
        console.log("parsed dynamic", dynamicParsed);
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

      state.tax = this.initialState.tax;
      if (staticParsed.tax != null) {
        state.tax = staticParsed.tax;
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

      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tools.create(tool, { investorInfo: this.state.investorInfo }));
      
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

      
      state.dataLength = staticParsed.dataLength;
      if (state.dataLength == null) {
        state.dataLength = Math.max(state.days[m], dynamicParsed.length);
      }
      
      const minRate = staticParsed.minDailyIncome[m];
      state.data = this.buildData(state.dataLength, true, 0, { $rateRequired: minRate });
      state.data.extendedFrom = state.dataLength > state.days[m] ? state.days[m] : null;

      state.currentDay = 1;
      state.id = save.id;
      state.saved = true;
      state.loading = false;
      state.currentSaveIndex = getSaveIndex(savePure) + 1;
    }
    catch (e) {
      failed = true;
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    console.log('parsing save finished!', state);
    this.setState(state, () => {
      if (!failed) {
        this.overrideData(dynamicParsed)
          .then(() => this.updateData())
          .then(() => chartVisible && updateChart.call(this))
          .then(() => this.setCurrentDay(currentDay))
          .catch(err => this.showAlert(err));
      }
    });
  }

  buildData(length = 0, rebuild = false, start = 0, options = {}) {
    let { data } = this.state;

    if (rebuild) {
      data = new Data();
    }

    const settings = { ...this.getDataOptions(), $length: length, $startFrom: start, ...options };
    return data.build(settings);
  }

  updateData(length, rebuild = false, start = 0) {
    if (length == null) {
      length = this.state.dataLength;
    }

    return new Promise(resolve => {
      let { days } = this.state;
      const data = this.buildData(length, rebuild, start);
      this.setState({ data, days }, () => resolve());
    })
  }

  overrideData(override = []) {
    const { mode, days, data } = this.state;

    return new Promise(resolve => {
      for (let i = 0; i < override.length; i++) {
        let item = override[i];

        let d = fallbackProp(item, ["day", "d"], i + 1);
        data[d - 1].day = d;

        let changed = fallbackProp(item, ["changed", "c"], false);
        data[d - 1].changed = changed;

        if (!changed) {
          continue;
        }

        let scale;
        if (changed) {
          scale = fallbackProp(item, ["rate", "scale", "s"]);
          if (scale != null) {
            scale = round(scale, 3);
          }
        }
        data[d - 1].scale = scale;

        let rateRequired;
        if (changed && d > days[mode]) {
          rateRequired = fallbackProp(item, ["rr"]);
        }
        data[d - 1].rateRequired = rateRequired;

        let payment;
        if (changed) {
          payment = fallbackProp(item, ["payment", "pmt"]);
        }
        data[d - 1].payment = payment;

        let payload;
        if (changed) {
          payload = fallbackProp(item, ["payload", "pld"]);
        }
        data[d - 1].payload = payload;

        let income = fallbackProp(item, ["income", "customIncome", "ci"]);
        if (income == null || typeof income != "number") {
          // data[d - 1].income = Math.round(data[d - 1].depoStart * scale / 100);
          // data[d - 1].scale = null;
        }
        else {
          data[d - 1].income = income;
          data[d - 1].scale = null;
        }

        data[d - 1].iterations = fallbackProp(item, ["iterations", "iterationsList", "il"]);
        if (typeof data[d - 1].iterations == "object") {
          const { iterations } = data[d - 1];
          
          if (iterations.length > 1) {
            data[d - 1].iterations = data[d - 1].iterations.map(it => new Iteration(
              it.percent, it.startTime, it.endTime
            ));
            data[d - 1].scale = iterations.calculatedRate;
          }
          else {
            let its = [new Iteration()];

            let startTime;
            let endTime;
            if (iterations[0]) {
              startTime = iterations[0].startTime;
              endTime   = iterations[0].endTime;
            }

            if (data[d - 1].scale != null) {
              its = [ new Iteration(data[d - 1].scale) ]; 
            }
            else {
              const it = new Iteration(iterations[0]?.percent);
              if (income != null) {
                it.rate   = null;
                it.income = income;
              }
              its = [it]; 
            }

            its[0].startTime = startTime;
            its[0].endTime = endTime;

            data[d - 1].iterations = its;
          }

        }
        else {
          data[d - 1].iterations = [];
        }

        data[d - 1].passiveIncome = fallbackProp(item, ["passiveIncome", "pi"], 0);
        data[d - 1].directUnloading = fallbackProp(item, ["directUnloading", "du"]);
      }

      this.setState({ data, daysInOrder: data.hasNoGaps }, () => resolve());
    })
  }

  recalc(rebuild = true) {

    // const period = days[mode];
    return new Promise((resolve, reject) => {
      this.updateData(null, rebuild)
        .then(() => chartVisible && updateChart.call(this))
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  checkFn(withdrawal, depoStart, days, percentage) {
    const { mode, withdrawalInterval, incomePersantageCustom } = this.state;
    depoStart  = +depoStart;
    withdrawal = +withdrawal;

    if (!percentage) {
      percentage = mode == 0 ? 15 : incomePersantageCustom;
    }
    percentage = +(percentage / 100);

    if (percentage > .3) {
      return ["", "Слишком большая доходность!"];
    }

    let err = ["Слишком большой вывод!", "Слишком маленькая доходность!"];

    if (mode == 0) {
      if (
        (withdrawal > (depoStart * percentage)) || 
        (withdrawal > (depoStart * 0.01) && days == 2600)
      ) {
        return err;
      }
    }
    else {
      const max = this.getMaxPaymentValue(withdrawalInterval[mode], percentage * 100);
      if (withdrawal > max) {
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

  getMaxPaymentValue(frequency, rate = this.getRate()) {
    const { withdrawalInterval, depoStart, mode } = this.state;

    frequency = frequency || withdrawalInterval[mode];

    let start = depoStart[mode];

    let max = 0
    for (let i = 0; i < frequency; i++) {
      let earned = start * (rate / 100);

      max += earned

      start += earned;
    }

    // const max = data
    //   .slice(0, frequency)
    //   .map(d => d.goal)
    //   .reduce((prev, curr) => prev + curr);

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

  // API

  reset() {
    return new Promise(resolve => {
      this.setStateAsync( clone(this.initialState) )
        .then(() => this.updateDepoPersentageStart())
        .then(() => {
          // Check if depoStart is more than depoEnd
          let { mode, depoStart, depoEnd } = this.state;
          if (depoStart[mode] >= depoEnd) {
            depoEnd = depoStart[mode] * 2;
          }

          return this.setState({ depoEnd, id: null }, () => resolve());
        })
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

      fetch("addTrademeterSnapshot", "POST", data)
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
      fetch("updateTrademeterSnapshot", "POST", data)
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
      fetch("deleteTrademeterSnapshot", "POST", { id })
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
              .then(response => this.extractSave(response.data))
              .catch(error => this.showAlert(error));
          }
          else {
            this.reset()
              .then(() => this.recalc())
              .catch(err => this.showAlert(err));

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
    this.setStateAsync({ currentDay })
      .then(() => this.updateDepoPersentageStart())
      .then(() => {
        const { data, chartScaleMode } = this.state;
        if (chartScaleMode == "1d") {
          let actualScale = 1;
          let min = Math.floor(currentDay - (actualScale / 2));
          let max = Math.floor(currentDay + (actualScale / 2));
          if (min < 0) {
            max += -min;
            min += -min;
          }

          scaleStart = min / data.length
          scaleEnd   = max / data.length;
        }
      })
      .then(() => chartVisible && updateChartTicks.call(this));
  }
  
  // ==================
  // Getters
  // ==================

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

  getRateFull(mode) {
    const {
      depoEnd,
      payloadInterval,
      withdrawalInterval,
      incomePersantageCustom,
    } = this.state;
    mode = mode || this.state.mode;

    const depoStart = this.state.depoStart[mode];
    const withdrawal = this.state.withdrawal[mode];
    const payload = this.state.payload[mode];
    const days = this.state.days[mode];

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
  
  getRateRecommended(options = {}) {
    const {
      mode,
      data,
      payloadInterval,
      withdrawalInterval,
      dataLength
    } = this.state;

    if (!options.length) {
      options.length = dataLength;
    }

    const depoStart  = this.state.depoStart[mode];
    const withdrawal = this.state.withdrawal[mode];
    const payload    = this.state.payload[mode];

    const rate = this.getRateFull();

    const realData = data
      .filledDays
      .map(item => ({
        scale:   item.calculatedRate / 100,
        payment: item.payment || 0,
        payload: item.payload || 0,
      }));
    
    const recommendedData = rateRecommended(
      depoStart,
      Math.round( this.getDepoEnd() ),
      withdrawal,
      withdrawalInterval[mode],
      payload,
      payloadInterval[mode],
      options.length,
      withdrawalInterval[mode],
      payloadInterval[mode],
      0,
      realData,
      {
        rateSuggest: rate / 100
      }
    );

    if (recommendedData.extraDays != this.state.extraDays) {
      this.setState({ extraDays: recommendedData.extraDays });
    }

    if (recommendedData.daysDiff != this.state.daysDiff) {
      this.setState({ daysDiff: recommendedData.daysDiff });
    }

    let value = recommendedData.rate * 100;
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

  getCurrentToolIndex() {
    let { currentToolCode, currentToolIndex } = this.state;
    const tools = this.getTools();
    // Обратная совместимость для сейвов, где указан только currentSaveIndex
    if (currentToolIndex != null) {
      // Если индекс выбранного инструмента превышает кол-во инструментов
      // -- выбираем последний возможный инструмент
      return Math.min(currentToolIndex, tools.length - 1);
    }

    return Tools.getToolIndexByCode(tools, currentToolCode);
  }

  /**
   * Получить выбранный торговый инструмент
   */
  getCurrentTool() {
    const tools = this.getTools();
    return tools[this.getCurrentToolIndex()] || Tools.create();
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
    const { data, days, depoStart, depoEnd } = this.state;
    mode = mode || this.state.mode;

    if (mode === 0) {
      return depoEnd;
    }
    else {
      let depo = depoStart[mode];
      if (data.length) {
        depo += data
          .slice(0, days[mode])
          .map(d => d.incomePlan)
          .reduce((acc, curr) => acc + curr);
      }
      return depo;
    }
  }

  // TODO: оптимизировать
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
    const { saves, currentSaveIndex } = this.state;
    let title = "Трейдометр";

    if (saves.length && saves[currentSaveIndex - 1]) {
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
      return [];
    }

    return data[day - 1].iterationsList.filter(v => v.percent != null || v.income != null);
  }

  getRealIncome(day, data, depoStart, rate, fallbackRate = this.getRate(), pure = false) {
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

    // let value = Math.round( depoStart * (scale / 100) );
    let value = depoStart * (scale / 100);

    if (data[day - 1].customIncome != null ) {
      value = data[day - 1].customIncome;
    }

    const iterationsList = this.getIterationsList(day, data);
    if (iterationsList && iterationsList.length) {
      value = iterationsList
        .map(el => el.getIncome( data[day - 1].depoStartTest ))
        .reduce((prev, curr) => prev + curr);
    }

    if (realData[day]) {
      if (!pure) {
        value += realData[day].payload != null ? realData[day].payload : 0;
        value -= realData[day].payment != null ? realData[day].payment : 0;
      }
    }
    else {
      value += data[day - 1].payloadPlan;
      value -= data[day - 1].paymentPlan;
    }
    
    return value;
  }

  render() {
    let {
      mode,
      data,
      currentDay,
      isLong,
      saved,
      extraDays,
      daysDiff,
    } = this.state; 

    const rate = this.getRate();
    const rateRecomm = this.getRateRecommended();

    const placeholder = "—";

    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">
            <Header
              title={this.getTitle()}
              onSaveChange={currentSaveIndex => {
                const { saves } = this.state;

                this.setState({ currentSaveIndex });

                if (currentSaveIndex === 0) {
                  this.reset()
                    .then(() => this.recalc())
                    .catch(error => console.warn(error));
                }
                else {
                  const id = saves[currentSaveIndex - 1].id;
                  this.setState({ loading: true });
                  this.fetchSaveById(id)
                    .then(response => this.extractSave(response.data))
                    .catch(error => this.showAlert(error));
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
                  let state = {
                    extraDays: 0,
                    daysDiff:  null,
                  };

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
                      .then(() => updateChart.call(this));
                  });
                }}
              />
            </Header>

            {true && (
              <div className="container">
                <section className="controls">
                  <Col className="controls-col1">
                    <div className="card controls-card1">
                      <h2 className="visually-hidden">Ввод значений</h2>

                      {/* Начальный депозит */}
                      <label className="input-group">
                        <span className="input-group__label">Начальный депозит</span>
                        <NumericInput
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
                              this.incomePersantageCustomInput?.current?.setErrorMsg(errMessages[1]);
                            }
                            this.withdrawalInput?.current?.setErrorMsg(errMessages[0]);
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
                              ref={this.incomePersantageCustomInput}
                              disabled={this.state.saved}
                              max={30}
                              className="input-group__input"
                              defaultValue={this.state.incomePersantageCustom}
                              placeholder={(this.state.minDailyIncome).toFixed(3)}
                              unsigned="true"
                              onBlur={val => {
                                const { days, withdrawal, depoStart, mode } = this.state;

                                let percentage = +val;
                                if (isNaN(percentage)) {
                                  percentage = undefined;
                                }

                                let errMessages = this.checkFn(withdrawal[mode], depoStart[mode], days[mode], percentage);

                                if (mode == 1) {
                                  this.incomePersantageCustomInput?.current?.setErrorMsg(errMessages[1]);
                                }
                                this.withdrawalInput?.current?.setErrorMsg(errMessages[0]);

                                this.setState({ incomePersantageCustom: val }, () => {
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

                                let percentage = +val;
                                if (isNaN(percentage)) {
                                  percentage = undefined;
                                }

                                let errMessages = this.checkFn(withdrawal[mode], depoStart[mode], days[mode], percentage);

                                if (mode == 1) {
                                  this.incomePersantageCustomInput?.current?.setErrorMsg(errMessages[1]);
                                }
                                this.withdrawalInput?.current?.setErrorMsg(errMessages[0]);
                              }}
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
                            const data = this.buildData(value, true);
                            const dataLength = data.length;

                            this.setState({ days, dataLength, currentDay }, this.recalc);

                            // validation
                            let withdrawal = this.state.withdrawal[mode];
                            let depoStart  = this.state.depoStart[mode];

                            if (mode == 1) {
                              this.incomePersantageCustomInput?.current?.setErrorMsg(
                                this.checkFn2(this.state.incomePersantageCustom, value)
                              );
                            }
                            this.withdrawalInput?.current?.setErrorMsg(this.checkFn(withdrawal, depoStart, value)[0]);
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
                                ref={this.withdrawalInput}
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
                                    : this.getMaxPaymentValue() - 1
                                }
                                onBlur={val => {
                                  const { mode } = this.state;
                                  let depoStart = this.state.depoStart[mode];
                                  let days = this.state.days[mode];

                                  if (val === this.state.withdrawal[mode]) {
                                    // return;
                                  }

                                  if (val === "") {
                                    val = 0;
                                  }

                                  let errMessages = this.checkFn(val, depoStart, days);
                                  this.withdrawalInput?.current?.setErrorMsg(errMessages[0]);
                                  if (mode == 1) {
                                    this.incomePersantageCustomInput?.current?.setErrorMsg(errMessages[1]);
                                  }

                                  const frequency = this.state.withdrawalInterval[mode];
                                  const paymentOverflowMsg = this.validatePayment(val, frequency);
                                  if (paymentOverflowMsg) {
                                    const max = this.getMaxPaymentValue();
                                    val = max - 1;
                                  }

                                  this.setWithdrawal(val);
                                }}
                                onChange={(e, val) => {
                                  const { mode } = this.state;
                                  let depoStart = this.state.depoStart[mode];
                                  let days = this.state.days[mode];

                                  let errMessages = this.checkFn(val, depoStart, days);
                                  this.withdrawalInput?.current?.setErrorMsg(errMessages[0]);
                                  if (mode == 1) {
                                    console.log(this.incomePersantageCustomInput);
                                    this.incomePersantageCustomInput?.current?.setErrorMsg(errMessages[1]);
                                  }

                                  const frequency = this.state.withdrawalInterval[mode];
                                  const paymentOverflowMsg = this.validatePayment(val, frequency);
                                  if (paymentOverflowMsg) {
                                    this.withdrawalInput?.current?.setErrorMsg(paymentOverflowMsg);
                                  }
                                }}
                              />
                            </label>
                          )
                        })()}


                        {/* Частота */}
                        <label className="input-group">
                          <span className="input-group__label">Частота</span>
                          <CustomSelect
                            value={this.state.withdrawalInterval[this.state.mode]}
                            disabled={this.state.saved}
                            options={[20, 50, 100]}
                            format={val => `раз в ${val} ${num2str(val, ["день", "дня", "дней"])}`}
                            min={1}
                            max={2600}
                            onSearch={value => {
                              const { mode, withdrawal } = this.state;
                              const max = this.getMaxPaymentValue(value);

                              let errMessages = ["", ""];
                              if (withdrawal[mode] > max) {
                                errMessages = ["Слишком большой вывод!", "Слишком маленькая доходность!"];
                              }

                              this.withdrawalInput?.current?.setErrorMsg(errMessages[0]);
                              if (mode == 1) {
                                this.incomePersantageCustomInput?.current?.setErrorMsg(errMessages[1]);
                              }
                            }}
                            onChange={value => {
                              let { mode, withdrawalInterval } = this.state;
                              
                              const frequency = value;
                              const payment = this.state.withdrawal[this.state.mode];

                              const max = this.getMaxPaymentValue(value);
                              if (payment > max) {
                                this.setWithdrawal(max - 1);
                                if (mode == 1) {
                                  this.incomePersantageCustomInput?.current?.setErrorMsg("");
                                }
                              }
                                                        
                              const paymentOverflowMsg = this.validatePayment(payment, frequency);
                              if (paymentOverflowMsg) {
                                this.withdrawalInput?.current?.setErrorMsg(paymentOverflowMsg);
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
                    tax,
                  } = this.state;

                  // Вывод
                  let paymentTotal = 0;
                  let paymentTax   = 0;
                  if (days[mode] > withdrawalInterval[mode]) {
                    const multiplier = Math.floor(days[mode] / payloadInterval[mode]);
                    paymentTotal = (withdrawal[mode] - withdrawal[mode] * (tax / 100)) * multiplier;
                    paymentTax = (withdrawal[mode] * (tax / 100)) * multiplier;
                  }
                  
                  // Пополнение
                  let payloadTotal = 0;
                  if (days[mode] > payloadInterval[mode]) {
                    payloadTotal = payload[mode] * Math.floor(days[mode] / payloadInterval[mode]);
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
                                        threshold={1_000_000_000} 
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
                              <Value format={val => +val.toFixed(3) + "%"}>
                                { this.getRate() / (iterations * (directUnloading ? 1 : 2)) }
                              </Value>
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

                          <Col span={12} className="stats-footer-row">
                            <h3 className="stats-key main__h3">
                              { `Выведено за ${days[mode]} ${num2str(days[mode], ["день",   "дня", "дней"])}` }
                            </h3>

                            <Tooltip title={paymentTax != 0 && "Удержан НДФЛ: " + formatNumber(Math.round(paymentTax))}>
                              <div className="stats-val">
                                {
                                  paymentTotal != 0
                                    ? '-'
                                    : null
                                }
                                <Value format={formatNumber}>{ Math.round(paymentTotal) }</Value>
                              </div>
                            </Tooltip>
                          </Col>

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
                          let step = this.getCurrentTool().guarantee / data[currentDay - 1].depoStart * 100;
                          if (step > 100) {
                            console.warn('step > 100');
                            for (let i = 0; i < tools.length; i++) {
                              let s = tools[i].guarantee / depoStart[mode] * 100;
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

                    <div className="card card--secondary section3__tool-block">

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
                        
                        <ToolSelect
                          tools={this.getTools()}
                          value={this.getCurrentToolIndex()}
                          disabled={this.getTools().length == 0}
                          onChange={currentToolIndex => {
                            const { depoStart, days, mode } = this.state;
                            let tools = this.getTools();
                            const currentTool = tools[currentToolIndex]; 

                            // Искомое значение на ползунке, к котором мы хотим прижаться
                            let toFind = this.state.depoPersentageStart;
                            let step = currentTool.guarantee / data[currentDay - 1].depoStartTest * 100;
                            if (step > 100) {
                              // Тут ищем инстурмент, с которым нам хватит на 1 контракт
                              for (let i = 0; i < tools.length; i++) {
                                let s = tools[i].guarantee / depoStart[mode] * 100;
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
                              // Очищаем currentToolIndex, чтобы отдать приоритет currentToolCode
                              currentToolIndex: null,
                              currentToolCode: currentTool.getSortProperty(),
                              depoPersentageStart
                            }, () => {
                              this.updateData(days[mode])
                                .then(() => this.updateDepoPersentageStart())
                            });
                          }}
                        />
                        
                      </div>
                    </div>
                  </Col>

                  <Col className="card card--column section3-col2">
                    {
                      (() => {
                        let tool = this.getCurrentTool();
                        let pointsForIteration = this.getPointsForIteration();

                        return (
                          <Riskometer
                            key={pointsForIteration}
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
                            className="section4__day-select"
                            options={
                              new Array(data.length).fill(0).map((val, index) => index + 1)
                            }
                            format={val => val}
                            value={this.state.currentDay}
                            min={1}
                            max={data.length}
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
                                formatNumber(Math.round(data[currentDay - 1].depoStart * (depoPersentageStart / 100)))
                                +
                                ` (${ round(depoPersentageStart, 3) }%)`
                              }
                            </div>
                          </div>
                          {/* /.row */}
                          <div className="section4-row">
                            <div className="section4-l">Целевой депо</div>
                            {/* <div className="section4-r">{formatNumber(data[currentDay - 1].depoStart + data[currentDay - 1].goal)}</div> */}
                            <div className="section4-r">{formatNumber(data[currentDay - 1].realDepoEnd)}</div>
                          </div>
                          {/* /.row */}
                          <div className="section4-row">
                            <div className="section4-l">Вывод / Пополнение</div>
                            <div className="section4-r">
                              {(() => {
                                let { paymentPlan } = data[currentDay - 1];
                                if (paymentPlan != 0) {
                                  paymentPlan = "-" + formatNumber(paymentPlan);
                                }

                                let { payloadPlan } = data[currentDay - 1];
                                if (payloadPlan != 0) {
                                  payloadPlan = "+" + formatNumber(payloadPlan);
                                }

                                return paymentPlan + " / " + payloadPlan;
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
                              let persantage = tool.rate / 12 * (365 / 260) / 100;

                              val = formatNumber(Math.round(val * persantage))
                            }
                            else {
                              val = 0;
                            }

                            return val == 0
                              ? null
                              : (
                                <div className="section4-row">
                                  <div className="section4-l">Пассивный доход</div>
                                  <div className="section4-r">{ val } / месяц</div>
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

                            <Switch
                              className="section4__switch-long-short"
                              key={isLong + ""}
                              checkedChildren="LONG"
                              unCheckedChildren="SHORT"
                              defaultChecked={isLong}
                              onChange={isLong => {
                                const { tools } = this.state;
                                const investorInfo = this.state.investorInfo;
                                investorInfo.type = isLong ? "LONG" : "SHORT";

                                this.setStateAsync({ investorInfo })
                                  .then(() => this.setStateAsync({ tools: tools.map(tool => tool.update(investorInfo)) }))
                                  .then(() => this.updateDepoPersentageStart())
                                  .then(() => this.recalc(false))
                              }}
                            />
                          </header>
                          <div className="section4-content card">
                            <div className="section4-row">
                              <div className="section4-l">Контрактов</div>
                              <div className="section4-r">{ formatNumber(data[currentDay - 1].contracts) }</div>
                            </div>
                            {/* /.row */}
                            <div className="section4-row">
                              <div className="section4-l">Шагов цены</div>
                              <div className="section4-r">{ formatNumber(pointsForIteration) }</div>
                            </div>
                            {/* /.row */}
                            <div className="section4-row">
                              <div className="section4-l">Итераций</div>
                              <div className="section4-r">{ Math.min(iterations * (directUnloading ? 1 : 2), 100) }</div>
                            </div>
                            {/* /.row */}
                            <div className="section4-row">
                              <div className="section4-l">Торговая цель</div>
                              <div className="section4-r">{formatNumber(data[currentDay - 1].goal) }</div>
                            </div>
                            {/* /.row */}
                          </div>
                        </Col>

                        <Col className="section4-col">
                          <header className="section4-header">
                            До цели
                          </header>
                          {(() => {
                            const { dataLength } = this.state;

                            let sum   = 0;
                            let total = 0;
                            let avg   = 0;
                            let printArr = [];
                            for (let dataItem of data) {
                              if (dataItem.changed) {
                                let r = (dataItem.calculatedRate != null) ? dataItem.calculatedRate : rate;
                                sum += r;
                                printArr.push(r);
                                total++;
                              }
                            }

                            if (total > 0 && (sum / total) != 0) {
                              avg = sum / total;
                            }
                            else {
                              avg = round(rate, 3);  
                            }

                            let printedDays = daysDiff;
                            if (currentDay == dataLength) {
                              printedDays = extraDays;
                            }

                            let daysTotal = dataLength + daysDiff;
                            const daysLeft = daysTotal - currentDay;
                            const percent = currentDay / daysTotal * 100;

                            return (
                              <div className="section4-content section4-content--centered card">
                                
                                <div className="section4-progress-wrap">
                                  <Progress 
                                    className="section4-progress"
                                    type="circle"
                                    percent={
                                      percent > 3 && percent < 100
                                        ? percent - 2 
                                        : percent
                                    } 
                                    format={() => daysLeft + " " + num2str(daysLeft, ["день", "дня", "дней"])}
                                  />

                                  {
                                    printedDays != 0 && (
                                      <span className="section4-progress__label">
                                        { printedDays > 0 && "+" }
                                        { printedDays + " " + num2str(printedDays, ["день", "дня", "дней"]) }
                                      </span>
                                    )
                                  }
                                </div>

                                <Stack className="section4__stats">
                                  {(() => {
                                    if (total > 0) {
                                      let visible = round(avg, 3) < round(rate, 3);

                                      return (
                                        <Statistic
                                          title={
                                            <span>
                                              средняя<br />
                                              <span aria-label="доходность">дох-ть</span>
                                            </span>
                                          }
                                          value={formatNumber(round(avg, 3))}
                                          formatter={node => node}
                                          valueStyle={{
                                            color: `var( ${visible ? "--danger-color" : "--success-color"} )`
                                          }}
                                          prefix={visible ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                                          suffix="%"
                                        />
                                      );
                                    }
                                  })()}

                                  {(() => {
                                    let value = rateRecomm;
                                    if ( String(value).indexOf("e") > -1 ) {
                                      value = value.toExponential(3);
                                    }
                                    
                                    const valid = value >= rate;

                                    return (
                                      <Statistic

                                        title={
                                          <span>
                                            рекомендуемая<br />
                                            <span aria-label="доходность">дох-ть</span>
                                          </span>
                                        }
                                        value={formatNumber(round(value, 3))}
                                        formatter={node => node}
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
                    dataLength,
                    currentDay,
                    directUnloading,
                    passiveIncomeTools,
                    currentPassiveIncomeToolIndex
                  } = this.state;


                  const rate  = this.getRate();
                  const lastFilledDay = data.lastFilledDay?.day || 0;

                  const onBlur = (prop, val) => {
                    if (val === "") {
                      val = undefined;
                    }

                    if (prop === "income") {
                      let iterations = [];

                      let scale = val;
                      if (val != null) {
                        scale = (val / data[currentDay - 1].depoStart) * 100;
                        iterations = [ new Iteration(scale) ]; 
                      }

                      data[currentDay - 1].scale = scale;
                      data[currentDay - 1].iterations = iterations;
                    }
                    
                    data[currentDay - 1][prop] = val;
                    
                    // Если заполнен хотя бы один инпут, то считаем, что день изменен 
                    const changed = data[currentDay - 1].isChanged;
                    data[currentDay - 1].changed = !val ? changed : true;

                    // console.log(data[currentDay - 1]);
                    
                    this.setStateAsync({ data })
                      .then(() => this.updateData(data.length, false, currentDay - 1))
                      .then(() => chartVisible && updateChart.call(this))
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
                  };

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
                          disabled={currentDay == dataLength && extraDays == 0}
                          data-type="link"
                          onClick={() => {
                            if ( currentDay < dataLength || extraDays == 0 ) {
                              this.setCurrentDay(currentDay + 1);
                            }
                            else {
                              const { data } = this.state;
                              this.setStateAsync({
                                extraDays:  0,
                                dataLength: data.length + extraDays
                              })
                                .then(() => {
                                  const r = this.getRateRecommended({ length: dataLength + extraDays });
                                  return this.setStateAsync({
                                    data: data.extend({
                                      ...this.getDataOptions(),
                                      $extraDays: extraDays,
                                      $rateRequired: r,
                                      $rate:         r,
                                    })
                                  })
                                })
                                .then(() => chartVisible && updateChart.call(this))
                                .then(() => this.setCurrentDay(currentDay + 1))
                            }
                          }}>
                          {currentDay < dataLength || extraDays == 0
                            ? "Следующий день" 
                            : `Добавить ${extraDays} ${num2str(extraDays, ["день", "дня", "дней"])}`
                          }
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

                            const { realIncome, goal } = data[day - 1];
                            let success = realIncome >= goal;
                            let failed = realIncome <= 0;

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
                        (!data[currentDay - 1].expanded && !this.state.saved)
                        ? null
                        : (
                          <span className="section5-content-title">
                            <span>
                              {
                                data[currentDay - 1].changed
                                  ? 
                                    <Value format={val => formatNumber(round(val, 3))}>
                                      {data[currentDay - 1].calculatedRate || 0}
                                    </Value>
                                  : placeholder
                              }
                              &nbsp;/&nbsp;
                              {formatNumber(round(
                                data[currentDay - 1].rateRequired != null
                                  ? data[currentDay - 1].rateRequired
                                  : rate,
                                3
                              ))}
                            </span>
                            &nbsp;
                            <span>
                              (
                              {(() => {
                                return data[currentDay - 1].changed
                                  ? (
                                    <Value format={val => val > 0 ? "+" + val : val}>
                                      { formatNumber(data[currentDay - 1].pureIncome) }
                                    </Value>
                                  )
                                  : placeholder
                              })()}
                              {" "}/{" "}
                              {
                                "+" + formatNumber(data[currentDay - 1].goal)
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
                              .concat(data.hasNoGaps && (currentDay > lastFilledDay + 1) ? "section5__save--hidden" : "")
                              .concat("custom-btn")
                              .concat(
                                (data[currentDay - 1].changed || data[currentDay - 1].expanded)
                                  ? "custom-btn--filled"
                                  : ""
                              )
                              .join(" ")
                              .trim()
                          }
                          role="button"
                          aria-expanded={data[currentDay - 1].expanded}
                          aria-controls="result"
                          type={!data[currentDay - 1].expanded ? "primary" : "default"}
                          onClick={e => {
                            let { data, currentDay, saved } = this.state;
                            const { expanded } = data[currentDay - 1];

                            if (expanded) {

                              if (!saved) {
                                dialogAPI.open("dialog1", e.target);
                              }
                              else {
                                this.update(this.getTitle());
                                data[currentDay - 1].expanded = !expanded;
                              }
                            }
                            else {
                              data[currentDay - 1].expanded = !expanded;
                            }

                            this.setState(data);
                          }}
                        >
                          {
                            !data[currentDay - 1].expanded
                              ? data[currentDay - 1].changed
                                ? "Изменить"
                                : "Добавить"
                              : "Сохранить"
                          }
                        </Button >

                        <button
                          disabled={dataLength - currentDay < 5}
                          data-type="link"
                          onClick={() => this.setCurrentDay(currentDay + 5)}>
                          Следующая неделя
                          <ArrowRight />
                        </button>

                      </div>

                      <div 
                        id="result"
                        className="result"
                        hidden={!data[currentDay - 1].expanded}
                      >

                        <div className="result-col result-col-iterations card">
                          <h3 className="result-col__title">Итерации</h3>
                          <div className="result-col__content">
                            <IterationsContainer
                              expanded={data[currentDay - 1].expanded}
                              data={data}
                              currentDay={currentDay}
                              placeholder={placeholder}
                              callback={(data, callback) => {
                                this.setStateAsync({ data })
                                  .then(() => callback())
                                  .then(() => this.updateData())
                                  .then(() => chartVisible && updateChart.call(this))
                              }}
                            />
                          </div>
                        </div>

                        {(() => {
                          return (
                            <div className="result-col card">
                              <h3 className="result-col__title">Торговая цель</h3>
                              <div className="result-col__content">
                                {(() => {
                                  let { scale, rateRequired } = data[currentDay - 1];
                                  if (scale == null) {
                                    scale = data[currentDay - 1].calculatedRate || 0;
                                  }

                                  if (rateRequired == null) {
                                    rateRequired = rate;
                                  }

                                  const percent = round(scale, 3) / round(rateRequired, 3) * 100;
                                  return (
                                    <Progress
                                      className="result-round-progress"
                                      type="circle"
                                      percent={
                                        percent > 3 && percent < 100
                                          ? percent - 2
                                          : percent
                                      }
                                      format={() =>
                                        <div className="result-round-progress__inner">
                                          <span>
                                            {
                                              data[currentDay - 1].changed && scale != null
                                                ? formatNumber(round(scale, scale > 100? 0 : 3)) + "%"
                                                : placeholder
                                            }
                                          </span>
                                          <span>
                                            из{" "}
                                            {
                                              formatNumber(round(rateRequired, 3))
                                            }
                                          </span>
                                        </div>
                                      }
                                    />
                                  )
                                })()}
                                <p className="result-round-progress__subtitle">
                                  До цели:
                                  <span>
                                    {
                                      formatNumber(
                                        Math.max(data[currentDay - 1].goal - (data[currentDay - 1].realIncome || 0), 0)
                                      )
                                    }
                                  </span>
                                </p>
                              </div>
                            </div>
                          )
                        })()}

                        <div className="result-col result-col-additional card">
                          <h3 className="result-col__title">Дополнительно</h3>
                          <div className="result-col__content">

                            <div className="result-col-additional-row">
                              {(() => {
                                const prop = "payment";
                                const value = data[currentDay - 1][prop];
                                const max = Math.trunc(data[currentDay - 1].depoStartTest * .8);

                                return (
                                  <label className="input-group">
                                    <span className="input-group__label">Вывод</span>
                                    <NumericInput
                                      className="input-group__input"
                                      defaultValue={
                                        data[currentDay - 1].changed && value != null
                                          ? value
                                          : ""
                                      }
                                      unsigned="true"
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
                                  </label>
                                )
                              })()}

                              {(() => {
                                const { payment, paymentPlan } = data[currentDay - 1];
                                const progress = payment / paymentPlan * 100;
                                return (
                                  <div className="result-col-additional-row__side">
                                    {formatNumber(paymentPlan)}
                                    <Progress
                                      className={
                                        ["result-col-additional-row__circle-progress"]
                                          .concat(
                                            progress > 0 && progress < 100
                                              ? "in-progress"
                                              : ""
                                          )
                                          .join(" ")
                                          .trim()
                                      }
                                      type="circle"
                                      percent={progress}
                                      status={
                                        progress >= 100
                                          ? "success"
                                          : paymentPlan == 0
                                              ? (payment == null || payment == 0)
                                                ? "success"
                                                : "exception"
                                              : "normal"
                                      }
                                    />
                                  </div>
                                )
                              })()}

                            </div>

                            <div className="result-col-additional-row">
                              {(() => {
                                const prop = "payload";
                                const value = data[currentDay - 1][prop];
                                const max = Math.trunc(this.getDepoEnd() - data[currentDay - 1].depoStartTest);

                                return (
                                  <label className="input-group">
                                    <span className="input-group__label">Пополнение</span>
                                    <NumericInput
                                      className="input-group__input"
                                      defaultValue={
                                        data[currentDay - 1].changed && value != null
                                          ? value
                                          : ""
                                      }
                                      round="true"
                                      unsigned="true"
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
                                  </label>
                                )
                              })()}

                              {(() => {
                                const { payload, payloadPlan } = data[currentDay - 1];
                                const progress = payload / payloadPlan * 100;
                                return (
                                  <div className="result-col-additional-row__side">
                                    {formatNumber(payloadPlan)}
                                    <Progress
                                      className={
                                        ["result-col-additional-row__circle-progress"]
                                          .concat(
                                            progress > 0 && progress < 100
                                              ? "in-progress"
                                              : ""
                                          )
                                          .join(" ")
                                          .trim()
                                      }
                                      type="circle"
                                      percent={progress}
                                      status={
                                        progress >= 100
                                          ? "success"
                                          : payloadPlan == 0
                                              ? (payload == null || payload == 0)
                                                ? "success"
                                                : "exception"
                                              : "normal"
                                      }
                                    />
                                  </div>
                                )
                              })()}
                            </div>

                            <div className="result-col-additional-row">
                              <span className="result-col-additional-row__main">Пассивный доход</span>
                              <div className="result-col-additional-row__side">
                                <Value>
                                  {(() => {
                                    const { mode } = this.state;
                                    let val = data[currentDay - 1].depoEnd;
                                    let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];
                                    if (tool) {
                                      let persantage = tool.rate / 12 * (365 / 260) / 100;

                                      return "+" + formatNumber(Math.round(val * persantage))
                                    }

                                    return 0;
                                  })()}
                                </Value> / мес
                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="result-col">
                          <h3 className="result-col__title result-col__title--large">Дневная цель</h3>
                          <div className="result-col__content">

                            {(() => {
                              const {
                                realIncome,
                                goal,
                                payment,
                                paymentPlan,
                                payload,
                                payloadPlan,
                              } = data[currentDay - 1];
                              const planIncome = goal - (paymentPlan || 0) + (payloadPlan || 0);
                              const income = (realIncome || 0) - (payment || 0) + (payload || 0);
                              let percent = income / planIncome;
                              if (income < 0) {
                                percent = 0;
                              }

                              return (
                                <footer className="result-info">

                                  <div className="result-info-subtitle">
                                    {
                                      data[currentDay - 1].changed
                                        ? (
                                          <Value format={val => formatNumber(Math.round(val))}>
                                            {income}
                                          </Value>
                                        )
                                        : placeholder
                                    }
                                    {" "}
                                    /
                                    {" "}
                                    <Value format={val => formatNumber(Math.round(val))} neutral={true}>
                                      {planIncome}
                                    </Value>
                                  </div>

                                  <Progress
                                    status={
                                      data[currentDay - 1].changed
                                        ? percent >= 1
                                          ? "success"
                                          : percent <= 0
                                            ? "exception"
                                            : "active"
                                        : "active"
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
                                          : round(percent * 100, 1)
                                        : 0
                                    }
                                  />

                                  <span className="result-info__label">
                                    <h4 className="result-info__label-title">Депозит:</h4>
                                    {" "}
                                    {
                                      data[currentDay - 1].changed
                                        ? (
                                          <Value
                                            format={val => formatNumber(Math.round(val))}
                                            neutral={data[currentDay - 1].depoEnd <= data[currentDay - 1].depoStart}
                                          >
                                            {data[currentDay - 1].depoEnd}
                                          </Value>
                                        )
                                        : placeholder
                                    }
                                    {" "}/{" "}
                                    {
                                      formatNumber(data[currentDay - 1].realDepoEnd)
                                    }
                                  </span>

                                </footer>
                              )
                            })()}

                          </div>
                        </div>

                      </div>

                    </section>
                  )
                })()}
                {/* /.section5 */}

                {/* График */}
                {chartVisible && (
                  <Chart 
                    defaultScaleMode={this.state.days[mode]} 
                    data={this.state.data}
                    currentDay={currentDay}
                  />
                )}

              </div>
            )}

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
                      maxLength={30}
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
                  .catch(err => this.showAlert(err));
              }
              else {
                const onResolve = (id) => {
                  const { expanded } = data[currentDay - 1];
                  // Сохранение
                  if (!expanded) {
                    data[currentDay - 1].expanded = true;
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
                  .catch(err => this.showAlert(err));

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
            toolsInfo={[
              { name: "Инструмент",   prop: "name"            },
              { name: "Код",          prop: "code"            },
              { name: "Цена шага",    prop: "stepPrice"       },
              { name: "Шаг цены",     prop: "priceStep"       },
              { name: "Средний ход",  prop: "averageProgress" },
              { name: "ГО",           prop: "guarantee"       },
              { name: "Текущая цена", prop: "currentPrice"    },
              { name: "Размер лота",  prop: "lotSize"         },
              { name: "Курс доллара", prop: "dollarRate"      },
            ]}
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}

            insertBeforeDialog={
              <label className="input-group input-group--fluid trademeter-config__depo">
                <span className="input-group__label">НДФЛ:</span>
                <NumericInput
                  className="input-group__input"
                  defaultValue={this.state.tax}
                  format={formatNumber}
                  unsigned="true"
                  suffix="%"
                  onBlur={val => {
                    const { tax } = this.state;
                    if (val == tax) {
                      return;
                    }

                    this.setState({ tax: val, changed: true });
                  }}
                />
              </label>
            }
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
      </Provider>
    );
  }
}

export { App, Consumer }