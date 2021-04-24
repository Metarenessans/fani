import { Tools } from "../../../tools"

export default function applyTools(response) {
  return new Promise(resolve => {
    const parsed = Tools.parse(response.data, { investorInfo: this.state.investorInfo });
    const sorted = Tools.sort(this.state.tools.concat(parsed));
    this.setStateAsync({ tools: sorted }).then(resolve)
  })
}