import React from "react"
import { Consumer } from "./app"
import { merge, round, cloneDeep as clone } from "lodash";
import { Tool } from "../../../common/tools";

const template = {
  ref:             null,
  code:            "",
  shortName:       "",
  fullName:        "",
  stepPrice:       0,
  priceStep:       0,
  averageProgress: 0,
  guarantee:       0,
  currentPrice:    0,
  lotSize:         0,
  dollarRate:      0,

  points: [
    [70,  70],
    [156, 55],
    [267, 41],
    [423, 27],
    [692, 13],
    [960,  7],
  ],

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
    else {
      this.guarantee = 0;
    }

    return this;
  },

  getFullName() {
    if (this.fullName) {
      return this.fullName;
    }
    else if (this.shortName) {
      return this.shortName;
    }
    else return this.code;
  },

  getSortProperty() {
    if (this.shortName) {
      return this.shortName;
    }
    else return this.code;
  },

  toString() {
    let str = String(this.code);
    if (this.fullName) {
      return `${this.fullName} (${str})`;
    }
    else if (this.shortName) {
      return `${this.shortName} (${str})`;
    }

    return str;
  },
};

const parseNumber = (value, fallback = 0) => {
  let result = Number(value);
  if (isNaN(result)) {
    result = fallback;
  }
  return result;
};

const parseTool = (tool, options = {}) => {
  let investorInfo = options.investorInfo || {};

  let averageProgress = parseNumber(tool.averageProgress);
  let currentPrice    = parseNumber(tool.price || tool.currentPrice);
  let stepPrice       = parseNumber(tool.stepPrice);
  let priceStep       = parseNumber(tool.priceStep);
  let dollarRate      = parseNumber(tool.dollarRate);
  let lotSize         = parseNumber(tool.lotVolume || tool.lotSize);

  // Америка
  if (dollarRate != 0 && dollarRate != 1) {
    priceStep = 0.01;
    stepPrice = dollarRate * priceStep * lotSize;

    // Оставляем такое же кол-во знаков после запятой, что и в dollarRate
    const match = String(dollarRate).match(/\.\d+/);
    if (match) {
      stepPrice = round(stepPrice, match[0].length - 1)
    }
  }
  // Россия
  else {
    stepPrice = priceStep * lotSize;
  }

  let parsedTool = Tool.fromObject({
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
  }, options);
  parsedTool = parsedTool.update(investorInfo);
  return parsedTool;
};

class Tools {

  /**
   * @param {Array<{}>} tools
   */
  static parse(tools, options = {}) {
    return new Promise((resolve, reject) => {
      if (!tools || tools.length === 0) {
        reject("No tools found!");
      }
      
      let readyTools = [];
      for (const tool of tools) {
        if (!tool.dollarRate) {
          if (tool.price == 0 || !tool.volume) {
            continue;
          }
        }

        let parsedTool = parseTool(tool, options);
        readyTools.push(parsedTool);
      }

      resolve(readyTools);
    });
  }

  static sort(tools) {
    return tools.sort((a, b) => a.getSortProperty().localeCompare(b.getSortProperty()))
  }

  static create(toolInfo = {}, options = {}) {
    const investorInfo = options.investorInfo || {};
    let tool = clone(template);
    tool = merge(tool, toolInfo);
    return tool.update(investorInfo);
  }
}

export { Tools, template };