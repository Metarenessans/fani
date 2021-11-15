import fetch from "../fetch"

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * @param {string} pageName Строковый идентификатор страницы (`"Trademeter"|"Mts"|"Tor"...`)
 * @param {number} id ID запрашиваемого сохранения
 * @returns {Promise<import("../../utils/extract-snapshot").SnapshotResponse>}
 */
export default function fetchSaveById(pageName, id) {
  // Делает первую букву заглавной
  pageName = pageName[0].toUpperCase() + pageName.slice(1);
  return fetch(`get${pageName}Snapshot`, "GET", { id });
}