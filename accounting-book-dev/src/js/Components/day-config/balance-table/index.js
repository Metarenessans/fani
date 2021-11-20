import React, { useContext } from "react"
import { Button, DatePicker } from "antd"
import locale from "antd/es/date-picker/locale/ru_RU"
import moment from "moment"
import { cloneDeep } from "lodash"
import Value from "../../../../../../common/components/value"
import round from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"
import Panel from "../../panel"

import { StateContext } from "../../../App"

import "./style.scss"

export default function BalanceTable() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const currentDay = data[currentRowIndex];
  return (
    <Panel className="balance-table" title={`Баланс (день ${currentRowIndex + 1})`}>
      <div className="balance-table-table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Баланс</th>
              <th>Доходы</th>
              <th>Постоянные<br /> доходы</th>
              <th>Периодические<br /> доходы</th>
              <th>Расходы</th>
              <th>Важные<br /> расходы</th>
              <th>Необязательные<br /> расходы</th>
            </tr>
            {(() => {
              return (
                <tr>
                  <td>
                    <Value
                      value={
                        currentDay.income.reduce((acc, row) => acc + row.value, 0)
                        -
                        currentDay.expense.reduce((acc, row) => acc + row.value, 0)
                      }
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={currentDay.income.reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={currentDay.income.filter(source => source.incomeTypeName == "Постоянные").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={currentDay.income.filter(source => source.incomeTypeName == "Периодические").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={-currentDay.expense.reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={-currentDay.expense.filter(source => source.expenseTypeName == "Важные").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={-currentDay.expense.filter(source => source.expenseTypeName == "Необязательные").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                </tr>
              )
            })()}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}