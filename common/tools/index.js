import { round } from "lodash";
import readyTools      from "../adr.json";
import readyToolsNew   from "../adr-new.json";
import readyToolsMarch from "../adr-march.json";
import readyToolsApril from "../adr-april.json";

import fraction        from "../utils/fraction";
import magnetToClosest from "../utils/magnet-to-closest";

const response = require("./row-tools.json");
const responseObject = response[0];

const filterJSONToolsFn = tool => tool.adr && tool.adrWeek && tool.adrMonth;

const correctJSONToolFn = tool => {
  tool.code.replace(".US", "");
  return tool;
};

const filteredReadyTools      = readyTools.filter(filterJSONToolsFn).map(correctJSONToolFn);
const filteredReadyToolsNew   = readyToolsNew.filter(filterJSONToolsFn).map(correctJSONToolFn);
const filteredReadyToolsMarch = readyToolsMarch.filter(filterJSONToolsFn).map(correctJSONToolFn);
const filteredReadyToolsApril = readyToolsApril.filter(filterJSONToolsFn).map(correctJSONToolFn);

const template = {
  ref:             {},
  fullName:        "",
  shortName:       "",
  code:            "",
  stepPrice:       1,
  priceStep:       1,
  averageProgress: 1,
  guarantee:       1,
  currentPrice:    1,
  volume:          1,
  lotSize:         1,
  dollarRate:      0,
  adrDay:          1,
  adrWeek:         1,
  adrMonth:        1,
  points: [
    [70,  70],
    [156, 55],
    [267, 41],
    [423, 27],
    [692, 13],
    [960,  7]
  ]
};

/**
 * Пытается преобразовать `value` к числу, и если результат равен `NaN`, возвращается `fallback`
 * 
 * @argument {} value
 * @argument {fallback} number
 */
const parseNumber = (value, fallback = 0) => {
  let result = Number(value);
  if (isNaN(result)) {
    result = fallback;
  }
  return result;
};

/**
 * Парсит объект-инструмент из ответа с сервера
 * и возвращает объект, который готов к конвертации в экземпляр класса {@link Tool}
 * 
 * @argument {responseObject} tool
 */
const parseTool = tool => {
  const ref = { ...tool };

  let averageProgress = parseNumber(tool.averageProgress);
  let currentPrice    = parseNumber(tool.price || tool.currentPrice);
  let stepPrice       = parseNumber(tool.stepPrice);
  let priceStep       = parseNumber(tool.priceStep);
  let dollarRate      = parseNumber(tool.dollarRate);
  let lotSize         = parseNumber(tool.lotVolume || tool.lotSize);
  let volume          = parseNumber(tool.value);
  let volumeAverage   = parseNumber(tool.volumeAverage);

  let firstTradeDate  = parseNumber(tool.firstTradeDate);
  let lastTradeDate   = parseNumber(tool.lastTradeDate);

  let adrDay;
  let adrWeek;
  let adrMonth;

  // Россия
  if (dollarRate == 1) {
    stepPrice = priceStep * lotSize;

    // Оставляем такое же кол-во знаков после запятой, что и в priceStep
    const match = String(priceStep).match(/\.\d+/);
    if (match) {
      stepPrice = round(stepPrice, match[0].length - 1);
    }
  }
  // Фьючерсы
  else if (dollarRate == 0) {}
  // Америка
  else {
    priceStep = 0.01;
    stepPrice = dollarRate * priceStep * lotSize;

    // Оставляем такое же кол-во знаков после запятой, что и в priceStep
    const match = String(priceStep).match(/\.\d+/);
    if (match) {
      stepPrice = round(stepPrice, match[0].length - 1);
    }
  }

  let found = false;
  
  /**
   * @param {readyTools} readyTools
   * @param {boolean} [strict=false] Если включен, то коды фьючерсов будут сравниваться не по первым двум символам, а на предмет строгого равенства
   */
  const check = (readyTools, strict = false) => {
    for (let readyTool of readyTools) {
      const lastCompareIndex = strict
        ? undefined
        : (readyTool.isFutures && dollarRate == 0) 
          ? 2 
          : undefined;
      const toolCode = tool.code.slice(0, lastCompareIndex);
      const readyToolCode = readyTool.code.slice(0, lastCompareIndex);

      if (toolCode == readyToolCode) {

        if (readyTool.adr) {
          adrDay   =  currentPrice * readyTool.adr      / 100;
        }
        if (readyTool.adrWeek) {
          adrWeek  =  currentPrice * readyTool.adrWeek  / 100;
        }
        if (readyTool.adrMonth) {
          adrMonth =  currentPrice * readyTool.adrMonth / 100;
        }
  
        found = true;
        break;
      }
    }
  };

  !found && check(filteredReadyToolsApril, true);
  !found && check(filteredReadyToolsMarch, true);
  !found && check(filteredReadyToolsNew);
  !found && check(filteredReadyTools);

  // Если инструмент не сметчился ни с одним из заготовленным файлов
  if (!found) {
    const blackSwan = currentPrice * 0.2;
    adrDay = blackSwan / 10;

    adrDay   = round(adrDay, 4);
    adrWeek  = round(adrDay * 1.25, 4);
    adrMonth = round(adrDay * 1.75, 4);
  }

  const precision = fraction(priceStep).length;
  // Если в шаге цены есть дробная часть, то округляем АДР до такого же кол-ва знаков после запятой
  if (precision > 0) {
    adrDay = round(adrDay, precision);
    adrWeek = round(adrWeek, precision);
    adrMonth = round(adrMonth, precision);
  }
  else {
    adrDay = magnetToClosest(adrDay, priceStep);
    adrWeek = magnetToClosest(adrWeek, priceStep);
    adrMonth = magnetToClosest(adrMonth, priceStep);
  }

  const obj = {
    ...template,

    ref,
    code:      tool.code,
    fullName:  tool.fullName  || tool.name,
    shortName: tool.shortName,
    stepPrice,
    priceStep,
    averageProgress,
    currentPrice,
    lotSize,
    dollarRate,
    volume,
    volumeAverage,

    firstTradeDate,
    lastTradeDate,

    adrDay,
    adrWeek,
    adrMonth,

    matched: found
  };

  if (obj.code != obj.ref.code) {
    console.error(obj);
  }

  return obj;
};

class Tool {

  /**
   * Сырой инструмент, каким он пришел с сервера
   * 
   * @type {template}
   */
  ref;

  /**
   * Цена шага
   * 
   * @type {number}
   */
  stepPrice;

  /**
   * Шаг цены
   * 
   * @type {number}
   */
  priceStep;

  /**
   * TODO: добавить описание
   * 
   * @type {number}
   */
  averageProgress;

  /**
   * ГО (гарантийное обеспечение)
   * 
   * @type {number}
   */
  guarantee;

  /**
   * Текущая цена
   * 
   * @type {number}
   */
  currentPrice;
  
  /** @type {number} */
  volume;

  /**
   * Размер лота
   * 
   * @type {number}
   */
  lotSize;

  /** @type {number} */
  dollarRate;

  /** 
   * Дневной АДР
   * 
   * @type {number}
   */
  adrDay;

  /**
   * Недельный АДР
   *
   * @type {number}
   */
  adrWeek;

  /**
   * Месячный АДР
   *
   * @type {number}
   */
  adrMonth;

  constructor(base = {}) {
    for (let prop in template) {
      this[prop] = template[prop];
    }
    for (let prop in base) {
      this[prop] = base[prop];
    }
  }

  /**
   * Обновляет ГО инструмента
   *
   * @argument {import("../api/fetch/investor-info/investor-info").InvestorInfo} investorInfo
   * @argument {{ useDefault: boolean }} [options]
   * @returns {Tool}
   */
  update(investorInfo, options) {
    options = options || {};
    const useDefault = options.useDefault || false;

    const { ref } = this;
    if (ref && Object.keys(ref).length) {
      let guarantee = ref.guarantee || ref.guaranteeValue;

      if (typeof guarantee == "object") {
        let guaranteeExtracted = ref.guarantee["default"];
        if (investorInfo) {
          const { status, type } = investorInfo;
          if (!useDefault && status && type) {
            if (ref.guarantee[status] && ref.guarantee[status][type]) {
              guaranteeExtracted = ref.guarantee[status][type];
            }
          }
        }

        guarantee = parseNumber(guaranteeExtracted);
      }
      else {
        guarantee = parseNumber(guarantee);
      }

      guarantee = round(guarantee, 2);

      if (isNaN(guarantee)) {
        guarantee = 0;
        console.warn("ГО неправильно обновилось", ref.code, ref.guarantee, investorInfo);
      }
      
      if (typeof guarantee == "number") {
        this.guarantee = guarantee;
      }
      else {
        this.guarantee = -1;
        console.warn("ГО неправильно обновилось", ref.code, ref.guarantee, investorInfo);
      }
    }

    return this;
  }

  set name(value) {
    this.fullName = value;
  }

  get name() {
    if (this.fullName) {
      return this.fullName.replace("Фьючерсный контракт ", "");
    }
    else if (this.shortName) {
      return this.shortName;
    }
    else return this.code;
  }

  get isFutures() {
    return this.dollarRate == 0;
  }

  get region() {
    return this.dollarRate != 1 ? "US" : "RU";
  }
  
  getFullName() {
    if (this.fullName) {
      return this.fullName;
    }
    else if (this.shortName) {
      return this.shortName;
    }
    else return this.code;
  }

  getSortProperty() {
    if (this.shortName) {
      return this.shortName;
    }
    else if (this.code) {
      return this.code;
    }
    else {
      return this.name;
    }
  }

  toString(options = { long: true }) {
    let str = String(this.code);
    if (!this.shortName && this.fullName && options.long) {
      return this.fullName + (str ? ` (${str})` : "");
    }
    else if (this.shortName) {
      return this.shortName + (str ? ` (${str})` : "");
    }

    return str;
  }

  /**
   * Парсит объект и конвертирует его в экземпляр класса {@link Tool}
   * 
   * @argument {{}|responseObject} object
   * @argument {{}} options
   */
  static fromObject(object, options) {
    const investorInfo = options?.investorInfo;
    const tool = new Tool(parseTool(object, options)).update(investorInfo, options);
    return tool;
  }
}

class Tools {

  /**
   * Парсит ответ с сервера (ожидается массив из объектов)
   * и на выходе отдает массив экземпляров класса {@link Tool}
   * 
   * @param {{}[]} tools
   * @param {{}} options
   * @returns {Tool[]}
   */
  static parse(tools, options = {}) {
    if (!tools || tools.length === 0) {
      throw new Error("No tools found!");
    }

    const shouldBeSkipped = tool => {
      // dollarRate == 0 or doesn't exist
      if (!tool.dollarRate) {
        if (tool.price == 0 || !tool.volume) {
          return true;
        }

        // Истек срок действия
        if (Number(tool.updateDate) > Number(tool.lastTradeDate)) {
          return true;
        }
      }

      return false;
    };

    let investorInfo = options.investorInfo || {};
    
    let parsedTools = [];
    let unmatchedTools = [];
    for (const rowData of tools) {
      if (shouldBeSkipped(rowData)) {
        continue;
      }

      // let tool = new Tool(merge(cloneDeep(template), parseTool(rowData, options)));
      let tool = new Tool(parseTool(rowData, options));
      if (!tool.matched) {
        unmatchedTools.push(tool);
      }
      tool = tool.update(investorInfo, options);

      if (tool.code != tool.ref.code) {
        console.warn("Something's wrong with tool's code:", tool);
      }

      parsedTools.push(tool);
    }

    if (unmatchedTools.length) {
      // console.warn("Не сметчились", unmatchedTools.map(tool => tool + ""));
    }

    for (let tool of parsedTools) {
      if (tool.code != tool.ref.code) {
        console.warn("Something's wrong with tool's code:", tool);
      }
    }

    return parsedTools;
  }

  /**
   * Сортирует массив экземпляров класса {@link Tool} в алфавитном порядке 
   *
   * @param {Tool[]} tools
   * @returns {Tool[]}
   */
  static sort(tools) {
    let c = a => 10 > a ? -1000 + +a : a.charCodeAt(0);

    return tools
      // Сортировка по алфавиту
      .sort((a, b) => {
        const l = String(a.toString()).toLowerCase().replace(/["().]+/g, "").trim();
        const r = String(b.toString()).toLowerCase().replace(/["().]+/g, "").trim();

        let res = 0;
        for (let i = 0; i < Math.min(l.length, r.length); i++) {
          if (l[i] == "-" || r[i] == "-") {
            return -1;
          }

          res = c(l[i]) - c(r[i]);

          if (res != 0) {
            break;
          }
        }
        return res;
      })
      // Сортировка фьючерсов по дате
      .sort((a, b) => {

        const convert = str => {
          let code;
          let number;
          let found = /-(\d+)\.(\d+)/g.exec(str);
          if (found) {
            number = found[2] + "." + found[1];
            code = str.slice(0, found.index);
          }
          else {
            code = a;
          }

          return [code, number];
        };

        const [codeA, numberA] = convert(a.toString());
        const [codeB, numberB] = convert(b.toString());
        if (codeA == codeB) {
          return (Math.trunc(numberA) - Math.trunc(numberB)) || (fraction(numberA) - fraction(numberB));
        }
      });
  }

  /**
   * Возвращает массив инструментов (экземпляров класса {@link Tool})
   * на основе заготовленного урезанного ответа с сервера
   * 
   * @returns {Tool[]}
   */
  static createArray() {
    return response.map(rowTool => Tool.fromObject(rowTool));
  }

  /**
   * Возвращает индекс искомого инструмента
   *
   * @argument {string} search Код инструмента, индекс которого нужно найти
   * @argument {Tool[]} tools Инструменты, среди которых идет поиск
   * @returns {number}
   */
  static getIndexByCode(search, tools) {
    if (!search || !tools.length) {
      return 0;
    }

    const alike = [];

    let index = -1;

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];

      if (
        tool.getSortProperty() === search ||
        tool.toString() === search ||
        tool.code === search
      ) {
        return i;
      }

      // Текущий инструмент - фьючерс
      if (tool.dollarRate == 0) {
        if (tool.code.slice(0, 2).toLowerCase() == search.slice(0, 2).toLowerCase()) {
          alike.push(tool);
        }
      }

      // Если в id есть месяц и год, то можно начать искать ближайший
      const regexp = /\d{1,2}\.\d{1,2}/;
      const found = regexp.exec(search);
      if (found) {
        // Находим все инструменты с одинаковым кодом
        let alike = [...tools].filter(tool =>
          tool.getSortProperty().slice(0, found.index) == search.slice(0, found.index)
        );

        const sorted = this.sort(alike.map(t => t.getSortProperty()).concat(search));
        index = tools.indexOf(alike[0]) + sorted.indexOf(sorted.find(n => n == search));
      }
    }

    if (index == -1 && alike.length) {
      const toolsSorted = this.sort(alike);
      const s = toolsSorted[0].toString();
      return this.getIndexByCode(s, tools);
    }

    return Math.max(index, 0);
  }

  /**
   * @argument {string} code
   * @argument {Tool[]} tools
   * @returns {number}
   * @deprecated Use {@link getIndexByCode} instead
   */
  static getToolIndexByCode(tools = [], search = "") {
    if (!search || !tools.length) {
      return 0;
    }

    const alike = [];

    let index = -1;

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];

      if (
        tool.getSortProperty() === search ||
        tool.toString()        === search ||
        tool.code              === search
      ) {
        return i;
      }

      // Текущий инструмент - фьючерс
      if (tool.dollarRate == 0) {
        if (tool.code.slice(0, 2).toLowerCase() == search.slice(0, 2).toLowerCase()) {
          alike.push(tool);
        }
      }

      // Если в id есть месяц и год, то можно начать искать ближайший
      const regexp = /\d{1,2}\.\d{1,2}/;
      const found = regexp.exec(search);
      if (found) {
        // Находим все инструменты с одинаковым кодом
        let alike = [...tools].filter(tool =>
          tool.getSortProperty().slice(0, found.index) == search.slice(0, found.index)
        );

        const sorted = this.sort(alike.map(t => t.getSortProperty()).concat(search));
        index = tools.indexOf(alike[0]) + sorted.indexOf(sorted.find(n => n == search));
      }
    }

    if (index == -1 && alike.length) {
      const toolsSorted = this.sort(alike);
      const s = toolsSorted[0].toString();
      return this.getIndexByCode(s, tools);
    }

    return Math.max(index, 0);
  }
}

export { Tools, Tool, template, parseTool };