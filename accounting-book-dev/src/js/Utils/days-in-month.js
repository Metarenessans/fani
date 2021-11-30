/**
 * Вызывать как метод объекта "new Date"
 * @returns возвращает количество дней в месяце
 */
Date.prototype.daysInMonth = function () {
  return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};