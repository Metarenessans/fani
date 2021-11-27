import React from "react";
import {
  Button,
  Tooltip,
  Radio,
  message
} from "antd";

import {
  PlusOutlined,
  SettingFilled
} from "@ant-design/icons";

import { cloneDeep, isEqual } from "lodash";

import formatNumber        from "../../../common/utils/format-number";
import typeOf              from "../../../common/utils/type-of";
import delay               from "../../../common/utils/delay";
import { Tools, Tool, template } from "../../../common/tools";

import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;
import Header                from "../../../common/components/header";
import NumericInput          from "../../../common/components/numeric-input";
import Config                from "../../../common/components/config";
import { Dialog, dialogAPI } from "../../../common/components/dialog";
import { SaveDialog, dialogID as saveDialogID } from "../../../common/components/save-dialog";
import DeleteDialog from "../../../common/components/delete-dialog";
import Dashboard             from "./components/Dashboard";

/* API */
import fetch             from "../../../common/api/fetch";
import { fetchInvestorInfo } from "../../../common/api/fetch/investor-info/fetch-investor-info";
import syncToolsWithInvestorInfo from "../../../common/utils/sync-tools-with-investor-info";

import "../sass/style.sass";

const defaultToolData = {
  selectedToolName: "SBER",
  percentage: 10
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
    // if (this.state.tooltipPlacement == "top") {
    //   this.setState({ tooltipPlacement: "bottom" })
    // }
  } 
  else {
    for (let i = 0; i < headerElements.length; i++) {
      headerElements[i].classList.remove("scroll");
      firstRowElement.classList.remove("scroll");
    }
    // if (this.state.tooltipPlacement == "bottom") {
    //   this.setState({ tooltipPlacement: "top" });
    // }
  }
}

class App extends BaseComponent {

  constructor(props) {
    super(props);

    this.deafultTitle = "КСД";

    this.initialState = {

      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      investorInfo: {
        status: "KSUR",
        type:   "LONG"
      },

      data: [{ ...defaultToolData }],

      /**
       * Свойство, по которому идет сортировка
       * 
       * По умолчанию значение равно `null` (сортировка выключена)
       * 
       * @type {?string}
       */
      sortProp: null,

      /** Флаг сортировки по убыванию */
      sortDESC: true,

      /** Режим */
      mode: 0,

      /** Размер депозита */
      depo: 1_000_000,
      
      customTools: [],

      toolsLoading: false,

      isToolsDropdownOpen: false
    };

    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState),

      tooltipPlacement: "top"
    };

    this.state.loading = true;

    this.syncToolsWithInvestorInfo = syncToolsWithInvestorInfo.bind(this, null, { useDefault: true });
  }

  componentDidMount() {
    this.fetchInitialData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { id, saves } = this.state;
    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }

  async fetchInitialData() {
    this.fetchInvestorInfo();

    await this.fetchTools();
    this.setFetchingToolsTimeout();

    await this.fetchSnapshots();
    await this.fetchLastModifiedSnapshot({ fallback: require("./snapshot.json") });
  }

  async fetchInvestorInfo() {
    try {
      const response = await fetchInvestorInfo();
  
      const { status, skill } = response.data;
      const investorInfo = { ...this.state.investorInfo, status, skill };
      await this.setStateAsync({ investorInfo });
  
      const { deposit } = response.data;
      return this.setStateAsync({ depo: deposit || 10_000 });
    }
    catch (error) {
      console.error(error);
      message.error(error);
    }
  }
  
  setFetchingToolsTimeout() {
    return new Promise(resolve => {
      console.log("staring 10sec timeout");
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
                console.log("no way!");
                resolve();
              }
            });
        }
        else resolve();
      }, dev ? 15_000 : 1 * 60 * 1_000);

    }).then(() => this.setFetchingToolsTimeout());
  }

  imitateFetchcingTools() {
    return new Promise((resolve, reject) => {
      if (Tools.storage?.length) {
        this.setState({ toolsLoading: true });

        let newTools = [...Tools.storage];

        setTimeout(() => {
          this.setState({
            tools: newTools,
            toolsLoading: false
          }, () => {
            Tools.storage = [];
            Tools.storageReady = false;
            resolve();
          });
        }, 2_000);
      }
      else {
        resolve();
      }
    });
  }

  prefetchTools() {
    return new Promise(resolve => {
      Tools.storage = [];
      const { investorInfo } = this.state;
      const requests = [];
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
            .then(tools => Tools.sort(Tools.storage.concat(tools)))
            .then(tools => {
              Tools.storage = [...tools];
            })
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        );
      }

      Promise.all(requests).then(() => resolve());
    });
  }

  fetchTools() {
    return new Promise(resolve => {
      const { investorInfo } = this.state;
      const requests = [];
      this.setState({ toolsLoading: true });
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
            .then(tools => Tools.sort(this.state.tools.concat(tools)))
            .then(tools => this.setStateAsync({ tools }))
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        );
      }

      Promise.all(requests)
        .then(() => this.setStateAsync({ toolsLoading: false }))
        .then(() => resolve());
    });
  }

  packSave() {
    let { depo, sortProp, sortDESC, mode, customTools } = this.state;

    const data = this.state.data.map(item => {
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
        customTools
      }
    };

    console.log("Save packed!", json);
    return json;
  }

  parseSnapshot = data => {
    let state = {};
    try {
      data.data.map(item => {
        delete item.selectedToolCode;
        return item;
      });

      // console.log("static", save.static);
      // console.log("staticParsed", staticParsed);

      let m = data.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.mode = m;
      state.sortProp = data.sortProp;
      state.sortDESC = data.sortDESC;

      state.depo = data.depo || this.state.depo;
      state.data = data.data;
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
      state.customTools = data.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tool.fromObject(tool, { investorInfo: this.state.investorInfo }));
    }
    catch (error) {
      console.error(error);
      message.error(error);
    }
    return state;
  };

  /** @typedef {import("../../../common/utils/extract-snapshot").Snapshot} Snapshot */
  /** @param {Snapshot} snapshot */
  async extractSnapshot(snapshot) {
    try {
      await super.extractSnapshot(snapshot, this.parseSnapshot);
      await this.syncToolsWithInvestorInfo();
    }
    catch (error) {
      message.error(error);
    }
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  getOptions() {
		return this.getTools().map((tool, idx) => {
      return {
        idx:   idx,
        label: String(tool)
      };
    });
  }

  render() {
    const { mode } = this.state;

    return (
      <StateContext.Provider value={this}>
        <div className="page">

          <main className="main">

            <Header>
              <Radio.Group
                className="tabs"
                key={mode}
                defaultValue={mode}
                name="radiogroup"
                onChange={e => this.setState({ mode: e.target.value, changed: true })}
              >
                <Radio className="tabs__label tabs__label--1" value={0}>
                  Произвольный
                  <span className="prefix">ход цены</span>
                </Radio>
                <Radio className="tabs__label tabs__label--1" value={1}>
                  Повышенный
                  <span className="prefix">ход цены</span>
                </Radio>
                <Radio className="tabs__label tabs__label--1" value={2}>
                  Аномальный
                  <span className="prefix">ход цены</span>
                </Radio>
                <Radio className="tabs__label tabs__label--2" value={3}>
                  Черный лебедь
                  <span className="prefix">ход цены</span>
                </Radio>
              </Radio.Group>

              <Tooltip title="Настройки">
                <button
                  className="settings-button js-open-modal main-top__settings"
                  type="button"
                  onClick={e => dialogAPI.open("config", e.target)}
                >
                  <span className="visually-hidden">Открыть конфиг</span>
                  <SettingFilled className="settings-button__icon" />
                </button>
              </Tooltip>
            </Header>

            <div className="main-content">

              <div className="container">

                <Dashboard />

                <footer className="main__footer">

                  <Button 
                    className="custom-btn main__save"
                    onClick={() => {
                      const { data } = this.state;
                      data.push({ ...defaultToolData });
                      this.setState({ data, changed: true, sortDESC: undefined, sortProp: false });
                    }}
                  >
                    <PlusOutlined aria-label="Добавить" />
                    инструмент
                  </Button>

                </footer>
                
              </div>

            </div>

          </main>

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
              { name: "ADR неделя",   prop: "adrWeek"      },
              { name: "ADR месяц",    prop: "adrMonth"     }
            ]}
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}

            insertBeforeDialog={
              <label className="input-group input-group--fluid ksd-config__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput
                  key={this.state.depo}
                  className="input-group__input"
                  defaultValue={this.state.depo}
                  format={formatNumber}
                  min={10_000}
                  onBlur={depo => {
                    if (depo == this.state.depo) {
                      return;
                    }
                    this.setState({ depo, changed: true });
                  }}
                />
              </label>
            }
          />
          {/* Инструменты */}

          <Dialog
            id="dialog-msg"
            title="Сообщение"
            hideConfirm
            cancelText="ОК"
          >
            {this.state.errorMessage}
          </Dialog>
          {/* Error Popup */}

        </div>
      </StateContext.Provider>
    );
  }
}

export { App };