import { merge, round, cloneDeep } from "lodash";
import fractionLength from "./utils/fraction-length"
import readyTools      from "./adr.json"
import readyToolsNew   from "./adr-new.json"
import readyToolsMarch from "./adr-march.json"
import readyToolsApril from "./adr-april.json"

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
  dollarRate:      1,
  adrDay:          1,
  adrWeek:         1,
  adrMonth:        1,
  points: [
    [70,  70],
    [156, 55],
    [267, 41],
    [423, 27],
    [692, 13],
    [960,  7],
  ],
};

class Tool {

  constructor(toCopy = {}) {
    Object.keys(toCopy).forEach(key => {
      this[key] = toCopy[key];
    });
  }

  update(investorInfo) {
    const { ref } = this;
    if (ref && Object.keys(ref).length > 0) {
      let guarantee = ref.guarantee || ref.guaranteeValue;

      if (typeof guarantee == "object") {
        let guaranteeExtracted = ref.guarantee["default"];
        const { status, type } = investorInfo;
        if (status && type) {
          if (ref.guarantee[status] && ref.guarantee[status][type]) {
            guaranteeExtracted = ref.guarantee[status][type];
          }
        }

        guarantee = parseNumber(guaranteeExtracted);
      }
      else {
        guarantee = parseNumber(guarantee);
      }

      guarantee = round(guarantee, 2);

      if (typeof guarantee == "number") {
        this.guarantee = guarantee;
      }
      else {
        throw new Error("ГО не число");
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
      return this.shortName + (str ? `(${str})` : "");
    }

    return str;
  }
}

const fraction = number => {
  const match = /\.\d+$/g.exec(String(number));
  return match ? match[0].slice(1) : 0;
};

const parseNumber = (value, fallback = 0) => {
  let result = Number(value);
  if (isNaN(result)) {
    result = fallback;
  }
  return result;
};

const parseTool = tool => {
  let averageProgress = parseNumber(tool.averageProgress);
  let currentPrice    = parseNumber(tool.price || tool.currentPrice);
  let stepPrice       = parseNumber(tool.stepPrice);
  let priceStep       = parseNumber(tool.priceStep);
  let dollarRate      = parseNumber(tool.dollarRate);
  let lotSize         = parseNumber(tool.lotVolume || tool.lotSize);
  let volume          = parseNumber(tool.value);

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
      stepPrice = round(stepPrice, match[0].length - 1)
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
      stepPrice = round(stepPrice, match[0].length - 1)
    }
  }

  var found = false;
  
  /**
   *
   *
   * @param {*} readyTools
   * @param {boolean} [strict=false] Если включен, то коды фьючерсов будут сравниваться не по первым двум символам, а на предмет полного соответствия
   */
  const check = (readyTools, strict = false) => {
    for (let readyTool of readyTools) {
      const lastCompareIndex = strict
        ? undefined
        : (readyTool.isFutures && dollarRate == 0) 
          ? 2 
          : undefined;
      const toolCode = tool.code.toLowerCase().slice(0, lastCompareIndex);
      const readyToolCode = readyTool.code.replace(".US", "").toLowerCase().slice(0, lastCompareIndex);

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

  const filterFn = tool => {
    if (tool.adrWeek == "" && tool.adrMonth == "") {
      return false;
    }
    return true;
  };

  check(readyTools.filter(filterFn));
  check(readyToolsNew.filter(filterFn));
  check(readyToolsMarch.filter(filterFn), true);
  check(readyToolsApril.filter(filterFn), true);

  // Если инструмент не сметчился ни с одним из заготовленным файлов
  if (!found) {
    const blackSwan = currentPrice * 0.2;
    adrDay = blackSwan / 10;

    adrDay   = round(adrDay, 4);
    adrWeek  = round(adrDay * 1.25, 4);
    adrMonth = round(adrDay * 1.75, 4);
  }

  // Оставляем такое же кол-во знаков после запятой, что и в шаге цены
  let fraction = fractionLength(priceStep);
  if (adrDay) {
    adrDay   = +(adrDay).toFixed(fraction);
  }
  if (adrWeek) {
    adrWeek  = +(adrWeek).toFixed(fraction);
  }
  if (adrMonth) {
    adrMonth = +(adrMonth).toFixed(fraction);
  }

  return {
    ref:       tool,
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

    firstTradeDate,
    lastTradeDate,

    adrDay,
    adrWeek,
    adrMonth,

    matched: found
  };
};

const shouldBeSkipped = tool => {
  // dollarRate == 0 or doesn't exist
  if (!tool.dollarRate) {
    if (tool.price == 0 || !tool.volume) {
      return true;
    }

    // Истек срок действия
    if (Number(tool.updateDate) > Number(tool.lastTradeDate)) {
      return true
    }
  }

  return false;
};

class Tools {

  /**
   * @param {Array<{}>} tools
   */
  static parse(tools, options = {}) {
    if (!tools || tools.length === 0) {
      throw new Error("No tools found!");
    }

    let investorInfo = options.investorInfo || {};
    
    let parsedTools = [];
    let unmatchedTools = [];
    for (const rowData of tools) {
      if (shouldBeSkipped(rowData)) {
        continue;
      }

      let tool = new Tool(merge(cloneDeep(template), parseTool(rowData, options)));
      if (!tool.matched) {
        unmatchedTools.push(tool);
      }
      tool = tool.update(investorInfo);
      parsedTools.push(tool);
    }

    if (unmatchedTools.length) {
      // console.warn("Не сметчились", unmatchedTools.map(tool => tool + ""));
    }

    return parsedTools;
  }

  static sort(tools) {
    let c = a => 10 > a ? -1000 + +a : a.charCodeAt(0);

    // Alphabetical sort
    let sorted = tools.sort((a, b) => {
      const l = String(a.toString()).toLowerCase().replace(/[\"\(\)\.]+/g, "").trim();
      const r = String(b.toString()).toLowerCase().replace(/[\"\(\)\.]+/g, "").trim();

      let res = 0;
      for (let i = 0; i < Math.min(l.length,r.length); i++) {
        res = c(l[i]) - c(r[i]);
        if (res != 0) {
          break;
        }
      }
      return res;
    });

    // Sorting the numbers at the end
    sorted = sorted.sort((a, b) => {

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

        return [code, number]
      };

      const [codeA, numberA] = convert(a.toString());
      const [codeB, numberB] = convert(b.toString());
      if (codeA == codeB) {
        return (Math.trunc(numberA) - Math.trunc(numberB)) || (fraction(numberA) - fraction(numberB));
      }
    });

    return sorted;
  }

  static create(
    toolInfo = {
      ref:             {},
      fullName:        "Сбербанк России ПАО ао",
      shortName:       "",
      code:            "SBER",
      stepPrice:       0.1,
      priceStep:       0.01,
      averageProgress: 0,
      guarantee:       3109,
      currentPrice:    310.9,
      volume:          0,
      lotSize:         10,
      dollarRate:      1,
      adrDay:          5.38,
      adrWeek:         14.58,
      adrMonth:        26.89,
    },
    options = {}
  ) {
    const investorInfo = options.investorInfo || {};

    let tool = new Tool({ ...template, ...toolInfo });
    tool = tool.update(investorInfo);
    return tool;
  }

  static createArray() {
    return [
      this.create(),
      this.create({
        ref:             {},
        fullName:        "BR-3.21",
        shortName:       "",
        code:            "BRH1",
        stepPrice:       7.46955,
        priceStep:       0.01,
        averageProgress: 0,
        guarantee:       7407.8,
        currentPrice:    59.51,
        volume:          0,
        lotSize:         10,
        dollarRate:      0,
        adrDay:          1.65,
        adrWeek:         3.71,
        adrMonth:        8.27,
      }),
      this.create({
        ref:             {},
        fullName:        "Si-3.21",
        shortName:       "",
        code:            "SiH1",
        stepPrice:       1,
        priceStep:       1,
        averageProgress: 0,
        guarantee:       4783.9,
        currentPrice:    73525,
        volume:          0,
        lotSize:         1000,
        dollarRate:      0,
        adrDay:          831,
        adrWeek:         2198,
        adrMonth:        5882,
      }),
      this.create({
        ref:             {},
        fullName:        "3D Systems Corp.",
        shortName:       "",
        code:            "DDD",
        stepPrice:       .74,
        priceStep:       .01,
        averageProgress: 0,
        guarantee:       3528.7,
        currentPrice:    47.85,
        volume:          0,
        lotSize:         1,
        dollarRate:      73.745,
        adrDay:          3.03,
        adrWeek:         5.11,
        adrMonth:        16.51,
      }),
      this.create({
        ref:             {},
        fullName:        "Abbvie Inc",
        shortName:       "",
        code:            "ABBV",
        stepPrice:       0.74,
        priceStep:       0.01,
        averageProgress: 0,
        guarantee:       7974.4,
        currentPrice:    107.85,
        volume:          1,
        lotSize:         1,
        dollarRate:      73.94,
        adrDay:          2.39,
        adrWeek:         4.66,
        adrMonth:        11.9,
      }),
      this.create({
        ref:             {},
        fullName:        "Abiomed Inc.",
        shortName:       "",
        code:            "ABMD",
        stepPrice:       0.74,
        priceStep:       0.01,
        averageProgress: 0,
        guarantee:       21812.9,
        currentPrice:    296.11,
        volume:          1,
        lotSize:         1,
        dollarRate:      73.665,
        adrDay:          8.91,
        adrWeek:         23.51,
        adrMonth:        60.91,
      }),
      this.create({
        ref:             {},
        fullName:        "Apple Inc",
        shortName:       "",
        code:            "AAPL",
        stepPrice:       0.73,
        priceStep:       0.01,
        averageProgress: 0,
        guarantee:       8810.1,
        currentPrice:    119.98,
        volume:          1,
        lotSize:         1,
        dollarRate:      73.665,
        adrDay:          3,
        adrWeek:         8.45,
        adrMonth:        12.18,
      }),
      this.create({
        ref:             {},
        fullName:        "АЛРОСА ПАО ао",
        shortName:       "",
        code:            "ALRS",
        stepPrice:       0.1,
        priceStep:       0.01,
        averageProgress: 0,
        guarantee:       1280,
        currentPrice:    128,
        volume:          1,
        lotSize:         10,
        dollarRate:      1,
        adrDay:          2.75,
        adrWeek:         5.47,
        adrMonth:        10.59,
      }),
      this.create({
        ref:             {},
        fullName:        "ПАО Московская Биржа",
        shortName:       "",
        code:            "MOEX",
        stepPrice:       0.1,
        priceStep:       0.01,
        averageProgress: 0,
        guarantee:       1715.9,
        currentPrice:    171.59,
        volume:          1,
        lotSize:         10,
        dollarRate:      1,
        adrDay:          3.11,
        adrWeek:         7.67,
        adrMonth:        17.64,
      }),
    ]
  }

  static getToolIndexByCode(tools = [], search = "") {
    if (!search || !tools.length) {
      return 0;
    }
    
    let index = tools.indexOf( 
      tools.find( tool => 
        tool.getSortProperty() == search || 
        tool.code              == search
      ) 
    );
    if (index > -1) {
      return index;
    }

    // Если в id есть месяц и год, то можно начать искать ближайший
    const regexp = /\d{1,2}\.\d{1,2}/;
    const found = regexp.exec(search);
    if ( found ) {
      // Находим все инструменты с одинаковым кодом
      let alike = [ ...tools ].filter(tool => 
        tool.getSortProperty().slice(0, found.index) == search.slice(0, found.index)
      );

      const sorted = this.sort( alike.map(t => t.getSortProperty()).concat(search) );
      index = tools.indexOf( alike[0] ) + sorted.indexOf( sorted.find( n => n == search ) );
    }

    return Math.max(index, 0);
  }
}

export { Tools, Tool, template };