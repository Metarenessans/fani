import fetch from "../../fetch"

export function fetchInvestorInfo() {
  return new Promise((resolve, reject) => {
    fetch("getInvestorInfo").then(resolve).catch(reject)
  })
}