import fetch from "./fetch"

export default function fetchSavesFor(page = "") {
  // Capitalizing the first letter
  page = page[0].toUpperCase() + page.slice(1);
  
  return fetch(`get${page}Snapshots`);
}