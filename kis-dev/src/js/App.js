import React from 'react'
const { Provider, Consumer } = React.createContext();

import { Dialog, dialogAPI } from "../../../common/components/dialog"
import SaveDialog   from "../../../common/components/save-dialog"
import DeleteDialog from "../../../common/components/delete-dialog"
import Config                from "../../../common/components/config"

import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

import Header from "../../../common/components/header";

import {Button, Input } from 'antd/es'
import { PlusOutlined } from '@ant-design/icons'

import "../../../common/api/fetch";

import formatNumber        from "../../../common/utils/format-number"
import { Tools, Tool, template } from "../../../common/tools"

import CrossButton           from "../../../common/components/cross-button"
import NumericInput          from "../../../common/components/numeric-input"
import DashboardRow          from "./components/DashboardRow"

/* API */
import fetch             from "../../../common/api/fetch"
import { applyTools }    from "../../../common/api/fetch/tools"
import { fetchInvestorInfo } from "../../../common/api/fetch/investor-info/fetch-investor-info"
import { applyInvestorInfo} from "../../../common/api/fetch/investor-info/apply-investor-info"
import fetchSaveById     from "../../../common/api/fetch/fetch-save-by-id"

import { isEqual, cloneDeep } from "lodash"

import "../sass/style.sass"
import { message } from 'antd';

const defaultToolData = {
  toolType: "Недвижимость",
  tool: {},
  saves: [],
  currentSaveIndex: 0,

  period:            10,
  firstPay:   1_000_000,
  rentIncome:    20_000,
  monthOutcome:       0,
  
  // incomeMonthly: 1_000_000,
  monthAppend:           0,
  
  // config
  depo:       5_000_000,
  secondDepo: 1_000_000,
  payPeriod:         10,
  payRate:          .08,
  profitPercent:    .06,
  activeInvestVal:  .03,
  ofzVal:           .06,
  monthPay:      40_000,
  investPercent:   0.06,
};

export default class App extends BaseComponent {

  constructor(props) {
    super(props);

    this.deafultTitle = <>Калькулятор Инвестиционных<br /> Стратегий</>;

    this.initialState = {
      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      currentSaveIndex: 0,

      lineConfigIndex: 0,

      isLong: true,

      data: [{ ...cloneDeep(defaultToolData) }, { ...cloneDeep(defaultToolData), toolType: "Вклад" }, { ...cloneDeep(defaultToolData), toolType: "Трейдинг", }],

      //Размер депозита
      depo: 1_000_000,
      
      customTools: [],      

      toolsLoading: false,
    };

    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState),

      toolsStorage: [],

      tooltipPlacement: "top",
    };

    this.state.loading = true;

    // Bindings
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.fetchSaveById = fetchSaveById.bind(this, "Kis");
  }

  componentDidMount() {
    this.fetchInitialData();
    this.bindEvents();

    // window.addEventListener( "scroll", () => onScroll.call(this) );
  }

  componentDidUpdate(prevProps, prevState) {
    // onScroll.call(this);
    const { id, saves, data } = this.state;

    if (!isEqual(prevState.data, data)) {
      this.setState({ changed: true })
    }

    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchTools()
      .then(() => this.setFetchingToolsTimeout())
    this.fetchSnapshots();
    this.fetchLastModifiedSnapshot({ fallback: require("./snapshot.json") })
      .then(() => this.setState({ changed: false }) )
      // .then(() => this.fetchSaves())
      .catch(error => console.error(error))
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

  setFetchingToolsTimeout() {
    const ms = dev ? 10_000 : 1 * 60 * 1_000;
    new Promise(resolve => {
      setTimeout(() => {
        const currentTool = this.getCurrentTool();
        if (!document.hidden) {
          fetch("getCompanyTrademeterInfo", "GET", {
            code: currentTool.code,
            region: currentTool.dollarRate == 1 ? "RU" : "EN"
          })
            .then(response => {
              Tools.prefetchedTool = response.data;

              const { isToolsDropdownOpen } = this.state;
              if (!isToolsDropdownOpen) {
                this.imitateFetchingTools()
                  .then(() => resolve());
              }
              else {
                console.log('Не могу пропушить инструмент в стейт, буду ждать окно');
                Tools.prefetchedTool = null;
                resolve();
              }

              resolve();
            })
        }
        else resolve();
      }, ms);
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
      const { investorInfo } = this.state;
      const requests = [];
      const parsedTools = [];
      this.setState({ toolsLoading: true })
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
            .then(tools => Tools.sort(parsedTools.concat(tools)))
            .then(tools => parsedTools.push(...tools))
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.all(requests)
        .then(() => this.setStateAsync({ tools: parsedTools, toolsLoading: false }))
        .then(() => resolve())
    })
  }

  packSave() {
    const {
      isLong,
      data,
      depo,
      customTools,
    } = this.state;

    const json = {
      static: {
        isLong,
        data,
        depo,
        customTools,
      },
    };

    console.log("Packed save:", json);
    return json;
  }
  
  parseSnapshot = data => {
    const initialState = cloneDeep(this.initialState);

    return {
      depo:        data.depo        ?? initialState.depo,
      isLong:      data.isLong      ?? initialState.isLong,
      data:        data.data        ?? initialState.data,
      customTools: data.customTools ?? initialState.customTools,
    };
  };

  /** @param {import('../../../common/utils/extract-snapshot').Snapshot} snapshot */
  async extractSnapshot(snapshot) {
    try {
      await super.extractSnapshot(snapshot, this.parseSnapshot);
    }
    catch (error) {
      message.error(error);
    }
  }

  showAlert(errorMessage = "") {
    console.log(`%c${errorMessage}`, "background: #222; color: #bada55");
    message.error(errorMessage);
    // if (!dev) {
    //   this.setState({ errorMessage }, () => dialogAPI.open("dialog-msg"));
    // }
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

  render() {
    const {
      data,
      sortProp,
      sortDESC,
      lineConfigIndex
    } = this.state;

    return (
      <StateContext.Provider value={this}>
        <div className="page">

          <main className="main">
            <Header />

            <div className="hdOptimize" >
              <div className="main-content">

                <div className="container">
                  <div className="dashboard">
                    {(() => {
                      return (
                        data.map((item, index) =>
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
                              const data = cloneDeep(this.state.data);
                              data[index] = { ...data[index], ...state, updatedOnce: true };
                              this.setState({ data });
                            }}
                            onChange={(prop, val) => {
                              const data = cloneDeep(this.state.data);
                              data[index][prop] = val;
                              this.setState({ data });
                            }}
                            onDelete={index => {
                              const data = cloneDeep(this.state.data);
                              data.splice(index, 1)
                              this.setState({ data });
                              // решение кейса undefined при удалении строки
                              this.setState({ lineConfigIndex: 0 });
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
                        const data = cloneDeep(this.state.data);
                        data.push({ ...cloneDeep(defaultToolData) });
                        this.setState({ data, sortDESC: undefined, sortProp: false })
                      }}>
                      <PlusOutlined aria-label="Добавить" />
                      инструмент
                    </Button>
                  </footer>
                  

                </div>
                {/* /.container */}
              </div>
            </div>

          </main>
          {/* /.main */}

          <SaveDialog />

          <DeleteDialog />

          <Config
            id="config"
            title="Инструменты"
            template={template}
            templateContructor={Tool}
            tools={this.state.tools}
            toolsInfo={[
              { name: "Инструмент", prop: "name" },
              { name: "Код", prop: "code" },
              { name: "Цена шага", prop: "stepPrice" },
              { name: "Шаг цены", prop: "priceStep" },
              { name: "ГО", prop: "guarantee" },
              { name: "Текущая цена", prop: "currentPrice" },
              { name: "Размер лота", prop: "lotSize" },
              { name: "Курс доллара", prop: "dollarRate" },
              { name: "ADR", prop: "adrDay" },
              { name: "ADR неделя", prop: "adrWeek" },
              { name: "ADR месяц", prop: "adrMonth" },
            ]}
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}
            insertBeforeDialog={
              <label className="input-group input-group--fluid mts-config__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput
                  className="input-group__input"
                  defaultValue={this.state.depo}
                  format={formatNumber}
                  min={10_000}
                  max={Infinity}
                  onBlur={val => {
                    const { depo } = this.state;
                    if (val == depo) {
                      return;
                    }

                    this.setState({ depo: val });
                  }}
                />
              </label>
            }
          />
          {/* Инструменты */}

          {(() => {
            const { errorMessage } = this.state;
            return (
              <Dialog
                id="dialog-msg"
                title="Сообщение"
                hideConfirm={true}
                cancelText="ОК"
              >
                {errorMessage}
              </Dialog>
            )
          })()}
          {/* Error Popup */}

          <Dialog
            id="dashboard-config"
            title={data[lineConfigIndex || 0].toolType}
            // confirmText={"Удалить"}
            confirmText={"Сохранить"}
            onConfirm={() => {
              const { id } = this.state;
              if (id == null) {
                this.save(this.getTitle());
              }
              else {
                this.update(this.getTitle())
                  .then(() => this.setState({ changed: false, saved: true }))
              }
              return true;
            }}
          >
            <div className="dashboard-row" >
              {(() => {
                let { depo, secondDepo, ofzVal, toolType, profitPercent, activeInvestVal, monthPay, investPercent } = data[lineConfigIndex || 0];
                
                const requiredVal = toolType == "Недвижимость" ? profitPercent : ofzVal
                return (
                  <>
                    {(toolType !== "Вклад" && 
                      <>
                        <div className="dashboard-col dashboard-col--dialog-depo">
                          <span className="dashboard-key">
                            <span className="dashboard-key-inner" style={{ width: "100%" }}>
                              {toolType == "Недвижимость" ? "Стоимость" : "Сумма"}
                            </span>
                          </span>

                        <span className="dashboard-val dashboard-val--wrap">
                            <NumericInput
                              className="dashboard__input"
                              defaultValue={toolType == "Недвижимость" ? depo : secondDepo}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex][toolType == "Недвижимость" ? "depo" : "secondDepo"] = value;
                                this.setState({ data: dataCopy });
                              }}
                              unsigned="true"
                              disabled={toolType === "Трейдинг"}
                              format={formatNumber}
                              min={0}
                            />
                          </span>
                        </div>

                        <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                          <span className="dashboard-key">
                            <span className="dashboard-key-inner">
                              Месячный платёж
                            </span>
                          </span>
                        
                          <span className="dashboard-val dashboard-col--rate">
                            <NumericInput
                              key={monthPay}
                              className="dashboard__input"
                              defaultValue={toolType === "Недвижимость" ? monthPay : 0 }
                              disabled={toolType === "Трейдинг"}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex].monthPay = value;
                                this.setState({ data: dataCopy });
                              }}
                              unsigned="true"
                              format={formatNumber}
                              min={0}
                            />
                          </span>
                        </div>
                      </>
                    )}
                    
                    {(toolType == "Вклад" && 
                      <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                      <span className="dashboard-key dashboard-key--contribution-rate">
                          <span className="dashboard-key-inner">
                            Ставка по вкладу
                          </span>
                        </span>
                        
                        <span className="dashboard-val dashboard-col--rate dashboard-val--invest-percent">
                          <NumericInput
                            className="dashboard__input dashboard__input--contribution"
                            defaultValue={investPercent * 100}
                            onBlur={value => {
                              const dataCopy = [...data];
                              dataCopy[lineConfigIndex].investPercent = value / 100;
                              this.setState({ data: dataCopy });
                            }}
                            unsigned="true"
                            format={formatNumber}
                            min={0}
                            max={100}
                            suffix="%"
                          />
                        </span>
                      </div>
                    )}
                    
                    {(toolType == "Недвижимость" &&
                      <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                        <span className="dashboard-key">
                          <span className="dashboard-key-inner" style={{ width: "100%" }}>
                              Упущенная прибыль
                          </span>
                        </span>

                      <span className="dashboard-val dashboard-col--rate  dashboard-val--profit-percent">
                          <NumericInput
                            className="dashboard__input"
                            defaultValue={ requiredVal * 100 }
                            onBlur={value => {
                              const dataCopy = [...data];
                              const prop = "profitPercent";
                              dataCopy[lineConfigIndex][prop] = value / 100;
                              this.setState({ data: dataCopy });
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

                    {(toolType == "Трейдинг" &&
                      <>
                      <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                        <span className="dashboard-key">
                          <span className="dashboard-key-inner" style={{ width: "100%" }}>
                            {/* <Tooltip title={""}> */}
                              Ставка ОФЗ
                            {/* </Tooltip> */}
                          </span>
                        </span>
                        
                        <span className="dashboard-val dashboard-col--rate dashboard-val--ofz">
                          <NumericInput
                            className="dashboard__input"
                            defaultValue={ofzVal * 100}
                            onBlur={value => {
                              const dataCopy = [...data];
                              const prop = "ofzVal";
                              dataCopy[lineConfigIndex][prop] = value / 100;
                              this.setState({ data: dataCopy });
                            }}
                            unsigned="true"
                            format={formatNumber}
                            min={0}
                            max={100}
                            suffix={"%"}
                          />
                        </span>
                      </div>

                        <div className="dashboard-col dashboard-col--main dashboard-col--percent">
                          <span className="dashboard-key">
                            <span className="dashboard-key-inner" style={{ width: "100%" }}>
                              {/* <Tooltip title={""}> */}
                                Активные инвестиций
                              {/* </Tooltip> */}
                            </span>
                          </span>
                          
                        <span className="dashboard-val dashboard-col--rate dashboard-val--active-invest">
                            <NumericInput
                              className="dashboard__input" 
                              defaultValue={activeInvestVal}
                              onBlur={value => {
                                const dataCopy = [...data];
                                dataCopy[lineConfigIndex].activeInvestVal = value;
                                this.setState({ data: dataCopy });
                              }}
                              unsigned="true"
                              format={formatNumber}
                              min={0}
                              max={1}
                              suffix={"%"}
                            />
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )
            })()}
            </div>
          </Dialog>

        </div>
      </StateContext.Provider>
    );
  }
}

export { App, Consumer }