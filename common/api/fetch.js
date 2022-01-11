import { ajax } from "jquery";

const urlPrefix = dev ? "https://fani144.ru/" : "";

/** @typedef {import("./fetch-response").FetchResponse} FetchResponse */

/**
 * Отправляет запрос на https://fani144.ru/local/php_interface/s1/ajax с помощью функции {@link ajax} из jQuery
 *
 * @param {string} query Подставляется в GET-параметр "method"
 * @param {"GET"|"POST"} [method="GET"] Метод HTTP запроса. Если не указан, будет использован "GET"
 * @param {{}} [data={}] Данные для передачи
 * @returns {Promise<FetchResponse>}
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
          /** @type {FetchResponse} */
          const parsed = JSON.parse(response);
          if (parsed.error) {
            reject(parsed.message);
          }
          resolve(parsed);
        }
        catch (error) {
          reject(error);
        }
      },
      error: xhr => {
        if (xhr.status == 0) {
          return;
        }
        reject(xhr);
      }
    });
  });
}

