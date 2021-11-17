import { ajax } from "jquery";

const urlPrefix = dev ? "https://fani144.ru/" : "";

/**
 * Отправляет запрос на https://fani144.ru/local/php_interface/s1/ajax с помощью функции ajax из jQuery
 *
 * @export
 * @param {string} query Подставляется в GET-параметр "method"
 * @param {"GET"|"POST"} [method="GET"] Метод HTTP запроса. По дефолту используется "GET"
 * @param {{}} [data={}] Данные для передачи
 * @returns {Promise<{ error: boolean, data: Array >}
 */
export default function fetch(query, method = "GET", data = {}) {
  const url = `${urlPrefix}/local/php_interface/s1/ajax/?method=${query}`;
  return new Promise((resolve, reject) => {
    ajax({
      url,
      method,
      data,
      success: response => {
        try {
          const parsed = JSON.parse(response);
          if (parsed.error) {
            reject(url + " failed: " + parsed.message);
          }
          resolve(parsed);
        }
        catch (error) {
          reject(`Не удалось распарсить JSON, полученный от ${query}: ${error}`);
        }
      },
      error: error => {
        if (error.status == 0) {
          return;
        }
        reject(error);
      }
    });
  });
}

