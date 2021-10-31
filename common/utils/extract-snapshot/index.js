/**
 * @typedef Snapshot
 * @property {number}  id
 * @property {string}  name
 * @property {number}  dateCreate
 * @property {number}  dateUpdate
 * @property {{}}      static
 * @property {{}}      dynamic
 */

/**
 * @typedef SnapshotResponse
 * @property {boolean}  error
 * @property {Snapshot} data
 */

/**
 * Парсит сохранение с помощью пользовательской коллбэк-функции
 * 
 * @param {Snapshot} snapshot {@link Snapshot Ответ с сервера}, который нужно распарсить
 * @param {(static: object, dynamic?: object) => object} parseFn Коллбэк-парсер
 * @this {import("react").Component}
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

  console.log(`Сохранение ${name} распаршено!`);
  return new Promise(resolve => this.setState(state, () => resolve(state)))
}