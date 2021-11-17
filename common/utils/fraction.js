/**
 * Возвращает дробную часть числа `number` (знаки после запятой) в виде строки
 * 
 * Если число не имеет дробной части, то функция вернет пустую строку
 *
 * @argument {number} number
 * @returns {string}
 */
export default function fraction(number) {
  return String(number).split(".")[1] || "";
}