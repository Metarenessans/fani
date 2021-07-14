import { ajax } from "jquery"

const urlPrefix = dev ? "https://fani144.ru/" : "";

export default function fetch(url = "", method = "GET", data = {}) {
  console.log(`%c Sending ${url} request...`, 'color: pink; background-color: black');
  return new Promise((resolve, reject) => {
    ajax({
      url: `${urlPrefix}/local/php_interface/s1/ajax/?method=${url}`,
      method,
      data,
      success: response => {
        console.log(`%c ${url} finished`, 'color: orange; background-color: black');
        try {
          const parsed = JSON.parse(response);
          if (parsed.error) {
            reject(url + " failed: " + parsed.message);
          }
          resolve(parsed);
        }
        catch (e) {
          console.log("Couldn't parse JSON", response);
          reject(url + " failed: " + e);
        }
      },
      error: error => {
        if (error.status == 0) {
          return;
        }
        reject(url + " failed: " + error);
      }
    });
  });
}

