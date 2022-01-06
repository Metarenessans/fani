import fetch from "../fetch";

/** @typedef {import("../../utils/extract-snapshot").SnapshotResponse} SnapshotResponse */

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * @param {string} pageName Строковый идентификатор страницы (`"Trademeter"|"Mts"|"Tor"...`)
 * @param {number} id ID запрашиваемого сохранения
 * @returns {Promise<SnapshotResponse>}
 */
export default async function fetchSaveById(pageName, id) {
  // Делает первую букву заглавной
  pageName = pageName[0].toUpperCase() + pageName.slice(1);
  const response = await fetch(`get${pageName}Snapshot`, "GET", { id });
  window.easterEgg = response;
  return response;
}