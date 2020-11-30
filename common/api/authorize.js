import isAuthorized from "./is-authorized"
import promiseWhile from "../utils/promise-while"

export default function authorize() {
  return new Promise((resolve, reject) => {
    const max = 10;
    let counter = 0;
    promiseWhile(false, i => !i, () => {
      return new Promise(next => {
        counter++;
        isAuthorized()
          .then(() => {
            resolve();
            next(true);
          })
          .catch(() => {
            if (counter >= max) {
              reject();
              next(true);
            }
            else {
              setTimeout(() => next(false), 1000);
            }
          });
      });
    });
  });
}