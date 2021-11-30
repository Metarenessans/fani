import React, { useContext } from "react";
import { flatten } from "lodash";

import Stack from "../../../../../common/components/stack";
import Value from "../../../../../common/components/value";
import formatNumber from "../../../../../common/utils/format-number";

import TablePanel   from "./table-panel";
import Panel        from "../panel";

import { StateContext } from "../../App";

import "./style.scss";

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
        <Panel className="stats-panel--indent" title="Генеральный анализ за этот месяц">
          {(() => {
            const data = context.slicedData;
            const incomeTotal = data.reduce((acc, day) => acc + day.income.reduce((acc, row) => acc + row.value, 0), 0);
            const expenseTotal = data.reduce((acc, day) => acc + day.expense.reduce((acc, row) => acc + row.value, 0), 0);
            const unnecessaryExpenses = data
              .reduce((acc, day) => 
                acc + day.expense
                  .filter(source => source.expenseTypeName == "Необязательные")
                  .reduce((acc, row) => acc + row.value, 0),
                0
              );
            return (
              <>
                <dl className="association-list">
                  <div>
                    <dt>Доходы</dt>
                    <dd>
                      <Value
                        value={incomeTotal}
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
                  <div className="income-line">
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
                        value={-expenseTotal}
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
                  <div className="payments-line">
                    <dt>Необязательные расходы</dt>
                    <dd>
                      <Value
                        value={-unnecessaryExpenses}
                        format={value => formatNumber(Math.floor(value))}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>Баланс</dt>
                    <dd>
                      <Value
                        value={incomeTotal - expenseTotal}
                        format={value => formatNumber(Math.floor(value))}
                      />
                    </dd>
                  </div>
                </dl>
                <p className="stats-additional">
                  Если Вы уберете необязательные расходы,<br />
                  Ваш баланс составит: {formatNumber(incomeTotal - expenseTotal + unnecessaryExpenses)} руб. (+{formatNumber(unnecessaryExpenses)} руб.)
                </p>
              </>
            );
          })()}
        </Panel>

        {/* Генеральный анализ за всё время */}
        <Panel className="stats-panel--indent" title="Генеральный анализ за всё время">
          {(() => {
            const data = flatten(state.data);
            const incomeTotal = data.reduce((acc, day) => acc + day.income.reduce((acc, row) => acc + row.value, 0), 0);
            const expenseTotal = data.reduce((acc, day) => acc + day.expense.reduce((acc, row) => acc + row.value, 0), 0);
            const unnecessaryExpenses = data
              .reduce((acc, day) =>
                acc + day.expense
                  .filter(source => source.expenseTypeName == "Необязательные")
                  .reduce((acc, row) => acc + row.value, 0),
                0
              );

            return (
              <>
                <dl className="association-list">
                  <div>
                    <dt>Доходы</dt>
                    <dd>
                      <Value
                        value={incomeTotal}
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
                  <div className="income-line">
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
                        value={-expenseTotal}
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
                  <div className="payments-line">
                    <dt>Необязательные расходы</dt>
                    <dd>
                      <Value
                        value={-unnecessaryExpenses}
                        format={value => formatNumber(Math.floor(value))}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>Баланс</dt>
                    <dd>
                      <Value
                        value={incomeTotal - expenseTotal}
                        format={value => formatNumber(Math.floor(value))}
                      />
                    </dd>
                  </div>
                </dl>
                <p className="stats-additional">
                  Если Вы уберете необязательные расходы,<br />
                  Ваш баланс составит: {formatNumber(incomeTotal - expenseTotal + unnecessaryExpenses)} руб. (+{formatNumber(unnecessaryExpenses)} руб.)
                </p>
              </>
            );
          })()}
        </Panel>
      </div>

    </Stack>
  );
}