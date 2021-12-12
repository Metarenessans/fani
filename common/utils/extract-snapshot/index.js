/**
 * Ответ с сервера
 * 
 * @typedef SnapshotResponse
 * @property {boolean}  error
 * @property {Snapshot} data
 */

/**
 * @typedef Snapshot
 * @property {number}  id         ID сейва
 * @property {string}  name       Название сейва
 * @property {number}  dateCreate Дата создания сейва в формате Unix time
 * @property {number}  dateUpdate Дата последнего обновления сейва в формате Unix time
 * @property {{}}      static     Объект со всеми сохраненными данными
 * @property {{}}      dynamic
 */

/**
 * Парсит сохранение с помощью пользовательской коллбэк-функции
 * 
 * @this {import("react").Component}
 * @param {Snapshot} snapshot {@link Snapshot Ответ с сервера}, который нужно распарсить
 * @param {(static: object, dynamic?: object) => object} parseFn Коллбэк-парсер
 * @returns {Promise<{}>} Данные, пропушенные в стейт 
 */
export default async function extractSnapshot(snapshot, parseFn) {
  // Начинаем обрабатывать сохранение
  await this.setStateAsync({ loading: true });

  const { id, name } = snapshot;

  let state;
  try {
    const parsedStatic = snapshot.static && JSON.parse(snapshot.static);
    const parsedDynamic = snapshot.dynamic && JSON.parse(snapshot.dynamic);
    state = parseFn(parsedStatic, parsedDynamic);
  }
  catch (error) {
    console.error("Не удалось распарсить сохранение: " + error);
  }
  finally {
    state = {
      ...state,
      id,
      saved: true
    };
  }

  console.log(`Сохранение '${name}' распаршено:`, state);
  await this.setStateAsync(state);
  // Рендеринг после пуша в стейт может быть долгим,
  // Поэтому мы выключаем флаг загрузки отдельным шагом
  await this.setStateAsync({ loading: false });
  return state;
}