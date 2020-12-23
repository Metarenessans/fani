import { merge, round, cloneDeep } from "lodash";
import fractionLength from "./utils/fraction-length"
import readyTools    from "./adr.json"
import readyToolsNew from "./adr-new.json"

const template = {
  ref:             null,
  fullName:        "",
  shortName:       "",
  code:            "",
  stepPrice:       0,
  priceStep:       0,
  averageProgress: 0,
  guarantee:       0,
  currentPrice:    0,
  volume:          0,
  lotSize:         0,
  dollarRate:      0,
  adrDay:          0,
  adrWeek:         0,
  adrMonth:        0,

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
    if (this.ref) {
      let guarantee = this.ref.guarantee || this.ref.guaranteeValue;

      if (typeof guarantee == "object") {
        let guaranteeExtracted = this.ref.guarantee["default"];
        if (investorInfo.status) {
          const type = investorInfo.type;
          if (this.ref.guarantee[investorInfo.status] && this.ref.guarantee[investorInfo.status][type]) {
            guaranteeExtracted = this.ref.guarantee[investorInfo.status][type];
          }
        }

        guarantee = parseNumber(guaranteeExtracted);
      }
      else {
        guarantee = parseNumber(guarantee);
      }

      this.guarantee = round(guarantee, 1);
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
    else return this.code;
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
  else if (dollarRate == 0) {

  }
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
  
  // Check if we already have pre-written tool
  const check = readyTools => {
    for (let readyTool of readyTools) {
      const lastCompareIndex = (readyTool.isFutures && dollarRate == 0) ? 2 : undefined;
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

  const filterFn = t => {
    if (t.adrWeek == "" && t.adrMonth == "") {
      return false;
    }
    return true;
  };

  check(readyTools.filter(filterFn));
  check(readyToolsNew.filter(filterFn));

  // We didn't find the tool in pre-written tools
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
    // id:        tool.code + (dollarRate == 1) ? ".RU" : ".US",
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
    for (const rowData of tools) {
      if (shouldBeSkipped(rowData)) {
        continue;
      }

      let tool = new Tool(merge(cloneDeep(template), parseTool(rowData, options)));
      tool = tool.update(investorInfo);
      parsedTools.push(tool);
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
      for (let i = 0; i < r.length; i++) {
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
      ref:             null,
      fullName:        "Сбербанк России ПАО ао",
      shortName:       "",
      code:            "SBER",
      stepPrice:       0.1,
      priceStep:       0.01,
      averageProgress: 0,
      guarantee:       738.1,
      currentPrice:    205.03,
      volume:          0,
      lotSize:         10,
      dollarRate:      1,
      adrDay:          4.02,
      adrWeek:         5,
      adrMonth:        10.7,
    },
    options = {}
  ) {
    const investorInfo = options.investorInfo || {};

    let tool = new Tool({ ...template, ...toolInfo });
    tool = tool.update(investorInfo);
    return tool;
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

export { Tools, template };