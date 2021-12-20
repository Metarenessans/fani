import fetch from "./fetch";

/**
 * ОФЗ
 * @typedef Bond
 * @property {string} name Название ОФЗ
 * @property {number} rate Годовая ставка
 */

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * @returns {Promise<Bond[]>} Отсортированный по убыванию годовой ставки массив ОФЗ
 */
export default async function fetchBonds() {
  try {
    const response = await fetch("getBonds");
    const { data } = response;
    if (data) {
      const tools = data
        // Берем годовую ставку из `yield`
        .map(tool => {
          let rate = Number(tool?.yield);
          if (!Number.isFinite(rate)) {
            rate = 0;
          }
          tool.rate = rate;
          delete tool.yield;
          return tool;
        })
        // Убираем все инструменты с годовой ставкой меньше или равной нулю
        .filter(tool => tool.rate > 0)
        // Сортировка по убыванию годовой ставки
        .sort((a, b) => b.rate - a.rate);
  
      return tools;
    }
    else throw "Не удалось получить ОФЗ!";
  }
  catch (error) {
    console.error(error);
  }
}