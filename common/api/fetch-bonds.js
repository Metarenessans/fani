import fetch from "./fetch";

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * @returns {Promise<Array<{ name: string, rate: number }>>}
 */
export default async function fetchBonds() {
  try {
    const response = await fetch("getBonds");
    const { data } = response;
    if (data) {
      const tools = data
        // Берем годовую ставку из `couponYieldYear`
        .map(tool => {
          let rate = Number(tool?.couponYieldYear);
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