import React from "react"
import { Checkbox, Progress } from "antd"

import Stack from "../../../../../common/components/stack"

import ControlPanel from "./control-panel"
import TablePanel   from "./table-panel"
import StatsPanel   from "../panel"

import "./style.scss"

export default function Stats() {
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
              <dd>50</dd>
            </div>
            <div>
              <dt>Сделок</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Общий результат</dt>
              <dd>0%</dd>
            </div>
            <div>
              <dt>Позиций Long</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Позиций Short</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Положительных сделок</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Отрицательных сделок</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Средняя положительная сделка</dt>
              <dd>0%</dd>
            </div>
            <div>
              <dt>Средняя отрицательная сделка</dt>
              <dd>0%</dd>
            </div>
          </dl>
        </StatsPanel>

        {/* Генеральный анализ состояния */}
        <StatsPanel title="Генеральный анализ состояния">
          <dl className="association-list">
            <div>
              <dt>Нормальных состояний</dt>
              <dd>50%</dd>
            </div>
            <div>
              <dt>Искаженных состояний</dt>
              <dd>0%</dd>
            </div>
            <div>
              <dt>Нормальных драйверов</dt>
              <dd>0%</dd>
            </div>
            <div>
              <dt>Искаженных драйверов</dt>
              <dd>0</dd>
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