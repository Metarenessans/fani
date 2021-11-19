import React, { useContext } from "react"
import { Checkbox, Progress } from "antd"
import { mean as average } from "lodash"

import Stack from "../../../../../common/components/stack"
import Value from "../../../../../common/components/value"
import round from "../../../../../common/utils/round"

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

      {/* Пошаговый план проработки */}
      <TablePanel />

      <div className="stats-container">
        {/* Генеральный анализ за этот месяц */}
        <StatsPanel title="Генеральный анализ за этот месяц">
          <dl className="association-list">
            <div>
              <dt>Доходы</dt>
              <dd>{<Value value={11_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
            <div>
              <dt>Постоянные доходы</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
            <div>
              <dt>Периодические доходы</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
            <div>
              <dt>Расходы</dt>
              <dd>{<Value value={-6_000} format={value => formatNumber(round(-value, 2))} />}</dd>
            </div>
            <div>
              <dt>Важные расходы</dt>
              <dd>{<Value value={-6_000} format={value => formatNumber(round(-value, 2))} />}</dd>
            </div>
            <div>
              <dt>Необязательные расходы</dt>
              <dd>{<Value value={-6_000} format={value => formatNumber(round(-value, 2))} />}</dd>
            </div>
            <div>
              <dt>Баланс</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
          </dl>
        </StatsPanel>

        {/* Генеральный анализ за всё время */}
        <StatsPanel title="Генеральный анализ за всё время">
          <dl className="association-list">
            <div>
              <dt>Доходы</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
            <div>
              <dt>Постоянные доходы</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
            <div>
              <dt>Периодические доходы</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
            <div>
              <dt>Расходы</dt>
              <dd>{<Value value={-6_000} format={value => formatNumber(round(-value, 2))} />}</dd>
            </div>
            <div>
              <dt>Важные расходы</dt>
              <dd>{<Value value={-6_000} format={value => formatNumber(round(-value, 2))} />}</dd>
            </div>
            <div>
              <dt>Необязательные расходы</dt>
              <dd>{<Value value={-6_000} format={value => formatNumber(round(-value, 2))} />}</dd>
            </div>
            <div>
              <dt>Баланс</dt>
              <dd>{<Value value={6_000} format={value => formatNumber(round(value, 2))} />}</dd>
            </div>
          </dl>
        </StatsPanel>

      </div>

    </Stack>
  )
}