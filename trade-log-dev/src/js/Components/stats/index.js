import React, { useContext } from "react"
import { Checkbox, Progress } from "antd"
import { mean as average } from "lodash"

import Stack from "../../../../../common/components/stack"
import round from "../../../../../common/utils/round"

import ControlPanel from "./control-panel"
import TablePanel   from "./table-panel"
import StatsPanel   from "../panel"

import { StateContext } from "../../App"

import "./style.scss"

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
              <dd>{data.reduce((acc, day) => acc + day.deals.length, 0)}</dd>
            </div>
            <div>
              <dt>Общий результат</dt>
              <dd>{
                data.reduce((acc, day) =>
                  acc + day.deals.reduce((acc, deal) => acc + deal.result, 0), 0
                )
              }%</dd>
            </div>
            <div>
              <dt>Позиций Long</dt>
              <dd>
                {
                  data.reduce((acc, day) =>
                    acc + day.deals.filter(deal => deal.isLong).length, 0
                  )
                }
              </dd>
            </div>
            <div>
              <dt>Позиций Short</dt>
              <dd>
                {
                  data.reduce((acc, day) =>
                    acc + day.deals.filter(deal => !deal.isLong).length, 0
                  )
                }
              </dd>
            </div>
            <div>
              <dt>Положительных сделок</dt>
              <dd>
                {
                  data.reduce((acc, day) =>
                    acc + day.deals.filter(deal => deal.result > 0).length, 0
                  )
                }
              </dd>
            </div>
            <div>
              <dt>Отрицательных сделок</dt>
              <dd>
                {
                  data.reduce((acc, day) =>
                    acc + day.deals.filter(deal => deal.result <= 0).length, 0
                  )
                }
              </dd>
            </div>
            <div>
              <dt>Средняя положительная сделка</dt>
              <dd>{(() => {
                const positiveResults = data
                   .map(day => day.deals.flat())[0]
                  ?.filter(deal => deal.result > 0)
                   .map(deal => deal.result)

                return ~~round(average(positiveResults), 1);
              })()}%</dd>
            </div>
            <div>
              <dt>Средняя отрицательная сделка</dt>
              <dd>{(() => {
                const negativeResults = data
                   .map(day => day.deals.flat())[0]
                  ?.filter(deal => deal.result <= 0)
                   .map(deal => deal.result)

                return ~~round(average(negativeResults), 1);
              })()}%</dd>
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
                  return round(checked / total * 100, 1);
                })()}
                %
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
                  return round(checked / total * 100, 1);
                })()}
                %
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
                  return round(checked / total * 100, 1);
                })()}
                %
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
                  return round(checked / total * 100, 1);
                })()}
                %
              </dd>
            </div>
            <div>
              <dt>Срабатываний раппорта</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Потерь раппорта</dt>
              <dd>0</dd>
            </div>
          </dl>
        </StatsPanel>
      </div>

      {/* Активная проработка */}
      <StatsPanel className="panel5" title="Активная проработка">
        <table>
          <tr>
            <th>Задача</th>
            <th>Приоритет</th>
            <th>Выполнено</th>
          </tr>
          <tr>
            <td>Изменить время входа в сделку</td>
            <td>
              <Progress percent={50} />
            </td>
            <td>
              <Checkbox />
            </td>
          </tr>
          <tr>
            <td>Не снимать отложенные заявки, выставленные до этого</td>
            <td>
              <Progress percent={25} />
            </td>
            <td>
              <Checkbox />
            </td>
          </tr>
          <tr>
            <td>Не перезаходить после закрытия по stop-loss</td>
            <td>
              <Progress percent={15} />
            </td>
            <td>
              <Checkbox />
            </td>
          </tr>
          <tr>
            <td>Не выключать робот</td>
            <td>
              <Progress percent={5} />
            </td>
            <td>
              <Checkbox />
            </td>
          </tr>
        </table>
      </StatsPanel>

    </Stack>
  )
}