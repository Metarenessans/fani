import fetch from "./fetch";

export default async function fetchLastModifiedSnapshot(page = "") {
  // Capitalizing the first letter
  page = page[0].toUpperCase() + page.slice(1);

  const response = await fetch(`getLastModified${page}Snapshot`);
  const { error, data } = response;
  // TODO: нужен метод проверки адекватности ответа по сохранению для всех проектов
  if (!error && data.name) {
    return data;
  }
}