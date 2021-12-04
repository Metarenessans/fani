import React from "react";

import $ from "jquery";
import { cloneDeep, isEqual, flatten } from "lodash";
import { Button, message } from "antd";

import typeOf from "../../../common/utils/type-of";

import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

import Header from "../../../common/components/header";
import { Dialog, dialogAPI } from "../../../common/components/dialog";
import SaveDialog, { dialogID as saveDialogID } from "../../../common/components/save-dialog";
import DeleteDialog from "../../../common/components/delete-dialog";

import DayConfig   from "./components/day-config";
import Stats       from "./components/stats";
import "../js/Utils/days-in-month";

/* API */

import "../sass/style.sass";

let scrollInitiator;

export const dealTemplate = {
  currentToolCode:      "",
  currentToolIndex:     "",
  enterTime:  null,
  changed: false,
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

    this.deafultTitle = <>Книга учета<br/> доходов и расходов</>;

    this.lastSavedState = {};

    this.initialState = {
      // Копирует `initialState` из BaseComponent
      ...this.initialState,

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

      /** @type {dayTemplate[][]} */
      data: [
        [
          // {
          //   ...cloneDeep(this.dayTemplate),
          //   date: 0
          // },
          // ...new Array(29).fill().map(pekora => cloneDeep(this.dayTemplate))

          // production
          cloneDeep(this.dayTemplate)
        ]
      ],

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
    const {
      data,
      month,
      incomeTypeTools,
      expenseTypeTools
    } = this.state;
    if (
      prevState.data != data ||
      prevState.month != month ||
      prevState.incomeTypeTools != incomeTypeTools ||
      prevState.expenseTypeTools != expenseTypeTools
    ) {
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
    this.fetchLastModifiedSnapshot({ fallback: require("./snapshot.json") })
      .then(() => this.setState({changed: false}))
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

    let _data = data.data ?? initialState.data;
    // Legacy сохранение
    if (typeOf(_data?.[0]) === "object") {

      let i, j, chunk = 30;
      const result = [];
      for (i = 0, j = _data.length; i < j; i += chunk) {
        let temporary = _data.slice(i, i + chunk);
        // do whatever
        result.push(temporary);
      }
      result;

      _data = result;
    }

    return {
      data: _data,
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

  getSelectedDay() {
    const { data, currentRowIndex } = this.state;
    return flatten(data)[currentRowIndex];
  }
  
  render() {
    const {
      step,
      data,
      month,
      currentRowIndex 
    } = this.state;
    
    function getRanges() {
      let range = [];

      let start = 0;
      const mappedData = data.map(row => new Date(row.date).getMonth());
      const months = Array.from(new Set(mappedData));

      for (let month of months) {
        const end = mappedData.lastIndexOf(month);
        range.push([start, end]);
        start = end + 1;
      }

      return range;
    }

    // const ranges = getRanges();
    const slicedData = data[month - 1];
    this.slicedData = slicedData;

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
                            month
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
                      // disabled={
                      //   // Номер месяца последней строки меньше текущего месяца
                      //   // new Date(cloneDeep(slicedData).pop().date).getMonth() + 1 === new Date().getMonth() + 1
                      //   //   ? false
                      //   //   : true
                      //   // new Date(slicedData[slicedData.length - 1].date).getDate() < new Date(slicedData[slicedData.length - 1].date).daysInMonth()
                      //   slicedData.length < 31
                      // }
                      //~~
                      onClick={async e => {
                        const data = cloneDeep(this.state.data);
                        const day = cloneDeep(dayTemplate);
                        // Обновляем дату

                        const daysInCurrentMonth = new Date(this.slicedData[0].date).daysInMonth();
                        const lastDay = this.slicedData[this.slicedData.length - 1];
                        const lastDayDate = new Date(lastDay.date).getDate();

                        day.date = lastDay?.date ?? Number(new Date());

                        // if (lastDayDate >= daysInCurrentMonth) {
                        //   day.date = lastDay.date + (24 * 60 * 60 * 1000);
                        // }

                        // Добавляем строку только если мы переходим в новый месяц впервые
                        if (!data[month]) {
                          
                          const newDate = new Date(lastDay.date);
                          newDate.setMonth(newDate.getMonth() + 1);
                          newDate.setDate(1);

                          day.date = +newDate;

                          data[month] = [day];
                        }

                        this.setState(prevState => {
                          const month = prevState.month + 1;
                          return {
                            data,
                            month
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
                                  false &&
                                  this.lastSavedState && 
                                  !isEqual(data[currentRowIndex], this.lastSavedState.data[currentRowIndex]);
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

                          <DayConfig />

                          <div className="buttons-container buttons-container--end">
                            <Button
                              className="table-panel__add-button custom-btn"
                            onClick={e => {
                              this.state.currentSaveIndex === 0 ?
                                dialogAPI.open(saveDialogID, e.target) :
                                this.update();
                            }}
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
