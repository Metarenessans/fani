import { Tool } from "../../tools";

/**
 * Обновляет ГО инструментов в стейте (`tools`) в соответствии с данными профиля инвестора (`investorInfo`)
 * 
 * @argument {{
 *  deposit: number,
 *  status:  "KSUR"|"KPUR",
 *  skill:   "SKILLED"|"UNSKILLED",
 *  type:    "LONG"|"SHORT"
 * }} [investorInfo]
 * @argument {{ 
 *  useDefault: boolean
 * }} [options]
 * @this {import("react").Component} React компонент
 * @returns {Promise<Tool[]>}
 */
export default function syncToolsWithInvestorInfo(investorInfo, options) {
  return new Promise((resolve, reject) => {
    if (!this) {
      reject("this должен быть экземляром класса React.Component!");
    }

    investorInfo = investorInfo || this.state.investorInfo;

    /** @type {Tool[]} */
    const tools = this.state?.tools;
    const updatedTools = tools.map(tool => tool.update(investorInfo, options));
    this.setState({ tools: updatedTools }, () => resolve(this.state.tools));
  })
}