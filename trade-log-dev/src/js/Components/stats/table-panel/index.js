import React, { useContext } from "react"
import { Button } from "antd"
import { cloneDeep } from "lodash"
import round from "../../../../../../common/utils/round"
import StatsPanel from "../../panel"
import formatUnitTime from "./format-unix-time"

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
              /** КОД */
              const averageResult = result / deals.length;
              return (
                <tr key={index}>
                  <td>{formatUnitTime(day.date)}</td>
                  <td>{index + 1}</td>
                  <td>{result}%</td>
                  {/* ~~ Преобразует NaN в 0 */}
                  <td>{~~(averageResult / state.dailyRate) * 100}%</td>
                  <td>{round(averageResult, 1)}%</td>
                  <td>
                    <Button
                      className="custom-btn"
                      onClick={async () => {
                        // TODO: Заменить на вызов какой-нибудь `openConfig()`
                        await context.setStateAsync({ currentRowIndex: index, step: 1 });
                        // TODO: убрать лишнее
                        document.querySelector(".trade-slider").classList.add("trade-slider-active");
                        document.querySelector(".dashboard").classList.add("dashboard-active");
                        setCurrentRowIndex(index);
                        scrollTop();
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