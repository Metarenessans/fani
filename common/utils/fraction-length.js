import fraction from "./fraction"

/**
 * Возвращает кол-во знаков после запятой числа `number`
 *
 * @param {number} number
 * @returns {number}
 * @deprecated Use `const precision = `{@link fraction}`(number).length`
 */
export default function fractionLength(number) {
  return fraction(number).length
}