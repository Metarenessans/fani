import React from "react";
import $ from "jquery";
import clsx from "clsx";
import { cloneDeep, isEqual, merge } from "lodash";
import { Button, message } from "antd";

import { Tools, Tool }       from "../../../common/tools";
import { Dialog, dialogAPI } from "../../../common/components/dialog";
import CrossButton           from "../../../common/components/cross-button";

import SaveDialog   from "../../../common/components/save-dialog";
import DeleteDialog from "../../../common/components/delete-dialog";
import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

import Header      from "../../../common/components/header";
import FirstStep   from "./components/step-1";
import SecondStep  from "./components/step-2";
import ThirdStep   from "./components/step-3";
import FourthStep  from "./components/step-4";
import Stats       from "./components/stats";

/* API */

import fetch from "../../../common/api/fetch";

import "../sass/style.sass";

let scrollInitiator;

export const dealTemplate = {
  currentToolCode: "SBER",
  currentToolIndex:     0,
  /**
   * Время входа в сделку в формате Unix time
   * 
   * По дефолту равен `null` (показывает placeholder)
   * 
   * @type {?number}
   */
  enterTime:  null,
  isLong:     null,

  impulse:   false,
  postponed: false,
  levels:    false,
  breakout:  false,

  result: 0,

  emotionalStates: {
    /** @type {boolean[]} */
    positive: [],
    /** @type {boolean[]} */
    negative: []
  },
  motives: {
    /** @type {boolean[]} */
    positive: [],
    /** @type {boolean[]} */
    negative: []
  }
};

const dayTemplate = {
  isSaved:  false,
  /**
   * Дата создания в формате Unix-time
   * 
   * @property {number}
   */
  date: Number(new Date()),

  /**
   * @typedef ExpectedDeal
   * @property {string} currentToolCode Код торгового инструмента
   * @property {number} load Загрузка (в %)
   * @property {number} iterations Количество итераций
   * @property {number} depo Депозит
   */

  /**
   * Массив Интрадей трейдометр 
   * 
   * @type {ExpectedDeal[]} 
   */
  expectedDeals: [
    {
      currentToolCode: "SBER",
      load:                 0,
      iterations:           1,
      depo:              null
    }
  ],

  /**
   * Регистр сделок
   * 
   * @type {dealTemplate[]}
   */
  deals: [
    cloneDeep(dealTemplate)
  ],

  reportMonitor: [
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: false, baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: false, baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null },
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null }
  ],

  /**
   * Технологии
   *
   * @type {Object.<string, boolean>}
   */
  technology: {
    "ЭМИ":                                               false,
    "ТМО":                                               false,
    "Перепросмотр":                                      false,
    "Работа с архетипами":                               false,
    "Работа с убеждениями":                              false,
    "Работа с ценностями":                               false,
    "Формирование устойчивого навыка (микро ТОТЕ)":      false,
    "Удаленное видение":                                 false,
    "Физическая активность: приседание, отжимание, биг": false,
    "Аффирмации":                                        false,
    "НАННИ":                                             false,
    "Работа со страхами":                                false,
    "Простукивание тимуса":                              false
  },

  /**
   * Кастомные техноголии
   *
   * @type {{ name: string, value: boolean }[]}
   */
  customTechnology: [],

  /**
   * Практические задачи на отработку
   * 
   * @type {Object.<string, boolean>}
   */
  practiceWorkTasks: {
    "Изменить время на сделку":                                false,
    "Не снимать отложенные заявки, выставленные до этого":     false,
    "Не перезаходить после закрытия по Stop-Loss":             false,
    "Не выключать робота":                                     false,
    "Контролировать объём входа":                              false,
    "Делать расчёты ФАНИ":                                     false,
    "Заносить результаты в ФАНИ":                              false,
    "Фиксировать сделки в скриншотах":                         false,
    "Выделять ключевые поведенченские паттерны и модели":      false,
    "Анализировать текущую ситуацию в конкретных показателях": false,
    "Смену тактики проводить через анализ и смену алгоритма":  false,
    "Время между сделками 30 минут":                           false,
    "Время между сделками 1 час":                              false,
    "Время между сделками. Четко по сессиям":                  false,
    "Удержание напряжения желания торговать":                  false,
    "Удержание напряжения желания наблюдать за сделкой":       false,
    "Снятие эмоциональной привязанности от результата сделки": false
  },

  /**
   * Кастомные рактические задачи на отработку
   *
   * @type {{ name: string, value: boolean }[]}
   */
  customPracticeWorkTasks: []
};

export default class App extends BaseComponent {

  /** @type {{}} */
  lastSavedState;

  constructor(props) {
    super(props);

    this.deafultTitle = "Бинарный журнал сделок";

    this.initialState = {
      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      /**
       * Депозит из профиля инвестора
       * 
       * @type {number}
       */
      investorDepo: null,
      /**
       * Дневной план (в %)
       * 
       * @type {number}
       */
      dailyRate: 0.5,


      /** 
       * Флаг ограничения на лимит убыточных сделок
       * 
       * @type {boolean}
       */
      limitUnprofitableDeals: true,

      /**
       * Допустимое количество убыточных сделок
       * 
       * @type {number}
       */
      allowedNumberOfUnprofitableDeals: 2,

      /** @type {dayTemplate[]} */
      data: [
        cloneDeep(this.dayTemplate)
      ],

      /**
       * Номер текущей страницы, где:
       * 
       * 0 - Главная
       *
       * 1 - ТС 1
       *
       * 2 - ТС 2
       *
       * 3 - ТС 3
       *
       * 4 - ТС 4
       * 
       * @type {0|1|2|3|4}
       */
      step: 0,

      /**
       * Индекс текущего выбранного дня
       * 
       * @type {number}
       */
      currentRowIndex: 0,

      extraStep:  false,
      extraSaved: false,
      customTools:   []
    };
    
    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState)
    };

    // Bindings
  }

  get dayTemplate() {
    return dayTemplate;
  }
  
  get dealTemplate() {
    return dealTemplate;
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { rowData } = this.state;
    if (prevState.rowData != rowData) {
      this.setState({ changed: true });
    }

    const { id, saves } = this.state;
    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }
  
  componentDidMount() {
    super.componentDidMount();

    this.fetchInitialData();
    
    // При наведении мыши на .dashboard-extra-container, элемент записывается в scrollInitiator
    $(document).on("mouseenter", ".table-extra-column-container", function (e) {
      scrollInitiator = e.target.closest(".table-extra-column-container");
    });

    document.addEventListener("scroll", function (e) {
      if (e?.target?.classList?.contains("table-extra-column-container")) {
        if (e.target !== scrollInitiator) return;

        document.querySelectorAll(".table-extra-column-container").forEach(element => {
          if (element === scrollInitiator) {
            return;
          }
          element.scrollLeft = scrollInitiator.scrollLeft;
        });
      }
    }, true /* Capture event */);

  }

  // Fetching everithing we need to start working
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
    await this.fetchLastModifiedSnapshot({ fallback: require("./snapshot.json") });
  }

  fetchTools() {
    return new Promise(resolve => {
      const { investorInfo } = this.state;
      const requests = [];
      const parsedTools = [];
      this.setState({ toolsLoading: true });
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
            .then(tools => Tools.sort(parsedTools.concat(tools)))
            .then(tools => parsedTools.push(...tools))
            .catch(error => message.error(`Не удалось получить инстурменты! ${error}`))
        );
      }

      Promise.all(requests)
        .then(() => this.setStateAsync({ tools: parsedTools, toolsLoading: false }))
        .then(() => resolve());
    });
  }

  packSave() {
    const {
      dailyRate,
      limitUnprofitableDeals,
      allowedNumberOfUnprofitableDeals,
      data,
      currentRowIndex,
      customTools
    } = this.state;

    const json = {
      static: {
        dailyRate,
        limitUnprofitableDeals,
        allowedNumberOfUnprofitableDeals,
        data,
        currentRowIndex,
        customTools
      }
    };

    console.log("Packed save:", json);
    return json;
  }

  parseSnapshot = data => {
    const initialState = cloneDeep(this.initialState);

    let _data = merge(cloneDeep(initialState.data), data.data)
      .map(day => {
        let { practiceWorkTasks } = day;
        practiceWorkTasks = merge(cloneDeep(dayTemplate.practiceWorkTasks), practiceWorkTasks);
        day.practiceWorkTasks = practiceWorkTasks;

        let { technology } = day;
        if (technology.amy) {
          technology["ЭМИ"] = technology.amy;
        }
        if (technology.tmo) {
          technology["ТМО"] = technology.tmo;
        }
        if (technology.recapitulation) {
          technology["Перепросмотр"] = technology.recapitulation;
        }
        if (technology.archetypesWork) {
          technology["Работа с архетипами"] = technology.archetypesWork;
        }

        delete technology.amy;
        delete technology.tmo;
        delete technology.recapitulation;
        delete technology.archetypesWork;

        technology = merge(cloneDeep(dayTemplate.technology), technology);
        day.technology = technology;

        return day;
      });

    return {
      dailyRate:                        data.dailyRate                        ?? initialState.dailyRate,
      limitUnprofitableDeals:           data.limitUnprofitableDeals           ?? initialState.limitUnprofitableDeals,
      allowedNumberOfUnprofitableDeals: data.allowedNumberOfUnprofitableDeals ?? initialState.allowedNumberOfUnprofitableDeals,
      data: _data,
      currentRowIndex:                  data.currentRowIndex                  ?? initialState.currentRowIndex,
      // TODO: у инструмента не может быть ГО <= 0, по идее надо удалять такие инструменты
      customTools:                     (data.customTools || []).map(tool => Tool.fromObject(tool))
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

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  getOptions() {
    return this.getTools().map((tool, idx) => ({
      idx,
      label: String(tool)
    }));
  }

  render() {
    const {
      step,
      currentRowIndex, 
      rowData,
      data,
      viewportWidth
    } = this.state;

    const mobile = viewportWidth <= 768;

    return (
      <StateContext.Provider value={this}>
        <div className="page">

          <main className="main">

            <div className="hdOptimize" >
              <div className="main-content">
                <Header />
                <div className="container">
                  {
                    step === 0
                    ? <Stats />
                    :
                      ((() => {
                        const hasChanged = this.lastSavedState && !isEqual(data[currentRowIndex], this.lastSavedState.data[currentRowIndex]);

                        return (
                          // TODO: это вернуть
                          // <div className="trade-slider" id="trade-slider">
                          <div className="trade-slider-active" id="trade-slider">
                            <div className="trade-slider-container">

                              <div className="trade-slider-top">
                                <Button
                                  className="day-button"
                                  disabled={currentRowIndex == 0}
                                  onClick={e => {
                                    this.setState(prevState => ({
                                      currentRowIndex: prevState.currentRowIndex - 1,
                                      extraStep: false
                                    }));
                                  }}
                                >
                                  <span adia-hidden="true">{"<< "}</span>
                                  {(mobile ? "Пред." : "Предыдущий") +" день"}
                                </Button>
                                <div className="trade-slider-day-container">
                                  <p>День {currentRowIndex + 1}</p>
                                  {currentRowIndex >= data.length - 1 && data.length > 1 && (
                                    <CrossButton
                                      className="cross-button"
                                      disabled={data.length == 1}
                                      onClick={() => {
                                        let dataClone = [...data];
                                        dataClone.splice(currentRowIndex, 1);
  
                                        this.setState({  
                                          data: dataClone,
                                          extraStep: false,
                                          step:          1,
                                          currentRowIndex: currentRowIndex == 0 ? 0 : currentRowIndex - 1
                                        });
                                      }}
                                    />
                                  )}
                                </div>

                                <Button
                                  className="day-button"
                                  disabled={currentRowIndex + 1 > data.length - 1}
                                  onClick={e => {
                                    this.setState(prevState => ({
                                      currentRowIndex: prevState.currentRowIndex + 1,
                                      extraStep: false
                                    }));
                                  }}
                                >
                                  {(mobile ? "След.": "Следующий") + " день"}
                                  <span adia-hidden="true">{" >>"}</span>
                                </Button>
                              </div>

                              <div className="trade-slider-middle">
                                
                                <div 
                                  className={clsx("trade-slider-middle-step", step >= 1 && ("blue-after-element") )}
                                  onClick={e => this.setState({ step: 1, extraStep: false })}
                                >
                                  <span className={clsx("step-logo", step >= 1 && "step-logo--active")}>
                                    Тс 1
                                  </span>

                                  <span className={clsx("step-name", step >= 1 && "step-name--active")}>
                                    Торговая<br/>стратегия
                                  </span>
                                </div>

                                <div 
                                  className={clsx("trade-slider-middle-step", step >= 2 && ("blue-after-element"))}
                                  onClick={() => this.setState({ step: 2, extraStep: false })}
                                >
                                  <span className={clsx("step-logo", step >= 2 && "step-logo--active")}>
                                    Тс 2
                                  </span>

                                  <span className={clsx("step-name", step >= 2 && "step-name--active")}>
                                    Торговое<br/> состояние
                                  </span>
                                </div>

                                <div
                                  className={clsx("trade-slider-middle-step", step >= 3 && ("blue-after-element"))}
                                  onClick={e => {
                                    this.setState({ step: 3, extraStep: false });
                                  }}
                                >
                                  <span className={clsx("step-logo", step >= 3 && "step-logo--active")}>
                                    Тс 3
                                  </span>

                                  <span className={clsx("step-name", step >= 3 && "step-name--active")}>
                                    Торговая<br/>сонастройка
                                  </span>
                                </div>

                                <div
                                  className="trade-slider-middle-step"
                                  onClick={() => this.setState({ extraStep: true, step: 4 })}
                                >
                                  <span className={clsx("step-logo", step == 4 && "step-logo--active")}>Тс 4</span>

                                  <span className={clsx("step-name", step == 4 && "step-name--active")}>
                                    Точечный<br/>самоанализа
                                  </span>
                                </div>
                              </div>

                              <div className="trade-slider--main-page">
                                <Button 
                                  className="main-button"
                                  onClick={async e => {
                                    if (hasChanged) {
                                      dialogAPI.open("close-slider-dialog", e.target);
                                    }
                                    else {
                                      await this.setStateAsync({ step: 0, extraStep: false });
                                    }
                                  }}
                                >
                                  Главная страница
                                </Button>
                              </div>

                              <div className="trade-slider-steps">
                                {step == 1 && (
                                  <FirstStep
                                    key={data}
                                    data={data[currentRowIndex]}
                                    tools={this.state.tools}
                                    searchVal={this.state.searchVal}
                                    setSeachVal={val => this.setState({searchVal: val})}
                                    currentRowIndex={currentRowIndex}
                                    toolsLoading={this.state.toolsLoading}
                                  />
                                )}

                                {step == 2 && (
                                  <SecondStep/>
                                )}

                                <ThirdStep hidden={step != 3} />

                                {step == 4 && (
                                  <FourthStep
                                    rowData={rowData}
                                    currentRowIndex={currentRowIndex}
                                    onChange={(prop, value, index) => {
                                      const rowDataClone = [...rowData];
                                      rowDataClone[index][prop] = value;
                                      this.setState({ rowData: rowDataClone });
                                    }}
                                    onClickTab={(boolean) => this.setState({ extraStep: boolean })}
                                  />
                                )}

                              </div>

                              <div className="trade-slider-bottom">
                                {step > 1 && (
                                  <Button
                                    className="trade-log-button trade-log-button--slider"
                                    onClick={e => {
                                      this.setState(prevState => ({ step: prevState.step - 1, extraStep: false }));
                                    }}
                                    disabled={step == 1}
                                  >
                                    Назад
                                  </Button>
                                )}

                                {step < 4 && (
                                  <Button 
                                    className="trade-log-button trade-log-button--slider"
                                    onClick={e => {
                                      this.setState(prevState => ({ step: prevState.step + 1 }));
                                    }}
                                    disabled={step == 4}
                                  >
                                    Далее
                                  </Button>
                                )}

                                {step == 4 && (
                                  hasChanged
                                    ? (
                                      <Button
                                        className={clsx(
                                          "trade-log-button",
                                          "trade-log-button--slider",
                                          "trade-log-button--filled"
                                        )}
                                        onClick={async e => {
                                          this.lastSavedState = cloneDeep(this.state);
                                          const { id } = this.state;
                                          if (id == null) {
                                            dialogAPI.open("dialog1", e.target);
                                          }
                                          else {
                                            await this.update(this.getTitle());
                                            this.setStateAsync({ saved: true });
                                          }
                                        }}
                                      >
                                        Сохранить
                                      </Button>
                                    )
                                    : (
                                      <Button
                                        className={clsx(
                                          "trade-log-button",
                                          "trade-log-button--slider"
                                        )}
                                        onClick={async e => await this.setStateAsync({ step: 0 })}
                                      >
                                        Закрыть
                                      </Button>
                                    )
                                )}
                              </div>

                            </div>
                          </div>
                        );
                      })())
                  }

                </div>
              </div>
            </div>

          </main>

          <SaveDialog />

          <DeleteDialog />

          <Dialog
            id="close-slider-dialog"
            title="Предупреждение"
            confirmText="ОК"
            onConfirm={e => {
              if (this.lastSavedState) {
                // Откатываемся к предыдущему сохраненному стейту
                this.setState({
                  dailyRate:                        this.lastSavedState.dailyRate,
                  limitUnprofitableDeals:           this.lastSavedState.limitUnprofitableDeals,
                  allowedNumberOfUnprofitableDeals: this.lastSavedState.allowedNumberOfUnprofitableDeals,
                  data:                             cloneDeep(this.lastSavedState.data),
                  currentRowIndex:                  this.lastSavedState.currentRowIndex,
                  customTools:                      cloneDeep(this.lastSavedState.customTools),
                  step:                             0
                });
                this.lastSavedState = null;
              }
              return true;
            }}
            cancelText="Отмена"
          >
            Вы уверены, что хотите выйти? Все несохраненные изменения будут потеряны
          </Dialog>

        </div>
      </StateContext.Provider>
    );
  }
}
