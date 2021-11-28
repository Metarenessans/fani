import React, { useContext } from "react";

import Value from "../../../../../../common/components/value";
import formatNumber from "../../../../../../common/utils/format-number";

import Panel from "../../panel";

import { StateContext } from "../../../App";

import "./style.scss";

export default function BalanceTable() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const currentDay = data[currentRowIndex];
  return (
    <Panel className="balance-table" title={`Баланс - день ${currentRowIndex + 1}`}>
      <div className="balance-table-wrapper">
        <div className="balance-table-row">
          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key income">
              Доходы
            </div>
            <div className="balance-table-value">
              <Value
                value={currentDay.income
                  .reduce((acc, row) => acc + row.value, 0)
                }
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}

          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key income">
              Постоянные<br/> доходы
            </div>
            <div className="balance-table-value">
              <Value
                value={currentDay.income
                  .filter(source => source.incomeTypeName == "Постоянные")
                  .reduce((acc, row) => acc + row.value, 0)
                }
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}

          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key income">
              Периодические<br/> доходы
            </div>
            <div className="balance-table-value">
              <Value
                value={currentDay.income
                  .filter(source => source.incomeTypeName == "Периодические")
                  .reduce((acc, row) => acc + row.value, 0)
                }
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}

          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key payments">
              Расходы
            </div>
            <div className="balance-table-value">
              <Value
                value={-currentDay.expense.reduce((acc, row) => acc + row.value, 0)}
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}

          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key payments">
              Важные<br/> расходы
            </div>
            <div className="balance-table-value">
              <Value
                value={-currentDay.expense
                  .filter(source => source.expenseTypeName == "Важные")
                  .reduce((acc, row) => acc + row.value, 0)
                }
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}

          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key payments">
              Необязательные<br/> расходы
            </div>
            <div className="balance-table-value">
              <Value
                value={-currentDay.expense
                  .filter(source => source.expenseTypeName == "Необязательные")
                  .reduce((acc, row) => acc + row.value, 0)
                }
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}

          {/* col */}
          <div className="balance-table-col">
            <div className="balance-table-key balance">
              Баланс
            </div>
            <div className="balance-table-value">
              <Value
                value={
                  currentDay.income.reduce((acc, row) => acc + row.value, 0)
                  -
                  currentDay.expense.reduce((acc, row) => acc + row.value, 0)
                }
                format={value => formatNumber(Math.floor(value))}
              />
            </div>
          </div>
          {/* col */}
        </div>
      </div>
    </Panel>
  );
}