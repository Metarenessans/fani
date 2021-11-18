import React, { useContext } from "react"
import { Button, DatePicker } from "antd"
import locale from "antd/es/date-picker/locale/ru_RU"
import moment from "moment"
import { cloneDeep } from "lodash"
import Value from "../../../../../../common/components/value"
import round from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"
import StatsPanel from "../../panel"

import { StateContext } from "../../../App"

import "./style.scss"

export default function BalanceTable() {
  const context = useContext(StateContext);
  const { state } = context;
  return (
    <StatsPanel className="balance-table" title="Баланс">
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
                      value={29_000}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={31_000}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={30_000}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={1_000}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={-2_000}
                      format={value => formatNumber(Math.floor(-value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={-1_000}
                      format={value => formatNumber(Math.floor(-value))}
                    />
                  </td>
                  <td>
                    <Value
                      value={-1_000}
                      format={value => formatNumber(Math.floor(-value))}
                    />
                  </td>
                </tr>
              )
            })()}
          </tbody>
        </table>
      </div>
    </StatsPanel>
  )
}