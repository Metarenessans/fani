import fetch from "../fetch"

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * @param {string} page Строковый идентификатор страницы (`"Trademeter"|"Mts"|"Tor"...`)
 * @param {number} id ID запрашиваемого сохранения
 * @returns {Promise<import("../../utils/extract-snapshot").SnapshotResponse>}
 */
export default function fetchSaveById(page, id) {
  if (typeof id !== "number") {
    throw "Аргумент id должен быть числом!";
  }

  // Делаем первую букву заглавной
  page = page[0].toUpperCase() + page.slice(1);
  return fetch(`get${page}Snapshot`, "GET", { id })
}