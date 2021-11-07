import fraction from "./fraction"

// TODO: Удалить и в месте вызова использовать `const precision = fraction(number).length`
/**
 * Возвращает кол-во знаков после запятой числа `number`
 *
 * @param {number} number
 * @returns {number}
 * @deprecated Удалить и в месте вызова использовать `const precision = fraction(number).length`
 */
export default function fractionLength(number) {
  return fraction(number).length
}