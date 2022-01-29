import { dealTemplate } from "../App";
import typeOf from "../../../../common/utils/type-of";

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

  /** @param {dealTemplate} deal */
  function parseDeal(deal) {
    emotionalStates.positive += Object.keys(deal.emotionalStates.positive).map(name => deal.emotionalStates.positive[name]).filter(value => value === true).length;
    emotionalStates.negative += Object.keys(deal.emotionalStates.negative).map(name => deal.emotionalStates.negative[name]).filter(value => value === true).length;
    
    motives.positive += Object.keys(deal.motives.positive).map(name => deal.motives.positive[name]).filter(value => value === true).length;
    motives.negative += Object.keys(deal.motives.negative).map(name => deal.motives.negative[name]).filter(value => value === true).length;

    positive += emotionalStates.positive;
    positive += motives.positive;

    negative += emotionalStates.negative;
    negative += motives.negative;
  }

  if (typeOf(deals) == "object") {
    parseDeal(deals);
  }
  else {
    for (let deal of deals) {
      parseDeal(deal);
    }
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