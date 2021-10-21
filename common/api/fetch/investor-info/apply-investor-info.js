/**
 * Распаковывает ответ с сервера и обновляет стейт по ключу `investorInfo`
 * 
 * @param {{ data: { deposit: number, status: string, skill: string } }} response Объект-ответ с сервера
 * @this {import("react").Component} React компонент
 * @returns {Promise.<{ data: { deposit: number, status: string, skill: string } }>}
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