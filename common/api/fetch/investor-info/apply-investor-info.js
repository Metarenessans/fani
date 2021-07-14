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