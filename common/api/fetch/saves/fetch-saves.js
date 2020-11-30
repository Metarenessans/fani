import fetch from "../../fetch"

export default function fetchSaves(page = "") {
  // Capitalizing the first letter
  page = page[0].toUpperCase() + page.slice(1);

  return new Promise((resolve, reject) => {
    fetch(`get${page}Snapshots`)
      .then(response => resolve(response.data))
      .catch(reject)
  });
}