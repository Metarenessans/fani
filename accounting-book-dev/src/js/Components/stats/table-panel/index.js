import React, { useContext } from "react";
import { Button, DatePicker } from "antd";
import locale from "antd/es/date-picker/locale/ru_RU";
import moment from "moment";
import { cloneDeep, isEqual, range } from "lodash";
import Value        from "../../../../../../common/components/value";
import formatNumber from "../../../../../../common/utils/format-number";
import "../../../Utils/days-in-month";
import Panel from "../../panel";

import { StateContext } from "../../../App";

import "./style.scss";

export default function TablePanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { month } = state;

  const data = context.slicedData;
  const date = new Date;
  const currentDateDay = date.getDate();
  const daysInMonth = date.daysInMonth();
  
  return (
    <Panel className="panel" >
      <div className="panel-table-wrapper">
        {data.map((day, index) => {
          const currentDay = day;
          const { deals } = day;
          const result = deals.reduce((acc, curr) => acc + curr.result, 0);

          // let realIndex = 0;
          // if (month == 1) {
          //   realIndex = index;
          // }
          // else {
          //   for (let i = 0; i < month - 1; i++) {
          //     realIndex = ranges[i][1] + 1;
          //   }
          //   realIndex += index;
          // }
          // index = realIndex;

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
                        data[month - 1][index].date = Number(moment);
                        if (Number(moment) === 0) {
                          data[month - 1][index].date = Date.now();
                        }

                        // TODO: удалить?
                          // правит подставление начала отсчёта unix в дату
                          // Number(moment) === 0 
                          //   ? Date.now() 
                          //   :
                          //     // введённая дата не может быть больше текущей даты
                          //     (Number(moment) > +new Date() ? Date.now() : Number(moment));
                        
                        // Получаем номер месяца первого элемента

                        // const m = new Date(context.slicedData[0].date).getMonth();
                        // const date = new Date(data[index].date);
                        // date.setMonth(m);
                        // data[index].date = +date;

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
          // ~~
          // Дизейблится, если кол-во строк (дней) в текущем месяце равно кол-ву дней в этом месяце
          disabled={data.length === new Date(cloneDeep(data).pop().date).daysInMonth()}
          onClick={e => {
            const data = cloneDeep(state.data);
            
            let day = cloneDeep(context.dayTemplate);
            // Обновляем дату
            day.date = Number(new Date());
            data[month - 1].push(day);

            context.setStateAsync({ data });
          }}
        >
          Добавить
        </Button>
        <Button
          className="panel__add-button custom-btn"
          disabled={data.length === 1}
          onClick={e => {
            const data = cloneDeep(state.data);
            data[month - 1].pop();
            context.setState({ data });
          }}
        >
          Удалить
        </Button>
      </div>
    </Panel>
  );
}