import { dealTemplate } from "../App";

/**
 * @typedef ParsedEmotionalState
 * @property {number} positive Количество позитивных состояний
 * @property {number} negative Количество негативных состояний
 * @property {number} total Общее количество состояний
 * @property {{ positive: number, negative: number }} emotionalStates Статистика эмоциональных состояний
 * @property {{ positive: number, negative: number }} motives Статистика мотивационных драйверов
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
  let emotionalStates = {
    positive: 0,
    negative: 0
  };
  let motives = {
    positive: 0,
    negative: 0
  };
  for (let deal of deals) {
    emotionalStates.positive += deal.emotionalStates.positive.filter(value => value === true).length;
    emotionalStates.negative += deal.emotionalStates.negative.filter(value => value === true).length;

    motives.positive += deal.motives.positive.filter(value => value === true).length;
    motives.negative += deal.motives.negative.filter(value => value === true).length;
    
    positive += emotionalStates.positive;
    positive += motives.positive;

    negative += emotionalStates.negative;
    negative += motives.negative;
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
    emotionalStates,
    motives,
    state
  };
}