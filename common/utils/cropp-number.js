/**
 * Обрезает число `number` до `precision` знаков после запятой без округления
 *
 * @param {number} number
 * @param {number} precision
 */
export default function croppNumber(number, precision) {
  const powerOfTen = 10 ** precision;
  return Math.trunc(number * powerOfTen) / powerOfTen;
}