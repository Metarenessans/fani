import React, { useContext } from "react"
import { Checkbox, Progress } from "antd"
import { mean as average } from "lodash"

import Stack from "../../../../../common/components/stack"
import Value from "../../../../../common/components/value"
import round from "../../../../../common/utils/round"
import formatNumber from "../../../../../common/utils/format-number"

import TablePanel   from "./table-panel"
import Panel        from "../panel"

import { StateContext } from "../../App"

import "./style.scss"


export default function Stats() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, month } = state;
  return (
    <Stack className="stats" space="2em">

      {/* Пошаговый план проработки */}
      <TablePanel />

      <div className="stats-container">
        {/* Генеральный анализ за этот месяц */}
        <Panel title="Генеральный анализ за этот месяц">
          {(() => {
            const data = state.data.slice((month - 1) * 30, month * 30 - 1);
            return (
              <dl className="association-list">
                <div>
                  <dt>Доходы</dt>
                  <dd>
                    <Value
                      value={
                        data.reduce((acc, day) => acc + day.income.reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Постоянные доходы</dt>
                  <dd>
                    <Value
                      value={
                        data.reduce((acc, day) => acc + day.income.filter(source => source.incomeTypeName == "Постоянные").reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Периодические доходы</dt>
                  <dd>
                    <Value
                      value={
                        data.reduce((acc, day) => acc + day.income.filter(source => source.incomeTypeName == "Периодические").reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Расходы</dt>
                  <dd>
                    <Value
                      value={
                        -data.reduce((acc, day) => acc + day.expense.reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Важные расходы</dt>
                  <dd>
                    <Value
                      value={
                        -data.reduce((acc, day) => acc + day.expense.filter(source => source.expenseTypeName == "Важные").reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Необязательные расходы</dt>
                  <dd>
                    <Value
                      value={
                        -data.reduce((acc, day) => acc + day.expense.filter(source => source.expenseTypeName == "Необязательные").reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Баланс</dt>
                  <dd>
                    <Value
                      value={
                        data.reduce((acc, day) => acc + day.income.reduce((acc, row) => acc + row.value, 0), 0)
                        -
                        data.reduce((acc, day) => acc + day.expense.reduce((acc, row) => acc + row.value, 0), 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </dd>
                </div>
              </dl>
            )
          })()}
        </Panel>

        {/* Генеральный анализ за всё время */}
        <Panel title="Генеральный анализ за всё время">
          <dl className="association-list">
            <div>
              <dt>Доходы</dt>
              <dd>
                <Value
                  value={
                    data.reduce((acc, day) => acc + day.income.reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
            <div>
              <dt>Постоянные доходы</dt>
              <dd>
                <Value
                  value={
                    data.reduce((acc, day) => acc + day.income.filter(source => source.incomeTypeName == "Постоянные").reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
            <div>
              <dt>Периодические доходы</dt>
              <dd>
                <Value
                  value={
                    data.reduce((acc, day) => acc + day.income.filter(source => source.incomeTypeName == "Периодические").reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
            <div>
              <dt>Расходы</dt>
              <dd>
                <Value
                  value={
                    -data.reduce((acc, day) => acc + day.expense.reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
            <div>
              <dt>Важные расходы</dt>
              <dd>
                <Value
                  value={
                    -data.reduce((acc, day) => acc + day.expense.filter(source => source.expenseTypeName == "Важные").reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
            <div>
              <dt>Необязательные расходы</dt>
              <dd>
                <Value
                  value={
                    -data.reduce((acc, day) => acc + day.expense.filter(source => source.expenseTypeName == "Необязательные").reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
            <div>
              <dt>Баланс</dt>
              <dd>
                <Value
                  value={
                    data.reduce((acc, day) => acc + day.income.reduce((acc, row) => acc + row.value, 0), 0)
                    -
                    data.reduce((acc, day) => acc + day.expense.reduce((acc, row) => acc + row.value, 0), 0)
                  }
                  format={value => formatNumber(Math.floor(value))}
                />
              </dd>
            </div>
          </dl>
        </Panel>

      </div>

    </Stack>
  )
}