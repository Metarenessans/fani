import React, { useContext } from "react"
import { Checkbox, Progress } from "antd"
import { mean as average } from "lodash"

import Stack from "../../../../../common/components/stack"
import Value from "../../../../../common/components/value"
import round from "../../../../../common/utils/round"

import ControlPanel from "./control-panel"
import TablePanel   from "./table-panel"
import StatsPanel   from "../panel"

import { StateContext } from "../../App"

import "./style.scss"
import formatNumber from "../../../../../common/utils/format-number"

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
                  return <Value value={sum} format={value => formatNumber(value) + "%"} />
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
                     .map(deal => deal.result)

                  return (
                    <Value 
                      value={~~round(average(positiveResults), 1)}
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
                     .map(deal => deal.result)

                  return (
                    <Value
                      value={~~round(average(negativeResults), 1)}
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
                  let total = 0;
                  let checked = 0;
                  for (let day of data) {
                    for (let deal of day.deals) {
                      checked += deal.emotionalStates.positive.length;
                      // FIXME: хардкод, в будущем должен использоваться реальный размер списка
                      total += 4;
                    }
                  }
                  return (
                    <Value 
                      value={checked / total * 100}
                      type="success"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  )
                })()}
              </dd>
            </div>
            <div>
              <dt>Искаженных состояний</dt>
              <dd>
                {(() => {
                  let total = 0;
                  let checked = 0;
                  for (let day of data) {
                    for (let deal of day.deals) {
                      checked += deal.emotionalStates.negative.length;
                      // FIXME: хардкод, в будущем должен использоваться реальный размер списка
                      total += 9;
                    }
                  }
                  return (
                    <Value
                      value={checked / total * 100}
                      type="danger"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  )
                })()}
              </dd>
            </div>
            <div>
              <dt>Нормальных драйверов</dt>
              <dd>
                {(() => {
                  let total = 0;
                  let checked = 0;
                  for (let day of data) {
                    for (let deal of day.deals) {
                      checked += deal.motives.positive.length;
                      // FIXME: хардкод, в будущем должен использоваться реальный размер списка
                      total += 6;
                    }
                  }
                  return (
                    <Value
                      value={checked / total * 100}
                      type="success"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  )
                })()}
              </dd>
            </div>
            <div>
              <dt>Искаженных драйверов</dt>
              <dd>
                {(() => {
                  let total = 0;
                  let checked = 0;
                  for (let day of data) {
                    for (let deal of day.deals) {
                      checked += deal.motives.negative.length;
                      // FIXME: хардкод, в будущем должен использоваться реальный размер списка
                      total += 3;
                    }
                  }
                  return (
                    <Value
                      value={checked / total * 100}
                      type="danger"
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  )
                })()}
              </dd>
            </div>
            <div>
              <dt>Срабатываний раппорта</dt>
              <dd>
                <Value>
                  0
                </Value>
              </dd>
            </div>
            <div>
              <dt>Потерь раппорта</dt>
              <dd>
                <Value>
                  0
                </Value>
              </dd>
            </div>
          </dl>
        </StatsPanel>
      </div>

      {/* Активная проработка */}
      {(() => {
        /** @type {Object.<string, number>} */
        const tasks = {};
        // Количество зачеканных задач на отработку во всех днях
        let tasksCount = 0;

        for (let day of data) {
          const practiceWorkTasks = day?.practiceWorkTasks;
          if (practiceWorkTasks) {
            Object.keys(practiceWorkTasks)
              // Оставляем только зачеканные задачи
              .filter(key => practiceWorkTasks[key])
              .forEach(taskName => {
                if (!tasks[taskName]) {
                  tasks[taskName] = 0;
                }
                tasks[taskName]++;
                tasksCount++;
              });
          }
        }

        // Рендерим секцию только если есть задачи на отработку
        if (tasksCount > 0) {
          return (
            <StatsPanel className="panel5" title="Активная проработка">
              <table>
                <tbody>
                  <tr>
                    <th>Задача</th>
                    <th>Приоритет</th>
                    <th>Выполнено</th>
                  </tr>
                  {Object.keys(tasks)
                    // Сортировка по убыванию частотности
                    .sort((l, r) => tasks[r] - tasks[l])
                    .map((taskName, index) =>
                      <tr key={index}>
                        <td>{taskName}</td>
                        <td>
                          <Progress percent={tasks[taskName] / tasksCount * 100} />
                        </td>
                        <td>
                          <Checkbox disabled />
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </StatsPanel>
          )
        }
      })()}

    </Stack>
  )
}