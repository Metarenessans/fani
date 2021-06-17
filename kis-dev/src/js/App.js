import React from 'react'
const { Provider, Consumer } = React.createContext();
import ReactDOM from 'react-dom'

import { Dialog, dialogAPI } from "../../../common/components/dialog"
import Config from "../../../common/components/config"
import CustomSelect from "../../../common/components/custom-select"

import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Typography,
  Spin,
  Input,
  Switch,
} from 'antd/es'

import {
  PlusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import "../../../common/api/fetch";

import params              from "../../../common/utils/params"
import num2str              from "../../../common/utils/num2str"
import round               from "../../../common/utils/round";
import formatNumber        from "../../../common/utils/format-number"
import typeOf              from "../../../common/utils/type-of"
import promiseWhile        from "../../../common/utils/promise-while"
import fractionLength      from "../../../common/utils/fraction-length"
import readyTools          from "../../../common/adr.json"
import { Tools, Tool, template } from "../../../common/tools"

import Header                from "./components/header"
import CrossButton           from "../../../common/components/cross-button"
import NumericInput          from "../../../common/components/numeric-input"
import CustomSlider          from "../../../common/components/custom-slider"
import Stack                 from "../../../common/components/stack"
import DashboardRow          from "./components/DashboardRow"

/* API */
import fetch             from "../../../common/api/fetch"
import { applyTools }    from "../../../common/api/fetch/tools"
import { fetchInvestorInfo, applyInvestorInfo } from "../../../common/api/fetch/investor-info"
import fetchSavesFor     from "../../../common/api/fetch-saves"
import fetchSaveById     from "../../../common/api/fetch/fetch-save-by-id"

import "../sass/style.sass"

const defaultToolData = {
  toolType: "Недвижимость",
  tool: {},

  period:          10,
  firstPay:   200_000,
  monthOutcome:     0,
  rentIncome:  20_000,
  
  // percent:             999,
  incomeMonthly: 1_000_000,
  monthPay:              0,
  monthAppend:           0,
  
  // config
  depo:       1_500_000,
  payPeriod:         10,
  payRate:          .08,
  profitPercent:    .04,
  activeInvestVal:  .03,
  ofzVal:           .05,
};

function onScroll() {
  if (innerWidth <= 768) {
    return;
  }

  const dashboardElement = document.querySelector(".dashboard");
  const dashboardElementStart = dashboardElement.getBoundingClientRect().top + window.scrollY;

  const firstRowElement = dashboardElement.querySelector(".dashboard-row:first-child");
  if (!firstRowElement) {
    return;
  }
  const headerElements = firstRowElement.querySelectorAll(".dashboard-key");

  if (pageYOffset > dashboardElementStart) {
    for (let i = 0; i < headerElements.length; i++) {
      headerElements[i].classList.add("scroll");
      firstRowElement.classList.add("scroll");
    }
  } 
  else {
    for (let i = 0; i < headerElements.length; i++) {
      headerElements[i].classList.remove("scroll");
      firstRowElement.classList.remove("scroll");
    }
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {

      id: null,

      loading: false,

      isLong: true,

      data: [{ ...defaultToolData }],

      lineConfigIndex: 0,

      //Размер депозита
      depo: 1_000_000,
      
      customTools: [],

      saved: false,
      
      currentSaveIndex: 0,

      toolsLoading: false,
    };

    this.state = {
      ...this.initialState,
      ...{
        tools: [],

        toolsStorage: [],

        saves: [],
      },
      tooltipPlacement: "top",
    };

    this.state.loading = true;

    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.applyTools        = applyTools.bind(this);
    this.fetchSaveById     = fetchSaveById.bind(this, "kis");
  }

  componentDidMount() {
    this.fetchInitialData();

    window.addEventListener( "scroll", () => onScroll.call(this) );
  }

  componentDidUpdate() {
    onScroll.call(this);
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  fetchInitialData() {
    this.fetchInvestorInfo();
    this.fetchTools()
      // .then(() => this.setFetchingToolsTimeout())

    if (dev) {
      // this.loadFakeSave();
      return;
    }
    this.fetchSaves();
  }

  loadFakeSave() {
    this.setState({ loading: true });

    setTimeout(() => {
      let { saves } = this.state;
      let save = {
        dateCreate: 1595544839,
        static: "{\"depo\":12000000,\"sortProp\":\"incomePercentage\",\"sortDESC\":true,\"mode\":0,\"data\":[{\"percentage\":10,\"selectedToolName\":\"GOLD-3.21\",\"guarantee\":8259.5,\"contracts\":145,\"income\":264570.77725,\"incomePercentage\":2.2047564770833334,\"loadingPercentage\":22.048,\"risk\":2.2047564770833334,\"freeMoney\":87.79524352291666,\"updatedOnce\":true,\"planIncome\":24.7},{\"percentage\":10,\"selectedToolName\":\"Si-3.21\",\"guarantee\":4535,\"contracts\":264,\"income\":220704,\"incomePercentage\":1.8392,\"loadingPercentage\":18.392,\"risk\":1.8392,\"freeMoney\":88.1608,\"updatedOnce\":true,\"planIncome\":836},{\"percentage\":10,\"selectedToolName\":\"RTS-3.21\",\"guarantee\":28307.4,\"contracts\":42,\"income\":217492.47030000002,\"incomePercentage\":1.8124372525,\"loadingPercentage\":18.124,\"risk\":1.8124372525,\"freeMoney\":88.1875627475,\"updatedOnce\":true,\"planIncome\":3505},{\"percentage\":10,\"selectedToolName\":\"MAGN-3.21\",\"guarantee\":9196.9,\"contracts\":130,\"income\":214630,\"incomePercentage\":1.7885833333333334,\"loadingPercentage\":17.886,\"risk\":1.7885833333333334,\"freeMoney\":88.21141666666666,\"updatedOnce\":true,\"planIncome\":1651},{\"percentage\":10,\"selectedToolName\":\"SILV-3.21\",\"guarantee\":3495,\"contracts\":343,\"income\":207770.9809,\"incomePercentage\":1.7314248408333333,\"loadingPercentage\":17.314,\"risk\":1.7314248408333333,\"freeMoney\":88.26857515916666,\"updatedOnce\":true,\"planIncome\":0.82},{\"percentage\":10,\"selectedToolName\":\"BR-4.21\",\"guarantee\":8384.8,\"contracts\":143,\"income\":197539.77815000003,\"incomePercentage\":1.646164817916667,\"loadingPercentage\":16.462,\"risk\":1.646164817916667,\"freeMoney\":88.35383518208333,\"updatedOnce\":true,\"planIncome\":1.87},{\"percentage\":10,\"selectedToolName\":\"LKOH-3.21\",\"guarantee\":10959.4,\"contracts\":109,\"income\":176144,\"incomePercentage\":1.4678666666666667,\"loadingPercentage\":14.679,\"risk\":1.4678666666666667,\"freeMoney\":88.53213333333333,\"updatedOnce\":true,\"planIncome\":1616},{\"percentage\":10,\"selectedToolName\":\"MOEX-3.21\",\"guarantee\":2898.9,\"contracts\":413,\"income\":174699,\"incomePercentage\":1.455825,\"loadingPercentage\":14.558,\"risk\":1.455825,\"freeMoney\":88.544175,\"updatedOnce\":true,\"planIncome\":423},{\"percentage\":10,\"selectedToolName\":\"MIX-3.21\",\"guarantee\":35677.1,\"contracts\":33,\"income\":151932,\"incomePercentage\":1.2661,\"loadingPercentage\":12.661,\"risk\":1.2661,\"freeMoney\":88.7339,\"updatedOnce\":true,\"planIncome\":4604},{\"percentage\":10,\"selectedToolName\":\"SBPR-3.21\",\"guarantee\":4473.8,\"contracts\":268,\"income\":137752,\"incomePercentage\":1.1479333333333333,\"loadingPercentage\":11.479,\"risk\":1.1479333333333333,\"freeMoney\":88.85206666666667,\"updatedOnce\":true,\"planIncome\":514},{\"percentage\":10,\"selectedToolName\":\"FSLR\",\"guarantee\":3627.5,\"contracts\":330,\"income\":102319.8,\"incomePercentage\":0.852665,\"loadingPercentage\":8.527,\"risk\":0.852665,\"freeMoney\":89.147335,\"updatedOnce\":true,\"planIncome\":4.19},{\"percentage\":10,\"selectedToolName\":\"BIIB\",\"guarantee\":8619.2,\"contracts\":139,\"income\":90413.93999999999,\"incomePercentage\":0.7534494999999999,\"loadingPercentage\":7.534,\"risk\":0.7534494999999999,\"freeMoney\":89.2465505,\"updatedOnce\":true,\"planIncome\":8.79},{\"percentage\":10,\"selectedToolName\":\"NIO\",\"guarantee\":3056.9,\"contracts\":392,\"income\":86733.92000000001,\"incomePercentage\":0.7227826666666668,\"loadingPercentage\":7.228,\"risk\":0.7227826666666668,\"freeMoney\":89.27721733333334,\"updatedOnce\":true,\"planIncome\":2.99},{\"percentage\":10,\"selectedToolName\":\"CVX\",\"guarantee\":3541.6,\"contracts\":338,\"income\":80288.52,\"incomePercentage\":0.6690710000000001,\"loadingPercentage\":6.691,\"risk\":0.6690710000000001,\"freeMoney\":89.330929,\"updatedOnce\":true,\"planIncome\":3.21},{\"percentage\":10,\"selectedToolName\":\"M\",\"guarantee\":1062.5,\"contracts\":1129,\"income\":77697.78,\"incomePercentage\":0.6474815,\"loadingPercentage\":6.475,\"risk\":0.6474815,\"freeMoney\":89.3525185,\"updatedOnce\":true,\"planIncome\":0.93},{\"percentage\":10,\"selectedToolName\":\"DDD\",\"guarantee\":1922.9,\"contracts\":624,\"income\":76190.4,\"incomePercentage\":0.6349199999999999,\"loadingPercentage\":6.349,\"risk\":0.6349199999999999,\"freeMoney\":89.36508,\"updatedOnce\":true,\"planIncome\":1.65},{\"percentage\":10,\"selectedToolName\":\"NKLA\",\"guarantee\":1171.8,\"contracts\":1024,\"income\":74260.48,\"incomePercentage\":0.6188373333333332,\"loadingPercentage\":6.188,\"risk\":0.6188373333333332,\"freeMoney\":89.38116266666667,\"updatedOnce\":true,\"planIncome\":0.98},{\"percentage\":10,\"selectedToolName\":\"SNAP\",\"guarantee\":4162.1,\"contracts\":288,\"income\":61165.44,\"incomePercentage\":0.509712,\"loadingPercentage\":5.097,\"risk\":0.509712,\"freeMoney\":89.49028799999999,\"updatedOnce\":true,\"planIncome\":2.87},{\"percentage\":10,\"selectedToolName\":\"PLNT\",\"guarantee\":6051,\"contracts\":198,\"income\":58314.96,\"incomePercentage\":0.48595799999999995,\"loadingPercentage\":4.86,\"risk\":0.48595799999999995,\"freeMoney\":89.514042,\"updatedOnce\":true,\"planIncome\":3.98},{\"percentage\":10,\"selectedToolName\":\"TTD\",\"guarantee\":53177.5,\"contracts\":22,\"income\":55856.68,\"incomePercentage\":0.4654723333333334,\"loadingPercentage\":4.655,\"risk\":0.4654723333333334,\"freeMoney\":89.53452766666666,\"updatedOnce\":true,\"planIncome\":34.31},{\"percentage\":10,\"selectedToolName\":\"PINS\",\"guarantee\":4988.6,\"contracts\":240,\"income\":53635.2,\"incomePercentage\":0.44695999999999997,\"loadingPercentage\":4.47,\"risk\":0.44695999999999997,\"freeMoney\":89.55304,\"updatedOnce\":true,\"planIncome\":3.02},{\"percentage\":10,\"selectedToolName\":\"MRNA\",\"guarantee\":9674.9,\"contracts\":124,\"income\":52211.44,\"incomePercentage\":0.43509533333333333,\"loadingPercentage\":4.351,\"risk\":0.43509533333333333,\"freeMoney\":89.56490466666666,\"updatedOnce\":true,\"planIncome\":5.69},{\"percentage\":10,\"selectedToolName\":\"UBER\",\"guarantee\":4084.5,\"contracts\":293,\"income\":42496.719999999994,\"incomePercentage\":0.35413933333333325,\"loadingPercentage\":3.541,\"risk\":0.35413933333333325,\"freeMoney\":89.64586066666666,\"updatedOnce\":true,\"planIncome\":1.96},{\"percentage\":10,\"selectedToolName\":\"TSLA\",\"guarantee\":49796.1,\"contracts\":24,\"income\":42108.95999999999,\"incomePercentage\":0.35090799999999994,\"loadingPercentage\":3.509,\"risk\":0.35090799999999994,\"freeMoney\":89.649092,\"updatedOnce\":true,\"planIncome\":23.71},{\"percentage\":10,\"selectedToolName\":\"qiwi\",\"guarantee\":816.9,\"contracts\":1468,\"income\":36934.880000000005,\"incomePercentage\":0.3077906666666667,\"loadingPercentage\":3.078,\"risk\":0.3077906666666667,\"freeMoney\":89.69220933333334,\"updatedOnce\":true,\"planIncome\":0.34},{\"percentage\":10,\"selectedToolName\":\"RTX\",\"guarantee\":5532,\"contracts\":216,\"income\":35964,\"incomePercentage\":0.2997,\"loadingPercentage\":2.997,\"risk\":0.2997,\"freeMoney\":89.7003,\"updatedOnce\":true,\"planIncome\":2.25},{\"percentage\":10,\"selectedToolName\":\"NOK\",\"guarantee\":292.8,\"contracts\":4098,\"income\":33357.72,\"incomePercentage\":0.27798100000000003,\"loadingPercentage\":2.78,\"risk\":0.27798100000000003,\"freeMoney\":89.722019,\"updatedOnce\":true,\"planIncome\":0.11},{\"percentage\":10,\"selectedToolName\":\"BKI\",\"guarantee\":5559.3,\"contracts\":215,\"income\":29115.3,\"incomePercentage\":0.2426275,\"loadingPercentage\":2.426,\"risk\":0.2426275,\"freeMoney\":89.7573725,\"updatedOnce\":true,\"planIncome\":1.83},{\"percentage\":10,\"selectedToolName\":\"OZON\",\"guarantee\":3818.4,\"contracts\":314,\"income\":23933.079999999998,\"incomePercentage\":0.1994423333333333,\"loadingPercentage\":1.994,\"risk\":0.1994423333333333,\"freeMoney\":89.80055766666666,\"updatedOnce\":true,\"planIncome\":1.03},{\"percentage\":10,\"selectedToolName\":\"SNE\",\"guarantee\":7505.1,\"contracts\":159,\"income\":20825.82,\"incomePercentage\":0.1735485,\"loadingPercentage\":1.735,\"risk\":0.1735485,\"freeMoney\":89.8264515,\"updatedOnce\":true,\"planIncome\":1.77},{\"percentage\":10,\"selectedToolName\":\"SBER\",\"guarantee\":1027.2,\"contracts\":1168,\"planIncome\":6.96,\"income\":81292.8,\"incomePercentage\":0.67744,\"loadingPercentage\":6.774,\"risk\":0.67744,\"freeMoney\":89.32256,\"updatedOnce\":true}],\"customTools\":[],\"current_date\":\"#\"}",
        data: {
          id: 20,
          name: "Отсортированный",
        },
        error: false,
        id: 20
      };
  
      const index = 0;
      this.extractSave(save);
  
      saves[index] = {
        id:      save.data.id,
        name:    save.data.name,
      };
      this.setState({ 
        saves, 
        currentSaveIndex: index + 1,
        loading: false
      });
    }, 1500);
  }

  fetchInvestorInfo() {
    fetch("getInvestorInfo")
      .then(response => {
        const { status, skill } = response.data;
        let investorInfo = { ...this.state.investorInfo, status, skill };
        return new Promise(resolve => this.setState({ investorInfo }, () => resolve(response)));
      })
      .then(response => {
        let { deposit } = response.data;
        return this.setStateAsync({ depo: deposit || 10000 });
      })
      .then(() => {
        let { tools, investorInfo } = this.state;
        tools = tools.map(tool => tool.update( investorInfo ));
        return this.setStateAsync({ tools });
      })
      .catch(error => console.error(error))
  }
  
  setFetchingToolsTimeout() {
    new Promise(resolve => {
      console.log('staring 10sec timeout');
      setTimeout(() => {

        this.prefetchTools()
          .then(() => {
            console.log(this.state.data.map(row => row.isToolsDropdownOpen));
            const isToolsDropdownOpen = this.state.data.some(row => row.isToolsDropdownOpen == true);
            if (!isToolsDropdownOpen) {
              this.imitateFetchcingTools()
                .then(() => resolve());
            }
            else {
              console.log('no way!');
              resolve();
            }
          });
      }, 15 * 60 * 1000);

    }).then(() => this.setFetchingToolsTimeout())
  }

  imitateFetchcingTools() {
    return new Promise((resolve, reject) => {
      const { toolsStorage } = this.state;
      if (toolsStorage?.length) {
        console.warn('fake fetching');
        this.setStateAsync({ toolsLoading: true });
        setTimeout(() => {
          this.setState({
            tools: toolsStorage,
            toolsStorage: [],
            toolsLoading: false,
          }, () => resolve());
        }, 2_000);
      }
      else {
        resolve();
      }
    })
  }

  prefetchTools() {
    return new Promise(resolve => {
      let toolsStorage = [];
      const requests = [];
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo: this.state.investorInfo }))
            .then(tools => Tools.sort(toolsStorage.concat(tools)))
            .then(tools => {
              toolsStorage = [...tools];
            })
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.all(requests)
        .then(() => this.setStateAsync({ toolsStorage }))
        .then(() => resolve(toolsStorage))
    })
  }

  fetchTools() {
    return new Promise(resolve => {
      const requests = [];
      this.setState({ toolsLoading: true })
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo: this.state.investorInfo }))
            .then(tools => Tools.sort(this.state.tools.concat(tools)))
            .then(tools => this.setStateAsync({ tools }))
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.all(requests)
        .then(() => this.setStateAsync({ toolsLoading: false }))
        .then(() => resolve())
    })
  }

  fetchSaves() {
    fetchSavesFor("ksd")
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
            this.fetchSaveById(id)
              .then(response => this.extractSave(response.data))
              .catch(error => console.error(error));
          }
        }
      })
      .catch(reason => this.showAlert(`Не удалось получить сохранения! ${reason}`));
  }

  showMessageDialog(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  packSave() {
    let { depo, sortProp, sortDESC, mode, data, customTools } = this.state;

    data = data.map(item => {
      item.selectedToolName = item.realSelectedToolName;
      delete item.realSelectedToolName;
      return item;
    });

    const json = {
      static: {
        depo,
        sortProp,
        sortDESC,
        mode,
        data,
        customTools,
        current_date: "#"
      },
    };

    console.log("Save packed!", json);
    return json;
  }

  validateSave(save) {
    return true;
  }

  extractSave(save) {
    const onError = e => {
      this.showMessageDialog(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        console.log(saves, currentSaveIndex - 1);
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    const { saves } = this.state;

    let staticParsed;

    let state = {};
    let failed = false;

    const getSaveIndex = save => {
      for (let i = 0; i < saves.length; i++) {
        let currentSave = saves[i];
        if (Object.keys(currentSave).every(key => currentSave[key] == save[key])) {
          return i;
        }
      }
      return -1;
    };

    const savePure = { ...save };
    delete savePure.static;

    // console.log(saves, savePure, getSaveIndex(savePure));

    try {

      staticParsed = JSON.parse(save.static);
      staticParsed.data.map(item => {
        delete item.selectedToolCode;
        return item;
      });

      // console.log("static", save.static);
      // console.log("staticParsed", staticParsed);

      let m = staticParsed.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.mode = m;
      state.sortProp = staticParsed.sortProp;
      state.sortDESC = staticParsed.sortDESC;

      state.depo = staticParsed.depo || this.state.depo;
      state.data = staticParsed.data;
      state.data = state.data
        .map(item => {
          item = { ...defaultToolData, ...item };

          if (item.guaranteeValue) {
            item.guarantee = item.guaranteeValue;
            delete item.guaranteeValue;
          }

          delete item.planIncome;
          return item;
        });
      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tools.create(tool, { investorInfo: this.state.investorInfo }));

      state.id      = save.id;
      state.saved   = true;
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

    this.setState(state);
  }

  reset() {
    return new Promise(resolve => this.setState(JSON.parse(JSON.stringify(this.initialState)), () => resolve()))
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
      };

      fetch("addKsdSnapshot", "POST", data)
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
      };
      fetch("updateKsdSnapshot", "POST", data)
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
      fetch("deleteKsdSnapshot", "POST", { id })
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

            this.setState({ loading: true });
            this.fetchSaveById(id)
              .then(response => this.extractSave(response.data))
              .catch(error => console.error(error));
          }
          else {
            this.reset()
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

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  getOptions() {
		return this.getTools().map((tool, idx) => {
      return {
        idx:   idx,
        label: String(tool),
      };
    });
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "КИС";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    const { data, sortProp, sortDESC, lineConfigIndex } = this.state;

    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">

            <Header
              onSaveChange={currentSaveIndex => {
                const { saves } = this.state;

                this.setState({ currentSaveIndex });

                if (currentSaveIndex === 0) {
                  this.reset();
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
            </Header>

            <div className="main-content">

              <div className="container">
                <div className="dashboard">
                  {(() => {
                    return (
                      data.map((item, index) =>
                        // ▲
                        <DashboardRow
                          tooltipPlacement={this.state.tooltipPlacement}
                          key={index}
                          item={item}
                          index={index}
                          sortProp={sortProp}
                          sortDESC={sortDESC}
                          mode={this.state.mode}
                          depo={this.state.depo}
                          toolsLoading={this.state.toolsLoading}
                          toolsStorage={this.state.toolsStorage}
                          percentage={item.percentage}
                          selectedToolName={item.selectedToolName}
                          planIncome={item.planIncome}
                          tools={this.getTools()}
                          options={this.getOptions()}



                          onSort={(sortProp, sortDESC) => {
                            if (sortProp !== this.state.sortProp) {
                              sortDESC = true;
                            }
                            this.setState({ sortProp, sortDESC })
                          }}
                          onUpdate={state => {
                            data[index] = { ...data[index], ...state, updatedOnce: true };
                            this.setState({ data });
                          }}
                          onChange={(prop, val) => {
                            data[index][prop] = val;
                            this.setState({ data, changed: true });
                          }}
                          onDelete={index => {
                            data.splice(index, 1)
                            this.setState({ data, changed: true });
                          }}
                          onConfigOpen={() => {
                            this.setState({ lineConfigIndex: index });
                          }}
                        />
                      )
                    )
                  })()}
                </div>

                <footer className="main__footer">

                  <Button className="custom-btn main__save"
                    key={Math.random()}
                    onClick={() => {
                      const { data } = this.state;
                      data.push({ ...defaultToolData });
                      this.setState({ data, changed: true, sortDESC: undefined, sortProp: false })
                    }}>
                    <PlusOutlined aria-label="Добавить" />
                    инструмент
                  </Button>
                </footer>
                

              </div>
              {/* /.container */}

            </div>

          </main>
          {/* /.main */}

          {(() => {
            let { saves, id } = this.state;
            let namesTaken = saves.slice().map(save => save.name);
            let name = (id) ? this.getTitle() : "Новое сохранение";

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
                  let index = saves.push({ id, name });
                  console.log(saves);

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
                label="Название сохранения"
                validate={validate}
                defaultValue={name}
                onChange={val => name = val}
                onBlur={() => { }} />
            );
            let modalJSX = (
              <Dialog
                id="dialog1"
                className="save-modal"
                title={"Сохранение"}
                onConfirm={() => {
                  if (validate(name).length) {
                    console.error(validate(name)[0]);
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
            id="dashboard-config"
            // title={data[lineConfigIndex || 0].toolType}
            title="Настройка инструмента"
            confirmText={"Удалить"}
            onConfirm={() => {
              return true;
            }}
          >
            <div className="dashboard-row" >
              {(() => {
                let { depo, payPeriod, ofzVal, payRate, toolType, profitPercent, activeInvestVal } = data[lineConfigIndex || 0];

                const requiredVal = toolType == "Недвижимость" ? profitPercent : ofzVal
                return (
                  <>
                    {toolType !== "Вклад" && 
                      <>
                        <div className="dashboard-col dashboard-col--main">
                          <span className="dashboard-key">
                            <span className="dashboard-key-inner" style={{ width: "100%" }}>
                              {toolType == "Недвижимость" ? "Стоимость" : "Сумма"}
                            </span>
                          </span>

                          <span className="dashboard-val dashboard-val--wrap">
                            <NumericInput
                              key={Math.random()}
                              className="dashboard__input"
                              defaultValue={depo}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex].depo = value;
                                this.setState({ data: dataCopy, changed: true });
                              }}
                              unsigned="true"
                              format={formatNumber}
                              min={0}
                            />
                          </span>
                        </div>

                        <div className="dashboard-col dashboard-col--splitted">
                          <span className="dashboard-key">
                            <Tooltip title={""}>
                              Период
                            </Tooltip>
                          </span>
                          <span className="dashboard-val dashboard-col--wide">
                            <NumericInput
                              className="dashboard__input dialog-period"
                              defaultValue={payPeriod}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex].payPeriod = value;
                                this.setState({ data: dataCopy, changed: true });
                              }}
                              unsigned={"true"}
                              format={formatNumber}
                              min={0}
                              suffix={num2str(payPeriod, ["год", "года", "лет"])}
                            />

                            <NumericInput
                              className="dashboard__input"
                              defaultValue={payPeriod * (toolType == "Трейдинг" ? 248 : 365)}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex].payPeriod = round(value / (toolType == "Трейдинг" ? 248 : 365), 2);
                                this.setState({ data: dataCopy, changed: true });
                              }}
                              unsigned="true"
                              format={formatNumber}
                              min={0}
                              suffix="дн"
                            />
                          </span>
                        </div>

                        <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                          <span className="dashboard-key">
                            {toolType == "Недвижимость" ? "Ставка по ипотеке" : "Ставка по кредиту"}
                            <span className="dashboard-key-inner" style={{ width: "100%" }}>
                            </span>
                          </span>

                          <span className="dashboard-val dashboard-col--wide">
                            <NumericInput
                              key={payRate}
                              className="dashboard__input"
                              defaultValue={payRate * 100}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex].payRate = value / 100;
                                this.setState({ data: dataCopy, changed: true });
                              }}
                              unsigned="true"
                              format={formatNumber}
                              min={0}
                              max={100}
                              suffix={"%"}
                            />
                          </span>
                        </div>
                      </>
                    }
                    
                    <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                      <span className="dashboard-key">
                        <span className="dashboard-key-inner" style={{ width: "100%" }}>
                          <Tooltip title={"Процент возможной годовой прибыли"}>
                            {toolType == "Недвижимость" ? "Возможная прибыль" : "Ставка ОФЗ"}
                          </Tooltip>
                        </span>
                      </span>

                      <span className="dashboard-val dashboard-col--wide">
                        <NumericInput
                          key={Math.random()}
                          className="dashboard__input"
                          defaultValue={ requiredVal * 100 }
                          onBlur={value => {
                            const dataCopy = [...data];
                            const prop = toolType == "Недвижимость" ? "profitPercent" : "ofzVal";
                            dataCopy[lineConfigIndex][prop] = value / 100;
                            this.setState({ data: dataCopy, changed: true });
                          }}
                          unsigned="true"
                          format={formatNumber}
                          min={0}
                          max={100}
                          suffix={"%"}
                        />
                      </span>
                    </div>

                    {(toolType !== "Недвижимость" &&
                      <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                        <span className="dashboard-key">
                          <span className="dashboard-key-inner" style={{ width: "100%" }}>
                            <Tooltip title={"Прибыль за один день"}>
                              Прибыль от актив. инвестиций
                            </Tooltip>
                          </span>
                        </span>

                        <span className="dashboard-val dashboard-col--wide">
                          <NumericInput
                            key={Math.random()}
                            className="dashboard__input"
                            defaultValue={activeInvestVal == 0.03? 0.03 : activeInvestVal * 100}
                            onBlur={value => {
                              const dataCopy = [...data];
                              dataCopy[lineConfigIndex].activeInvestVal = value / 100;
                              this.setState({ data: dataCopy, changed: true });
                            }}
                            unsigned="true"
                            format={formatNumber}
                            min={0}
                            max={100}
                            suffix={"%"}
                          />
                        </span>
                      </div>
                    )}
                  </>
                )
            })()}
            </div>
          </Dialog>
        </div>
      </Provider>
    );
  }
}

export { App, Consumer }