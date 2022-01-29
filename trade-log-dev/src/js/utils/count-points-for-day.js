import { cloneDeep } from "lodash";
import parseEmotionalState from "./parse-emotional-state";

export default function countPointsForDay(day) {
  return [...cloneDeep(day.deals)]
    .filter(deal => deal.result !== 0)
    .map((deal, i) => {
      let points = 0;

      const emotionalState = parseEmotionalState(deal);
      // Каждое положительное состояние: +1 очко
      points += emotionalState.positive;
      // Каждое отрицательное состояние: -1 очко
      points -= emotionalState.negative;

      // Положительная сделка: +5 очков
      if (deal.result > 0) {
        points += 5;
      }
      // Отрицательная сделка: - 5 очков
      else if (deal.result < 0) {
        points -= 5;
      }

      const { baseTrendDirection, momentDirection, doubts } = day.reportMonitor[i];

      // LONG  - true
      // SHORT - false
      if (
        (baseTrendDirection === true  && momentDirection === true)  ||
        (baseTrendDirection === false && momentDirection === false)
      ) {
        points++;
      }
      else if (baseTrendDirection != null && momentDirection != null) {
        points--;
      }

      // Сомнения в решении отсутствуют: +1 очко
      if (doubts === false) {
        points++;
      }
      // Сомнения в решении присутствуют: -1 очко
      else if (doubts === true) {
        points--;
      }

      return points;
    });
}