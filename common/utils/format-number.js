/**
 * Форматирует число `number`, расставляя пробелы между разрядами
 *
 * @param {number} number Число, которое нужно отформатировать
 * @returns {string}
 */
export default function formatNumber(number) {
  var chunks = String(number).split(".");
  var result = chunks[0].replace(/(\d)(?=(\d{3})+([^\d]|$))/g, "$1 ");
  if (chunks[1]) {
    result += "." + chunks[1];
  }
  return result;
}