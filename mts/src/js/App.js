import React from 'react'
const { Provider, Consumer } = React.createContext();
import {
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Pagination,
} from 'antd/es'
const { Option } = Select;
import { message } from 'antd';

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
import fallbackBoolean from '../../../common/utils/fallback-boolean';
import stepConverter   from './components/settings-generator/step-converter';

import syncToolsWithInvestorInfo from "../../../common/utils/sync-tools-with-investor-info"

import { cloneDeep, isEqual } from "lodash"

import { Tools, Tool, template, parseTool } from "../../../common/tools"

let chartModule;
let Chart;

import Stack                   from "../../../common/components/stack"
import { Dialog, dialogAPI }   from "../../../common/components/dialog"

import "../sass/style.sass";

import BaseComponent           from "../../../common/components/BaseComponent"
import Config                  from "../../../common/components/config"
import NumericInput            from "../../../common/components/numeric-input"
import Header                  from "./components/header"
import CustomSlider            from "../../../common/components/custom-slider"

import { SettingsGenerator, onSGOpen, onSGClose } from "./components/settings-generator"

function delay(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  )
}

// TODO: удалить и заменить на вызов функции
let min, max;

const algorithms = [
  { name: "Стандарт",  profitRatio: 100 },
  { name: "СМС + ТОР", profitRatio: 100 },
  { name: "Лимитник",  profitRatio: 100 }
];

let initialImport = true;
let genaTable;
let unsavedGena = null;
let lastSavedSG = null;
let sgChanged = false;

class App extends BaseComponent {

  constructor(props) {
    super(props);

    this.initialState = {

      loading: false,
      chartLoading: true,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },

      depo: 1_000_000,
      page: 1,
      priceRange: [null, null],
      percentage: 10,
      days: 1,
      prevDays: 1,
      data: null,

      customTools: [],
      /** Код текущего выбранного инструмента */
      currentToolCode:   "SBER",

      id:                  null,
      saved:              false,
      risk:                  .5,
      isResetDisabled:     true,
      scaleOffset:            0,
      changedMinRange:        0,
      changedMaxRange:        0,
      movePercantage:         0,
      profitRatio:          100,
      searchVal:             "",

      // Индекс алгоритма МААНИ (0 - Стандарт, 1 - СМС + ТОР, 2 - Лимитник)
      mode:                  0,
      // Индекс выбранного пресета в данной категории (mode)
      presetSelection:       algorithms.map(algorithm => 0),

      totalIncome:           0,
      totalStep:             0,

      toolsLoading:       false,
      isFocused:          false,

      kodTable: [],

      genaID:   -1,
      shouldImportSG: false,
    };

    this.state = {
      ...this.initialState,
      ...{
        saves:              [],
        currentSaveIndex:    0,
        tools:              [],
        genaSave: null,
      } 
    };

    // Bindings

    /** @type {applyInvestorInfo} */
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    /** @type {fetchSaveById} */
    this.fetchSaveById = fetchSaveById.bind(this, "Mts");
    /** @type {syncToolsWithInvestorInfo} */
    this.syncToolsWithInvestorInfo = syncToolsWithInvestorInfo.bind(this, null, { useDefault: true });
  }

  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData();

    import("./components/chart" /* webpackChunkName: "chart" */).then(module => {
      chartModule = module;
      Chart = module.Chart;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentToolCode } = this.state;
    if (prevState.currentToolCode != currentToolCode) {
      console.log("Сбрасываем масштаб графика");
      this.setStateAsync({ scaleOffset: 0 }).then(() => chartModule?.updateChartScaleMinMax(min, max));
    }

    const { id, saves } = this.state;
    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }

    const { shouldImportSG } = this.state;
    if (shouldImportSG) {
      setTimeout(() => {
        this.importDataFromGENA(this.state.genaSave)
      }, 100)
    }
  }

  fallbackToBasePreset() {
    console.warn("Resetting presetSelection");

    const { mode } = this.state;
    const presetSelection = [...this.state.presetSelection];
    presetSelection[mode] = 0

    const genaSave = cloneDeep(this.state.genaSave);
    const options = genaSave?.presets.filter(preset => preset.type == algorithms[mode].name) || [{ name: algorithm.name }];
    const currentPreset = options[presetSelection[mode]];
    genaSave.currentPresetName = currentPreset.name;
    
    return this.setStateAsync({ presetSelection, genaSave });
  }

  fetchCompanyQuotes() {
    // Отменяем запрос, если модуль с графиком не подгрузился или ответ от предыдущего запроса еще не был получен 
    if (!Chart) {
      return Promise.resolve();
    }

    this.setState({ chartLoading: true });

    let from = new Date();
    let to   = new Date();
    from.setMonth(from.getMonth() - 1);

    from = Math.floor(+from / 1000);
    to   = Math.floor(+to   / 1000);

    const tool = this.getCurrentTool();
    const { code } = tool;
    let method = "getCompanyQuotes";

    if (tool.dollarRate == 0) {
      method = "getPeriodFutures";

      let _f = from;
      let _t = to;

      if (tool.firstTradeDate) {
        _f = tool.firstTradeDate;
      }
      if (tool.lastTradeDate) {
        _t = tool.lastTradeDate;
      }

      if (_f < _t) {
        from = _f;
        to   = _t;
      }
      else {
        console.warn(_f, _t);
      }
    }

    let body = { code, from, to };
    
    if (tool.dollarRate != 0) {
      body = {
        ...body,
        region: tool.dollarRate != 1 ? "US" : "RU",
      };
    }

    fetch(method, "GET", body)
      .then(response => {
        const { data } = response;
        return this.setStateAsync({ data, chartLoading: false });
      })
      .catch(reason => {
        message.error(`Не удалось получить график для ${code}: ${reason}`);
        console.warn(`Не удалось получить график для ${code}: ${reason}`);

        this.setStateAsync({ chartLoading: false });
        // Пробуем отправить запрос снова 2 секунды
        return new Promise(resolve => {
          setTimeout(() => {
            this.fetchCompanyQuotes().then(() => resolve());
          }, 2_000)
        })
      });
  }

  setFetchingToolsTimeout() {
    const ms = dev ? 10_000 : 1 * 60 * 1_000;
    new Promise(resolve => {
      setTimeout(() => {
        const currentTool = this.getCurrentTool();
        if (!document.hidden) {
          fetch("getCompanyTrademeterInfo", "GET", {
            code:   currentTool.code,
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

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchTools()
      .then(() => this.setFetchingToolsTimeout())
      .then(() => {
        if (this.state.id == null) {
          this.updatePriceRange(this.getCurrentTool())
        }
      })
      .then(() => this.fetchSaves())
      .catch(error => console.error(error))
      .finally(() => {
        return Promise.allSettled([
          this.fetchInvestorInfo(),
          this.fetchGENA()
        ])
      })
      .then(() => this.fetchCompanyQuotes())
  }

  fetchGENA() {
    const parseGENASave = save => {
      save.ranull         = save.ranull == null ? 0 : save.ranull;
      save.ranullMode     = fallbackBoolean(save.ranullMode, true)
      save.ranullPlus     = save.ranullPlus == null ? 0 : save.ranullPlus;
      save.ranullPlusMode = fallbackBoolean(save.ranullPlusMode, true);

      // Ставим в ГЕНЕ такой же пресет, как и в сохраненном алгоритме МААНИИ
      const mode = this.state.mode;
      const { presetSelection } = this.state;
      const options = save?.presets.filter(preset => preset.type == algorithms[mode].name);
      const currentPreset = options[presetSelection[mode]];
      // Меняем в текущем пресете название инструмента, чтобы не произошло базинги
      currentPreset.options.currentToolCode = this.state.currentToolCode;
      // Делаем фолбек на дефолтный инструмент во всех пресетах
      save.presets = save.presets.map(preset => {
        preset.options.currentToolCode = preset.options.currentToolCode ?? "SBER";
        return preset;
      });

      save.currentPresetName = currentPreset.name;

      save.firstLoad = true;

      console.log("parseGENASave", save);
      return save;
    };

    return fetch("getGenaSnapshots")
      .then(response => {
        const { data } = response;
        console.log("getGenaSnapshots:", data);
        return this.setStateAsync({ genaSaves: data });
      })
      .then(() => new Promise((resolve, reject) => {
        const { id } = this.state.genaSaves[0];
        if (id != null) {
          fetch("getGenaSnapshot", "GET", { id })
            .then(response => {
              const { data } = response;
              try {
                let genaSave = JSON.parse(data.static);
                genaSave = parseGENASave(genaSave);
                lastSavedSG = cloneDeep(genaSave);
                sgChanged = false;

                console.log("getGenaSnapshot", genaSave);
                this.setStateAsync({ genaID: id, genaSave })
                  .then(() => delay(100))
                  .then(() => this.exportDataToSG(true))
                  .then(() => this.setStateAsync({ shouldImportSG: true }))
                  .then(() => resolve())
              }
              catch (e) {
                reject("Не удалось распарсить генератор настроек!", e);
              }
            })
            .catch(error => reject(error));
        }
        else {
          resolve();
        }
      }))
      .catch(error => console.error(error))
      .finally(() => {
        if (dev) {
          const response = {
            "error": false,
            "data": {
              "id": 60,
              "name": "",
              "dateCreate": 1629903262,
              "static": "{\"isLong\":true,\"comission\":1,\"risk\":0.5,\"depo\":10000000,\"secondaryDepo\":0,\"load\":10,\"currentTab\":\"Закрытие основного депозита\",\"presets\":[{\"name\":\"Стандарт\",\"type\":\"Стандарт\",\"options\":{\"currentToolCode\":\"BRV1\",\"Закрытие основного депозита\":{\"closeAll\":false,\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\",\"mode\":\"custom\",\"modes\":[\"custom\"],\"customData\":[{\"inPercent\":false,\"preferredStep\":0.03,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.05,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.08,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.09,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.11,\"length\":1,\"percent\":9,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.14,\"length\":1,\"percent\":9,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.17,\"length\":1,\"percent\":18,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.2,\"length\":1,\"percent\":2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.26,\"length\":1,\"percent\":2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.3,\"length\":1,\"percent\":3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.33,\"length\":1,\"percent\":7,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.35,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.39,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.45,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.53,\"length\":1,\"percent\":3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.55,\"length\":1,\"percent\":0.3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.65,\"length\":1,\"percent\":0.3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.75,\"length\":1,\"percent\":0.4,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.82,\"length\":1,\"percent\":0.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.84,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.86,\"length\":1,\"percent\":0.1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.89,\"length\":1,\"percent\":0.1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.05,\"length\":1,\"percent\":0.2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.15,\"length\":1,\"percent\":0.2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.25,\"length\":1,\"percent\":0.4,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.44,\"length\":1,\"percent\":0.5,\"stepInPercent\":\"\"}]},\"Прямые профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":1.64,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":1.64},\"Обратные профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":1.64,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":1.64}}},{\"name\":\"СМС + ТОР\",\"type\":\"СМС + ТОР\",\"options\":{\"currentToolCode\":\"SBER\",\"Закрытие основного депозита\":{\"closeAll\":false,\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}]},\"Закрытие плечевого депозита\":{\"closeAll\":false,\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}]},\"Обратные докупки (ТОР)\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}]},\"Прямые профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}]},\"Обратные профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}]}}},{\"name\":\"Лимитник\",\"type\":\"Лимитник\",\"options\":{\"currentToolCode\":\"SBER\",\"Закрытие основного депозита\":{\"closeAll\":false,\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":5.63,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":5.63},\"Обратные докупки (ТОР)\":{\"mode\":\"custom\",\"closeAll\":false,\"customData\":[{\"inPercent\":false,\"preferredStep\":5.63,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":5.63}}},{\"name\":\"Стандарт (BRV1)\",\"type\":\"Стандарт\",\"options\":{\"currentToolCode\":\"BRV1\",\"Закрытие основного депозита\":{\"closeAll\":false,\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\",\"mode\":\"custom\",\"modes\":[\"custom\"],\"customData\":[{\"inPercent\":false,\"preferredStep\":0.03,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.05,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":true,\"preferredStep\":0.08,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.09,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.11,\"length\":1,\"percent\":9,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.14,\"length\":1,\"percent\":9,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.17,\"length\":1,\"percent\":18,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.2,\"length\":1,\"percent\":2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.26,\"length\":1,\"percent\":2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.3,\"length\":1,\"percent\":3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.33,\"length\":1,\"percent\":7,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.35,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.39,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.45,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.53,\"length\":1,\"percent\":3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.55,\"length\":1,\"percent\":0.3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.65,\"length\":1,\"percent\":0.3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.75,\"length\":1,\"percent\":0.4,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.82,\"length\":1,\"percent\":0.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.84,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.86,\"length\":1,\"percent\":0.1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.89,\"length\":1,\"percent\":0.1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.05,\"length\":1,\"percent\":0.2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.15,\"length\":1,\"percent\":0.2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.25,\"length\":1,\"percent\":0.4,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.44,\"length\":1,\"percent\":0.5,\"stepInPercent\":\"\"}]},\"Прямые профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":1.64,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":1.64},\"Обратные профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":1.64,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":1.64}}},{\"name\":\"Стандарт (BRV1) 2\",\"type\":\"Стандарт\",\"options\":{\"currentToolCode\":\"BRV1\",\"Закрытие основного депозита\":{\"closeAll\":false,\"inPercent\":false,\"preferredStep\":\"\",\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\",\"mode\":\"custom\",\"modes\":[\"custom\"],\"customData\":[{\"inPercent\":false,\"preferredStep\":0.03,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.05,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.08,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.09,\"length\":1,\"percent\":9.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.11,\"length\":1,\"percent\":9,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.14,\"length\":1,\"percent\":9,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.17,\"length\":1,\"percent\":18,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.2,\"length\":1,\"percent\":2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.26,\"length\":1,\"percent\":2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.3,\"length\":1,\"percent\":3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.33,\"length\":1,\"percent\":7,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.35,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.39,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.45,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.53,\"length\":1,\"percent\":3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.55,\"length\":1,\"percent\":0.3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.65,\"length\":1,\"percent\":0.3,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.75,\"length\":1,\"percent\":0.4,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.82,\"length\":1,\"percent\":0.5,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.84,\"length\":1,\"percent\":1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.86,\"length\":1,\"percent\":0.1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":0.89,\"length\":1,\"percent\":0.1,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.05,\"length\":1,\"percent\":0.2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.15,\"length\":1,\"percent\":0.2,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.25,\"length\":1,\"percent\":0.4,\"stepInPercent\":\"\"},{\"inPercent\":false,\"preferredStep\":1.44,\"length\":1,\"percent\":0.5,\"stepInPercent\":\"\"}]},\"Прямые профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":1.64,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":1.64},\"Обратные профитные докупки\":{\"mode\":\"custom\",\"customData\":[{\"inPercent\":false,\"preferredStep\":1.64,\"length\":1,\"percent\":\"\",\"stepInPercent\":\"\"}],\"preferredStep\":1.64}}}],\"currentPresetName\":\"Стандарт (BRV1) 2\",\"isProfitableBying\":false,\"isReversedProfitableBying\":false,\"isMirrorBying\":false,\"isReversedBying\":false,\"ranull\":10,\"ranullMode\":true,\"ranullPlus\":3,\"ranullPlusMode\":true,\"totalIncome\":81099.29179999998,\"totalLoss\":50000}"
            }
          };
          const { data } = response;

          let genaSave = JSON.parse(data.static);
          genaSave = parseGENASave(genaSave);
          lastSavedSG = cloneDeep(genaSave);
          sgChanged = false;

          console.log("getGenaSnapshot", genaSave);
          this.setStateAsync({ genaID: response.data.id, genaSave })
            .then(() => delay(100))
            .then(() => this.exportDataToSG(true))
            .then(() => this.setStateAsync({ shouldImportSG: true }))
        }
      });
  }

  saveGENA(save) {
    const { genaID } = this.state;

    lastSavedSG = cloneDeep(save);
    sgChanged = false;

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
        if (!response.error) {
          message.success("Сохранено!");
          return this.setStateAsync({
            genaID:   response.id,
            genaSave: save
          });
        }
      })
      .catch(error => {
        console.error(error);
        message.error("Что-то пошло не так");
      })
      .finally(() => {
        if (dev) {
          message.success("Сохранено!");
          return this.setStateAsync({ genaSave: save })
        }
      })
  }

  exportDataToSG(initialExport = false) {
    const {
      mode,
      presetSelection,
      priceRange,
      percentage,
      depo,
      currentToolCode,
      risk
    } = this.state;
    const genaSave = cloneDeep(this.state.genaSave);
    const options = genaSave.presets.filter(preset => preset.type == algorithms[mode].name);
    const currentPreset = options[presetSelection[mode]];
    const currentPresetIndex = genaSave.presets.indexOf(currentPreset);

    const changes = {};

    // Инструмент
    currentPreset.options.currentToolCode = currentToolCode;
    // Данные пушатся в дефолтный пресет
    if (currentPresetIndex < 3) {
      genaSave.presets = genaSave.presets.map((preset, index) => {
        if (index < 3) {
          preset.options.currentToolCode = currentToolCode;
        }
        return preset;
      });
    }
    changes["Инструмент:"] = currentToolCode;

    // Риск
    currentPreset.options.risk = risk;
    changes["Риск:"] = formatNumber(risk);

    // Ход
    const currentTool = this.getCurrentTool();
    const fraction = fractionLength(currentTool.priceStep);
    const step = round(Math.abs(priceRange[0] - priceRange[1]), fraction);
    currentPreset.options["Закрытие основного депозита"].customData = [{
      length:        1,
      percent:       100,
      preferredStep: step,
      inPercent:     false,
    }];
    changes["Ход:"] = step;

    // Загрузка
    const load = Math.abs(percentage);
    genaSave.load = load;
    changes["Загрузка:"] = load;

    // Депозит
    genaSave.depo = depo;
    genaSave.secondaryDepo = 0;
    changes["Депозит:"] = formatNumber(depo);

    genaSave.firstLoad = initialExport;

    console.warn(
      `Экспорт данных из МТС в ${currentPreset.name}:`,
      ...Object.keys(changes).map(key => [key, changes[key]]),
      genaSave
    );

    return this.setStateAsync({ genaSave });
  }

  importDataFromGENA(genaSave) {
    const { mode, percentage, presetSelection, currentToolCode } = this.state;
    
    if (!genaSave) {
      return Promise.resolve();
    }

    const getStepFromPreset = currentPreset => {
      const { depo, percentage } = this.state;
      const currentTool = this.getCurrentTool();

      const contracts = Math.floor(depo * (Math.abs(percentage) / 100) / currentTool.guarantee);

      const percentToSteps = currentPreset.type == "Лимитник"
        ? stepConverter.complexFromPercentToSteps
        : stepConverter.fromPercentsToStep;

      let totalStep = 0;

      const primaryRows = currentPreset.options["Закрытие основного депозита"]?.customData;
      if (primaryRows?.length) {
        const lastPrimaryRow = primaryRows[primaryRows.length - 1];
        if (lastPrimaryRow) {
          let value = lastPrimaryRow.inPercent
            ? percentToSteps(lastPrimaryRow.preferredStep, currentTool, contracts)
            : lastPrimaryRow.preferredStep === "" ? currentTool.adrDay : lastPrimaryRow.preferredStep;
          
          totalStep += value;
        }
      }

      const secondaryRows = currentPreset.options["Закрытие плечевого депозита"]?.customData;
      if (secondaryRows?.length) {
        const lastSecondaryRow = secondaryRows[secondaryRows.length - 1];
        if (genaTable["Закрытие плечевого депозита"]?.on && lastSecondaryRow) {
          const value = lastSecondaryRow.inPercent
            ? percentToSteps(lastSecondaryRow.preferredStep, currentTool, contracts)
            : lastSecondaryRow.preferredStep === "" ? currentTool.adrDay : lastSecondaryRow.preferredStep;
          
          totalStep += value;
        }
      }

      if (isNaN(totalStep)) {
        console.log("Шаг в гене равен NaN, откатываемся к нулю");
        totalStep = 0;
      }

      return totalStep;
    };
    
    const options = genaSave?.presets.filter(preset => preset.type == algorithms[mode].name) || [{ name: algorithm.name }];
    const currentPreset = options[presetSelection[mode]];

    console.log("importDataFromGENA", genaSave, currentPreset, genaSave.currentPresetName);

    // Не можем стягивать из ГЕНЫ изменения, тк в ГЕНЕ выбран не тот свейв, который выбран в "Алгоритм МААНИ"
    if (currentPreset.name != genaSave.currentPresetName) {
      console.error("Отмена importDataFromGENA, изменения были в несинхронизированном сейве", currentPreset.name, genaSave.currentPresetName);
      return Promise.resolve();
    }

    // console.log("стягиваем инструмент из синхронизированного пресета", currentPreset, currentPreset.options.currentToolCode);

    // TODO: работает ли JSDoc?
    const previousToolCode = currentToolCode;
    return this.setStateAsync({
      depo:            genaSave.depo + genaSave.secondaryDepo,
      // В гене загрузка всегда положительная, поэтому чтобы правильно импорировать данные,
      // нужно учесть знак предыдущей загрузки
      percentage:      genaSave.load * (percentage < 0 ? -1 : 1),
      currentToolCode: currentPreset.options.currentToolCode ?? currentToolCode,
      risk:            currentPreset.options.risk,
      totalIncome:     genaSave.totalIncome,
      shouldImportSG:  false,
    })
      .then(() => {
        const currentTool = this.getCurrentTool();
        const fraction = fractionLength(currentTool.priceStep);

        const step = round(Math.abs(this.state.priceRange[0] - this.state.priceRange[1]), fraction);
        if (initialImport) {
          initialImport = false;
          return this.setStateAsync({ totalStep: round(step, fraction) });
        }

        const totalStep = getStepFromPreset(currentPreset);
        // Шаг в Гене не равен шагу в МТС

        // Если передвинули ползунок вручную, то перенос хода в мтс не требуется
        if (this.state.changedPriceRangeManually) {
          // console.log("Передвинули ползунок вручную, то перенос хода в мтс не требуется");
          return this.setStateAsync({ totalStep: round(totalStep, fraction) });
        }

        if (totalStep === 0) {
          this.updatePriceRange(currentTool, 0);
        }
        else if (totalStep !== step) {
          if (totalStep === 0) {
            console.warn("Ход в гене = 0, соответственно откатываем ползунок хода в мтс");
            this.updatePriceRange(currentTool);
          }
          else {
            const { percentage } = this.state;
            const startOffset =  percentage >= 0 ? 0         : totalStep;
            const endOffset   =  percentage >= 0 ? totalStep : 0;
            const priceRange = [
              currentTool.currentPrice - startOffset,
              currentTool.currentPrice + endOffset
            ];
            console.warn("Раздвигаем ползунок под ход из гены:", totalStep, priceRange);
            
            // TODO: поменять цифры на краях ползунка
            const prevStep = Math.abs(min - max);
            const realStep = Math.abs(priceRange[0] - priceRange[1]);

            let scaleOffset = this.state.scaleOffset; 
            if (realStep * 2 >= prevStep) {
              // max = price + realStep;
              // min = price - realStep;
              // console.log("corrected minmax:", min, max);

              scaleOffset = -Math.abs(realStep - prevStep) + scaleOffset;
            }
            
            this.setStateAsync({ priceRange, scaleOffset });
            // Обновляем график
            const isLong = percentage >= 0;
            const possibleRisk = this.getPossibleRisk();
            chartModule?.updateChartMinMax(priceRange, isLong, possibleRisk);
            chartModule?.updateChartScaleMinMax(min + scaleOffset, max - scaleOffset);
          }
        }
        
        this.setStateAsync({ totalStep: round(totalStep, fraction) })
      })
      .then(() => {
        if (previousToolCode != this.state.currentToolCode) {
          // console.log("prevTool", previousToolCode, "currTool", this.state.currentToolCode);
          this.fetchCompanyQuotes();
        }
      })
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      fetch("getMtsSnapshots")
        .then(response => {
          const saves = response.data.sort((l, r) => r.dateUpdate - l.dateUpdate);
          this.setState({ saves, loading: false });
        })

      fetch("getLastModifiedMtsSnapshot")
        .then(response => {
          // TODO: нужен метод проверки адекватности ответа по сохранению для всех проектов
          if (!response.error && response.data?.name) {
            const pure = params.get("pure") === "true";
            if (!pure) {
              this.setState({ loading: true });
              return this.extractSnapshot(response.data)
                .then(resolve)
                .catch(error => reject(error));
            }
          }
          resolve();
        })
        .catch(reason => {
          this.showAlert(`Не удалось получить сохранения! ${reason}`);
          reject(reason);
        })
        .finally(() => {
          if (dev) {
            const response = require("./snapshot").default;

            const saves = [{
              "id": response.data.id,
              "name": response.data.name,
              "dateCreate": response.data.dateCreate,
            }];

            this.setStateAsync({ saves }).then(() => {
              if (!response.error && response.data?.name) {
                this.extractSnapshot(response.data)
              }
            })
          }
        })
    });
  }

  imitateFetchingTools() {
    return new Promise(resolve => {
      if (Tools.prefetchedTool) {
        this.setState({ toolsLoading: true });

        const tools = [...this.state.tools];
        const oldTool = this.getCurrentTool();
        const index = tools.indexOf(oldTool);
        if (index != -1) {
          tools[index] = Tool.fromObject(Tools.prefetchedTool);
        }

        setTimeout(() => {
          this.setState({
            tools,
            toolsLoading: false,
          }, () => {
            Tools.prefetchedTool = null;
            resolve()
          });
        }, 2_000);
      }
      else {
        resolve();
      }
    })
  }

  // TODO: Написать тесты
  // Должен возвращать фьючи и акции
  // Должен содержать в себе Apple, Сбер и BR
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
            .then(tools => parsedTools.push(...tools))
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.allSettled(requests)
        .then(() => this.setStateAsync({ tools: Tools.sort(parsedTools), toolsLoading: false }))
        .then(() => resolve())
    })
  }

  // ~~
  async fetchInvestorInfo() {
    try {
      const response = await fetch("getInvestorInfo");
      await this.applyInvestorInfo(response);
      const depo = response.data?.deposit ?? 10_000;
      await this.setStateAsync({ depo });
      await this.syncToolsWithInvestorInfo();
    }
    catch (error) {
      message.error(`Не удалось получить профиль инвестора: ${error}`);
    }

    if (dev) {
      await this.setStateAsync({
        investorInfo: {
          email:   "justbratka@ya.ru",
          deposit: 50_000,
          status:  "KSUR",
          skill:   s,
          type:    this.state.percentage >= 0 ? "LONG" : "SHORT"
        }
      });
      this.syncToolsWithInvestorInfo();
    }
    
  }

  updatePriceRange(tool, step = 0) {
    // console.log(`%c updatePriceRange, ${tool.code}, ${step}`, "background-color: yellow; color: black");
    return new Promise(resolve => {
      const currentPrice = tool.currentPrice;
      this.setState({ priceRange: [currentPrice - step / 2, currentPrice + step / 2] }, () => resolve());
    })
  }

  showAlert(errorMessage = "") {
    console.log(`%c${errorMessage}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage }, () => dialogAPI.open("dialog-msg"));
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
      presetSelection,
      days,
      scaleOffset,
      kodTable
    } = this.state;

    const json = {
      static: {
        depo,
        priceRange,
        percentage,
        profitRatio,
        risk,
        mode,
        presetSelection,
        days,
        scaleOffset,
        customTools,
        currentToolCode,
        kodTable,
        current_date: "#"
      },
    };

    console.log("Packed save:", json);
    return json;
  }

  parseSnapshot(data) {
    const { investorInfo } = this.state; 
    const initialState = cloneDeep(this.initialState);
    const percentage = data.percentage      ?? initialState.percentage;
    return {
      depo:            data.depo            ?? initialState.depo,
      priceRange:      data.priceRange      ?? initialState.priceRange,
      percentage,
      profitRatio:     data.profitRatio     ?? initialState.profitRatio,
      risk:            data.risk            ?? initialState.risk,
      mode:            data.mode            ?? initialState.mode,
      presetSelection: data.presetSelection ?? initialState.presetSelection,
      days:            data.days            ?? initialState.days,
      scaleOffset:     data.scaleOffset     ?? initialState.scaleOffset,
      kodTable:        data.kodTable        ?? initialState.kodTable,
      // TODO: у инструмента не может быть ГО <= 0, по идее надо удалять такие инструменты
      customTools:    (data.customTools || []).map(tool => Tool.fromObject(tool, { investorInfo })),
      currentToolCode: data.currentToolCode ?? initialState.currentToolCode,
      investorInfo:   { ...investorInfo, type: percentage >= 0 ? "LONG" : "SHORT" }
    }
  }

  priceRangeMinMax(priceRange) {
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

    return this.setStateAsync({ priceRange: range });
  }

  /** @param {import('../../../common/utils/extract-snapshot').Snapshot} snapshot */
  async extractSnapshot(snapshot) {
    try {
      const state = await super.extractSnapshot(snapshot, this.parseSnapshot);
      await this.syncToolsWithInvestorInfo();
      await this.priceRangeMinMax(state.priceRange);
      // TODO: что-то тут не так...
      await delay(250);
      // console.log("Ready to push good old presetSelection", state.presetSelection);
      return this.setStateAsync({ presetSelection: state.presetSelection })
    }
    catch (error) {
      message.error(error)
    }
  };

  /** @deprecated Use {@link extractSnapshot} instead */
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

      state.presetSelection = staticParsed.presetSelection || initialState.presetSelection;

      state.days = staticParsed.days || initialState.days;

      state.scaleOffset = staticParsed.scaleOffset || initialState.scaleOffset;

      state.kodTable = staticParsed.kodTable || initialState.kodTable;
      
      // TODO: у инструмента не может быть ГО <=0, по идее надо удалять такие инструменты
      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools.map(tool => Tool.fromObject(tool, { investorInfo }));

      state.currentToolCode = staticParsed.currentToolCode || initialState.currentToolCode;

      state.id = save.id;
      state.saved = true;
      state.loading = false;
    }
    catch (e) {
      failed = true;
      state = {
        id: save?.id || 0,
        saved: true
      };

      onError(e);
    }

    state.investorInfo = { ...this.state.investorInfo };
    state.investorInfo.type = state.percentage >= 0 ? "LONG" : "SHORT";

    console.log('%c Parsing save finished!', state, "background: orange");
    return this.setStateAsync(state)
      .then(this.syncToolsWithInvestorInfo)
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
      })
      .then(() => {
        setTimeout(() => {
          // console.log("Ready to push good old presetSelection", state.presetSelection);
          return this.setStateAsync({ presetSelection: state.presetSelection })
        }, 250);
      });
  }

  async reset() {
    await super.reset();
    await this.exportDataToSG();
    await this.fetchCompanyQuotes();
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
              .then(response => this.extractSnapshot({ ...response, data: { ...response.data, id }}))
              .then(() => this.setState({ id }))
              .catch(err => this.showAlert(err));
          }
          else {
            this.reset();

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

  getCurrentTool() {
    return this.getTools()[this.getCurrentToolIndex()] || Tools.createArray()[0];
  }
  
  getToolByCode(code) {
    return Tools.getToolIndexByCode(this.getTools(), code);
  }

  getTitleJSX() {
    const { saves, currentSaveIndex } = this.state;
    let titleJSX = <span>Моделирование Торговой&nbsp;Стратегии</span>;
    if (saves && saves[currentSaveIndex - 1]) {
      titleJSX = <span>{saves[currentSaveIndex - 1].name}</span>;
    }

    return titleJSX;
  }

  /**
   * Возвращает название текущего сейва (по дефолту возвращает строку "Моделирование Торговой Стратегии") */
  getTitle() {
    return this.getTitleJSX().props.children;
  }

  getDisabledMods() {
    const { depo } = this.state;

    let disabledModes = [false, false, false];

    const tool = this.getCurrentTool();
    if (!tool.volume) {
      console.warn(`У ${tool.code} нет объема`, tool);
      return disabledModes;
    }

    let depoOverflow = tool?.volumeAverage > 0 && (depo > tool.volumeAverage);

    // Фьючерсы
    if (tool.dollarRate == 0) {
      disabledModes = [
        tool.volume < 1e9                    || depoOverflow,
        tool.volume < 1e9 || depo <= 600_000 || depoOverflow,
                             depo <= 100_000 || depoOverflow
      ]
    }
    // Россия
    else if (tool.dollarRate == 1) {
      disabledModes = [
        tool.volume < 200_000 || depo < 1_000_000 || depoOverflow,
        tool.volume < 200_000 || depo < 3_000_000 || depoOverflow,
                                 depo < 1_000_000 || depoOverflow
      ]
    }
    // Америка
    else {
      disabledModes = [
        depo < 3_000_000,
        depo <= 10_000_000,
        depo < 3_000_000
      ]
    }

    if (disabledModes.every(mode => mode == true)) {
      console.error("All modes are disabled!", depo, tool);
      return disabledModes.map(mode => false);
    }

    return disabledModes;
  }

  getPossibleRisk() {
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
      chartModule?.updateChartMinMax(priceRange, isLong, possibleRisk);
    }

    return possibleRisk;
  }

  render() {
    let {
      currentSaveIndex,
      loading,
      saves,
      changed,
      saved,
      data,
      days,
      depo,
      mode,
      page,
      risk,
      chartLoading,
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
      totalStep,
      kodTable
    } = this.state;

    // Вызывается в момент выбора пресета в МТС
    const onAlgorythmChange = async (index, subIndex) => {
      const mode = index;

      const _presetSelection = [...presetSelection];
      _presetSelection[index] = subIndex;

      let profitRatio = algorithms[index].profitRatio;
      if (_presetSelection[mode] != 0) {
        profitRatio = this.state.profitRatio;
      }

      await this.setStateAsync({
        mode,
        presetSelection: _presetSelection,
        // scaleOffset: 0,
        profitRatio,
        changed: true
      });
      // Ставим в гене такой же пресет, какой только что выбрали
      const genaSave = cloneDeep(this.state.genaSave);
      const options = genaSave.presets.filter(preset => preset.type == algorithms[mode].name);
      const currentPreset = options[subIndex];
      console.log("Ставим в гене такой же пресет, какой только что выбрали", options, currentPreset);
      genaSave.currentPresetName = currentPreset.name;
      await this.setStateAsync({ genaSave });
      await (subIndex === 0 ? this.exportDataToSG() : Promise.resolve());
      await delay(100);
      return await this.setStateAsync({ shouldImportSG: true });
    }

    const tools = this.getTools();
    const currentTool = this.getCurrentTool();
    const fraction = fractionLength(currentTool.priceStep);

    const isLong = percentage >= 0;
    
    const contracts = Math.floor(depo * (Math.abs(percentage) / 100) / currentTool.guarantee);

    // TODO: вставить позже
    // const disabledModes = this.getDisabledMods();
    const disabledModes = [
      currentTool.isFutures && currentTool.volume < 1e9,
      currentTool.isFutures && currentTool.volume < 1e9 || depo <= 600_000,
      depo <= 100_000
    ];
    // Если текущий режим заблокирован, откатываемся к доступному
    if (disabledModes[mode]) {
      mode = disabledModes.indexOf(false);
      console.warn("Текущий режим заблокирован, откатываемся к доступному");
      onAlgorythmChange(mode, presetSelection[mode]);
    }

    const price = currentTool.currentPrice;
    let percent = currentTool.adrDay;
    if (days == 5) {
      percent = currentTool.adrWeek;
    }
    else if (days == 20) {
      percent = currentTool.adrMonth;
    }

    max = price + percent;
    min = price - percent;
    
    const step = currentTool.priceStep;
    
    let income = totalIncome * profitRatio / 100;
    
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
        chartModule?.updateChartMinMax(priceRange, isLong, possibleRisk);
      }

      return possibleRisk;
    }

    let possibleRisk = getPossibleRisk();

    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">

            <Header
              title={this.getTitleJSX()}
              loading={loading}
              saves={saves}
              currentSaveIndex={currentSaveIndex}
              changed={changed}
              saved={saved}
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
                    .then(response => this.extractSnapshot(response.data))
                    .then(() => this.fetchCompanyQuotes())
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
                  className="settings-button js-open-modal page-header__settings"
                  onClick={e => dialogAPI.open("config", e.target)}
                >
                  <span className="visually-hidden">Открыть настройки инструментов</span>
                  <SettingFilled className="settings-button__icon" aria-hidden="true" />
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
                          
                          {/* Торговый инструмент */}
                          <Select
                            onFocus={() => this.setState({ isToolsDropdownOpen: true })}
                            onBlur={() => {
                              this.setStateAsync({ isToolsDropdownOpen: false })
                                .then(() => this.imitateFetchingTools());
                            }}
                            value={toolsLoading && tools.length == 0 ? 0 : this.getCurrentToolIndex()}
                            onChange={currentToolIndex => {
                              const tools = this.getTools();
                              const currentTool = tools[currentToolIndex];
                              const currentToolCode = currentTool.code;
                              this.setStateAsync({ currentToolCode, isToolsDropdownOpen: false })
                                .then(() => this.updatePriceRange(currentTool))
                                .then(() => this.fallbackToBasePreset())
                                .then(() => this.exportDataToSG())
                                .then(() => new Promise(resolve => {
                                  setTimeout(() => {
                                    this.setState({ shouldImportSG: true }, resolve)
                                  }, 500)
                                }))
                                .then(() => this.imitateFetchingTools())
                                .then(() => this.fetchCompanyQuotes())
                            }}
                            disabled={toolsLoading || chartLoading}
                            loading={toolsLoading || chartLoading}
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

                        <div className="mts-slider1">
                          <span className="mts-slider1-middle">
                            <b>Текущая цена</b><br />
                            {toolsLoading ? <LoadingOutlined /> : formatNumber(price)}
                          </span>
                          <span className="mts-slider1-top">
                            {/* TODO: заменить на вызов функции */}
                            <b>{formatNumber(round(max - scaleOffset, fraction))}</b>
                            &nbsp;
                            (+{round((percent / currentTool.currentPrice * 100) + movePercantage, 2)}%)
                          </span>
                          <span className="mts-slider1-bottom">
                            {/* TODO: заменить на вызов функции */}
                            <b>{formatNumber(round(min + scaleOffset, fraction))}</b>
                            &nbsp;
                            (-{round((percent / currentTool.currentPrice * 100) + movePercantage, 2)}%)
                          </span>
                          <CustomSlider
                            className="mts-slider1__input"
                            range
                            vertical
                            disabled={toolsLoading || chartLoading}
                            value={priceRange}
                            max={max - scaleOffset}
                            min={min + scaleOffset}
                            percentage={percentage}
                            step={step}
                            precision={1}
                            tooltipPlacement="left"
                            tipFormatter={value => formatNumber(+(value).toFixed(fraction))}
                            onClick={e => {
                              this.fallbackToBasePreset();
                            }}
                            onChange={priceRange => {
                              // console.log("Should apprear after real slider drag", priceRange);
                              this.setState({
                                priceRange,
                                totalStep: round(Math.abs(priceRange[0] - priceRange[1]), fraction),
                                changedPriceRangeManually: false,
                                changed: true
                              });
                              chartModule?.updateChartMinMax(priceRange, isLong, possibleRisk);
                            }}
                            // Вызывается только при ручном изменении значения
                            onAfterChange={priceRange => {
                              console.log("onAfterChange");
                              this.exportDataToSG()
                                .then(() => 
                                  this.setStateAsync({
                                    changedPriceRangeManually: true,
                                    shouldImportSG: true
                                  })
                                );
                            }}
                          />

                          <Button
                            className="scale-button scale-button--default"
                            onClick={ e => {
                              chartModule?.updateChartScaleMinMax(min, max);
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
                                chartModule?.updateChartScaleMinMax(min + updatedScaleOffset, max - updatedScaleOffset);
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
                                  days: this.initialState.days
                                });
                                chartModule?.updateChartScaleMinMax(min + updatedScaleOffset, max - updatedScaleOffset);
                              }
                            }}
                            aria-label="Уменьшить масштаб графика"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480.606 480.606"><path d="M202.039 125.423h-30v46.616h-46.617v30h46.617v46.616h30v-46.616h46.615v-30h-46.615z" /><path d="M480.606 459.394L329.409 308.195c27.838-32.663 44.668-74.978 44.668-121.157C374.077 83.905 290.172 0 187.039 0S0 83.905 0 187.039s83.905 187.039 187.039 187.039c46.179 0 88.495-16.831 121.157-44.669l151.198 151.198 21.212-21.213zM187.039 344.077C100.447 344.077 30 273.63 30 187.039S100.447 30 187.039 30s157.039 70.447 157.039 157.039-70.448 157.038-157.039 157.038z" /></svg>
                          </Button>
                        </div>

                        <div className="card main-content-stats">
                          <div className="main-content-stats__wrap">

                            {(() => {
                              const callback = priceRange => {
                                const { percentage } = this.state;
                                const oldStep = Math.abs(this.state.priceRange[0] - this.state.priceRange[1]);
                                const newStep = Math.abs(priceRange[0] - priceRange[1]);
                                console.warn("old step:", oldStep, this.state.priceRange);
                                console.warn("new step:", newStep, priceRange);
                                const totalStep = round(newStep, fraction);

                                let scaleOffset = this.state.scaleOffset;
                                if (newStep > oldStep) {
                                  // Меняем цифры на краях ползунка через scaleOffset
                                  const realStep = Math.abs(priceRange[0] - priceRange[1]);
                                  
                                  if (realStep * 2 >= oldStep) {
                                    scaleOffset = -Math.abs(realStep - oldStep) + scaleOffset;
                                  }
                                }

                                // Обновляем график
                                const isLong = percentage >= 0;
                                const possibleRisk = this.getPossibleRisk();
                                chartModule?.updateChartMinMax(priceRange, isLong, possibleRisk);
                                chartModule?.updateChartScaleMinMax(min + scaleOffset, max - scaleOffset);  

                                this.setStateAsync({ priceRange, scaleOffset, totalStep, changed: true })
                                  .then(() => this.exportDataToSG())
                                  .then(() =>
                                    this.setStateAsync({
                                      changedPriceRangeManually: true,
                                      shouldImportSG: true
                                    })
                                  );
                              };

                              return (
                                <>
                                  <div className="main-content-stats__row">
                                    <span>
                                      <Tooltip title="Цена приобретения позиции">
                                        Точка входа
                                      </Tooltip>
                                    </span>
                                    <NumericInput
                                      // min={min}
                                      // max={max}
                                      unsigned="true"
                                      format={number => formatNumber(round(number, fraction))}
                                      round={"false"}
                                      disabled={toolsLoading || chartLoading}
                                      key={Math.random()}
                                      defaultValue={(isLong ? priceRange[0] : priceRange[1]) || 0}
                                      onBlur={value => {
                                        value = round(value, fraction);

                                        console.log(isLong);

                                        // ЛОНГ: то есть точка входа - снизу (число меньше)
                                        if (isLong) {
                                          if (value > priceRange[1]) {
                                            callback([priceRange[1], value]);
                                          }
                                          else {
                                            callback([value, priceRange[1]]);
                                          }
                                        }
                                        // ШОРТ: то есть точка входа - сверху (число больше)
                                        else {
                                          if (value < priceRange[0]) {
                                            callback([value, priceRange[0]]);
                                          }
                                          else {
                                            callback([priceRange[0], value]);
                                          }
                                        }

                                        this.fallbackToBasePreset();
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
                                      // min={min}
                                      // max={max}
                                      format={ number => formatNumber(round(number, fraction)) }
                                      unsigned="true"
                                      round={"false"}
                                      disabled={toolsLoading || chartLoading}
                                      key={Math.random()}
                                      defaultValue={(isLong ? priceRange[1] : priceRange[0]) || 0}
                                      onBlur={value => {
                                        value = round(value, fraction);

                                        // ЛОНГ: то есть точка выхода - сверху (число меньше)
                                        if (isLong) {
                                          if (value < priceRange[0]) {
                                            callback([value, priceRange[0]]);
                                          }
                                          else {
                                            callback([priceRange[0], value]);
                                          }
                                        }
                                        // ШОРТ: то есть точка выхода - снизу (число больше)
                                        else {
                                          if (value > priceRange[1]) {
                                            callback([priceRange[1], value]);
                                          }
                                          else {
                                            callback([value, priceRange[1]]);
                                          }
                                        }

                                        this.fallbackToBasePreset();
                                      }}
                                    />
                                  </div>
                                </>
                              )
                            })()}


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
                                // Лев, [20.09.21 15:04]
                                // еще минор: коэффициент прибыли теперь будет разлочен во всех режимах и по дефолту 100%
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
                                test="true"
                                defaultValue={risk}
                                min={0}
                                max={100}
                                unsigned="true"
                                suffix="%"
                                format={number => formatNumber(round(number, fraction))}
                                round={"false"}
                                onBlur={async risk => {
                                  await this.setStateAsync({ risk, changed: true });
                                  let possibleRisk = getPossibleRisk();
                                  chartModule?.updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                                  await this.exportDataToSG();
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
                                      {formatNumber(kod) + "%"}
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
                    {Chart &&
                      <Chart
                        className="mts__chart"
                        // key={currentTool.toString() + chartLoading}
                        min={min}
                        max={max}
                        priceRange={priceRange}
                        loading={chartLoading}
                        tool={currentTool}
                        data={data}
                        days={days}
                        onRendered={() => {
                          const { percentage, priceRange, scaleOffset, days } = this.state;
                          const isLong = percentage >= 0;
                          const possibleRisk = getPossibleRisk();
                          chartModule?.updateChartMinMax(priceRange, isLong, possibleRisk);
                          chartModule?.updateChartScaleMinMax(min + scaleOffset, max - scaleOffset);
                          chartModule?.updateChartZoom(days);
                        }}
                      />
                    }

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
                            onClick={e => {
                              this.fallbackToBasePreset();
                            }}
                            onChange={(range = []) => {
                              const { investorInfo } = this.state;
                              const percentage = range[0] + range[1];
                              
                              investorInfo.type = percentage >= 0 ? "LONG" : "SHORT";

                              chartModule?.updateChartMinMax(this.state.priceRange, percentage >= 0, possibleRisk);
                              this.setStateAsync({
                                investorInfo,
                                percentage, 
                                changed: true
                              })
                                .then(this.syncToolsWithInvestorInfo)
                            }}
                            onAfterChange={priceRange => {
                              console.log("onAfterChange");
                              this.exportDataToSG()
                                .then(() => this.setStateAsync({ shouldImportSG: true }))
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
                              Алгоритм МААНИ 144
                            </Tooltip>
                          </span>

                          <div className="main-content-options-group">

                            {algorithms.map((algorithm, index) => (() => {
                              const options = 
                                genaSave?.presets.filter(preset => preset.type == algorithm.name) ||
                                [{ name: algorithm.name }];

                              return (
                                <Select
                                  className={mode == index ? "selected" : ""}
                                  value={presetSelection[index]}
                                  disabled={disabledModes[index] || chartLoading}
                                  showArrow={options?.length > 1}
                                  dropdownStyle={{
                                    visibility:    options?.length > 1 ? "visible" : "hidden",
                                    pointerEvents: options?.length > 1 ? "all"     : "none"
                                  }}
                                  onSelect={value => {
                                    onAlgorythmChange(index, value);
                                  }}
                                  // Сработает только в случае, когда есть только дефолтный пресет
                                  onFocus={e => {
                                    if (options?.length == 1) {
                                      onAlgorythmChange(index, 0);
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
                            disabled={!dev && (toolsLoading || chartLoading)}
                            onClick={e => {
                              lastSavedSG = cloneDeep(genaSave);
                              sgChanged = false;
                              dialogAPI.open("settings-generator", e.target);
                              onSGOpen();
                            }}
                          >
                            <span className="visually-hidden">Открыть генератор настроек МААНИ 144</span>
                            <Tooltip title="Генератор настроек МААНИ 144">
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
                              chartModule?.updateChartScaleMinMax(min, max);
                              chartModule?.updateChartZoom(days);
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
                                  <td>
                                    <Input 
                                      defaultValue={kodTable[index]?.fact || 0}
                                      onBlur={e => {
                                        if (!kodTable[index]) {
                                          kodTable[index] = {};
                                        }
                                        kodTable[index].fact = e.target.value;
                                        this.setState({ kodTable });
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <Input
                                      defaultValue={kodTable[index]?.income || 0}
                                      onBlur={e => {
                                        if (!kodTable[index]) {
                                          kodTable[index] = {};
                                        }
                                        kodTable[index].income = e.target.value;
                                        this.setState({ kodTable });
                                      }}
                                    />
                                  </td>
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
            title="Удаление сохранения"
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
                  defaultValue={this.state.depo}
                  format={formatNumber}
                  min={10_000}
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

          {/* ГЕНА */}
          {(() => {
            const onClose = (save, e) => {
              // TODO: clean up
              const { genaSave } = this.state;

              const target = e?.target || document.querySelector(".settings-button");

              const saveToCompare = cloneDeep(lastSavedSG);
              delete saveToCompare.currentTab;
              
              const genaSavePure = cloneDeep(genaSave);
              delete genaSavePure.key;
              delete genaSavePure.currentTab;
              
              let changed = sgChanged;
              if (genaSavePure == null) {
                changed = true;
              }
              else if (changed) {
                changed = true;
              }

              if (changed) {
                dialogAPI.open("settings-generator-close-confirm", target);
              }
              else {
                dialogAPI.close("settings-generator");
                onSGClose();
                this.setState({
                  shouldImportSG: true,
                  changedPriceRangeManually: false
                });
              }
            };

            return (
              <Dialog
                id="settings-generator"
                pure={true}
                onClose={() => onClose()}
              >
                <SettingsGenerator
                  depo={depo}
                  tools={tools}
                  load={percentage}
                  toolsLoading={toolsLoading}
                  investorInfo={investorInfo}
                  defaultToolCode={currentToolCode}
                  currentToolCode={currentToolCode}
                  contracts={contracts}
                  risk={risk}
                  algorithm={algorithms[mode].name}
                  genaSave={genaSave}
                  onSave={genaSave => {
                    this.saveGENA(genaSave);
                  }}
                  onUpdate={(genaSave, tableData, changed) => {
                    // console.log("onUpdate", genaSave);
                    sgChanged = sgChanged || changed;
                    genaTable = tableData;
                    this.setStateAsync({ genaSave });
                  }}
                  onClose={(save, e) => onClose(save, e)}
                  onDownload={(title, text) => {
                    const file = new Blob([text], { type: "text/plain" });

                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(file);
                    link.setAttribute("download", title + ".txt");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                  onToolSelectFocus={() => this.setState({ isToolsDropdownOpen: true })}
                  onToolSelectBlur={() => {
                    this.setStateAsync({ isToolsDropdownOpen: false })
                      .then(() => this.imitateFetchingTools());
                  }}
                />
              </Dialog>
            )
          })()}

          <Dialog
            id="settings-generator-close-confirm"
            title="Предупреждение"
            confirmText="ОК"
            onConfirm={e => {
              dialogAPI.close("settings-generator");
              onSGClose();
              if (lastSavedSG) {
                // TODO: откат к предыдущему сохраненному сейву гену
                console.log("Откатываемся к предыдущему сохраненному сейву гены");
                this.setState({
                  genaSave: cloneDeep(lastSavedSG),
                  shouldImportSG: true,
                })
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