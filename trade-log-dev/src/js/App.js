import React from "react"
/** @type {import("react").Context<App>} */
export const StateContext = React.createContext();

import $ from "jquery"
import clsx from "clsx"

import { cloneDeep, isEqual } from "lodash"

import { Button, Input, message } from "antd"

import { PlusOutlined } from '@ant-design/icons'

import params                from "../../../common/utils/params"
import { Tools }             from "../../../common/tools"
import { Dialog, dialogAPI } from "../../../common/components/dialog"
import CrossButton           from "../../../common/components/cross-button"

import Header      from "./components/header"
import FirstStep   from "./components/step-1"
import SecondStep  from "./components/step-2"
import ThirdStep   from "./components/step-3"
import FourthStep  from "./components/step-4"
import Stats       from "./components/stats"

/* API */

import fetch from "../../../common/api/fetch"
import fetchSaveById from "../../../common/api/fetch/fetch-save-by-id"
import { fetchInvestorInfo, applyInvestorInfo } from "../../../common/api/fetch/investor-info"

import "../sass/style.sass"

let scrollInitiator;

const dealTemplate = {
  currentToolCode: "SBER",
  currentToolIndex:    "",
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
 
  isSaved: false,

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
      load:       1,
      iterations: 1,
      depo:       0,
    }
  ],

  /**
   * Регистр сделок
   * 
   * @type {dealTemplate[]}
   * 
   * //TODO: добавить описание
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
    { result: true,  baseTrendDirection: null, momentDirection: null, doubts: null },
  ],

  technology: {
    amy: false,
    tmo: false,
    recapitulation: false,
    archetypesWork: false,
  },

  customTechnology: [],

  /**
   * Практические задачи на отработку
   * 
   * @type {Object.<string, boolean>}
   */
  practiceWorkTasks: {
    "Изменить время на сделку":                            false,
    "Не снимать отложенные заявки, выставленные до этого": false,
    "Не перезаходить после закрытия по Stop-Loss":         false,
    "Не выключать робота":                                 false,
    "Контролировать объём входа":                          false,
    "Делать расчёты ФАНИ":                                 false,
    "Заносить результаты в ФАНИ":                          false,
    "Фиксировать сделки в скриншотах":                     false,
    "Выделять ключевые поведенченские паттерны и модели":  false,
  },
  customPracticeWorkTasks: [],
};

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {

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

      extraStep:  false,
      extraSaved: false,
      loading:    false,
      customTools:   [],
      currentSaveIndex: 0,

      loading: false,
      saved:   false,
      id:       null,

    };

    this.state = {
      ...cloneDeep(this.initialState),
      
      /**
       * Индекс текущего выбранного дня
       * 
       * @type {number}
       */
      currentRowIndex:   0,
      
      toolsLoading:  false,
      changed:       false,
      searchVal:        "",

      /** @type {Tool[]} */
      tools:        [],
      saves:        [],
    };

    // Bindings
    /**
     * @type {applyInvestorInfo}
     */
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.fetchInvestorInfo = fetchInvestorInfo.bind(this);
    this.fetchSaveById = fetchSaveById.bind(this, "Tradelog");
  }

  get dayTemplate() {
    return dayTemplate;
  }
  
  get dealTemplate() {
    return dealTemplate;
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { 
      id, 
      saves, 
      rowData, 
    } = this.state;

    // if (prevState.step == 2 && this.state.step == 1) {
    //   document.getElementById("trade-slider").scrollIntoView();
    // }
    
    // if (prevState.step !== this.state.step && this.state.step == 2) {
    //   document.getElementById("second-step").scrollIntoView();
    // }

    // if (prevState.step !== this.state.step && this.state.step == 3) {
    //   document.getElementById("trade-slider").scrollIntoView();
    // }

    if (prevState.rowData != rowData) {
      this.setState({ changed: true });
    }

    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }
  
  componentDidMount() {
    this.fetchInitialData();
    
    // При наведении мыши на .dashboard-extra-container, элемент записывается в scrollInitiator
    $(document).on("mouseenter", ".table-extra-column-container", function (e) {
      scrollInitiator = e.target.closest(".table-extra-column-container");
    })

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

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchTools()
      .then(() => this.fetchSaves())
      .catch(error => console.error(error))

    this.fetchInvestorInfo()
      .then(response => this.setStateAsync({ depo: response.data.deposit }))
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

  fetchSaves() {
    return new Promise((resolve, reject) => {
      fetch("getTradelogSnapshots")
        .then(response => {
          const saves = response.data.sort((l, r) => r.dateUpdate - l.dateUpdate);
          this.setState({ saves, loading: false });
        })

      fetch("getLastModifiedTradelogSnapshot")
        .then(response => {
          // TODO: нужен метод проверки адекватности ответа по сохранению для всех проектов
          if (!response.error && response.data?.name) {
            const pure = params.get("pure") === "true";
            if (!pure) {
              this.setState({ loading: true });
              return this.extractSave(response.data)
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
          const {changed} = this.state;
          this.setState({ changed: false });
          if (dev) {
            const response = {
              "error": false,
              "data": {
                "id": 0,
                "name": null,
                "dateCreate": 0,
                "dateUpdate": 0,
                "static": null
              }
            };

            const saves = [{
              "id": response.data.id,
              "name": response.data.name,
              "dateCreate": response.data.dateCreate,
            }];

            this.setStateAsync({ saves, loading: false }).then(() => {
              if (!response.error && response.data?.name) {
                this.extractSave(response.data)
              }
            })
          }
        })
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

  // TODO:
  packSave() {
    const { rowData } = this.state;

    const json = {
      static: {
        rowData
      },
    };

    console.log("Packed save:", json);
    return json;
  }

  extractSave(save) {
    const { saves, investorInfo } = this.state;
    let staticParsed;

    let state = {};

    try {
      let lastUpdated = save.dateUpdate || save.dateCreate;
      console.log('Extracting save:', save, "last updated:", new Date(lastUpdated * 1_000).toLocaleString("ru").replace(/\./g, "/"));

      staticParsed = JSON.parse(save.static);
      console.log("Parsed static", staticParsed);
      
      const initialState = cloneDeep(this.initialState);
      
      state.rowData = staticParsed.rowData ?? initialState.rowData;

      state.id = save.id;
      state.saved = true;
      state.loading = false;
    }
    catch (e) {
      state = {
        id: save?.id || 0,
        saved: true
      };
    }

    console.log('Parsing save finished!', state);
    return this.setStateAsync(state);
  }

  reset() {
    const initialState = cloneDeep(this.initialState);
    console.log(initialState);
    return this.setStateAsync(initialState);
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

      fetch("addTradelogSnapshot", "POST", data)
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
      fetch("updateTradelogSnapshot", "POST", data)
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
      fetch("deleteTradelogSnapshot", "POST", { id })
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
        idx: idx,
        label: String(tool),
      };
    });
  }


  getTitleJSX() {
    const { saves, currentSaveIndex } = this.state;
    let titleJSX = <span>Бинарный журнал сделок</span>;
    if (saves && saves[currentSaveIndex - 1]) {
      titleJSX = <span>{saves[currentSaveIndex - 1].name}</span>;
    }

    return titleJSX;
  }

  /**
   * Возвращает название текущего сейва (по дефолту возвращает строку "Калькулятор Инвестиционных Стратегий") */
  getTitle() {
    return this.getTitleJSX().props.children;
  }

  render() {
    const {
      step, 
      extraStep, 
      currentRowIndex, 
      rowData,
      extraSaved,
      loading,
      saves,
      currentSaveIndex,
      saved,
      changed,
      data
    } = this.state;

    return (
      <StateContext.Provider value={this}>
        <div className="page">

          <main className="main">

            <div className="hdOptimize" >
              <div className="main-content">
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
                />
                <div className="container">
                  {
                    step === 0
                    ? <Stats />
                    : (
                      // TODO: это вернуть
                      // <div className="trade-slider" id="trade-slider">
                      <div className="trade-slider-active" id="trade-slider">
                        <div className="trade-slider-container">

                          <div className="trade-slider-top">
                            <Button
                              className={"day-button"}
                              disabled={currentRowIndex == 0}
                              onClick={e => {
                                this.setState(prevState => ({
                                  currentRowIndex: prevState.currentRowIndex - 1,
                                  extraStep: false
                                }))
                              }}
                            >
                              {"<< Предыдущий день"}
                            </Button>
                            <div className="trade-slider-day-container">
                              <p>День {currentRowIndex + 1}</p>
                              <CrossButton
                                className="cross-button"
                                disabled={data.length == 1}
                                onClick={() => {
                                  document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                                  document.querySelector(".dashboard").classList.remove("dashboard-active");
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
                            </div>

                            <Button
                              className={"day-button"}
                              disabled={currentRowIndex + 1 > data.length - 1}
                              onClick={e => {
                                this.setState(prevState => ({
                                  currentRowIndex: prevState.currentRowIndex + 1,
                                  extraStep: false
                                }))
                              }}
                            >
                              {"Следующий день >>"}
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
                              onClick={ () => this.setState({ step: 2, extraStep: false })}
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

                          <div className={"trade-slider--main-page"}>
                            <Button 
                              className={"main-button"}
                              onClick={async () => {
                                await this.setStateAsync({ step: 0, extraStep: false });
                                document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                                document.querySelector(".dashboard").classList.remove("dashboard-active");
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
                                setSeachVal={ val => this.setState({searchVal: val}) }
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
                                  this.setState({ rowData: rowDataClone })
                                }}
                                onClickTab={(boolean) => this.setState({ extraStep: boolean })}
                              />
                            )}

                          </div>

                          <div className="trade-slider-bottom">
                            {step == 1 && (
                              <Button
                                className="trade-log-button trade-log-button--slider"
                                onClick={async e => {
                                  await this.setStateAsync({ step: 0, extraStep: false });
                                  document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                                  document.querySelector(".dashboard").classList.remove("dashboard-active");
                                }}
                                disabled={step > 1}
                              >
                                Закрыть
                              </Button>
                            )}
                            
                            {step > 1 && (
                              <Button
                                className="trade-log-button trade-log-button--slider"
                                onClick={e => {
                                  this.setState(prevState => ({ step: prevState.step - 1, extraStep: false }))
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
                                  this.setState(prevState => ({ step: prevState.step + 1 }))
                                }}
                                disabled={step == 4}
                              >
                                Далее
                              </Button>
                            )}

                            {(() => {
                              if (step == 4 && !extraSaved) {
                                return (
                                  <Button
                                    className="trade-log-button trade-log-button--slider"
                                    onClick={() => {
                                      const dataClone = [...data];
                                      dataClone[currentRowIndex].isSaved = true;
                                      this.update(this.getTitle());
                                      this.setState({
                                        data: dataClone, 
                                        extraSaved: true,
                                      })
                                    }}
                                  >
                                    Сохранить
                                  </Button>
                                )
                              }
                              
                              if (extraSaved) {
                                return (
                                  <Button
                                    className="trade-log-button trade-log-button--slider"
                                    onClick={ e => {
                                      this.setState({ step: 1, extraStep: false, extraSaved: false, changed: false});
                                      document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                                      document.querySelector(".dashboard").classList.remove("dashboard-active");
                                    }}
                                  >
                                    Закрыть
                                  </Button>
                                )
                              }
                            })()}
                          </div>

                        </div>
                      </div>
                    )
                  }

                </div>
              </div>
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

        </div>
      </StateContext.Provider>
    );
  }
}
