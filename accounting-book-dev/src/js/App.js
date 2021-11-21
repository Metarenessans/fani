import React from "react";

import $ from "jquery";
import { cloneDeep, isEqual } from "lodash";
import { Button, message } from "antd";

import { Dialog, dialogAPI } from "../../../common/components/dialog";
import { SaveDialog, dialogID as saveDialogID } from "../../../common/components/save-dialog";

import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

import Header from "../../../common/components/header";
import DeleteDialog from "../../../common/components/delete-dialog";

import DayConfig   from "./components/day-config";
import Stats       from "./components/stats";

/* API */

import "../sass/style.sass";

let scrollInitiator;

export const dealTemplate = {
  currentToolCode:      "",
  currentToolIndex:     "",
  enterTime:  null
};

const dayTemplate = {
  /**
   * Общий массив наименований затрат
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
      expenseTypeName:         "Важные",
      selectedPaymentToolName: "Жилье",
      value:                   0
    },
    {
      expenseTypeName:         "Необязательные",
      selectedPaymentToolName: "Машина",
      value:                   0
    }
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
      incomeTypeName:         "Постоянные",
      selectedIncomeToolName: "Работа",
      value:                  0
    },    
    {
      incomeTypeName:         "Периодические",
      selectedIncomeToolName: "Бизнес",
      value:                  0
    }  
  ],

  /**
   * Регистр сделок
   * 
   * @type {dealTemplate[]}
   */
  deals: [
    cloneDeep(dealTemplate)
  ]
};

export default class App extends BaseComponent {

  constructor(props) {
    super(props);

    this.deafultTitle = "Бинарный журнал сделок";

    this.lastSavedState = {};

    this.initialState = {
      /**
       * Номер месяца (начиная с 1)
       * 
       * @type {number}
       */
      month: 1,

      /**
       * Виды расходов
       * 
       * @type {string[]}
       */
      expenseTypeTools: ["Важные", "Необязательные"],

      /**
       * Виды доходов
       * 
       * @type {string[]}
       */
      incomeTypeTools:  ["Постоянные", "Периодические"],

      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      /** @type {dayTemplate[]} */
      data: [cloneDeep(this.dayTemplate)],

      /**
       * Номер текущей страницы, где:
       * 
       * 0 - Главная
       *
       * 1 - Конфиг дня
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
      customTools:   []
    };
    
    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState),

      /** Статьи расходов */
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

      /** Статьи доходов */
      incomeTools: ["Работа", "Бизнес", "Пассивный доход"]
    };

    // Bindings
  }

  get dayTemplate() {
    return dayTemplate;
  }
  
  get dealTemplate() {
    return dealTemplate;
  }

  componentDidMount() {
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

  fetchInitialData() {
    this.fetchSnapshots();
    this.fetchLastModifiedSnapshot();
  }

  packSave() {
    const {
      data,
      month,
      incomeTypeTools,
      expenseTypeTools
    } = this.state;

    const json = {
      static: {
        data,
        month,
        incomeTypeTools,
        expenseTypeTools
      }
    };

    console.log("Packed save:", json);
    return json;
  }

  parseSnapshot = data => {
    const initialState = cloneDeep(this.initialState);
    return {
      data:             data.data             ?? initialState.data,
      month:            data.month            ?? initialState.month,
      incomeTypeTools:  data.incomeTypeTools  ?? initialState.incomeTypeTools,
      expenseTypeTools: data.expenseTypeTools ?? initialState.expenseTypeTools
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

  render() {
    const {
      step,
      data,
      month,
      currentRowIndex 
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
                      className="day-button"
                      disabled={month === 1}
                      onClick={e => {
                        this.setState(prevState => {
                          const month = prevState.month - 1;
                          return {
                            month,
                            currentRowIndex: (month - 1) * 30
                          };
                        });
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
                      className="day-button"
                      disabled={month + 1 > Math.ceil(data.length / 30)}
                      onClick={e => {
                        this.setState(prevState => {
                          const month = prevState.month + 1;
                          return {
                            month,
                            currentRowIndex: (month - 1) * 30
                          };
                        });
                      }}
                    >
                      {"Следующий месяц >>"}
                    </Button>
                  </div>
                  {
                    step === 0
                      ? <Stats/>
                      :
                        <div id="trade-slider" className="trade-slider-active">
                          <div className="trade-slider-container">
                            <div className="trade-slider--main-page">
                              <Button 
                                className="main-button"
                                onClick={async e => {
                                  const hasChanged = 
                                    this.lastSavedState && 
                                    !isEqual(data[currentRowIndex], this.lastSavedState.data[currentRowIndex]);
                                  // ~~
                                  if (false && hasChanged) {
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

                            <DayConfig />

                            <div className="buttons-container buttons-container--end">
                              <Button
                                className="table-panel__add-button custom-btn"
                                onClick={e => dialogAPI.open(saveDialogID, e.target)}
                              >
                                Сохранить
                              </Button>
                              <Button
                                className="table-panel__add-button custom-btn"
                                onClick={e => this.setState({ step: 0 })}
                              >
                                Закрыть
                              </Button>
                            </div>
                          </div>
                        </div>
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
