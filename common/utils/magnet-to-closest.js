/**
 * Магнитит число `number` к ближайшему шагу `step`
 * 
 * Пример:
 * ```
 *   magnetToClosest(5.9, 1)
 *   > 6
 * 
 *   magnetToClosest(1.5, 3)
 *   > 3
 * ```
 * 
 * ВАЖНО: результат всегда будет больше или равным `step`, то есть
 * ```
 *  magnetToClosest(0, 3)
 *  > 3
 * ```
 * 
 * @param {number} number Число, которое нужно примагнитить
 * @param {number} step Шаг, к которому нужно прижать `number`
 * @returns {number}
 * @todo Написать тесты
 */
export default function magnetToClosest(number, step) {
  return Math.max(Math.round(number / step) * step, step);
}