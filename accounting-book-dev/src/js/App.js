import React from "react"

import $ from "jquery"
import clsx from "clsx"
import { clone, cloneDeep, isEqual } from "lodash"
import { Button, Input, message } from "antd"

import { Tools, Tool }       from "../../../common/tools"
import { Dialog, dialogAPI } from "../../../common/components/dialog"
import CrossButton           from "../../../common/components/cross-button"

import BaseComponent, { Context } from "../../../common/components/BaseComponent"
/** @type {React.Context<App>} */
export const StateContext = Context;

import Header      from "../../../common/components/header"
import DayConfig   from "./components/day-config"
import Stats       from "./components/stats"

/* API */

import fetch from "../../../common/api/fetch"

import "../sass/style.sass"

let scrollInitiator;

export const dealTemplate = {
  currentToolCode:      "",
  currentToolIndex:     "",
  enterTime:  null,
};

const dayTemplate = {
  /**
   * Общий массив наименований затрат
   * 
   * @type {paymentTools[]}
   */
  paymentTools: [
    "Жилье",
    "Машина",
    "Питание",
    "Одежда",
    "Отдых",
    "Обучение",
    "Страховка",
    "Хобби",
    "Налоги",
    "Прочее"
  ],
  /**
   * Общий массив наименований дохода
   *
   * @type {incomeTools[]}
   */
  incomeTools: ["Работа", "Бизнес", "Пассивный доход"],

  isSaved:  false,
  /**
   * Дата создания в формате Unix-time
   * 
   * @property {number}
   */
  date: Number(new Date()),

  /**
   * @typedef PaymentSource
   * @property {"Важные"|"Необязательные"} expenseTypeName Выбранный тип расходов
   * @property {string} selectedPaymentToolName Источник расходов
   * @property {number} value Потраченая сумма
   */

  /**
   * Массив значений для таблицы затрат
   * 
   * @type {PaymentSource[]}
   */
  expense: [
    {
      expenseTypeName:        "Важные",
      selectedPaymentToolName: "Жилье",
      value:                         0,
    },
    {
      expenseTypeName:  "Необязательные",
      selectedPaymentToolName:  "Машина",
      value:                           0,
    },
  ],

  /**
   * @typedef IncomeSource
   * @property {"Постоянные"|"Периодические"} incomeTypeName Выбранный тип дохода
   * @property {string} selectedIncomeToolName Название дохода
   * @property {number} value Заработанная сумма
   */

  /**
   * Массив значений для таблицы доходов
   *
   * @type {IncomeSource[]}
   */
  income: [
    {
      incomeTypeName:       "Постоянные",
      selectedIncomeToolName:   "Работа",
      value:                           0,
    },    
    {
      incomeTypeName:    "Периодические",
      selectedIncomeToolName:   "Бизнес",
      value:                           0,
    },    
  ],

  /**
   * Регистр сделок
   * 
   * @type {dealTemplate[]}
   */
  deals: [
    cloneDeep(dealTemplate)
  ],
};

export default class App extends BaseComponent {

  /** @type {{}} */
  lastSavedState;

  constructor(props) {
    super(props);

    this.initialState = {
      /**
       * Номер месяца (начиная с 1)
       * 
       * @type {number}
       */
      month: 1,

      /**
       * Дефолтный массив видов трат
       * 
       * * @type {expenseTypeTools[]}
       */
      expenseTypeTools: ["Важные", "Необязательные"],

      /**
       * Дефолтный массив видов дохода
       * 
       * * @type {incomeTypeTools[]}
       */
      incomeTypeTools:  ["Постоянные", "Периодические"],

      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      /** @type {dayTemplate[]} */
      data: [
        // ...new Array(30).fill().map(pekora => cloneDeep(this.dayTemplate))
        cloneDeep(this.dayTemplate)
      ],

      /**
       * Номер текущей страницы, где:
       * 
       * 0 - Главная
       *
       * 1 - конфиг дня
       * 
       * @type {0|1}
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
      customTools:   [],
    };
    
    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState),

      paymentTools: [
        "Жилье",
        "Машина",
        "Одежда",
        "Отдых",
        "Обучение",
        "Страховка",
        "Хобби",
        "Налоги",
        "Прочее"
      ],
      incomeTools: ["Работа", "Бизнес", "Пассивный доход"],
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

    window.addEventListener("contextmenu", e => {
      e.preventDefault();
      console.log("!");
      document.getElementById("add-day-btn").click();
    });
  }

  // Fetching everithing we need to start working
  fetchInitialData() {
    // this.fetchSnapshots();
    // this.fetchLastModifiedSnapshot()
  }

  packSave() {
    const {
      data,
      currentRowIndex,
    } = this.state;

    const json = {
      static: {
        data,
        currentRowIndex,
      },
    };

    console.log("Packed save:", json);
    return json;
  }

  parseSnapshot = data => {
    const {} = this.state; 
    const initialState = cloneDeep(this.initialState);
    return {
      data:                             data.data                             ?? initialState.data,
      currentRowIndex:                  data.currentRowIndex                  ?? initialState.currentRowIndex,
    }
  }

  /** @param {import('../../../common/utils/extract-snapshot').Snapshot} snapshot */
  async extractSnapshot(snapshot) {
    try {
      await super.extractSnapshot(snapshot, this.parseSnapshot);
    }
    catch (error) {
      message.error(error)
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
      data,
      month
    } = this.state;

    return (
      <StateContext.Provider value={this}>
        <div className="page">

          <main className="main">

            <div className="hdOptimize" >
              <div className="main-content">
                <Header />
                <div className="container">
                  <div className="trade-slider-top">
                    <Button
                      className={"day-button"}
                      disabled={month === 1}
                      onClick={e => {
                        this.setState(prevState => ({ month: prevState.month - 1, step: 0 }))
                      }}
                    >
                      {"<< Предыдущий месяц"}
                    </Button>
                    <div className="trade-slider-day-container">
                      <p>Месяц {month}</p>
                      {/* {currentRowIndex >= data.length - 1 && data.length > 1 && (
                        <CrossButton
                          className="cross-button"
                          disabled={data.length == 1}
                          onClick={() => {
                            let dataClone = [...data];
                            dataClone.splice(currentRowIndex, 1);

                            this.setState({
                              data: dataClone,
                              extraStep: false,
                              step: 1,
                              currentRowIndex: currentRowIndex == 0 ? 0 : currentRowIndex - 1
                            });
                          }}
                        />
                      )} */}
                    </div>

                    <Button
                      className={"day-button"}
                      disabled={month + 1 > Math.ceil(data.length / 30)}
                      onClick={e => {
                        this.setState(prevState => ({ month: prevState.month + 1, step: 0 }))
                      }}
                    >
                      {"Следующий месяц >>"}
                    </Button>
                  </div>
                  {
                    step === 0
                    ? 
                      <Stats />
                      :
                      ((() => {
                        const hasChanged = this.lastSavedState && !isEqual(data[currentRowIndex], this.lastSavedState.data[currentRowIndex]);

                        return (
                          <div className="trade-slider-active" id="trade-slider">
                            <div className="trade-slider-container">


                              <div className={"trade-slider--main-page"}>
                                <Button 
                                  className={"main-button"}
                                  onClick={async e => {
                                    // ~~
                                    if (false && hasChanged) {
                                      dialogAPI.open("close-slider-dialog", e.target);
                                    }
                                    else {
                                      await this.setStateAsync({ step: 0, extraStep: false })
                                    }
                                  }}
                                >
                                  Главная страница
                                </Button>
                              </div>

                              <DayConfig
                                key={data}
                                data={data[currentRowIndex]}
                                tools={this.state.tools}
                                searchVal={this.state.searchVal}
                                setSeachVal={ val => this.setState({searchVal: val}) }
                                currentRowIndex={currentRowIndex}
                                toolsLoading={this.state.toolsLoading}
                              />
                            </div>
                          </div>
                        )
                      })())
                  }

                </div>
              </div>
            </div>

          </main>
          {/* /.main */}

          {false && (() => {
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

          <Dialog
            id="close-slider-dialog"
            title="Предупреждение"
            confirmText="ОК"
            onConfirm={e => {
              if (false && this.lastSavedState) {
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
