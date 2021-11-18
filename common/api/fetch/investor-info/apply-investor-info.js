/**
 * @typedef {import("./investor-info-response").InvestorInfoResponse} InvestorInfoResponse
 */

/**
 * Распаковывает ответ с сервера и обновляет стейт по ключу `investorInfo`
 * 
 * @this {import("react").Component} React-компонент
 * @param {InvestorInfoResponse} response Объект-ответ с сервера
 * @returns {Promise<InvestorInfoResponse>}
 */
export function applyInvestorInfo(response) {
  const { data } = response;
  const { status, skill } = data;
  const investorInfo = {
    ...this.state.investorInfo,
    status,
    skill
  };
  return new Promise(resolve => this.setState({ investorInfo }, () => resolve(response)));
}