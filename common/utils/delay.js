/**
 * Возвращает {@link Promise}, который резолвится через `ms` миллисекунд
 * 
 * @param {number} ms Время в миллисекундах
 * @returns {Promuise}
 */
export default function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}