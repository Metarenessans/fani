/**
 * Does some crazy shit
 * @param {object} investorInfo 
 * @returns {Promise}
 */
export default function syncToolsWithInvestorInfo(investorInfo, options) {
  return new Promise((resolve, reject) => {
    if (!this) {
      reject("No context provided");
    }

    options = options || {};
    let useDefault = options.useDefault || false;

    investorInfo = investorInfo || this.state.investorInfo;
    const { tools } = this.state;
    const updatedTools = tools.map(tool => tool.update(investorInfo, options));
    
    if (!updatedTools.every(tool => {
      let guarantee = tool.ref.guarantee;

      if (typeof guarantee == "object") {
        guarantee = tool.ref.guarantee["default"];
        if (!useDefault && investorInfo.status && investorInfo.type) {
          if (tool.ref.guarantee[investorInfo.status] && tool.ref.guarantee[investorInfo.status][investorInfo.type]) {
            guarantee = tool.ref.guarantee[investorInfo.status][investorInfo.type];
          }
        }
      }

      const comp1 = Math.floor(tool.guarantee);
      const comp2 = Math.floor(Number(guarantee));

      if (comp1 != comp2) {
        // console.error(comp1, comp2, tool.code, tool.ref.guarantee);
      }

      return comp1 == comp2;
    })) {
      // throw new Error("ГО неправильно посчитались");
    }

    this.setState({ tools: updatedTools }, () => resolve(this.state.tools));
  })
}