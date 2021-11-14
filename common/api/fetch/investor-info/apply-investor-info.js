/**
 * Распаковывает ответ с сервера и обновляет стейт по ключу `investorInfo`
 * 
 * @param {import(".").InvestorInfoResponse} response Объект-ответ с сервера
 * @this {import("react").Component} React компонент
 * @returns {Promise.<import(".").InvestorInfoResponse>}
 */
export function applyInvestorInfo(response) {
  const { data } = response;
  const { status, skill } = data;
  const investorInfo = {
    ...this.state.investorInfo,
    status,
    skill
  };
  return new Promise(resolve => this.setState({ investorInfo }, () => resolve(response)))
}