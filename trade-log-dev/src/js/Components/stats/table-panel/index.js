import React, { useContext } from "react"
import { Button, DatePicker } from "antd"
import locale from "antd/es/date-picker/locale/ru_RU"
import moment from "moment"
import { cloneDeep } from "lodash"
import Value        from "../../../../../../common/components/value"
import round        from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"
import StatsPanel from "../../panel"

import { StateContext } from "../../../App"

import "./style.scss"

export default function TablePanel() {
  const context = useContext(StateContext);
  const { state } = context;
  return (
    <StatsPanel className="table-panel" title="Пошаговый план проработки">
      <div className="table-panel-table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Дата</th>
              <th>День</th>
              <th>Результат</th>
              <th>Выполнение плана</th>
              <th>КОД</th>
              <th></th>
            </tr>
            {state.data.map((day, index) => {
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
                        data[index].date = Number(moment) === 0 ? Number(Date.now()) : Number(moment);
                        context.setState({ data })
                      }}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <Value
                      value={result}
                      format={value => formatNumber(round(value, 3)) + "%"}
                    />
                  </td>
                  <td>
                    <Value
                      value={(result / state.dailyRate) * 100}
                      format={value => formatNumber(round(value, 3)) + "%"}
                    />
                  </td>
                  <td>
                    <Value
                      value={result / deals.length}
                      format={value => formatNumber(round(value, 1)) + "%"}
                    />
                  </td>
                  <td>
                    <Button
                      className="custom-btn"
                      onClick={() => {
                        // TODO: Заменить на вызов какой-нибудь `openConfig()`
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
        className="table-panel__add-button custom-btn"
        onClick={async e => {
          const data = cloneDeep(state.data);
          const day = cloneDeep(context.dayTemplate);
          // Обновляем дату
          day.date = Number(new Date());
          data.push(day);
          await context.setStateAsync({ data });
          document.querySelector(".table-panel-table-wrapper").scrollTop = 99999;
        }}
      >
        Добавить
      </Button>
    </StatsPanel>
  )
}