import React, { useContext } from "react"
import { Button, DatePicker } from "antd"
import locale from "antd/es/date-picker/locale/ru_RU"
import moment from "moment"
import { cloneDeep } from "lodash"
import Value        from "../../../../../../common/components/value"
import round        from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"
import Panel from "../../panel"

import { StateContext } from "../../../App"

import "./style.scss"

export default function TablePanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { month } = state;
  const data = state.data.slice((month - 1) * 30, month * 30);
  return (
    <Panel className="table-panel" >
      <div className="table-panel-table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Дата</th>
              <th>Баланс</th>
              <th>Доходы</th>
              <th>Постоянные<br/> доходы</th>
              <th>Периодические<br/> доходы</th>
              <th>Расходы</th>
              <th>Важные<br/> расходы</th>
              <th>Необязательные<br/> расходы</th>
              <th></th>
            </tr>
            {data.map((day, index) => {
              index = index + (month - 1) * 30;
              const currentDay = day;
              const { deals } = day;
              const result = deals.reduce((acc, curr) => acc + curr.result, 0);
              return (
                <tr key={index}>
                  <td>
                    <DatePicker
                      locale={locale}
                      format="DD.MM.YYYY"
                      value={moment(day.date)}
                      onChange={(moment, formatted) => {
                        const data = cloneDeep(state.data);
                        data[index].date = Number(moment);
                        context.setState({ data })
                      }}
                    />
                  </td>
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
                  <td>
                    <Button
                      className="custom-btn custom-btn--edit"
                      onClick={() => {
                        context.lastSavedState = cloneDeep(state);
                        context.setState({
                          currentRowIndex: index,
                          step: 1
                        });
                      }}
                    >
                      Редактировать
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Button
        id="add-day-btn"
        className="table-panel__add-button custom-btn"
        onClick={async e => {
          const { month} = state;
          const data = cloneDeep(state.data);
          const day = cloneDeep(context.dayTemplate);
          // Обновляем дату
          let time = new Date();
          if (data[data.length - 1]) {
            time = new Date(data[data.length - 1]?.date + (24 * 3600 * 1000));
          }
          day.date = Number(time);
          data.push(day);
          await context.setStateAsync({ data });
          document.querySelector(".table-panel-table-wrapper").scrollTop = 99999;
          if (data.length > month * 30) {
            context.setState({ month: month + 1 });
          }
        }}
      >
        Добавить
      </Button>
    </Panel>
  )
}