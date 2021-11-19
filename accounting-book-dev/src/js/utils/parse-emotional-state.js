import { dealTemplate } from "../App"

/**
 * @typedef ParsedEmotionalState
 * @property {number} positive Количество позитивных состояний
 * @property {number} negative Количество негативных состояний
 * @property {number} total Общее количество состояний
 * @property {"positive"|"negative"|"neutral"} state Состояние-результат
 */

/**
 * Парсит сделки и возвращает статистику об эмоциональном фоне
 * 
 * @param {dealTemplate[]} deals
 * @returns {ParsedEmotionalState}
 */
export default function parseEmotionalState(deals) {
  let positive = 0;
  let negative = 0;
  for (let deal of deals) {
    positive += deal.emotionalStates.positive.filter(value => value === true).length;
    negative += deal.emotionalStates.negative.filter(value => value === true).length;
    positive += deal.motives.positive.filter(value => value === true).length;
    negative += deal.motives.negative.filter(value => value === true).length;
  }

  let state;
  if (positive === negative) {
    state = "neutral";
  }
  else if (positive > negative) {
    state = "positive";
  }
  else if (positive < negative) {
    state = "negative";
  }

  return {
    positive,
    negative,
    total: positive + negative,
    state
  }
}