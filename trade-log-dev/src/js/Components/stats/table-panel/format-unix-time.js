/** 
 * Форматирует время в формате unix time
 * 
 * @param {number} t Время в формате Unix time
 * @param {string} separator Разделитель между датой, месяцем и годом. По дефолту используется точка
 * @returns {string} Строка в формате `dd.mm.yy`
 */
export default function formatUnixTime(t, separator = ".") {
  const date = new Date(t);
  let dd = date.getDate();
  if (dd < 10) dd = "0" + dd;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  let yy = date.getFullYear();
  if (yy < 10) yy = "0" + yy;

  return dd + separator + mm + separator + yy;
}