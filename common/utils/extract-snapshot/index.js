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
 * @returns {Promise}
 */
export default function extractSnapshot(snapshot, parseFn) {
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
      saved: true,
      loading: false
    };
  }

  console.log(`Сохранение '${name}' распаршено:`, state);
  return new Promise(resolve => this.setState(state, resolve));
}