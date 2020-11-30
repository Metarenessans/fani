import { fetchI } from "../../../../common/api/fetch/investor-info"

export default function fetchInvestorInfo() {
  fetch("getInvestorInfo")
    .then(response => {
      const { status, skill } = response.data;
      const investorInfo = { status, skill };
      return new Promise(resolve => {
        this.setState({ investorInfo }, () => resolve(response));
      });
    })
    .then(response => {
      const { deposit } = response.data;
      let { depoStart, depoEnd } = this.state;

      // TODO: simplify
      deposit = deposit || 10000;
      deposit = (deposit > 10000) ? deposit : 10000;
      depoStart[0] = deposit;
      depoStart[1] = deposit;
      if (deposit >= depoEnd) {
        depoEnd = deposit * 2;
      }

      return this.setStateAsync({ depoStart, depoEnd });
      // return new Promise(resolve => this.setState({ depoStart, depoEnd }, resolve));
    })
    .then(this.recalc)
    .catch(error => this.showMessageDialog(`Не удалось получить начальный депозит! ${error}`))
}