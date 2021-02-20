import { ajax } from "jquery"

export default function fetch(url = "", method = "GET", data = {}) {
  console.log(`Sending ${url} request...`);
  return new Promise((resolve, reject) => {
    ajax({
      url: `https://fani144.ru/local/php_interface/s1/ajax/?method=${url}`,
      method,
      data,
      success: response => {
        try {
          const parsed = JSON.parse(response);
          if (parsed.error) {
            reject(parsed.message);
          }
          resolve(parsed);
        }
        catch (e) {
          console.log("Couldn't parse response", response);
          reject(e);
        }
      },
      error: error => {
        reject(error);
      }
    });
  });
}

