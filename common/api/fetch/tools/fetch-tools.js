import fetch from "../../fetch"

export default function fetchTools() {
  return new Promise((resolve, reject) => {
    for (let request of ["getFutures", "getTrademeterInfo"]) {
      fetch(request).then(resolve).catch(reject)
    }
  })
}