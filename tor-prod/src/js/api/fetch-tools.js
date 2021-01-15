import fetch from "../../../../common/api/fetch"
import { Tools } from "../../../../common/tools"

export default function fetchTools() {
  for (let request of ["getFutures", "getTrademeterInfo"]) {
    fetch(request)
      .then(response => Tools.parse(response.data, { investorInfo: this.state.investorInfo }))
      .then(tools => Tools.sort(this.state.tools.concat(tools)))
      .then(tools => this.setStateAsync({ tools }))
      .then(() => this.updateDepoPersentageStart())
      .catch(error => this.showMessageDialog(`Не удалось получить инстурменты! ${error}`))
  }
}