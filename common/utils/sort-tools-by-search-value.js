import { Tool } from "../tools";

/**
 * Сортирует инструменты по значению, введенному в поиске (`searchValue`)
 * @param {string} searchValue
 * @param {Tool[]} tools
 * @return {Tool[]}
 */
export default function sortToolsBySearchValue(searchValue, tools) {
  if (!searchValue) {
    return tools;
  }

  searchValue = searchValue.toLowerCase();
  
  return tools.sort((a, b) => {
    a = String(a).substring(0, searchValue.length).toLowerCase();
    b = String(b).substring(0, searchValue.length).toLowerCase();

    if (a == searchValue) {
      if (b != searchValue) return -1;
    }
    else if (b == searchValue) return 1;
    return a < b 
      ? -1 
      : a > b 
        ? 1 
        : 0;
  });
}
