import fetch from "../fetch"

export default function fetchSaveById(page, id) {
  return new Promise((resolve, reject) => {
    if (typeof id !== "number") {
      reject("id is not a number!");
    }

    // Capitalizing the first letter
    page = page[0].toUpperCase() + page.slice(1);
    
    fetch(`get${page}Snapshot`, "GET", { id })
      .then(resolve)
      .catch(reject)
  });
}