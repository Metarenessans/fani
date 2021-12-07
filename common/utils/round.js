/**
 * Округляет число до N знаков после запятой
 *
 * @param {number} number Число, которое нужно округлить
 * @param {number} [decimals=0] Кол-во знаков, до которых нужно округлить
 */
export default function round(number, decimals) {
  if (!decimals) {
    return Math.round(number);
  }
  if (decimals > 6) {
    decimals = 6;
    console.warn("Точность не может быть больше 6 знаков!");
  }
  const factorOfTen = 10 ** decimals;
  return Math.round(number * factorOfTen) / factorOfTen;
}