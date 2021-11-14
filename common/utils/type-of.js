/**
 * Возвращает тип агрумента `value` в нижнем регистре
 * 
 * @param {any} value
 * @returns {"number"|"string"|"boolean"|"array"|"object"|"function"}
 */
export default function typeOf(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}