import React from 'react'
const { Provider, Consumer } = React.createContext();
import {
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Pagination,
  Dropdown,
  Menu
} from 'antd/es'
const { Option } = Select;

import {
  LoadingOutlined,
  SettingFilled,
} from "@ant-design/icons"

import fetch           from "../../../common/api/fetch"
import { applyInvestorInfo } from "../../../common/api/fetch/investor-info"
import fetchSaveById   from "../../../common/api/fetch/fetch-save-by-id"
import params          from "../../../common/utils/params"
import round           from "../../../common/utils/round"
import formatNumber    from "../../../common/utils/format-number"
import fractionLength  from "../../../common/utils/fraction-length"
import sortInputFirst  from "../../../common/utils/sort-input-first"
import isEqual         from '../../../common/utils/is-equal';
import fallbackBoolean from '../../../common/utils/fallback-boolean';
import stepConverter   from './components/settings-generator/step-converter';

import syncToolsWithInvestorInfo from "../../../common/utils/sync-tools-with-investor-info"

import { Tools, Tool, template } from "../../../common/tools"

import {
  Chart,
  updateChartMinMax,
  updateChartScaleMinMax,
  updateChartZoom,
  minChartValue,
  maxChartValue,
} from "./components/chart"

import Stack                   from "../../../common/components/stack"
import { Dialog, dialogAPI }   from "../../../common/components/dialog"

import "../sass/style.sass";

import Config                  from "../../../common/components/config"
import NumericInput            from "../../../common/components/numeric-input"
import SettingsGenerator       from "./components/settings-generator"
import Header                  from "./components/header"
import CustomSlider            from "../../../common/components/custom-slider"

const algorithms = [
  { name: "Стандарт",  profitRatio: 60 },
  { name: "СМС + ТОР", profitRatio: 60 },
  { name: "Лимитник",  profitRatio: 90 }
];

let unsavedGena = null;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {

      loading: false,
      loadingChartData: true,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },

      depo: 1000000,
      mode: 0,
      chance: 50,
      page: 1,
      priceRange: [null, null],
      percentage: 10,
      days: 1,
      prevDays: 1,
      data: null,

      customTools: [],
      currentToolCode: "SBER",

      id:                  null,
      saved:              false,
      risk:                  .5,
      isResetDisabled:     true,
      scaleOffset:            0,
      changedMinRange:        0,
      changedMaxRange:        0,
      movePercantage:         0,
      profitRatio:           60,
      searchVal:             "",

      presetSelection:       algorithms.map(algorithm => 0),
      totalIncome:           0,
      totalStep:             0,

      toolsLoading:       false,
      isFocused:          false,

      genaID: -1,
    };

    this.state = {
      ...this.initialState,
      ...{
        saves:              [],
        currentSaveIndex:    0,
        tools:              [],
      } 
    };

    // Bindings
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.fetchSaveById = fetchSaveById.bind(this, "Mts");
  }

  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData();
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  fetchCompanyQuotes() {
    this.setState({ loadingChartData: true });

    let from = new Date();
    let to   = new Date();
    from.setMonth(from.getMonth() - 1);

    from = Math.floor(+from / 1000);
    to   = Math.floor(+to   / 1000);

    const tool = this.getCurrentTool();
    let method = "getCompanyQuotes";

    if (tool.dollarRate == 0) {
      method = "getPeriodFutures";
      from = tool.firstTradeDate;
      to   = tool.lastTradeDate;
    }

    let body = {
      code: tool.code,
      from,
      to,
    };
    
    if (tool.dollarRate != 0) {
      body = {
        ...body,
        region: tool.dollarRate != 1 ? "US" : "RU",
      };
    }

    fetch(method, "GET", body)
      .then(response => {
        if (this.state.currentToolCode == tool.code) {
          const data = response.data;
          this.setState({ data, loadingChartData: false });
        }
      })
      .catch(error => console.error(error));
  }

  setFetchingToolsTimeout() {
    new Promise(resolve => {
      const ms = dev ? 10_000 : 1 * 60 * 1_000;
      console.log(formatNumber(ms / 1_000) + "s timeout started");
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
                Tools.storage = [];
                Tools.storageReady = false;
                resolve();
              }
            });
        }
        else resolve();
      }, ms);

    }).then(() => this.setFetchingToolsTimeout())
  }

  // ----------
  // Fetch
  // ----------

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchTools()
      .then(() => this.setFetchingToolsTimeout())
      .finally(() => {
        this.fetchSaves()
          .catch(error => console.error(error))
          .finally(() => {
            Promise.allSettled([
              this.fetchInvestorInfo(),
              this.fetchGENA()
            ])
              .finally(() => this.fetchCompanyQuotes())
          });
      });
  }

  fetchGENA() {
    const parseGENASave = save => {
      save.ranull         = save.ranull == null ? 0 : save.ranull;
      save.ranullMode     = fallbackBoolean(save.ranullMode, true)
      save.ranullPlus     = save.ranullPlus == null ? 0 : save.ranullPlus;
      save.ranullPlusMode = fallbackBoolean(save.ranullPlusMode, true);
      return save;
    };

    return fetch("getGenaSnapshots")
      .then(response => {
        const { data } = response;
        console.log("getGenaSnapshots:", data);
        return this.setStateAsync({ genaSaves: data });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          const id = this.state.genaSaves[0]?.id;
          if (id != null) {
            fetch("getGenaSnapshot", "GET", { id })
              .then(response => {
                const { data } = response;
                try {
                  let genaSave = JSON.parse(data.static);
                  genaSave = parseGENASave(genaSave);

                  console.log("getGenaSnapshot", genaSave);
                  this.setState({ genaID: id, genaSave }, () => resolve());
                }
                catch (e) {
                  reject(e);
                }
              })
              .catch(error => reject(error));
          }
          else {
            resolve();
          }
        })
      })
      .catch(error => console.error(error))
      .finally(() => {
        if (false && dev) {
          let genaSave = {
            "isLong": true,
            "comission": 1,
            "risk": 300,
            "depo": 250000,
            "secondaryDepo": 750000,
            "load": 44.96,
            "currentTab": "Закрытие основного депозита",
            "presets": [
              {
                "name": "Стандарт",
                "type": "Стандарт",
                "options": {
                  "Закрытие основного депозита": {
                    "closeAll": false,
                    "inPercent": false,
                    "preferredStep": "",
                    "length": "",
                    "percent": "",
                    "stepInPercent": "",
                    "mode": "custom",
                    "modes": [
                      "custom"
                    ],
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": "",
                        "length": 10,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ]
                  },
                  "Прямые профитные докупки": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 285.2,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 285.2
                  },
                  "Обратные профитные докупки": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 285.2,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 285.2
                  }
                }
              },
              {
                "name": "СМС + ТОР",
                "type": "СМС + ТОР",
                "options": {
                  "Закрытие основного депозита": {
                    "closeAll": false,
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Закрытие плечевого депозита": {
                    "closeAll": false,
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Обратные докупки (ТОР)": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Прямые профитные докупки": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Обратные профитные докупки": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "currentToolCode": "AFZ1"
                }
              },
              {
                "name": "Лимитник",
                "type": "Лимитник",
                "options": {
                  "Закрытие основного депозита": {
                    "closeAll": false,
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 2.44,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 5.31
                  },
                  "Обратные докупки (ТОР)": {
                    "mode": "custom",
                    "closeAll": false,
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 2.44,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 5.31
                  }
                }
              },
              {
                "name": "Лимитник (SBER)",
                "type": "Лимитник",
                "options": {
                  "Закрытие основного депозита": {
                    "closeAll": false,
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 2.44,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 2.44
                  },
                  "Обратные докупки (ТОР)": {
                    "mode": "custom",
                    "closeAll": false,
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 2.44,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 2.44
                  },
                  "currentToolCode": "MMM"
                }
              },
              {
                "name": "test",
                "type": "СМС + ТОР",
                "options": {
                  "Закрытие основного депозита": {
                    "closeAll": false,
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Закрытие плечевого депозита": {
                    "closeAll": false,
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Обратные докупки (ТОР)": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Прямые профитные докупки": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "Обратные профитные докупки": {
                    "mode": "custom",
                    "customData": [
                      {
                        "inPercent": false,
                        "preferredStep": 220,
                        "length": 1,
                        "percent": "",
                        "stepInPercent": ""
                      }
                    ],
                    "preferredStep": 220
                  },
                  "currentToolCode": "AFZ1"
                }
              }
            ],
            "currentPresetName": "test",
            "isProfitableBying": false,
            "isReversedProfitableBying": false,
            "isMirrorBying": false,
            "isReversedBying": true,
            "ranull": 0,
            "ranullMode": true,
            "ranullPlus": 0,
            "ranullPlusMode": true
          };
          genaSave = parseGENASave(genaSave);

          console.log("getGenaSnapshot", genaSave);
          return this.setStateAsync({ genaSave })
        }
      });
  }

  saveGENA(save) {
    const { genaID } = this.state;

    let request = "addGenaSnapshot";
    if (genaID > -1) {
      request = "updateGenaSnapshot";
    }

    const data = {
      id: genaID,
      name: "",
      static: JSON.stringify(save)
    };

    return fetch(request, "POST", data)
      .then(response => {
        console.log(response);
        if (response.id != null) {
          return this.setStateAsync({
            genaID:   response.id,
            genaSave: save
          });
        }
      })
      .catch(error => console.error(error))
      .finally(() => {
        if (dev) {
          return this.setStateAsync({ genaSave: save })
        }
      })
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      fetch("getMtsSnapshots")
        .then(response => {
          const saves = response.data.sort((l, r) => r.dateUpdate - l.dateUpdate);
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
                .then(() => resolve())
                .catch(error => reject(error));
            }
          }
          else {
            resolve();
          }
        })
        .catch(reason => {
          if (dev) {
            setTimeout(() => {
              this.extractSave();
              resolve();
            }, 2_000);
          }
          else {
            this.showAlert(`Не удалось получить сохранения! ${reason}`);
            reject(reason);
          }
        });
    });
  }

  imitateFetchcingTools() {
    return new Promise((resolve, reject) => {
      if (Tools.storageReady) {
        this.setStateAsync({ toolsLoading: true });
        const oldTool = this.getCurrentTool();
        const newTools = [...Tools.storage];
        setTimeout(() => {
          this.setState({
            tools: newTools,
            toolsLoading: false,
          }, () => {
            Tools.storage = [];
            Tools.storageReady = false;

            const newTool = newTools[Tools.getToolIndexByCode(newTools, oldTool.code)];

            if (oldTool.code != newTool.code) {
              this.updatePriceRange(newTool).then(() => resolve())
            }
            else {
              resolve()
            }
          });
        }, 2_000);
      }
      else {
        resolve();
      }
    })
  }

  prefetchTools() {
    return new Promise(resolve => {
      Tools.storage = [];
      Tools.storageReady = false;
      const { investorInfo } = this.state;
      const requests = [];
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => {
              if (response.data?.length == 0) {
                console.warn("В ответе с сервера нет " + (request == "getFutures" ? "фючерсов" : "акций"));
              }
              return Tools.parse(response.data, { investorInfo })
            })
            .then(tools => Tools.sort(Tools.storage.concat(tools)))
            .then(tools => {
              Tools.storage = [...tools];
            })
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.all(requests).then(() => {
        Tools.storageReady = true;

        const tools = [...Tools.storage];
        const futuresCount = tools.filter(tool => tool.ref.toolType == "futures").length;
        const stocksCount = tools.filter(tool => tool.ref.toolType == "shareUs" || tool.ref.toolType == "shareRu").length;

        // console.log(`Акций: ${stocksCount}, фьючерсов: ${futuresCount}`);

        if (futuresCount == 0) {
          console.warn("В массиве нет фьючерсов!", tools);
        }
        
        if (stocksCount == 0) {
          console.warn("В массиве нет акций!", tools);
        }

        resolve();
      })
    })
  }

  fetchTools(shouldUpdatePriceRange = true) {
    return new Promise(resolve => {
      const requests = [];
      this.setState({ toolsLoading: true })
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo: this.state.investorInfo }))
            .then(tools => Tools.sort(this.state.tools.concat(tools)))
            .then(tools => this.setStateAsync({ tools }))
            .then(() => {
              if (shouldUpdatePriceRange && this.state.id == null) {
                this.updatePriceRange(this.getCurrentTool())
              }
            })
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

    Promise.all(requests)
      .then(() => this.setStateAsync({ toolsLoading: false }))
      .then(() => resolve())
    })
  }

  fetchInvestorInfo() {
    return new Promise((resolve, reject) => {
      fetch("getInvestorInfo")
        .then(this.applyInvestorInfo)
        .then(response => {
          const depo = response.data.deposit || 10_000;
          return this.setStateAsync({ depo });
        })
        .then(syncToolsWithInvestorInfo.bind(this))
        .then(() => resolve())
        .catch(reason => reject(reason))
        .finally(() => {
          if (dev) {
            this.setStateAsync({
              investorInfo: {
                email:   "justbratka@ya.ru",
                deposit: 50_000,
                status:  "KSUR",
                skill:   "SKILLED",
                type:    this.state.percentage >= 0 ? "LONG" : "SHORT"
              }
            })
              .then(syncToolsWithInvestorInfo.bind(this));
          }
          else {
            syncToolsWithInvestorInfo.bind(this);
          }
        })
    })
  }

  updatePriceRange(tool) {
    return new Promise(resolve => {
      const currentPrice = tool.currentPrice;
      this.setState({ priceRange: [currentPrice, currentPrice] }, () => resolve());
    })
  }

  importDataFromGENA(genaSave) {
    // ~~
    const { mode, presetSelection } = this.state;

    if (!genaSave) {
      return Promise.resolve();
    }
    
    if (algorithms[mode].name != genaSave.presets.find(preset => preset.name == genaSave.currentPresetName).type) {
      return Promise.resolve();
    }

    const options = genaSave?.presets.filter(preset => preset.type == algorithms[mode].name) || [{ name: algorithm.name }];
    const currentPreset = options[presetSelection[mode]];

    let percentToSteps = currentPreset.type == "Лимитник"
      ? stepConverter.complexFromPercentToSteps
      : stepConverter.fromPercentsToStep;
    
    let totalStep = 0;

    const primaryOption = currentPreset.options["Закрытие основного депозита"];
    if (primaryOption && primaryOption.customData) {
      totalStep += primaryOption.customData.reduce((acc, curr) => {
        const value = curr.inPercent
          ? percentToSteps(curr.preferredStep, currentTool, contracts)
          : curr.preferredStep;
        return acc + Number(value);
      }, 0);
    }

    const secondaryOption = currentPreset.options["Закрытие плечевого депозита"];
    if (secondaryOption && secondaryOption.customData) {
      totalStep += secondaryOption.customData.reduce((acc, curr) => {
        const value = curr.inPercent
          ? percentToSteps(curr.preferredStep, currentTool, contracts)
          : curr.preferredStep;
        return acc + Number(value);
      }, 0);
    }

    return this.setStateAsync({
      depo:            genaSave.depo + genaSave.secondaryDepo,
      percentage:      genaSave.load,
      currentToolCode: currentPreset.options.currentToolCode,
      risk:            genaSave.risk,
      totalIncome:     genaSave.totalIncome,
      totalStep,
    });
  }

  showAlert(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  bindEvents() {
  }

  packSave() {
    const {
      depo,
      customTools,
      currentToolCode,
      priceRange,
      percentage,
      profitRatio,
      risk,
      mode,
      days,
      scaleOffset
    } = this.state;

    const json = {
      static: {
        depo,
        priceRange,
        percentage,
        profitRatio,
        risk,
        mode,
        days,
        scaleOffset,
        customTools,
        currentToolCode,
        current_date: "#"
      },
    };

    console.log("Packed save:", json);
    return json;
  }

  validateSave() {
    return true;
  }

  extractSave(save) {
    const onError = e => {
      this.showAlert(String(e));
      console.error(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        console.log(saves, currentSaveIndex - 1);
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    const { saves, investorInfo } = this.state;
    let staticParsed;

    let state = {};
    let failed = false;

    if (dev) {
      state = {
        currentToolCode: "AAPL",
        current_date: "#",
        customTools: [],
        days: 1,
        depo: 1000000,
        mode: 0,
        percentage: -12.5,
        priceRange: [129.042, 132.006],
        profitRatio: 60,
        risk: 0.5,
        scaleOffset: -2.6,
      };

      state.id = 0;
      state.saved = true;
      state.loading = false;
    }
    else {
      try {
        let lastUpdated = save.dateUpdate || save.dateCreate;
        console.log('Extracting save:', save, "last updated:", new Date(lastUpdated * 1_000).toLocaleString("ru").replace(/\./g, "/"));

        staticParsed = JSON.parse(save.static);
        console.log("Parsed static", staticParsed);
  
        const initialState = { ...this.initialState };
  
        state.depo = staticParsed.depo || initialState.depo;
  
        state.priceRange = staticParsed.priceRange || initialState.priceRange;
  
        state.percentage = staticParsed.percentage || initialState.percentage;
  
        state.profitRatio = staticParsed.profitRatio || initialState.profitRatio;
  
        state.risk = staticParsed.risk || initialState.risk;
  
        state.mode = staticParsed.mode || initialState.mode;
  
        state.days = staticParsed.days || initialState.days;
  
        state.scaleOffset = staticParsed.scaleOffset || initialState.scaleOffset;
        
        // TODO: у инструмента не может быть ГО <=0, по идее надо удалять такие инструменты
        state.customTools = staticParsed.customTools || [];
        state.customTools = state.customTools
          .map(tool => Tools.create(tool, { investorInfo }));
  
        state.currentToolCode = staticParsed.currentToolCode ||initialState.currentToolCode;
  
        state.id = save.id;
        state.saved = true;
        state.loading = false;
        state.currentSaveIndex = saves.indexOf( saves.find(currSave => currSave.id == save.id) ) + 1;
      }
      catch (e) {
        failed = true;
        state = {
          id: save.id,
          saved: true
        };
  
        onError(e);
      }
    }

    state.investorInfo = { ...this.state.investorInfo };
    state.investorInfo.type = state.percentage >= 0 ? "LONG" : "SHORT";

    console.log('Parsing save finished!', state);
    return this.setStateAsync(state)
      .then(syncToolsWithInvestorInfo.bind(this))
      .then(() => {
        const priceRangeMinMax = priceRange => {
          let range = [...priceRange].sort((l, r) => l - r);

          const { days, scaleOffset } = this.state;
          // Проверка на выход за диапазоны
          const currentTool = this.getCurrentTool();
          const price = currentTool.currentPrice;
          let percent = currentTool.adrDay;
          if (days == 5) {
            percent = currentTool.adrWeek;
          }
          else if (days == 20) {
            percent = currentTool.adrMonth;
          }

          const max = price + percent - scaleOffset;
          const min = price - percent + scaleOffset;

          if (priceRange[1] > max || priceRange[0] < min) {
            range = [price, price];
          }

          return range;
        };

        const priceRange = priceRangeMinMax(state.priceRange);
        return this.setStateAsync({ priceRange });
      });
  }

  reset() {
    return new Promise(resolve => {
      const state = JSON.parse(JSON.stringify(this.initialState));
      this.setStateAsync(state)
        .then(() => this.updatePriceRange(this.getCurrentTool()));
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
      };

      fetch("addMtsSnapshot", "POST", data)
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
      if (dev) {
        resolve();
      }

      if (!id) {
        reject("id must be present!");
      }

      const json = this.packSave();
      const data = {
        id,
        name,
        static: JSON.stringify(json.static),
      };
      fetch("updateMtsSnapshot", "POST", data)
        .then(response => {
          console.log("Updated!", response);
          resolve();
        })
        .catch(error => console.error(error));
    })
  }

  delete(id = 0) {
    console.log(`Deleting id: ${id}`);

    return new Promise((resolve, reject) => {
      fetch("deleteMtsSnapshot", "POST", { id })
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
              .catch(err => this.showAlert(err));
          }
          else {
            this.reset()
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

  getCurrentTool() {
    const { tools, currentToolCode } = this.state;
    return tools.find(tool => tool.code == currentToolCode) || Tools.create();
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  getOptions() {
    return this.getTools().map((tool, idx) => {
      return {
        idx:   idx,
        label: String(tool),
      };
    });
  }

  getSortedOptions() {
    return sortInputFirst(this.state.searchVal, this.getOptions());
  }

  getCurrentToolIndex() {
    const { currentToolCode } = this.state;
    return Tools.getToolIndexByCode(this.getTools(), currentToolCode);
  }
  
  getToolByCode(code) {
    const { tools } = this.state;
    return tools.find(tool => tool.code == code) || Tools.create();
  }

  /**
   * Возвращает название текущего сейва (по дефолту возвращает строку "Моделирование Торговой Стратегии")
   */
  getTitle() {
    const { saves, currentSaveIndex } = this.state;
    let title = "Моделирование Торговой Стратегии";

    if (saves.length && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    let {
      data,
      days,
      depo,
      mode,
      page,
      risk,
      chance,
      currentToolCode,
      percentage,
      priceRange,
      profitRatio,
      scaleOffset,
      toolsLoading,
      movePercantage,
      investorInfo,
      prevDays,
      genaSave,
      presetSelection,
      totalIncome,
      totalStep
    } = this.state;

    const tools = this.getTools();
    const currentTool = this.getCurrentTool();
    const fraction = fractionLength(currentTool.priceStep);

    const isLong = percentage >= 0;
    const priceRangeSorted = [...priceRange].sort((l, r) => l - r);
    
    const planIncome = round(priceRangeSorted[1] - priceRangeSorted[0], 2);
    const contracts = Math.floor(depo * (Math.abs(percentage) / 100) / currentTool.guarantee);

    const disabledModes = [
      currentTool.isFutures && currentTool.volume < 1e9,
      currentTool.isFutures && currentTool.volume < 1e9 || depo <= 600_000,
      depo <= 100_000
    ];
    if (disabledModes[mode]) {
      mode = disabledModes.indexOf(false);
    }

    
    const price = currentTool.currentPrice;
    let percent = currentTool.adrDay;
    if (days == 5) {
      percent = currentTool.adrWeek;
    }
    else if (days == 20) {
      percent = currentTool.adrMonth;
    }

    const max = price + percent;
    const min = price - percent;

    const STEP_IN_EACH_DIRECTION = 20;
    const step = (max - min) / (STEP_IN_EACH_DIRECTION * 2);
    
    // let income = (contracts || 1) * planIncome / currentTool.priceStep * currentTool.stepPrice;
    let income = totalIncome * profitRatio / 100
    
    const ratio = income / depo * 100;
    let suffix = round(ratio, 2);
    if (suffix > 0) {
      suffix = "+" + suffix;
    }

    const kod = round(ratio / (days || 1), 2);

    const getPossibleRisk = () => {
      const currentTool = this.getCurrentTool();
      let { depo, percentage, priceRange, risk } = this.state;
      const contracts = Math.floor(depo * (Math.abs(percentage) / 100) / currentTool.guarantee);
      let possibleRisk = 0;
      const isLong = percentage >= 0;
      let enterPoint = isLong ? priceRange[0] : priceRange[1];

      let stopSteps =
        (depo * risk / 100)
        /
        currentTool.stepPrice
        /
        (contracts || 1)
        *
        currentTool.priceStep;

      if (risk != 0 && percentage != 0) {
        possibleRisk = round(enterPoint + (isLong ? -stopSteps : stopSteps), 2);
        updateChartMinMax(priceRange, isLong, possibleRisk);
      }

      return possibleRisk;
    }

    let possibleRisk = getPossibleRisk();


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
              <Tooltip title="Настройки">
                <button
                  className="settings-button js-open-modal main-top__settings"
                  onClick={e => dialogAPI.open("config", e.target)}
                >
                  <span className="visually-hidden">Открыть конфиг</span>
                  <SettingFilled className="settings-button__icon" />
                </button>
              </Tooltip>
            </Header>

            <div className="main-content">

              <div className="container">

                <div className="main-content__wrap">
                  {(() => {
                    return (
                      <Stack className="main-content__left">

                        <label>
                          <span className="visually-hidden">Торговый инструмент</span>
                          
                          <Select
                            onFocus={() => this.setState({ isToolsDropdownOpen: true })}
                            onBlur={() => {
                              this.setStateAsync({ isToolsDropdownOpen: false })
                                .then(() => this.imitateFetchcingTools());
                            }}
                            value={toolsLoading && tools.length == 0 ? 0 : this.getCurrentToolIndex()}
                            onChange={currentToolIndex => {
                              const tools = this.getTools();
                              const currentToolCode = tools[currentToolIndex].code;
                              this.setStateAsync({ currentToolCode, isToolsDropdownOpen: false })
                                .then(() => this.updatePriceRange(tools[currentToolIndex]))
                                .then(() => this.imitateFetchcingTools())
                                .then(() => this.fetchCompanyQuotes());
                            }}
                            disabled={toolsLoading}
                            loading={toolsLoading}
                            showSearch
                            onSearch={(value) => this.setState({ searchVal: value })}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: "100%" }}
                          >
                            {(() => {
                              if (toolsLoading && tools.length == 0) {
                                return (
                                  <Option key={0} value={0}>
                                    <LoadingOutlined style={{ marginRight: ".2em" }} />
                                    Загрузка...
                                  </Option>
                                )
                              }
                              else {
                                return this.getSortedOptions().map((option) => (
                                  <Option key={option.idx} value={option.idx}>
                                    {option.label}
                                  </Option>
                                ));
                              }
                            })()}
                          </Select>
                        </label>
                        {/* Торговый инструмент */}

                        <div className="mts-slider1">
                          <span className="mts-slider1-middle">
                            <b>Текущая цена</b><br />
                            {(() => {
                              if(toolsLoading) {
                                return <LoadingOutlined/>
                              }
                              else {
                                return formatNumber(price)
                              }
                            })()}
                            
                          </span>
                          <span className="mts-slider1-top">
                            <b>{formatNumber(round(max - scaleOffset, fraction))}</b>
                            &nbsp;
                            (+{round((percent / currentTool.currentPrice * 100) + movePercantage, 2)}%)
                          </span>
                          <span className="mts-slider1-bottom">
                            <b>{formatNumber(round(min + scaleOffset, fraction))}</b>
                            &nbsp;
                            (-{round((percent / currentTool.currentPrice * 100) + movePercantage, 2)}%)
                          </span>
                          <CustomSlider
                            className="mts-slider1__input"
                            range
                            vertical
                            value={priceRange}
                            max={max - scaleOffset}
                            min={min + scaleOffset}
                            percentage={percentage}
                            step={step}
                            precision={1}
                            tooltipPlacement="left"
                            tipFormatter={value => formatNumber(+(value).toFixed(fraction))}
                            onChange={priceRange => {
                              this.setState({ priceRange, changed: true });
                              updateChartMinMax(priceRange, isLong, possibleRisk);
                            }}
                          />

                          <Button
                            className="scale-button scale-button--default"
                            onClick={ e => {
                              updateChartScaleMinMax(min, max);
                              this.setState({
                                scaleOffset: 0,
                                changedMinRange: min,
                                changedMaxRange: max,
                                movePercantage: 0,
                                days: prevDays
                              });
                            }}
                            disabled={scaleOffset == 0}
                          >
                            отмена
                          </Button>

                          <Button
                            className="scale-button scale-button--minus"
                            onClick={ () => {
                              let { scaleOffset } = this.state;
                              const sliderStepPercent = .5;
                              const scaleStep = round(price * .005 , 2);

                              const updatedScaleOffset = scaleOffset - scaleStep;
                              
                              if (min + updatedScaleOffset != 0) {
                                this.setState({
                                  scaleOffset: updatedScaleOffset,
                                  changedMinRange: min + updatedScaleOffset,
                                  changedMaxRange: max - updatedScaleOffset,
                                  movePercantage: movePercantage + sliderStepPercent,
                                  days: this.initialState.days
                                });
                                updateChartScaleMinMax(min + updatedScaleOffset, max - updatedScaleOffset);
                              }
                            }}
                            aria-label="Увеличить масштаб графика"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 227.406 227.406"><g ><path d="M217.575 214.708l-65.188-67.793c16.139-15.55 26.209-37.356 26.209-61.485C178.596 38.323 140.272 0 93.167 0 46.06 0 7.737 38.323 7.737 85.43c0 47.106 38.323 85.43 85.43 85.43 17.574 0 33.922-5.339 47.518-14.473l66.078 68.718a7.482 7.482 0 005.407 2.302 7.5 7.5 0 005.405-12.699zM22.737 85.43c0-38.835 31.595-70.43 70.43-70.43 38.835 0 70.429 31.595 70.429 70.43s-31.594 70.43-70.429 70.43c-38.835-.001-70.43-31.595-70.43-70.43z" /><path d="M131.414 77.93H54.919c-4.143 0-7.5 3.357-7.5 7.5s3.357 7.5 7.5 7.5h76.495c4.143 0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5z" /></g></svg>
                          </Button>

                          <Button
                            className="scale-button scale-button--plus"
                            disabled={(() => {
                              let { scaleOffset } = this.state;
                              let scaleStep = round(price * .005, 2);
                              const updatedScaleOffset = scaleOffset + scaleStep;
                              return Math.abs((min + updatedScaleOffset) - (max - updatedScaleOffset)) < step;
                            })()}
                            onClick={ () => {
                              let { scaleOffset } = this.state;
                              const sliderStepPercent = .5;
                              let scaleStep = round(price * .005, 2);
                              
                              const updatedScaleOffset = scaleOffset + scaleStep;
                              Math.abs((min + updatedScaleOffset + scaleStep) - (max - updatedScaleOffset + scaleStep))
                              if (min + updatedScaleOffset < max - updatedScaleOffset) {
                                this.setState({
                                  scaleOffset: updatedScaleOffset, changedMinRange: min + updatedScaleOffset,
                                  changedMaxRange: max - updatedScaleOffset,
                                  movePercantage: movePercantage + sliderStepPercent,
                                  days: 0
                                });
                                updateChartScaleMinMax(min + updatedScaleOffset, max - updatedScaleOffset);
                              }
                            }}
                            aria-label="Уменьшить масштаб графика"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480.606 480.606"><path d="M202.039 125.423h-30v46.616h-46.617v30h46.617v46.616h30v-46.616h46.615v-30h-46.615z" /><path d="M480.606 459.394L329.409 308.195c27.838-32.663 44.668-74.978 44.668-121.157C374.077 83.905 290.172 0 187.039 0S0 83.905 0 187.039s83.905 187.039 187.039 187.039c46.179 0 88.495-16.831 121.157-44.669l151.198 151.198 21.212-21.213zM187.039 344.077C100.447 344.077 30 273.63 30 187.039S100.447 30 187.039 30s157.039 70.447 157.039 157.039-70.448 157.038-157.039 157.038z" /></svg>
                          </Button>
                        </div>

                        <div className="card main-content-stats">
                          <div className="main-content-stats__wrap">

                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Цена приобретения позиции">
                                  Точка входа
                                </Tooltip>
                              </span>
                              <NumericInput
                                key={this.state.priceRange}
                                min={min}
                                max={max}
                                unsigned="true"
                                format={number => formatNumber(round(number, fraction))}
                                round={"false"}
                                defaultValue={(isLong ? priceRange[0] : priceRange[1]) || 0}
                                onBlur={value => {
                                  const callback = () => {
                                    const possibleRisk = getPossibleRisk();
                                    updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                                    this.setState({ changed: true });
                                  };

                                  // ЛОНГ: то есть точка входа - снизу (число меньше)
                                  if (isLong) {
                                    if (value > priceRange[1]) {
                                      this.setState({ priceRange: [priceRange[1], value] }, callback);
                                    }
                                    else {
                                      this.setState({ priceRange: [value, priceRange[1]] }, callback);
                                    }
                                  }
                                  // ШОРТ: то есть точка входа - сверху (число больше)
                                  else {
                                    if (value < priceRange[0]) {
                                      this.setState({ priceRange: [value, priceRange[0],] }, callback);
                                    }
                                    else {
                                      this.setState({ priceRange: [priceRange[0], value] }, callback);
                                    }
                                  }
                                }}
                              />
                            </div>

                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Цена закрытия позиции">
                                  Точка выхода
                                </Tooltip>
                              </span>
                              <NumericInput
                                key={this.state.priceRange}
                                min={min}
                                max={max}
                                format={ number => formatNumber(round(number, fraction)) }
                                unsigned="true"
                                round={"false"}
                                defaultValue={(isLong ? priceRange[1] : priceRange[0]) || 0}
                                onBlur={value => {
                                  const callback = () => {
                                    const possibleRisk = getPossibleRisk();
                                    updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                                    this.setState({ changed: true });
                                  };

                                  // ЛОНГ: то есть точка выхода - сверху (число меньше)
                                  if (isLong) {
                                    if (value < priceRange[0]) {
                                      this.setState({ priceRange: [value, priceRange[0]] }, callback);
                                    }
                                    else {
                                      this.setState({ priceRange: [priceRange[0], value] }, callback);
                                    }
                                  }
                                  // ШОРТ: то есть точка выхода - снизу (число больше)
                                  else {
                                    if (value > priceRange[1]) {
                                      this.setState({ priceRange: [priceRange[1], value] }, callback);
                                    }
                                    else {
                                      this.setState({ priceRange: [value, priceRange[1]] }, callback);
                                    }
                                  }
                                }}
                              />
                            </div>

                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Величина движения цены от точки входа до выхода">
                                  Величина хода
                                </Tooltip>
                              </span>
                              <span className="main-content-stats__val">
                                {formatNumber(totalStep)}
                              </span>
                            </div>
                            
                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Количество контрактов на заданную загрузку">
                                  Контрактов
                                </Tooltip>
                              </span>
                              <span className="main-content-stats__val">
                                {contracts}
                              </span>
                            </div>

                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Значение для коррекции прибыли">
                                  Коэффициент прибыли
                                </Tooltip>
                              </span>
                              <NumericInput 
                                unsigned="true"
                                key={mode + chance * Math.random()} 
                                disabled={mode == 0}
                                defaultValue={profitRatio}
                                min={0}
                                max={100}
                                onBlur={profitRatio => this.setState({ profitRatio })}
                                suffix="%"
                              />
                            </div>

                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Величина stop loss в процентах от депозита">
                                  Риск движения против
                                </Tooltip>
                              </span>
                              <NumericInput
                                defaultValue={risk}
                                min={0}
                                max={100}
                                unsigned="true"
                                suffix="%"
                                format={number => formatNumber(round(number, fraction))}
                                round={"false"}
                                onBlur={risk => {
                                  this.setStateAsync({ risk, changed: true })
                                    .then(() => {
                                      let possibleRisk = getPossibleRisk();
                                      updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                                    });
                                }}
                              />
                            </div>

                            <div className="main-content-stats__row">
                              <span>
                                <Tooltip title="Цена (уровень) закрытия позиции по стопу">
                                  Stop Loss
                                </Tooltip>
                              </span>
                              <span className="main-content-stats__val">
                                {formatNumber(round(possibleRisk, 2))}
                              </span>
                            </div>

                            {(() => {
                              return (
                                <>
                                  <div className="main-content-stats__row">
                                    <span>
                                      <Tooltip title="Размер прибыли на депозит при заданных условиях">
                                        Прибыль
                                      </Tooltip>
                                    </span>
                                    <span className="main-content-stats__val">
                                      {`${formatNumber(Math.floor(income))} (${suffix}%)`}
                                    </span>
                                  </div>

                                  <div className="main-content-stats__row">
                                    <span>
                                      <Tooltip title="Величина убытка при закрытии позиции по стопу">
                                        Убыток
                                      </Tooltip>
                                    </span>
                                    <span className="main-content-stats__val">
                                      {`${formatNumber(Math.floor(depo * risk / 100))} ₽`}
                                    </span>
                                  </div>

                                  <div className="main-content-stats__row">
                                    <span>
                                      <Tooltip title="Коэффициент оборачиваемости денег - прибыль в процентах к депозиту">
                                        КОД
                                      </Tooltip>
                                    </span>
                                    <span className="main-content-stats__val">
                                      {(() => {
                                        if (scaleOffset != 0) {
                                          return "-"
                                        }
                                        else {
                                          return formatNumber(kod) + "%"
                                        }
                                      })()}
                                    </span>
                                  </div>
                                </>
                              )
                            })()}

                          </div>
                        </div>

                      </Stack>
                    )
                  })()}

                  <Stack className="main-content__right">
                    <Chart
                      className="mts__chart"
                      key={currentTool.toString() + this.state.loadingChartData}
                      min={min}
                      max={max}
                      priceRange={priceRange}
                      loading={this.state.loadingChartData}
                      tool={currentTool}
                      data={data}
                      days={days}
                      onRendered={() => {
                        // console.log("Chart has been rendered");

                        const { percentage, priceRange, scaleOffset, days } = this.state;
                        const isLong = percentage >= 0;
                        const possibleRisk = getPossibleRisk();
                        updateChartMinMax(priceRange, isLong, possibleRisk);
                        updateChartScaleMinMax(min + scaleOffset, max - scaleOffset);
                        updateChartZoom(days);
                      }}
                    />

                    {(() => {
                      return (
                        <div className={
                          ["mts-slider2"].concat(percentage >= 0 ? "right" : "")
                            .join(" ")
                            .trim()
                        }>
                          <span className="mts-slider2-middle">
                            <Tooltip title="Объём депозита в процентах на вход в сделку">
                              Загрузка:{" "}
                            </Tooltip>

                            <NumericInput
                              format={number => round(number, 2)}
                              suffix="%"
                              round={"false"}
                              key={percentage}
                              defaultValue={percentage}
                              onBlur={ percentage => this.setState({ percentage }) }
                            />
                          </span>

                          <CustomSlider
                            className="mts-slider2__input"
                            style={{
                              "--primary-color": percentage >= 0 ? "var(--accent-color)" : "var(--danger-color)",
                              "--primary-color-lighter": percentage >= 0 ? "var(--accent-color-lighter)" : "var(--danger-color-lighter)",
                            }}
                            range
                            value={[0, percentage].sort((l, r) => l - r)}
                            min={-100}
                            max= {100}
                            step= {.5}
                            precision={1}
                            tooltipVisible={false}
                            onChange={(range = []) => {
                              let { investorInfo } = this.state;
                              const percentage = range[0] + range[1];
                              
                              investorInfo.type = percentage >= 0 ? "LONG" : "SHORT";

                              updateChartMinMax(this.state.priceRange, percentage >= 0, possibleRisk);
                              this.setStateAsync({
                                investorInfo,
                                percentage, 
                                changed: true
                              })
                                .then(syncToolsWithInvestorInfo.bind(this))
                            }}
                          />

                          <span aria-hidden="true" className="mts-slider2-short">Short</span>
                          <span aria-hidden="true" className="mts-slider2-long">Long</span>
                        </div>
                      )
                    })()}
                    {/* long-short */}

                    <div className="main-content-options">
                      <div className="main-content-options__wrap">

                        <div className="main-content-options__row">
                          <span className="main-content-options__label">
                            <Tooltip title="Настройки торгового робота для расчёта результатов торговой стратегии">
                              Алгоритм МАНИ 144
                            </Tooltip>
                          </span>

                          <div className="main-content-options-group">

                            {algorithms.map((algorithm, index) => (() => {
                              // ~~
                              let options = genaSave?.presets.filter(preset => preset.type == algorithm.name) || [{ name: algorithm.name }];

                              return (
                                <Select
                                  className={mode == index ? "selected" : ""}
                                  value={presetSelection[index]}
                                  disabled={disabledModes[index]}
                                  showArrow={options?.length > 1}
                                  dropdownStyle={{
                                    visibility:    options?.length > 1 ? "visible" : "hidden",
                                    pointerEvents: options?.length > 1 ? "all"     : "none"
                                  }}
                                  onSelect={value => {
                                    presetSelection[index] = value;

                                    this.setStateAsync({
                                      presetSelection,
                                      mode: index,
                                      profitRatio: algorithm.profitRatio,
                                      changed: true
                                    })
                                      .then(() => this.importDataFromGENA(genaSave));
                                  }}
                                  onFocus={e => {
                                    if (options?.length == 1) {
                                      presetSelection[index] = 0;

                                      this.setStateAsync({
                                        presetSelection,
                                        mode: index,
                                        profitRatio: algorithm.profitRatio,
                                        changed: true
                                      })
                                        .then(() => this.importDataFromGENA(genaSave));
                                    }
                                  }}
                                >
                                  {options.map((preset, index) =>
                                    <Select.Option value={index} title={preset.name}>
                                      {preset.name}
                                    </Select.Option>
                                  )}
                                </Select>
                              )
                            })())}
                            

                          </div>

                          <button
                            className="settings-button js-open-modal main-content-options__settings"
                            onClick={e => dialogAPI.open("settings-generator", e.target)}
                            // На проде ГЕНА дизейблится
                            disabled={dev ? false : !location.href.replace(/\/$/, "").endsWith("-dev")}
                          >
                            <span className="visually-hidden">Открыть конфиг</span>
                            <Tooltip title=" Генератор настроек МАНИ 144">
                              <SettingFilled className="settings-button__icon" />
                            </Tooltip>
                          </button>
                        </div>

                        <div className="main-content-options__row">
                          <span className="main-content-options__label">
                            <Tooltip title="Продолжительность нахождения в сделке">
                              Дней в позиции
                            </Tooltip>
                          </span>
                          <Radio.Group
                            className="main-content-options__radio"
                            key={days}
                            defaultValue={days}
                            onChange={e => {
                              const days = e.target.value;

                              const fraction = fractionLength(currentTool.priceStep);
                              const price    = round(currentTool.currentPrice, fraction);
                              let percent = currentTool.adrDay;
                              if (days == 5) {
                                percent = currentTool.adrWeek;
                              }
                              else if (days == 20) {
                                percent = currentTool.adrMonth;
                              }

                              const max = round(price + percent, fraction);
                              const min = round(price - percent, fraction);

                              this.setState({ days, prevDays: days, changed: true });
                              updateChartScaleMinMax(min, max);
                              updateChartZoom(days);
                            }}
                          >
                            <Radio value={1}>день</Radio>
                            <Radio value={5}>неделя</Radio>
                            <Radio value={20}>месяц</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                    </div>
                    {/* Mods */}

                    {(() => {
                      const period = Math.min(days, 5);

                      return (
                        <div className="mts-table">
                          <h3>
                            <Tooltip title="Раздел для ввода результатов оборачиваемости средств на депозите в течении сделки">
                              Статистика КОД
                            </Tooltip>
                          </h3>
                          <table>
                            <thead>
                              <tr>
                                <th>День</th>
                                <th>План %</th>
                                <th>Факт %</th>
                                <th>Доходность</th>
                              </tr>
                            </thead>
                            <tbody>
                              {new Array(period).fill(0).map((value, index) =>
                                <tr key={index}>
                                  <td>{((page - 1) * period) + (index + 1)}</td>
                                  <td>{kod}</td>
                                  <td><Input defaultValue="1"/></td>
                                  <td><Input defaultValue="1"/></td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <Pagination
                            key={days}
                            style={{display: days < 20 ? "none" : "flex"}}
                            className="mts-table__paginator"
                            onChange={page => {
                              this.setState({ page })
                            }}
                            defaultCurrent={1}
                            pageSize={period}
                            total={days}
                          />
                        </div>
                      )
                    })()}
                  </Stack>
                </div>

              </div>
              {/* /.container */}

            </div>

          </main>
          {/* /.main */}

          {(() => {
            const { saves, id } = this.state;
            const currentTitle = this.getTitle();
            let namesTaken = saves.slice().map(save => save.name);
            let name = id ? currentTitle : "Новое сохранение";

            /**
             * Проверяет, может ли данная строка быть использована как название сейва
             * 
             * @param {String} nameToValidate
             * 
             * @returns {Array<String>} Массив ошибок (строк). Если текущее название валидно, массив будет пустым
             */
            const validate = (nameToValidate = "") => {
              nameToValidate = nameToValidate.trim();

              let errors = [];
              if (nameToValidate != currentTitle) {
                let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(nameToValidate);
                if (nameToValidate.length < 3) {
                  errors.push("Имя должно содержать не меньше трех символов!");
                }
                else if (test) {
                  errors.push(`Нельзя использовать символ "${test[0]}"!`);
                }
                if (namesTaken.indexOf(nameToValidate) > -1) {
                  console.log();
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
              let { id, data, saves, currentSaveIndex } = this.state;

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
                  .catch(err => this.showAlert(err));

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
              { name: "ADR неделя",   prop: "adrWeek"      },
              { name: "ADR месяц",    prop: "adrMonth"     },
            ]}
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}

            insertBeforeDialog={
              <label className="input-group input-group--fluid mts-config__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput
                  className="input-group__input"
                  key={this.state.depo}
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

          <Dialog
            id="settings-generator"
            pure={true}
          >
            <SettingsGenerator
              depo={depo}
              tools={tools}
              load={percentage}
              toolsLoading={toolsLoading}
              investorInfo={investorInfo}
              currentToolCode={currentToolCode}
              contracts={contracts}
              risk={risk}
              algorithm={algorithms[mode].name}
              genaSave={genaSave}
              onSave={genaSave => {
                this.saveGENA(genaSave);
                this.importDataFromGENA(genaSave);
              }}
              onUpdate={genaSave => {
                this.setStateAsync({ genaSave }).then(() => this.importDataFromGENA(genaSave));
              }}
              onClose={(save, e) => {

                unsavedGena = {...save};

                const genaSavePure = { ...genaSave };
                delete genaSavePure.key;

                let changed = false;

                if (genaSavePure == null) {
                  changed = true;
                }
                else if (!isEqual(save, genaSavePure)) {
                  var diff = function (obj1, obj2) {

                    // Make sure an object to compare is provided
                    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
                      return obj1;
                    }

                    //
                    // Variables
                    //

                    var diffs = {};
                    var key;


                    //
                    // Methods
                    //

                    /**
                     * Check if two arrays are equal
                     * @param  {Array}   arr1 The first array
                     * @param  {Array}   arr2 The second array
                     * @return {Boolean}      If true, both arrays are equal
                     */
                    var arraysMatch = function (arr1, arr2) {

                      // Check if the arrays are the same length
                      if (arr1.length !== arr2.length) return false;

                      // Check if all items exist and are in the same order
                      for (var i = 0; i < arr1.length; i++) {
                        if (arr1[i] !== arr2[i]) return false;
                      }

                      // Otherwise, return true
                      return true;

                    };

                    /**
                     * Compare two items and push non-matches to object
                     * @param  {*}      item1 The first item
                     * @param  {*}      item2 The second item
                     * @param  {String} key   The key in our object
                     */
                    var compare = function (item1, item2, key) {

                      // Get the object type
                      var type1 = Object.prototype.toString.call(item1);
                      var type2 = Object.prototype.toString.call(item2);

                      // If type2 is undefined it has been removed
                      if (type2 === '[object Undefined]') {
                        diffs[key] = null;
                        return;
                      }

                      // If items are different types
                      if (type1 !== type2) {
                        diffs[key] = item2;
                        return;
                      }

                      // If an object, compare recursively
                      if (type1 === '[object Object]') {
                        var objDiff = diff(item1, item2);
                        if (Object.keys(objDiff).length > 0) {
                          diffs[key] = objDiff;
                        }
                        return;
                      }

                      // If an array, compare
                      if (type1 === '[object Array]') {
                        if (!arraysMatch(item1, item2)) {
                          diffs[key] = item2;
                        }
                        return;
                      }

                      // Else if it's a function, convert to a string and compare
                      // Otherwise, just compare
                      if (type1 === '[object Function]') {
                        if (item1.toString() !== item2.toString()) {
                          diffs[key] = item2;
                        }
                      } else {
                        if (item1 !== item2) {
                          diffs[key] = item2;
                        }
                      }

                    };


                    //
                    // Compare our objects
                    //

                    // Loop through the first object
                    for (key in obj1) {
                      if (obj1.hasOwnProperty(key)) {
                        compare(obj1[key], obj2[key], key);
                      }
                    }

                    // Loop through the second object and find missing items
                    for (key in obj2) {
                      if (obj2.hasOwnProperty(key)) {
                        if (!obj1[key] && obj1[key] !== obj2[key]) {
                          diffs[key] = obj2[key];
                        }
                      }
                    }

                    // Return the object of differences
                    return diffs;

                  };

                  changed = true;
                }

                if (changed) {
                  dialogAPI.open("settings-generator-close-confirm", e.target);
                }
                else {
                  dialogAPI.close("settings-generator");
                }
              }}
              onDownload={(title, text) => {
                const file = new Blob([text], { type: 'text/plain' });

                const link = document.createElement("a");
                link.href = URL.createObjectURL(file);
                link.setAttribute('download', `${title}.txt`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              onToolSelectFocus={() => this.setState({ isToolsDropdownOpen: true })}
              onToolSelectBlur={() => {
                this.setStateAsync({ isToolsDropdownOpen: false })
                  .then(() => this.imitateFetchcingTools());
              }}
            />
          </Dialog>
          {/* ГЕНА */}

          <Dialog
            id="settings-generator-close-confirm"
            title="Предупреждение"
            confirmText="ОК"
            onConfirm={e => {
              dialogAPI.close("settings-generator");
              if (unsavedGena) {
                this.setStateAsync({ genaSave: { ...unsavedGena, key: Math.random() } })
                  .then(() => this.importDataFromGENA(unsavedGena))
                  .finally(() => {
                    unsavedGena = null;
                  });
              }
              return true;
            }}
            cancelText="Отмена"
          >
            Вы уверены, что хотите выйти? Все несохраненные изменения будут потеряны
          </Dialog>

        </div>
      </Provider>
    );
  }
}

export { App, Consumer }