export function applyInvestorInfo(response) {
  return new Promise((resolve, reject) => {
    const { status, skill } = response.data;
    const investorInfo = { status, skill };
    return this.setStateAsync({ investorInfo }, () => resolve(response));
  })
}