import React, { useContext } from "react";
import { Button, DatePicker } from "antd";
import locale from "antd/es/date-picker/locale/ru_RU";
import moment from "moment";
import { cloneDeep } from "lodash";
import Value        from "../../../../../../common/components/value";
import formatNumber from "../../../../../../common/utils/format-number";
import Panel from "../../panel";

import { StateContext } from "../../../App";

import "./style.scss";

export default function TablePanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { month } = state;
  const data = state.data.slice((month - 1) * 30, month * 30);
  return (
    <Panel className="panel" >
      <div className="panel-table-wrapper">
        {data.map((day, index) => {
          index = index + (month - 1) * 30;
          const currentDay = day;
          const { deals } = day;
          const result = deals.reduce((acc, curr) => acc + curr.result, 0);
          return (
            <>
              <div className="panel-table-row">
                
                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key">
                    Дата
                  </div>
                  <div className="panel-table-value">
                    <DatePicker
                      locale={locale}
                      format="DD.MM.YYYY"
                      value={moment(day.date)}
                      onChange={(moment, formatted) => {
                        const data = cloneDeep(state.data);
                        data[index].date = Number(moment) === 0 ? Number(Date.now()) : Number(moment);
                        context.setState({ data });
                      }}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key income">
                    Доходы
                  </div>
                  <div className="panel-table-value">
                    <Value
                      value={currentDay.income.reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key income">
                    Постоянные<br/> доходы
                  </div>
                  <div className="panel-table-value">
                    <Value
                      value={currentDay.income.filter(source => source.incomeTypeName == "Постоянные").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key income">
                    Периодические<br/> доходы
                  </div>
                  <div className="panel-table-value">
                    <Value
                      value={currentDay.income.filter(source => source.incomeTypeName == "Периодические").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key payments">
                    Расходы
                  </div>
                  <div className="panel-table-value">
                    <Value
                      value={-currentDay.expense.reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key payments">
                    Важные<br/> расходы
                  </div>
                  <div className="panel-table-value">
                    <Value
                      value={-currentDay.expense.filter(source => source.expenseTypeName == "Важные").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key payments">
                    Необязательные<br/> расходы
                  </div>
                  <div className="panel-table-value">
                    <Value
                      value={-currentDay.expense.filter(source => source.expenseTypeName == "Необязательные").reduce((acc, row) => acc + row.value, 0)}
                      format={value => formatNumber(Math.floor(value))}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key balance">
                    Баланс
                  </div>
                  <div className="panel-table-value">
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

                {/* col */}
                <div className="panel-table-col">
                  <div className="panel-table-key expense-table-key-space">
                  </div>
                  <div className="panel-table-value">
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
                  </div>
                </div>
                {/* col */}
              </div>
            </>
          );
        })}
      </div>

      <div className="buttons-container">
        <Button
          id="add-day-btn"
          className="panel__add-button custom-btn"
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
        <Button
          className="panel__add-button custom-btn"
          disabled={state.data.length === 1}
          onClick={e => {
            const data = cloneDeep(state.data);
            data.pop();
            context.setState({ data });
          }}
        >
          Удалить
        </Button>
      </div>
    </Panel>
  );
}