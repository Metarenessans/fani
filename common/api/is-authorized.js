import fetch from "./fetch"

export default function isAuthorized() {
  return new Promise((resolve, reject) => {
    fetch("getAuthInfo")
      .then(response => {
        if (response.authorized) {
          resolve();
        }
        reject();
      })
      .catch(reject)
  })
};