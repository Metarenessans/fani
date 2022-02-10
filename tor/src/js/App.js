import React from 'react'
const { Provider, Consumer } = React.createContext();
import { Input } from 'antd/es'

import {} from '@ant-design/icons'

import formatNumber from "../../../common/utils/format-number"

import { cloneDeep, isEqual } from "lodash"

import NumericInput          from "../../../common/components/numeric-input"
import Config                from "../../../common/components/config"
import { Dialog, dialogAPI } from "../../../common/components/dialog"
import Header                from "../../../common/components/header"
import SaveDialog            from "../../../common/components/save-dialog"
import DeleteDialog          from "../../../common/components/delete-dialog"
import { Tools, Tool, template }   from "../../../common/tools"
import Dashboard             from "./components/Dashboard"
import round                 from "../../../common/utils/round"

/* API */
import { applyInvestorInfo }  from "../../../common/api/fetch/investor-info/apply-investor-info"
import { applyTools }         from "../../../common/api/fetch/tools"
import fetchSaveById     from "../../../common/api/fetch/fetch-save-by-id"

import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

import "../sass/style.sass"

export default class App extends BaseComponent {

  constructor(props) {
    super(props);

    this.deafultTitle = "ТОР";

    /**
     * Дефолтный стейт
     */
    this.initialState = {
      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      id: null,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },

      loading: false,

      // Депозит
      depo: 1_000_000,

      items: [{
        id: 1,
        selectedToolName: "SBER",
        drawdown:           null,

        // Контрактов
        contracts: 40,
        // Просадка

        // Догрузка (в процентах)
        additionalLoading: 20,
        // Ожидаемый ход (в долларах)
        stepExpected: 1,

        directUnloading: true,

        isLong: false,

        // ===================
        // Вычисляемые значения
        // ===================

        // Свободные деньги
        freeMoney:     0,
        // Прошло пунктов против
        pointsAgainst: 0,
        // 
        incomeExpected: 0,
      }],

      customTools: [],

      saved: false,

      currentSaveIndex: 0,

      toolsLoading: false,

      isFocused: false,

      currentToolIndex:  0,
    };

    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState),

      tools: [],

      toolsStorage: [],

      saves: [],
    };

    this.state.loading = true;

    
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.applyTools        = applyTools.bind(this);
    this.fetchSaveById     = fetchSaveById.bind(this, "tor");
  }

  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData()
  }

  componentDidUpdate(prevProps, prevState) {
    const { id, saves, items, currentSaveIndex, toolsLoading, tools, loading } = this.state;
    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }

    // if (prevState.currentSaveIndex !== currentSaveIndex) {
    //   if (currentSaveIndex === 0) {
    //     this.getContracts();
    //   }
    // }

    // if (prevState.loading !== loading && toolsLoading === false && currentSaveIndex === 0) {
    //   this.getContracts();
    // }
  }

  getContracts() {
    const { items, depo, currentSaveIndex, tools} = this.state;
    const currentToolindex = Tools.getIndexByCode("SBER", tools);

    if (tools.length !== 0 && currentToolindex) {
      if (items && depo &&  currentSaveIndex == 0) {
        const tools = this.getTools();
        const currentToolindex = Tools.getIndexByCode("SBER", tools);
        const currentTool = tools[currentToolindex];
        const contracts   = round( round((depo * 0.1)) / round((currentTool?.guarantee)));
  
        let itemsClone = [...items];
        itemsClone[0].contracts = contracts;
        if (contracts !== null) {
          this.setStateAsync({ items: itemsClone });
        }
      }
    }
    else {
      setTimeout(() => this.getContracts(), 1_000);
    }
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  bindEvents() {
    super.bindEvents();
  }

  async fetchInitialData() {
    this.fetchInvestorInfo()
      .then(response => {
        const { deposit } = response.data;
        this.initialState.investorDepo = deposit;
        this.setState({ investorDepo: deposit });
      })
      .catch(error => {
        if (dev) {
          const deposit = 10_000;
          this.initialState.investorDepo = deposit;
          this.setState({ investorDepo: deposit });
        }
      });

    this.fetchTools();
    await this.fetchSnapshots();
    await this.fetchLastModifiedSnapshot({ fallback: this.getTestSpapshot() });
  }

  getTestSpapshot() {
    return require("./snapshot.json");
  }
  
  setFetchingToolsTimeout() {
    new Promise(resolve => {
      setTimeout(() => {
        if (!document.hidden) {
          this.prefetchTools()
            .then(() => {
              const { isToolsDropdownOpen } = this.state;
              if (!isToolsDropdownOpen) {
                this.imitateFetchcingTools()
                  .then(() => resolve());
              }
              else {
                console.log('no way!');
                resolve();
              }
            });
        }
        else resolve();

      }, dev ? 6_000 : 1 * 60 * 1_000);

    }).then(() => this.setFetchingToolsTimeout())
  }

  imitateFetchcingTools() {
    return new Promise((resolve, reject) => {
      if (Tools.storage?.length) {
        this.setStateAsync({ toolsLoading: true });
        const newTools = Tools.storage;

        setTimeout(() => {
          this.setState({
            tools: newTools,
            toolsLoading: false,
          }, () => resolve());
        }, 2_000);
      }
      else {
        resolve();
      }
    })
  }

  showAlert(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  packSave() {
    let { items, customTools } = this.state;

    const json = {
      static: {
        items,
        customTools,
        current_date: "#"
      },
    };

    console.log("Save packed!", json);
    return json;
  }

  extractSave(save) {
    const onError = e => {
      this.showAlert(String(e));

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

    try {

      staticParsed = JSON.parse(save.static);
      console.log(save);
      console.log("staticParsed", staticParsed);

      state.items = staticParsed.items;

      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tool.fromObject(tool, { investorInfo: this.state.investorInfo }));

      state.id      = save.id;
      state.saved   = true;
      state.loading = false;
      state.currentSaveIndex = saves.indexOf( saves.find(currSave => currSave.id == save.id) ) + 1;
    }
    catch (e) {
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    return this.setStateAsync(state)
  }

  extractSnapshot(snapshot) {
    return this.extractSave(snapshot);
  }

  render() {
    return (
      <Context.Provider value={this}>
        <div className="page">
          <main className="main">
            
            <Header />

            <div className="main-content">
              <div className="container">
                {
                  this.state.items.map((obj, index) =>

                    <Dashboard
                      toolsLoading={this.state.toolsLoading}
                      onFocus={() => this.setState({ isToolsDropdownOpen: true })}
                      onBlur={() => {
                        this.setStateAsync({ isToolsDropdownOpen: false })
                          .then(() => this.imitateFetchcingTools());
                      }}
                      index={index}
                      investorInfo={this.state.investorInfo}
                      items={this.state.items}
                      loading={this.state.loading}
                      tools={this.getTools()}
                      data={obj}
                      depo={this.state.depo}
                      onChange={(prop, val, jsx) => {
                        const { items } = this.state;

                        if (prop == "selectedToolName") {
                          items[index].stepExpected = jsx.getToolByName(val).priceStep * 100;
                          this.setStateAsync({ isToolsDropdownOpen: false })
                            .then(() => this.imitateFetchcingTools());
                        }
                        items[index][prop] = val;
                        this.setState({ items, changed: true });
                      }}
                      
                      onContractsChange={ (index, value, name) => {
                        const { items } = this.state
                        const itemsClone = [...items];
                        itemsClone[index][name] = value;

                        this.setState({ items: itemsClone })
                      }}
                      onDrawdownChange={(val, cb) => {
                        this.setState({ drawdown: val }, cb);
                      }}
                      onOpenConfig={e => {
                        dialogAPI.open("config", e.target);
                      }}
                      onCopy={() => {
                        let { items } = this.state;

                        var copy = Object.assign({}, items[index]);
                        copy.id = Math.random();
                        items.push(copy);

                        this.setState({ items });
                      }}
                      onDelete={() => {
                        let { items } = this.state;

                        if (items.length > 1) {
                          items.splice(index, 1);
                          this.setState({ items });
                        }
                      }}
                      onChangeTool={ value => {
                        const { currentToolIndex } = this.state;
                        this.setState({ currentToolIndex: value });
                      }}
                    />
                  ) 
                }
              
              </div>
              {/* /.container */}
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
              { name: "Инструмент",   prop: "name"         },
              { name: "Код",          prop: "code"         },
              { name: "Цена шага",    prop: "stepPrice"    },
              { name: "Шаг цены",     prop: "priceStep"    },
              { name: "ГО",           prop: "guarantee"    },
              { name: "Текущая цена", prop: "currentPrice" },
              { name: "Размер лота",  prop: "lotSize"      },
              { name: "Курс доллара", prop: "dollarRate"   },
              { name: "ADR",          prop: "adrDay"       },
            ]}
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}

            insertBeforeDialog={
              <label className="input-group input-group--fluid tor-config__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput
                  className="input-group__input"
                  defaultValue={this.state.depo}
                  format={formatNumber}
                  min={10000}
                  max={Infinity}
                  onBlur={val => {
                    const { depo } = this.state;
                    if (val == depo) {
                      return;
                    }

                    this.setState({ depo: val, changed: true });
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
        </div>
      </Context.Provider>
    );
  }
}

export { App }