import fetch from "./fetch"

/**
 * Делает GET-запрос с помощью кастомной функции-обертки fetch
 * 
 * @returns {Promise<Array<{ name: string, rate: number }>>}
 */
export default async function fetchBonds() {
  const response = await fetch("getBonds");
  const { data } = response;
  if (data) {
    const tools = data
      // Берём годовую ставку из поля `yield`
      .map(tool => {
        let rate = Number(tool?.yield);
        if (rate == null || isNaN(rate)) {
          rate = 0;
        }
        tool.rate = rate;
        delete tool.yield;
        return tool;
      })
      // убирает все инструменты с годовой ставкой меньше или равной нулю
      .filter(tool => tool.rate > 0)
      // сортировка по убыванию годовой ставки
      .sort((a, b) => b.rate - a.rate);

    return tools;
  }
  else throw "Произошла ошибка при попытке получить ОФЗ!";
}

fetchBonds().then(tools => {
})