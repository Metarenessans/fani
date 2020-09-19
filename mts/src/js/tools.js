const template = {
  code:            "",
  shortName:       "",
  fullName:        "",
  stepPrice:       0,
  priceStep:       0,
  averageProgress: 0,
  guaranteeValue:  0,
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
  ]
};

const parseNumber = (value, fallback = 0) => {
  let result = Number(value);
  if (isNaN(result)) {
    result = fallback;
  }
  return result;
};

const parseTool = (tool, status) => {
  let stepPrice  = parseNumber(tool.stepPrice);
  let priceStep  = parseNumber(tool.priceStep);
  let dollarRate = parseNumber(tool.dollarRate);
  if (dollarRate != 0) {
    priceStep = .01;
    stepPrice = dollarRate * priceStep;
  }

  let parsedTool = {
    code:      tool.code,
    fullName:  tool.fullName  || tool.name,
    shortName: tool.shortName || tool.name,

    stepPrice,
    priceStep,
    averageProgress: parseNumber(tool.averageProgress),
    // TODO: расчет с учетом KSUR / KPUR / default
    guaranteeValue:  parseNumber(tool.guarantee || tool.guaranteeValue),
    currentPrice:    parseNumber(tool.price),
    lotSize:         parseNumber(tool.lotVolume),
    dollarRate,

    // TODO: get those falues from the server of whatever
    points: template.points
  };

  return parsedTool;
};

class Tools {

  /**
   * @param {Array<{}>} tools
   */
  static parse(tools) {
    return new Promise((resolve, reject) => {
      if (!tools || tools.length === 0) {
        reject("No tools found!");
      }
      
      let readyTools = [];
      for (const tool of tools) {
        // if (tool.price == 0 || !tool.volume) {
        //   continue;
        // }

        let parsedTool = parseTool(tool);
        readyTools.push(parsedTool);
      }

      resolve(readyTools);
    });
  }
}

export { Tools, template };