/**
 * 
 * @param {{ data: { deposit: number, status: string, skill: string } }} response
 * @returns {Promise.<{ data: { deposit: number, status: string, skill: string } }>}
 */
export function applyInvestorInfo(response) {
  return new Promise(resolve => {
    const { status, skill } = response.data;
    const investorInfo = {
      ...this.state.investorInfo,
      status,
      skill
    };
    this.setState({ investorInfo }, () => resolve(response));
  })
}