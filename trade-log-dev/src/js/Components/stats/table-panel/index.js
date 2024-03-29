import React, { useContext, useState, useEffect } from "react";
import { Button, DatePicker } from "antd";
import locale from "antd/es/date-picker/locale/ru_RU";
import { EditOutlined, CalendarOutlined } from "@ant-design/icons";
import moment from "moment";
import { cloneDeep } from "lodash";
import Value        from "../../../../../../common/components/value";
import round        from "../../../../../../common/utils/round";
import formatNumber from "../../../../../../common/utils/format-number";
import StatsPanel from "../../panel";

import { StateContext } from "../../../App";

import "./style.scss";
import TrademeterSync from "../../trademeter-sync";

function useViewportWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return width;
}

export default function TablePanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { loading, syncedWithTrademeter } = state;

  const viewportWidth = useViewportWidth();

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
                      disabled={loading}
                      locale={locale}
                      format="DD.MM.YYYY"
                      value={moment(day.date)}
                      allowClear={viewportWidth > 768}
                      placeholder={viewportWidth <= 768 ? "" : null}
                      onChange={(moment, formatted) => {
                        const data = cloneDeep(state.data);
                        // При сбросе значения ставим текущую дату
                        data[index].date = Number(moment) === 0 ? Date.now() : Number(moment);
                        context.setState({ data });
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
                      format={value => formatNumber(round(value, 1)) + "%"}
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
                      disabled={loading}
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
                      {viewportWidth > 768 ? "Редактировать" : <EditOutlined />}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button
        disabled={loading || syncedWithTrademeter}
        className="table-panel__add-button custom-btn"
        onClick={async e => {
          const data = state.data;
          const day = cloneDeep(context.dayTemplate);
          // Добавляем все кастомные технологии
          // Если есть хотя бы один день, то можно брать его кастомные технологии
          if (data.length > 0) {
            day.customTechnology = cloneDeep(data[data.length - 1].customTechnology);
          }
          // Обновляем дату
          day.date = Number(new Date());
          data.push(day);
          await context.setStateAsync({ data });
          document.querySelector(".table-panel-table-wrapper").scrollTop = 99999;
        }}
      >
        Добавить день
      </Button>
      <TrademeterSync />
    </StatsPanel>
  );
}