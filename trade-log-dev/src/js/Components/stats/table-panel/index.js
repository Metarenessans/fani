import React, { useContext } from "react"
import { Button } from "antd"
import { cloneDeep } from "lodash"
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
          <tr>
            <th>Дата</th>
            <th>День</th>
            <th>Результат</th>
            <th>Выполнение плана</th>
            <th>КОД</th>
            <th></th>
          </tr>
          {state.data.map((day, index) =>
            <tr key={index}>
              <td>10.10.2021</td>
              <td>{index + 1}</td>
              <td>0.38%</td>
              <td>76%</td>
              <td>0.095%</td>
              <td>
                <Button 
                  className="custom-btn" 
                  onClick={async () =>  {
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
          )}
        </table>
      </div>
      <Button 
        className="table-panel__add-button custom-btn"
        onClick={async e => {
          const data = cloneDeep(state.data);
          data.push(cloneDeep(context.dayTemplate));
          await context.setStateAsync({ data });
          document.querySelector(".table-panel-table-wrapper").scrollTop = 99999;
        }}
      >
        Добавить
      </Button>
    </StatsPanel>
  )
}