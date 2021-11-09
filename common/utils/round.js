/**
 * Округляет число до N знаков после запятой
 *
 * @param {number} number Число, которое нужно округлить
 * @param {number} [decimals=0] Кол-во знаков, до которых нужно округлить
 * @returns {number}
 */
export default function round(number, decimals = 0) {
  if (number == null) {
    return number;
  }

  let dec = Math.pow(10, decimals);
  return Math.round(number * dec) / dec;
}