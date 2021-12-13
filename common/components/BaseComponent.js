import React from "react";
import { message } from "antd";
import { cloneDeep } from "lodash";

import fetch         from "../api/fetch";
import fetchSaveById from "../api/fetch/fetch-save-by-id";
import { fetchInvestorInfo } from "../api/fetch/investor-info/fetch-investor-info";
import { applyInvestorInfo } from "../api/fetch/investor-info/apply-investor-info";

import params          from "../utils/params";
import extractSnapshot from "../utils/extract-snapshot";
import { Tools, Tool } from "../tools";

/** @type {React.Context<BaseComponent>} */
export const Context = React.createContext();

/** @typedef {import("../utils/extract-snapshot").SnapshotResponse} SnapshotResponse */
/** @typedef {import("../api/fetch/investor-info/investor-info").InvestorInfo} InvestorInfo */
/** @typedef {import("../api/fetch/investor-info/investor-info-response").InvestorInfoResponse} InvestorInfoResponse */

// TODO: добавить флаг в стейте, который бы отвечал за загрузку конкретно селекта с сейвами
export default class BaseComponent extends React.Component {

  constructor(props) {
    super(props);

    /**
     * Строковый идентификатор страницы (Например: `"Trademeter"|"Mts"|"Tor"...`)
     *
     * Подставляется в запросы на сервер
     *
     * @type {string|JSX.Element}
     */
    this.pageName = props.pageName;

    /**
     * Дефолтный заголовок страницы
     * 
     * Показывается в дефолтном сейве
     * 
     * @type {string}
     */
    this.deafultTitle = "Hello world!";

    this.initialState = {
      /** 
       * ID текущего сохранения
       * 
       * По умолчанию равен `null` (чистая страница)
       * 
       * @type {?number}
       */
      id: null,

      /**
       * Индекс текущего сохранения
       * 
       * @type {number}
       */
      currentSaveIndex: 0,

      /**
       * Равен `true`, если запрос на получение сохранения был отправлен, но ответ еще не получен
       * 
       * При получении ответа/ошибке значение становится равным `false`
       * 
       * @type {boolean}
       */
      loading: false,

      /**
       * Равен `true`, если запрос на получение инструментов был отправлен, но ответ еще не получен
       *
       * При получении ответа/ошибке значение становится равным `false`
       *
       * @type {boolean}
       */
      toolsLoading: false,

      /**
       * Флаг дизейбла селекта с инструментами
       * 
       * Используем, когда нужно запретить пользователю менять инструмент,
       * но не хотим активировать прелоадеры, связанные с `toolsLoading`
       * 
       * @type {boolean}
       */
      toolSelectDisabled: false,

      /** Код текущего выбранного инструмента */
      currentToolCode: "SBER",

      // TODO: можно обойтись только одним флагом 

      saved: false,

      changed: false
    };

    this.state = {
      ...cloneDeep(this.initialState),

      /**
       * Профиль инвестора
       * 
       * @type {InvestorInfo}
       */
      investorInfo: {},

      /**
       * Список сохранений
       * 
       * @type {{ id: number, name: string }[]}
       */
      saves: [],

      /**
       * Торговые инструменты
       * 
       * @type {Tool[]}
       */
      tools: [],

      /**
       * Кастомные (созданные пользователем) торговые инструменты
       * 
       * @type {Tool[]}
       */
      customTools: [],

      /**
       * Ширина вьюпорта 
       * 
       * @type {number}
       */
      viewportWidth: 0,

      /**
       * Влияет на сортировку Select'ов с инструментами
       * 
       * TODO: удалить, когда полностью переедет в ToolSelect
       */
      searchVal: ""
    };

    /** @type {fetchSaveById & (id: number) => Promise<SnapshotResponse>} */
    this.fetchSaveById = fetchSaveById.bind(this, this.pageName);
  
    /** @type {fetchInvestorInfo} */
    this.fetchInvestorInfo = fetchInvestorInfo.bind(this);
    
    /** @type {applyInvestorInfo} */
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
  }

  onResize = e => {
    this.setState({ viewportWidth: window.innerWidth });
  };

  bindEvents() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }
  
  componentDidMount() {
    this.bindEvents();  
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  /** {@link BaseComponent.setState setState}, обернутый в {@link Promise} */
  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve));
  }
    
  extractSnapshot(snapshot, parseFn) {
    return extractSnapshot.call(this, snapshot, parseFn);
  }

  /** Пушит `this.initialState` в стейт */
  reset() {
    return this.setStateAsync(cloneDeep(this.initialState));
  }

  /**
   * Возвращает название текущего выбранного сохранения.
   * 
   * В дефолтном сохранении ("не выбрано") возвращает `this.deafultTitle`
   * 
   * @returns {string}
   */
  getTitle() {
    const { saves, currentSaveIndex } = this.state;
    return saves?.[currentSaveIndex - 1]?.name ?? this.deafultTitle;
  }

  /**
   * Возвращает список всех инстурментов (поулченые с бэка + кастомные)
   * 
   * @returns {Tool[]}
   */
  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  /**
   * Возвращает индекс выбранного инструмента
   * 
   * @returns {number}
   */
  getCurrentToolIndex() {
    const { currentToolCode } = this.state;
    return Tools.getToolIndexByCode(this.getTools(), currentToolCode);
  }

  /**
   * Возвращает текущий инструмент
   * 
   * @returns {Tool}
   */
  getCurrentTool() {
    return this.getTools()[this.getCurrentToolIndex()] || Tools.createArray()[0];
  }

  /**
   * Возвращает инструмент по коду
   * 
   * @param {string} code Код инструмента
   * @returns {Tool}
   */
  getToolByCode(code) {
    const tools = this.getTools();
    return tools[Tools.getIndexByCode(code, tools)] ?? Tools.createArray()[0];
  }

  /**
   * 1. Делает GET запрос на https://fani144.ru/local/php_interface/s1/ajax/?method=getInvestorInfo (смотри {@link fetchInvestorInfo})
   * 
   * 2. Распаковывает данные в стейт по ключу `investorInfo` (смотри {@link applyInvestorInfo})
   * 
   * @param {{ fallback: InvestorInfo }} options
   * @return {Promise<InvestorInfoResponse>}
   */
  async fetchInvestorInfo(options) {
    /** @type {InvestorInfoResponse} */
    let response;
    try {
      response = await fetchInvestorInfo.call(this);
      await this.applyInvestorInfo(response);
    }
    catch (error) {
      message.error(`Не удалось получить профиль инвестора: ${error}`);
    }
    finally {
      const { fallback } = options;
      if (dev && fallback) {
        await this.setStateAsync({ investorInfo: fallback });
      }
    }

    return response;
  }

  async prefetchFutures() {
    const { investorInfo } = this.state;
    try {
      const response = await fetch("getFutures");
      let tools = [];
      tools = Tools.parse(response.data, { investorInfo, useDefault: true });
      tools = Tools.sort(tools);
      return tools;
    }
    catch (error) {
      message.error(`Не удалось получить фьючерсы: ${error}`);
    }
  }

  async fetchFutures() {
    const { investorInfo } = this.state;
    await this.setStateAsync({ toolsLoading: true });
    try {
      const response = await fetch("getFutures");
      let tools = [];
      tools = Tools.parse(response.data, { investorInfo, useDefault: true });
      tools = Tools.sort(tools);
      await this.setStateAsync({ tools, toolsLoading: false });
      return tools;
    }
    catch (error) {
      message.error(`Не удалось получить фьючерсы: ${error}`);
    }
  }

  /**
   * Делает GET запросы на `getFutures` и `getTrademeterInfo` с помощью {@link fetch}
   * 
   * @returns {Promise<Tool[]>}
   */
  async fetchTools() {
    await this.setStateAsync({ toolsLoading: true });
    const tools = await this.prefetchTools();
    await this.setStateAsync({ toolsLoading: false, tools });
    return tools;
  }

  // TODO: Написать тесты
  // Должен возвращать фьючи и акции
  // Должен содержать в себе Apple, Сбер и BR
  async prefetchTools() {
    const { investorInfo } = this.state;
    let tools = [];
    const requests = [];
    for (let request of ["getFutures", "getTrademeterInfo"]) {
      requests.push(
        fetch(request)
          .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
          .then(parsedTools => tools.push(...parsedTools))
          .catch(error => message.error(`Не удалось получить инстурменты: ${error}`))
      );
    }

    await Promise.allSettled(requests);
    tools = Tools.sort(tools);
    this.prefetchedTools = tools;
    return tools;
  }

  /**
   * Получает конкретную акцию по коду и региону
   * 
   * Делает GET запрос на `getCompanyTrademeterInfo` с помощью {@link fetch}
   * 
   * Пример запроса: https://fani144.ru/local/php_interface/s1/ajax/?method=getCompanyTrademeterInfo&code=SBER&region=RU
   * 
   * @param {string} code Код акции
   * @param {"RU"|"EN"} region Регион акции
   * @returns {Promise}
   * 
   * TODO: переименовать во что-то более связанное с акциями
   */
  async fetchTool(code, region) {
    await this.setStateAsync({ toolsLoading: true });
    const response = await fetch("getCompanyTrademeterInfo", "GET", { code, region });
    const tool = Tool.fromObject(response.data);
    console.log(tool);

    const tools = cloneDeep(this.state.tools);
    // Обновляем инструмент в массиве, если он есть
    const index = tools.findIndex(tool => tool.code == code && tool.region == region);
    if (index == -1) {
      tools.push(tool);
    }
    else {
      tools[index] = tool;
    }
    return this.setStateAsync({ toolsLoading: false, tools });
  }

  /**
   * Делает GET запрос на `get<pageName>Snapshots` с помощью {@link fetch},
   * где `<pageName>` - это `this.pageName`
   * 
   * Пример: если `this.pageName` равен `Mts`,
   * то запрос уйдет на https://fani144.ru/local/php_interface/s1/ajax/?method=getMtsSnapshots
   * 
   * @returns {Promise}
   */
  async fetchSnapshots() {
    await this.setStateAsync({ loading: true });
    try {
      const response = await fetch(`get${this.pageName}Snapshots`);
      // Сортировка по дате обновления
      const saves = response.data.sort((l, r) => r.dateUpdate - l.dateUpdate);
      return this.setStateAsync({ saves, loading: false });
    }
    catch (error) {
      console.error("Не удалось получить сохранения:", error);
      !dev && message.error(error);
    }
  }

  /**
   * 1. Делает GET запрос на `getLastModified<pageName>Snapshot` с помощью {@link fetch},
   * где `<pageName>` - это `this.pageName` (пример запроса: https://fani144.ru/local/php_interface/s1/ajax/?method=getLastModifiedMtsSnapshot)
   * 
   * 2. Передает ответ в {@link BaseComponent.extractSnapshot}
   *
   * @param {object} options
   * @param {?SnapshotResponse} options.fallback Фейк ответ с сервера (работает только на локальной сборке)
   * @returns {Promise}
   */
  async fetchLastModifiedSnapshot(options) {
    await this.setStateAsync({ loading: true });

    /** @type {SnapshotResponse} */
    let response;
    try {
      response = await fetch(`getLastModified${this.pageName}Snapshot`);
    }
    catch (error) {
      console.error(error);
      !dev && message.error(`Не удалось получить последнее сохранение: ${error}`);
    }

    const pure = params.get("pure") === "true";
    if (!pure) { 
      const fallback = options?.fallback;
      if (dev && fallback) {
        response = fallback;
        const { data } = response;
        const { id, name, dateCreate } = data;
  
        const saves = [{ id, name, dateCreate }];
        await this.setStateAsync({ saves });
      }

      if (!response?.error && response?.data?.name) {
        await this.extractSnapshot(response.data);
      }
    }

    await this.setStateAsync({ loading: false });
  }

  /**
   * Делает POST-запрос с помощью кастомной функции-обертки {@link fetch}
   * 
   * @param {string} name Название сохранения
   * @returns {Promise<number>}
   */
  async save(name) {
    if (!name) {
      throw "Название сохранения не может быть пустым!";
    }

    const json = this.packSave();
    const data = {
      name,
      static: JSON.stringify(json.static)
    };

    try {
      const response = await fetch(`add${this.pageName}Snapshot`, "POST", data);
      console.log("Сохранено!", response);
      message.success("Сохранено!");

      const { id } = response;
      if (id) {
        await this.setStateAsync({ id });
        return id;
      }
      else {
        throw "Произошла незвестная ошибка! Пожалуйста, повторите действие позже";
      }
    }
    catch (error) {
      message.error(`Не удалось создать сохранение: ${error}`);
    }
  }

  /**
   * Делает POST-запрос с помощью кастомной функции-обертки {@link fetch}
   * 
   * Пример: если `name="Mts"`, то адрес запроса будет
   * https://fani144.ru/local/php_interface/s1/ajax?method=updateMtsSnapshot
   *
   * @param {string} name Название сохранения
   * @returns {Promise}
   */
  async update(name) {
    const { id } = this.state;
    if (!id) {
      throw "Не удалось обновить сохранение: 'id' равен " + id;
    }

    const json = this.packSave();
    const data = {
      id,
      name,
      static: JSON.stringify(json.static)
    };

    try {
      const response = await fetch(`update${this.pageName}Snapshot`, "POST", data);
      console.log("Сохранение обновлено!", response);
      message.success("Готово!");
    }
    catch (error) {
      message.error(`Не удалось обновить сохранение: ${error}`);
    }

    return this.setStateAsync({ saved: true, changed: false });
  }

  /**
   * Делает POST-запрос с помощью кастомной функции-обертки {@link fetch}
   *
   * @param {number} id ID сохранения, которое нужно удалить
   * @returns {Promise}
   */
  async delete(id) {
    await fetch(`delete${this.pageName}Snapshot`, "POST", { id });
    let {
      saves,
      saved,
      changed,
      currentSaveIndex
    } = this.state;

    // Находим индекс сохранения, которое нужно удалить
    const index = saves.indexOf(saves.find(save => save.id === id));
    // Удаляем элемент под этим индексом из массива
    saves.splice(index - 1, 1);
    // Предотвращаем кейс, где текущий индекс больше длины самого массива
    currentSaveIndex = Math.min(Math.max(this.state.currentSaveIndex, 1), saves.length);

    if (saves.length > 0) {
      id = saves[currentSaveIndex - 1].id;
      try {
        const response = await this.fetchSaveById(id);
        console.log("Сохранение удалено!", response);
        message.success("Удалено!");
        // TODO: удалить?
        response.data.id = id;
        await this.extractSnapshot(response.data);
        await this.setStateAsync({ id });
      }
      catch (error) {
        console.error(error);
        message.error(error);
      }
    }
    else {
      await this.reset();
      saved   = false;
      changed = false;
    }

    return this.setStateAsync({
      id,
      saves,
      saved,
      changed,
      currentSaveIndex
    });
  }
}