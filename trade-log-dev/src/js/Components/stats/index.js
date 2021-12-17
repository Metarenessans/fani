import React, { useContext } from "react";
import { cloneDeep, mean as average } from "lodash";

import Stack        from "../../../../../common/components/stack";
import Value        from "../../../../../common/components/value";
import round        from "../../../../../common/utils/round";
import formatNumber from "../../../../../common/utils/format-number";

import ControlPanel from "./control-panel";
import TablePanel   from "./table-panel";
import StatsPanel   from "../panel";
import Tasks        from "./tasks/Tasks";

import parseEmotionalState from "../../utils/parse-emotional-state";

import { StateContext } from "../../App";

import "./style.scss";

function countPointsForDay(day) {
  return [...cloneDeep(day.deals)]
    .filter(deal => deal.result !== 0)
    .map((deal, i) => {
      let points = 0;

      const emotionalState = parseEmotionalState(deal);
      // Каждое положительное состояние: +1 очко
      if (emotionalState.positive > emotionalState.negative) {
        points++;
      }
      // Каждое отрицательное состояние: -1 очко
      else if (emotionalState.positive < emotionalState.negative) {
        points--;
      }

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
        (baseTrendDirection === true  && momentDirection === true) ||
        (baseTrendDirection === false && momentDirection === false)
      ) {
        points++;
      }
      else {
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

export default function Stats() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data } = state;
  return (
    <Stack className="stats" space="2em">

      {/* Панель управления */}
      <ControlPanel />

      {/* Пошаговый план проработки */}
      <TablePanel />

      <div className="stats-container">
        {/* Генеральная статистика */}
        <StatsPanel title="Генеральная статистика">
          <dl className="association-list">
            <div>
              <dt>Торговых дней</dt>
              <dd>{data.length}</dd>
            </div>
            <div>
              <dt>Сделок</dt>
              <dd>
                {data.reduce((acc, day) => {
                  const deals = day.deals.filter(deal => deal.result !== 0);
                  return acc + deals.length;
                }, 0)}
              </dd>
            </div>
            <div>
              <dt>Общий результат</dt>
              <dd>
                {(() => {
                  let sum = 0;
                  for (let day of data) {
                    const deals = day.deals.filter(deal => deal.result !== 0);
                    const totalResult = deals
                      .map(deal => deal.result)
                      .reduce((acc, curr) => acc + curr, 0);
                    
                    sum += totalResult;
                  }
                  return <Value value={sum} format={value => formatNumber(round(value, 3)) + "%"} />;
                })()}
              </dd>
            </div>
            <div>
              <dt>Позиций Long</dt>
              <dd>
                {data.reduce((acc, day) => {
                  const deals = day.deals
                    .filter(deal => deal.result !== 0)
                    .filter(deal => deal.isLong);
                  return acc + deals.length;
                }, 0)}
              </dd>
            </div>
            <div>
              <dt>Позиций Short</dt>
              <dd>
                {data.reduce((acc, day) => {
                  const deals = day.deals
                    .filter(deal =>  deal.result !== 0)
                    .filter(deal => !deal.isLong);
                  return acc + deals.length;
                }, 0)}
              </dd>
            </div>
            <div>
              <dt>Положительных сделок</dt>
              <dd>
                <Value type="success">
                  {data.reduce((acc, day) =>
                    acc + day.deals.filter(deal => deal.result > 0).length,
                    0
                  )}
                </Value>
              </dd>
            </div>
            <div>
              <dt>Отрицательных сделок</dt>
              <dd>
                <Value type="danger">
                  {data.reduce((acc, day) =>
                    acc + day.deals.filter(deal => deal.result < 0).length,
                    0
                  )}
                </Value>
              </dd>
            </div>
            <div>
              <dt>Средняя положительная сделка</dt>
              <dd>
                {(() => {
                  const positiveResults = data
                     .map(day => day.deals.flat())[0]
                    ?.filter(deal => deal.result > 0)
                     .map(deal => deal.result);

                  let value = average(positiveResults);
                  if (isNaN(value)) {
                    value = 0;
                  }

                  return (
                    <Value 
                      value={round(value, 1)}
                      type="success"
                      format={value => formatNumber(value) + "%"}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Средняя отрицательная сделка</dt>
              <dd>
                {(() => {
                  const negativeResults = data
                     .map(day => day.deals.flat())[0]
                    ?.filter(deal => deal.result < 0)
                     .map(deal => deal.result);

                  let value = average(negativeResults);
                  if (isNaN(value)) {
                    value = 0;
                  }

                  return (
                    <Value
                      value={round(value, 1)}
                      type="danger"
                      format={value => formatNumber(value) + "%"}
                    />
                  );
                })()}
              </dd>
            </div>
          </dl>
        </StatsPanel>

        {/* Генеральный анализ состояния */}
        <StatsPanel title="Генеральный анализ состояния">
          <dl className="association-list">
            <div>
              <dt>Нормальных состояний</dt>
              <dd>
                {(() => {
                  let positiveChecked = 0;
                  let negativeChecked = 0;
                  
                  for (let day of data) {
                    const emotionalState = parseEmotionalState(day.deals);
                    positiveChecked += emotionalState.emotionalStates.positive;
                    negativeChecked += emotionalState.emotionalStates.negative;
                  }

                  let value = (positiveChecked / (positiveChecked + negativeChecked)) * 100;
                  if (!Number.isFinite(value)) {
                    value = 0;
                  }

                  return (
                    <Value 
                      value={value}
                      type="success"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Искаженных состояний</dt>
              <dd>
                {(() => {
                  let positiveChecked = 0;
                  let negativeChecked = 0;

                  for (let day of data) {
                    const emotionalState = parseEmotionalState(day.deals);
                    positiveChecked += emotionalState.emotionalStates.positive;
                    negativeChecked += emotionalState.emotionalStates.negative;
                  }

                  let value = (negativeChecked / (positiveChecked + negativeChecked)) * 100;
                  if (!Number.isFinite(value)) {
                    value = 0;
                  }

                  return (
                    <Value
                      value={value}
                      type="danger"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Нормальных драйверов</dt>
              <dd>
                {(() => {
                  let positiveChecked = 0;
                  let negativeChecked = 0;

                  for (let day of data) {
                    const emotionalState = parseEmotionalState(day.deals);
                    positiveChecked += emotionalState.motives.positive;
                    negativeChecked += emotionalState.motives.negative;
                  }

                  let value = (positiveChecked / (positiveChecked + negativeChecked)) * 100;
                  if (!Number.isFinite(value)) {
                    value = 0;
                  }
                  return (
                    <Value
                      value={value}
                      type="success"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Искаженных драйверов</dt>
              <dd>
                {(() => {
                  let positiveChecked = 0;
                  let negativeChecked = 0;

                  for (let day of data) {
                    const emotionalState = parseEmotionalState(day.deals);
                    positiveChecked += emotionalState.motives.positive;
                    negativeChecked += emotionalState.motives.negative;
                  }

                  let value = (negativeChecked / (positiveChecked + negativeChecked)) * 100;
                  if (!Number.isFinite(value)) {
                    value = 0;
                  }
                  return (
                    <Value
                      value={value}
                      type="danger"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Срабатываний раппорта</dt>
              <dd>
                {(() => {
                  let value = 0;
                  for (let day of data) {
                    value += countPointsForDay(day).filter(points => points > 0).length;
                  }

                  return (
                    <Value
                      value={value}
                      type="success"
                      format={formatNumber}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Потерь раппорта</dt>
              <dd>
                {(() => {
                  let value = 0;
                  for (let day of data) {
                    value += countPointsForDay(day).filter(points => points < 0).length;
                  }

                  return (
                    <Value
                      value={value}
                      type="danger"
                      format={formatNumber}
                    />
                  );
                })()}
              </dd>
            </div>
          </dl>
        </StatsPanel>
      </div>

      {/* Активная проработка */}
      <Tasks />

    </Stack>
  );
}