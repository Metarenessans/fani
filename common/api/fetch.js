import { ajax } from "jquery"

const urlPrefix = dev ? "https://fani144.ru/" : "";

export default function fetch(url = "", method = "GET", data = {}) {
  return new Promise((resolve, reject) => {
    ajax({
      url: `${urlPrefix}/local/php_interface/s1/ajax/?method=${url}`,
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
        catch (e) {
          console.error("Couldn't parse JSON", response);
          reject(e);
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

