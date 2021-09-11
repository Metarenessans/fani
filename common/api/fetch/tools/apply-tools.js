import { Tools } from "../../../tools"

export default function applyTools(response) {
  return new Promise(resolve => {
    if (!this) {
      throw new Error("No context provided!", this);
    }

    const { investorInfo } = this.state;
    const parsed = Tools.parse(response.data, { investorInfo, useDefault: true });
    const sorted = Tools.sort(this.state.tools.concat(parsed));
    this.setStateAsync({ tools: sorted }).then(resolve)
  })
}