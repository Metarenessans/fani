// TODO: удалить, `magnetToClosest` делает то же самое
/** 
 * Примагничивает число к ближайшему шагу
 * 
 * @param {number} value Число, которое нужно примагнитить
 * @param {number} step Число, к которому нужно примагнитить
 * @todo Удалить, `magnetToClosest` делает то же самое
 */
export default function roundToClosest(value, step) {
  return Math.floor(value / step) * step;
}