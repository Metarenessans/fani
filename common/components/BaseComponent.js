import React from "react";
import { message } from "antd";
import { cloneDeep } from "lodash";

import fetch         from "../api/fetch";
import fetchSaveById from "../api/fetch/fetch-save-by-id";
import { fetchInvestorInfo } from "../api/fetch/investor-info/fetch-investor-info";

import params          from "../utils/params";
import extractSnapshot from "../utils/extract-snapshot";

/** @type {React.Context<BaseComponent>} */
export const Context = React.createContext();

/** @typedef {import("../utils/extract-snapshot").SnapshotResponse} SnapshotResponse */

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

      // TODO: можно обойтись только одним флагом 

      saved: false,

      changed: false
    };

    this.state = {
      ...cloneDeep(this.initialState),

      /**
       * Список сохранений
       * 
       * @type {{ id: number, name: string }[]}
       */
      saves: [],

      /**
       * Торговые инструменты
       * 
       * @type {import("../tools").Tool[]}
       */
      tools: [],

      /**
       * Влияет на сортировку Select'ов с инструментами
       */
      searchVal: ""
    };

    /** @type {fetchSaveById & (id: number) => Promise<SnapshotResponse>} */
    this.fetchSaveById = fetchSaveById.bind(this, this.pageName);
  
    /** @type {fetchInvestorInfo} */
    this.fetchInvestorInfo = fetchInvestorInfo.bind(this);
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

  // TODO: fetchTools

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
   * Делает GET запрос на `get<pageName>Snapshots` с помощью {@link fetch},
   * где `<pageName>` - это `this.pageName`
   * 
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
   * Делает GET запрос на `getLastModified<pageName>Snapshot` с помощью {@link fetch},
   * где `<pageName>` - это `this.pageName`
   *
   * Пример: если `this.pageName` равен `Mts`,
   * то запрос уйдет на https://fani144.ru/local/php_interface/s1/ajax/?method=getLastModifiedMtsSnapshot
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
    if (pure) {
      await this.setStateAsync({ loading: false });
    }
    else {
      const fallback = options?.fallback;
      if (dev && fallback) {
        response = fallback;
        const { data } = response;
        const { id, name, dateCreate } = data;
  
        const saves = [{ id, name, dateCreate }];
        await this.setStateAsync({ saves });
      }

      if (!response.error && response.data?.name) {
        await this.extractSnapshot(response.data);
      }
    }
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

    return this.setStateAsync({ changed: false });
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