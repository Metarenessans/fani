import React from "react";
import $ from "jquery";
import clsx from "clsx";
import { cloneDeep, isEqual, merge } from "lodash";
import { Button, message } from "antd";

import { Tools, Tool }       from "../../../common/tools";
import { Dialog, dialogAPI } from "../../../common/components/dialog";
import CrossButton           from "../../../common/components/cross-button";

import typeOf  from "../../../common/utils/type-of";
import num2str from "../../../common/utils/num2str";
import parseTasks          from "./components/stats/tasks/parse-tasks";
import parseEmotionalState from "./utils/parse-emotional-state";

import SaveDialog, { dialogID as saveDialogID } from "../../../common/components/save-dialog";
import DeleteDialog from "../../../common/components/delete-dialog";
import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

import Header      from "../../../common/components/header";
import Diary       from "./components/diary";
import FirstStep   from "./components/step-1";
import SecondStep  from "./components/step-2";
import ThirdStep   from "./components/step-3";
import FourthStep  from "./components/step-4";
import Stats       from "./components/stats";

/* API */

import "../sass/style.sass";

let scrollInitiator;

/** Страница, с которой был переход в Личный дневник */
let previousStep = -1;

/**
 * Локальное время пользователя на момент запуска тайм-аута для каждого дня
 * в формате Unix-time
 * 
 * @type {number[]}
 */
let timeoutStartTime = [];

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
    /** @type {Object.<string, boolean>} */
    positive: {
      "Спокойствие":  false,
      "Собранность":  false,
      "Смелость":     false,
      "Уверенность":  false
    },
    /** @type {Object.<string, boolean>} */
    negative: {
      "Жалость":                  false,
      "Жадность":                 false,
      "Эго (я прав)":             false,
      "Эйфория":                  false,
      "Вина":                     false,
      "Обида":                    false,
      "Гнев":                     false,
      "Апатия":                   false,
      "Стагнация":                false,
      "Тревожность":              false,
      "Перевозбуждение":          false,
      "Гиперактивность":          false,
      "Cтрах":                    false,
      "Ужас":                     false,
      "Отчаяние":                 false,
      "Выталкивающая сила рынка": false
    }
  },
  motives: {
    /** @type {Object.<string, boolean>} */
    positive: {
      "Видение рынка":                                           false,
      "Видение точки входа":                                     false,
      "Видение точки выхода":                                    false,
      "Видение торгового диапазона":                             false,
      "Видение силы рынка (тенденции)":                          false,
      "Контроль загрузки позиции без Stop Loss":                 false,
      "Контроль Точки Входа и загрузки по позиции со Stop Loss": false,
      "Отработка навыка входа":                                  false,
      "Отработка навыка выхода":                                 false,
      "Отработка пребывания в сделке":                           false,
      "Отработка среднесрочного анализа":                        false,
      "Создание торгового алгоритма":                            false
    },
    /** @type {Object.<string, boolean>} */
    negative: {
      "Скука":                                                        false,
      "Азарт":                                                        false,
      "Желание торговать":                                            false,
      "Спешка и суета":                                               false,
      "Желание закрыть позицию раньше изначального Намерения (цели)": false,
      "Большая позиция без Stop Loss":                                false
    }
  }
};

/**
 * Рекомендуемые задачи на отработку для конкретного эмоционального состояния
 *  
 * @type {Object.<string, string[]>}
 */
export const recommendedEmotionalStateTasks = {
  "Жалость":      ["ЭМИ", "ТМО", "Перепросмотр", "Точка Лао-гун (ладони-магнит)"],
  "Жадность":     ["Воля"],
  "Эго (я прав)": ["Кто я", "ОВД"],
  "Эйфория":      ["ЭМИ", "Физические упражнения"],
  "Вина":         ["ЭМИ", "ТМО", "Анализ", "ЭУЛ", "Работа с тимусом"],
  "Обида":        ["ЭМИ", "ТМО", "Анализ", "ЭУЛ", "Работа с тимусом"],
  "Гнев":         ["ЭМИ", "ТМО", "Анализ", "ЭУЛ", "Работа с тимусом", "Физические упражнения"],
  "Апатия":       ["ЭМИ", "ТМО", "Анализ", "ЭУЛ", "Работа с тимусом", "Физические упражнения"],
  "Стагнация":    ["ЭМИ", "ТМО", "Анализ", "ЭУЛ", "Работа с тимусом", "Физические упражнения"],
  
  "Скука":             ["Счет", "Математические задачи", "Дыхательные упражнения и энергопрактики"],
  "Азарт":             ["Дыхание, ЭМИ", "Планка", "Ходьба"],
  "Желание торговать": ["Анализ \"Что конкретно и зачем?\""],
  "Спешка и суета":    ["Дыхание", "Работа с тимусом"]
};

export const dayTemplate = {
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
    "Удаленное Видение (НИ Мастер)":                     false,
    "Физическая активность: приседания, отжимания, бег": false,
    "Аффирмации":                                        false,
    "НАННИ":                                             false,
    "Работа со страхами":                                false,
    "Простукивание тимуса":                              false,
    "Ладони магниты (точка лаотгун). Биомагнетизм":      false,
    "Работа со страхами (НИ Мастер, МКС)":               false,
    "Тенсегрити (шаманские танцы) МКС":                  false,
    "Быстрый счет до 120":                               false,
    "Спонтанное движение пальцем по лужице воды (интуиция)": false,
    "Световая медитация (энерго финансовый марафон, МКС)":   false,
    "Медитация планеты":                                     false,
    "Медитация пройти через стену ограничений":              false,
    "Мантра Ом Мани":                                        false,
    "Жонглирование":                                         false,
    "Рисование":                                             false,
    "Чтение и написание стихов":                             false,
    "Обратный просмотр дня. С \"Фотографией\" момента (МКС)": false,
    "Медитация на объем капитала. Визуализация, кинестетика": false

  },

  /**
   * Кастомные технологии
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
    "Делать более детальные расчёты в ФАНИ":                   false,
    "Заносить результаты в ФАНИ":                              false,
    "Фиксировать сделки на скриншотах":                        false,
    "Выделять ключевые поведенческие паттерны и модели":       false,
    "Анализировать текущую ситуацию в конкретных показателях": false,
    "Смену тактики проводить через анализ и смену алгоритма":  false,
    "Время между сделками: 30 минут":                          false,
    "Время между сделками: 1 час":                             false,
    "Время между сделками: четко по сессиям":                  false,
    "Удержание напряжения от желания торговать":               false,
    "Удержание напряжения от желания наблюдать за сделкой":    false,
    "Удержание напряжения закрыть сделку раньше. Отпускание":  false,
    "Снятие эмоциональной привязанности от результата сделки": false,
    "Переторговка: сделок больше чем":                         false,
    "Переторговка: время более чем":                           false,
    "Инструментов в работе: более чем":                        false,
    "Торговля без четкого алгоритма (ручная)":                 false,
    "Торговля избыточным количеством инструментов":            false,
    "Проработка иллюзии очевидности прошлого":                 false,
    "Не открывать сразу сделку после закрытия по профиту":     false,
    "Не торговать импульсный вход, только от уровней отложения": false,
    "\"Бумажная\" торговля. Прогноз точки входа и выхода":     false,
    "Анализ торговых показателей из инфобота":                 false,
    "Торговать только уровни (откаты игнорировать)":           false,
    "Ставить заявки в \"невозможную\" точну входа (ВИДЕНИЕ)":  false,
    "Думать только о рынке. Гасить мысли о деньгах":           false,
    "Не гнаться за рынком (жалость, спешка, суета)":           false
  },

  /**
   * Массив готовности практических задач на отработку
   * 
   * @type {Object.<string, boolean>}
   */
  readyWorkTasks: {
    "Изменить время на сделку":                                false,
    "Не снимать отложенные заявки, выставленные до этого":     false,
    "Не перезаходить после закрытия по Stop-Loss":             false,
    "Не выключать робота":                                     false,
    "Контролировать объём входа":                              false,
    "Делать более детальные расчёты в ФАНИ":                   false,
    "Заносить результаты в ФАНИ":                              false,
    "Фиксировать сделки на скриншотах":                        false,
    "Выделять ключевые поведенческие паттерны и модели":       false,
    "Анализировать текущую ситуацию в конкретных показателях": false,
    "Смену тактики проводить через анализ и смену алгоритма":  false,
    "Время между сделками: 30 минут":                          false,
    "Время между сделками: 1 час":                             false,
    "Время между сделками: четко по сессиям":                  false,
    "Удержание напряжения от желания торговать":                false,
    "Удержание напряжения от желания наблюдать за сделкой":     false,
    "Удержание напряжения закрыть сделку раньше. Отпускание":  false,
    "Снятие эмоциональной привязанности от результата сделки": false,
    "Переторговка: сделок больше чем":                         false,
    "Переторговка: время более чем":                           false,
    "Инструментов в работе: более чем":                        false,
    "Торговля без четкого алгоритма (ручная)":                 false,
    "Торговля избыточным количеством инструментов":            false,
    "Проработка иллюзии очевидности прошлого":                 false
  },

  /**
   * Кастомные практические задачи на отработку
   *
   * @type {{ name: string, value: boolean }[]}
   */
  customPracticeWorkTasks: [],

  /** 
   * Массив готовности практических задачи на отработку
   * 
   * @type {Object.<string, boolean>}
   */
  readyCustomPracticeWorkTasks: {}
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

      changed: false,
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

      /**
       * Массив готовности практических задач на отработку
       * 
       * @type {Object.<string, number>}
       */
      readyWorkTasksCheckTime: {},

      /**
       * Содержимое личного дневника
       */
      notes: "",

      /**
       * Время блокировки сделок в минутах
       * 
       * `9999` считается за "до конца дня"
       */
      lockTimeoutMinutes: 9999,

      /**
       * Массив тайм-аутов в минутах для каждого дня
       * 
       * @type {number[]}
       */
      timeoutMinutes: [],

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
    const {
      dailyRate,
      limitUnprofitableDeals,
      allowedNumberOfUnprofitableDeals,
      data,
      customTools
    } = this.state;
    if (
      prevState.dailyRate                        != dailyRate                        ||
      prevState.limitUnprofitableDeals           != limitUnprofitableDeals           ||
      prevState.allowedNumberOfUnprofitableDeals != allowedNumberOfUnprofitableDeals ||
      !isEqual(prevState.data, data)                                                 ||
      !isEqual(prevState.customTools, customTools)
    ) {
      dev && console.log("есть изменения");
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

  checkForLockingDeals(dayIndex) {
    const { data, lockTimeoutMinutes } = this.state;

    const i = dayIndex || this.state.currentRowIndex;

    // Проверяем, нужно ли блокировать добавление сделок и ставить тайм-ауты
    const day = data[i];
    const deals = day.deals;
    const emotionalState = parseEmotionalState(deals);
    const isNegativeEmotionalState = emotionalState.negative > emotionalState.positive;

    // Убыточные сделки
    const unprofitableDeals = deals.filter(deal => deal.result < 0);
    // Если включен лимит убыточных сделок и мы превышаем допустимый лимит - запрещаем торговлю
    let tradingNotAllowed =
      this.state.limitUnprofitableDeals && unprofitableDeals.length >= this.state.allowedNumberOfUnprofitableDeals;

    console.log("tradingNotAllowed", tradingNotAllowed, "isNegativeEmotionalState", isNegativeEmotionalState);

    // Вышли в негативный эмоциональный фон
    if (tradingNotAllowed || isNegativeEmotionalState) {
      let msg = `Добавление сделок для ${i + 1} дня заблокировано`;
      if (location.href.replace(/\/$/g, "").endsWith("-dev") || dev) {
        if (lockTimeoutMinutes === 9999) {
          msg += " до конца дня";
        }
        else {
          msg += `на ${lockTimeoutMinutes} ${num2str(lockTimeoutMinutes, ["минута", "минуты", "минут"])}`;
        }
        message.warn(msg);
      }

      console.warn(msg);

      const timeoutMinutes = cloneDeep(this.state.timeoutMinutes);
      timeoutMinutes[i] = lockTimeoutMinutes;
      localStorage.setItem("timeoutMinutes", JSON.stringify(timeoutMinutes));
      this.setState({ timeoutMinutes });

      if (!timeoutStartTime) {
        timeoutStartTime = [];
      }
      timeoutStartTime[i] = Number(new Date());
      console.log("Записываем timeoutStartTime в localStorage", timeoutStartTime, new Date(timeoutStartTime[i]));
      localStorage.setItem("timeoutStartTime", JSON.stringify(timeoutStartTime));
    }
  }
  
  componentDidMount() {
    super.bindEvents();

    this.fetchInitialData()
      .then(() => this.setState({ changed: false }));
    
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

    setInterval(() => {
      const oldTimeoutMinutes = cloneDeep(this.state.timeoutMinutes);
      const timeoutMinutes = cloneDeep(this.state.timeoutMinutes);
      for (let i = 0; i < timeoutMinutes.length; i++) {
        if (timeoutMinutes[i] === 9999) {
          continue;
        }
        timeoutMinutes[i] -= 1;
        if (timeoutMinutes[i] < 0) {
          timeoutMinutes[i] = 0;
        }
      }

      if (!isEqual(oldTimeoutMinutes, timeoutMinutes)) {
        this.setState({ timeoutMinutes });
        localStorage.setItem("timeoutMinutes", JSON.stringify(timeoutMinutes));
        console.log(timeoutMinutes);
      }
    }, 60_000);
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
    await this.fetchLastModifiedSnapshot({ fallback: this.getTestSpapshot() });
  }

  getTestSpapshot() {
    return require("./snapshot.json");
  }

  packSave() {
    const {
      dailyRate,
      limitUnprofitableDeals,
      allowedNumberOfUnprofitableDeals,
      data,
      currentRowIndex,
      customTools,
      readyWorkTasksCheckTime,
      notes,
      lockTimeoutMinutes
    } = this.state;

    const json = {
      static: {
        dailyRate,
        limitUnprofitableDeals,
        allowedNumberOfUnprofitableDeals,
        data,
        currentRowIndex,
        customTools,
        readyWorkTasksCheckTime,
        notes,
        lockTimeoutMinutes
      }
    };

    const snapshot = {
      name: this.getTitle(),
      static: JSON.stringify(json.static)
    };
    
    console.log("Packed save:", json);
    return json;
  }
  
  parseSnapshot = parsedSnapshot => {
    const initialState = cloneDeep(this.initialState);

    const technologyBCProps = [
      {
        incorrect: "Удаленное видение",
        correct: "Удаленное Видение (НИ Мастер)"
      },
      {
        incorrect: "Физическая активность: приседание, отжимание, биг",
        correct: "Физическая активность: приседания, отжимания, бег"
      }
    ];

    const practiceBCProps = [
      {
        incorrect: "Фиксировать сделки в скриншотах",
        correct: "Фиксировать сделки на скриншотах"
      },
      {
        incorrect: "Выделять ключевые поведенченские паттерны и модели",
        correct: "Выделять ключевые поведенческие паттерны и модели"
      },
      {
        incorrect: "Время между сделками 30 минут",
        correct: "Время между сделками: 30 минут"
      },
      {
        incorrect: "Время между сделками 1 час",
        correct: "Время между сделками: 1 час"
      },
      {
        incorrect: "Время между сделками. Четко по сессиям",
        correct: "Время между сделками: четко по сессиям"
      },
      {
        incorrect: ["Делать расчёты ФАНИ", "Делать расчёты в ФАНИ"],
        correct: "Делать более детальные расчёты в ФАНИ"
      },
      {
        incorrect: "Удержание напряжения желания торговать",
        correct: "Удержание напряжения от желания торговать"
      },
      {
        incorrect: "Удержание напряжения желания наблюдать за сделкой",
        correct: "Удержание напряжения от желания наблюдать за сделкой"
      }
    ];

    function applyFallbackProperties(object, fallbackProperties) {
      Object.keys(object).forEach(taskName => {
        const group = fallbackProperties.find((group) => {
          // Внутри incorrect лежит массив строк
          if (typeof group.incorrect == "object") {
            return group.incorrect.some((name) => name === taskName);
          }
          return taskName == group.incorrect;
        });
        if (group) {
          const value = object[taskName];
          delete object[taskName];
          object[group.correct] = value;
        }
      });
      return object;
    }

    let data = merge(cloneDeep(initialState.data), parsedSnapshot.data)
      .map(/** @param {dayTemplate} day */ day => {
        day = merge(cloneDeep(dayTemplate), day);

        let { practiceWorkTasks, readyWorkTasks } = day;
        practiceWorkTasks = merge(cloneDeep(dayTemplate.practiceWorkTasks), practiceWorkTasks);

        // practiceWorkTasks
        day.practiceWorkTasks = applyFallbackProperties(practiceWorkTasks, practiceBCProps);

        // readyWorkTasks
        day.readyWorkTasks = applyFallbackProperties(readyWorkTasks, practiceBCProps);

        // Технологии
        let { technology } = day;
        if (technology.amy) {
          technology["ЭМИ"] = technology.amy;
          delete technology.amy;
        }
        if (technology.tmo) {
          technology["ТМО"] = technology.tmo;
          delete technology.tmo;
        }
        if (technology.recapitulation) {
          technology["Перепросмотр"] = technology.recapitulation;
          delete technology.recapitulation;
        }
        if (technology.archetypesWork) {
          technology["Работа с архетипами"] = technology.archetypesWork;
          delete technology.archetypesWork;
        }

        technology = applyFallbackProperties(technology, technologyBCProps);
        technology = merge(cloneDeep(dayTemplate.technology), technology);
        day.technology = technology;

        // Сделки
        for (let deal of day.deals) {
          // Старая версия, где был массив с null, true и false
          if (typeOf(deal.emotionalStates.positive) == "array") {
            const positiveEmotionalStatesLabels = [
              "Спокойствие",
              "Собранность",
              "Смелость",
              "Уверенность"
            ];

            const positiveEmoStates = cloneDeep(deal.emotionalStates.positive);

            const fixedPositiveEmoStates = {};
            for (let i = 0; i < positiveEmoStates.length; i++) {
              if (positiveEmoStates[i]) {
                fixedPositiveEmoStates[positiveEmotionalStatesLabels[i]] = positiveEmoStates[i];
              }
            }
            deal.emotionalStates.positive = merge(cloneDeep(dealTemplate.emotionalStates.positive), fixedPositiveEmoStates);

            const negativeEmotionalStatesLabels = [
              "Жалость",
              "Жадность",
              "Эго (я прав)",
              "Эйфория",
              "Вина",
              "Обида",
              "Гнев",
              "Апатия",
              "Стагнация",
              "Тревожность",
              "Перевозбуждение",
              "Гиперактивность",
              "Cтрах",
              "Ужас",
              "Отчаяние",
              "Выталкивающая сила рынка"
            ];

            const negativeEmoStates = cloneDeep(deal.emotionalStates.negative);

            const fixedNegativeEmoStates = {};
            for (let i = 0; i < negativeEmoStates.length; i++) {
              if (negativeEmoStates[i]) {
                fixedNegativeEmoStates[negativeEmotionalStatesLabels[i - 4]] = negativeEmoStates[i];
              }
            }
            deal.emotionalStates.negative = merge(cloneDeep(dealTemplate.emotionalStates.negative), fixedNegativeEmoStates);

            const positiveMotives = [
              "Видение рынка",
              "Отработка навыка входа",
              "Отработка навыка выхода",
              "Отработка пребывания в сделке",
              "Отработка среднесрочного анализа",
              "Создание торгового алгоритма"
            ];

            const positiveMotive = cloneDeep(deal.motives.positive);

            const fixedPositiveMotives = {};
            for (let i = 0; i < positiveMotive.length; i++) {
              if (positiveMotive[i]) {
                fixedPositiveMotives[positiveMotives[i]] = positiveMotive[i];
              }
            }
            deal.motives.positive = merge(cloneDeep(dealTemplate.motives.positive), fixedPositiveMotives);

            const negativeMotives = [
              "Скука",
              "Азарт",
              "Желание торговать",
              "Спешка и суета"
            ];

            const negativeMotive = cloneDeep(deal.motives.negative);

            const fixedNegativeMotives = {};
            for (let i = 0; i < negativeMotive.length; i++) {
              if (negativeMotive[i]) {
                fixedNegativeMotives[negativeMotives[i - 6]] = negativeMotive[i];
              }
            }
            deal.motives.negative = merge(cloneDeep(dealTemplate.motives.negative), fixedNegativeMotives);
          }
        }

        return day;
      });

    let readyWorkTasksCheckTime = parsedSnapshot.readyWorkTasksCheckTime ?? initialState.readyWorkTasksCheckTime;
    let tasks = parseTasks(data);
    delete tasks.count;
    Object.keys(tasks).forEach(taskName => {
      if (tasks[taskName].done === tasks[taskName].checked && !readyWorkTasksCheckTime[taskName]) {
        readyWorkTasksCheckTime[taskName] = Number(new Date());
      }
    });
    // Обратная совместимость свойств
    readyWorkTasksCheckTime = applyFallbackProperties(readyWorkTasksCheckTime, practiceBCProps);

    return {
      dailyRate:                        parsedSnapshot.dailyRate                        ?? initialState.dailyRate,
      limitUnprofitableDeals:           parsedSnapshot.limitUnprofitableDeals           ?? initialState.limitUnprofitableDeals,
      allowedNumberOfUnprofitableDeals: parsedSnapshot.allowedNumberOfUnprofitableDeals ?? initialState.allowedNumberOfUnprofitableDeals,
      data,
      readyWorkTasksCheckTime,
      notes:                            parsedSnapshot.notes                            ?? initialState.notes,
      lockTimeoutMinutes:               parsedSnapshot.lockTimeoutMinutes               ?? initialState.lockTimeoutMinutes,
      currentRowIndex:                  parsedSnapshot.currentRowIndex                  ?? initialState.currentRowIndex,
      // TODO: у инструмента не может быть ГО <= 0, по идее надо удалять такие инструменты
      customTools:                     (parsedSnapshot.customTools || []).map(tool => Tool.fromObject(tool))
    };
  };

  /** @param {import('../../../common/utils/extract-snapshot').Snapshot} snapshot */
  async extractSnapshot(snapshot) {
    try {
      await super.extractSnapshot(snapshot, this.parseSnapshot);

      // Считываем время начала блокировок из localStorage
      timeoutStartTime = JSON.parse(localStorage.getItem("timeoutStartTime"));

      // Считываем кол-во минут до конца разблокировки сделок из localStorage
      let timeoutMinutes = JSON.parse(localStorage.getItem("timeoutMinutes"));
      if (typeOf(timeoutMinutes) !== "array") {
        timeoutMinutes = [];
      }

      // Тайм-аут мог закончиться, перерасчитываем timeoutMinutes
      for (let i = 0; i < timeoutMinutes.length; i++) {
        if (timeoutStartTime[i] == null) {
          continue;
        }
        let msElapsed = Number(new Date()) - timeoutStartTime[i];
        if (msElapsed < 0) {
          msElapsed = 0;
        }
        
        const minElapsed = Math.floor(msElapsed / 1_000 / 60);

        const prevValue = timeoutMinutes[i];
        timeoutMinutes[i] -= minElapsed;
        if (timeoutMinutes[i] < 0) {
          timeoutMinutes[i] = 0;
        }
      }

      await this.setStateAsync({ timeoutMinutes });
    }
    catch (error) {
      message.error(error);
    }
  }

  /** @type {BaseComponent.prototype.save} */
  async save(name) {
    this.lastSavedState = cloneDeep(this.state);
    return super.save(name);
  }

  /** @type {BaseComponent.prototype.update} */
  async update(name) {
    this.lastSavedState = cloneDeep(this.state);
    return super.update(name);
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
                        const hasChanged = 
                          (this.lastSavedState && !isEqual(data[currentRowIndex], this.lastSavedState.data[currentRowIndex])) ||
                          !isEqual(this.state.notes, this.lastSavedState.notes);

                        return (
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
                                    Точечный<br/>самоанализ
                                  </span>
                                </div>
                              </div>

                              <div className="trade-slider--main-page">
                                <Button
                                  className={clsx("main-button", step === -1 && "active")}
                                  onClick={e => {
                                    previousStep = step;
                                    this.setState({ step: -1, extraStep: false });
                                  }}
                                >
                                  Личный дневник
                                </Button>

                                <Button 
                                  className="main-button"
                                  onClick={async e => {
                                    if (!dev && hasChanged) {
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
                                {step == -1 && <Diary />}

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

                                {step == 2 && <SecondStep />}

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
                                {(step == -1 || step > 1) && (
                                  <Button
                                    className="trade-log-button trade-log-button--slider"
                                    onClick={e => {
                                      if (step === -1) {
                                        return this.setState({ step: previousStep });
                                      }
                                      this.setState(prevState => ({ step: prevState.step - 1, extraStep: false }));
                                    }}
                                    disabled={step == 1}
                                  >
                                    Назад
                                  </Button>
                                )}

                                {step > 0 && step < 4 && (
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

                                {(step == -1 || step >= 4) && (
                                  hasChanged
                                    ? (
                                      <Button
                                        className={clsx(
                                          "trade-log-button",
                                          "trade-log-button--slider",
                                          "trade-log-button--filled",
                                          this.state.changed && "header__changed-button"
                                        )}
                                        onClick={e => {
                                          this.lastSavedState = cloneDeep(this.state);
                                          const { id } = this.state;
                                          if (id == null ) {
                                            dialogAPI.open(saveDialogID, e.target);
                                          }
                                          else {
                                            this.update(this.getTitle());
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
