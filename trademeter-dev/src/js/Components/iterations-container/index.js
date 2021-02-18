import React from 'react'

import { Popover } from "antd/es"
import { ClockCircleFilled } from "@ant-design/icons"

import formatNumber from "../../../../../common/utils/format-number"
import round        from "../../../../../common/utils/round"

import Iteration from "../../utils/iteration"
import isEqual   from "../../utils/is-equal"

import CrossButton     from "../../../../../common/components/cross-button"
import NumericInput    from "../../../../../common/components/numeric-input"
import TimeRangePicker from "../time-range-picker"

import './style.scss'

const focusLastInputIn = node => {
  if (node != null) {
    let arr = node.querySelectorAll("input");
    let lastElement = arr[arr.length - 1]
    lastElement.focus();
  }
}

export default class IterationsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {};
  }

  //TODO: нужна передача конкретного дня, а не даты
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  componentDidMount() {
    const { data, currentDay } = this.props;
    if (data[currentDay - 1].expanded) {
      const list = document.querySelector(".iterations-list");
      list.scrollTop = 9999;
    }
  }

  componentDidUpdate(prevProps) {
    const { expanded, currentDay, data} = this.props;

    if (expanded != prevProps.expanded || currentDay != prevProps.currentDay) {
      const list = document.querySelector(".iterations-list");
      list.scrollTop = 9999;
    }

    if (expanded != prevProps.expanded && expanded && !data[currentDay - 1].changed) {
      focusLastInputIn(this.myRef.current);
    }
  }

  render() {
    const { data, currentDay, placeholder, callback} = this.props;

    const onChange = (iterations = [], shouldFocusLastElement = true, scrolling = true) => {
      const filteredIterations = iterations.filter(it => !it.empty);

      const { depoStart } = data[currentDay - 1];

      let rate;
      let income;
      if (filteredIterations.length > 0) {
        rate = filteredIterations
          .map(it => it.rate)
          .reduce((prev, curr) => prev + curr);

        income = filteredIterations
          .map(it => it.getIncome(depoStart))
          .reduce((prev, curr) => prev + curr);
      }

      data[currentDay - 1].rate = rate;
      data[currentDay - 1].income = income;
      data[currentDay - 1].iterations = iterations;

      data[currentDay - 1].changed = data[currentDay - 1].isChanged;

      callback(data, () => {
        if (shouldFocusLastElement) {
         focusLastInputIn(this.myRef.current);
        }

        if (scrolling) {
          const list = document.querySelector(".iterations-list");
          list.scrollTop = 9999;
        }
      })
    };

    let { iterations, calculatedRate, depoStart, changed } = data[currentDay - 1];
    let iterationsToRender = iterations.map(it => it.copy());
    if (iterationsToRender.length == 0) {
      iterationsToRender = [new Iteration(calculatedRate)];
    }

    return (
      <>
        <div
          className="iterations"
          ref={this.myRef}
          key={currentDay}
        >
          <ol className="iterations-list">
            {
              // ▲
              iterationsToRender && iterationsToRender
                .map((currentIteration, index) => {
                  let rate = currentIteration.getRate(depoStart);
                  if (!changed || rate == null || isNaN(rate)) {
                    rate = "";
                  }

                  let income = currentIteration.getIncome(depoStart);
                  if (!changed || income == null || isNaN(income)) {
                    income = "";
                  }

                  return (
                    <li 
                      className="iterations-list-item"
                      key={index}
                    >
                      <span className="iterations-list-item__number">
                        {index + 1}
                      </span>

                      <NumericInput
                        key={Math.random()}
                        className="iterations-list-item__input"
                        defaultValue={income}
                        placeholder={placeholder}
                        format={formatNumber}
                        round="true"
                        onChange={(e, val, jsx) => {
                          const {payment, payload } = data[currentDay - 1]
                          let errMsg = "";
                          // массив из значений инпутов итераций
                          let ArrayValue = iterations.map((value) => { return value.getIncome(depoStart) })
                          // замяем значение под текущим индексом на актуальное 
                          ArrayValue[index] = Number(val)
                          // суммируем все значения итераций
                          let iterationsSum = ArrayValue
                            .filter((value) => !isNaN(value))
                            .reduce((acc, curr) => acc + curr, 0)

                          if ( ((Math.round(depoStart) - (payment || 0) + (payload || 0)) * 0.95) + iterationsSum <= 0 ) {
                            errMsg = "максимальный убыток -95%";
                          }

                          jsx.setState({ errMsg });
                        }}

                        onBlur={(val, textValue) => {
                          
                          if (!iterations[index]) {
                            iterations[index] = new Iteration();
                          }

                          let shouldFocusLastElement = false;
                          let scrolling = false;
                          let lastIteration = iterations[iterations.length - 1];
                          let shouldCreateNewIteration = false;
                          let percent;
                          
                          const { payment, payload } = data[currentDay - 1]
                          // массив из значений инпутов итераций
                          let ArrayValue = iterations.map((value) => { return value.getIncome(depoStart) })
                          // замяем значение под текущим индексом на 0
                          ArrayValue[index] = 0;
                          // суммируем все значения итераций
                          let iterationsSumWithoutCurrent = ArrayValue
                          .filter((value) => !isNaN(value))
                          .reduce((acc, curr) => acc + curr, 0);
                          
                          // Сумма итераций с текущим
                          const iterationsSumWithCurrent = iterationsSumWithoutCurrent + Number(val);
                          
                          //Депо для слива
                          const minDepo = (Math.round(depoStart) - (payment || 0) + (payload || 0)) * 0.95;
                          
                          if (minDepo + iterationsSumWithCurrent <= 0) {
                            val = -(minDepo + iterationsSumWithoutCurrent);
                          }
                          console.log(val);
                          
                          // Инпут не пустой
                          if (textValue !== "") {
                            percent = val / data[currentDay - 1].depoStartTest * 100;

                            // Больше одной сторок
                            if (iterations.length > 1) {
                              shouldFocusLastElement = true;
                            }

                            // Последняя строка
                            if (index == iterations.length - 1) {
                              shouldCreateNewIteration = true;
                              shouldFocusLastElement = true;
                            }
                            else {
                              shouldFocusLastElement = false;
                            }
                          }
                          
                          if (index < iterations.length - 1 && lastIteration.empty) {
                            shouldFocusLastElement = false;
                            shouldCreateNewIteration = false;
                          }

                          if (shouldCreateNewIteration) {
                            iterations.push(new Iteration());
                          }

                          iterations[index].income = null;
                          iterations[index].percent = percent;
                          onChange(iterations, shouldFocusLastElement, scrolling);
                        }}
                      />
                      <span className="iterations-list-item__separator">~</span>
                      <span className="iterations-list-item__input iterations-list-item__input--unstyled">
                        {
                          formatNumber(round(rate, 3)) + "%"
                        }
                      </span>

                      <Popover
                        content={
                          <TimeRangePicker
                            startTime={currentIteration.startTime}
                            endTime={currentIteration.endTime}
                            onChange={(startTime, endTime) => {
                              if (!iterations[index]) {
                                iterations[index] = new Iteration();
                              }
    
                              if (!isNaN(startTime)) {
                                iterations[index].startTime = startTime;
                              }
                              if (!isNaN(endTime)) {
                                iterations[index].endTime = endTime;
                              }
    
                              data[currentDay - 1].iterations = iterations;
                              this.setState({ data });
                            }}
                          />
                        }
                        trigger="click"
                        placement="left"
                        destroyTooltipOnHide={true}
                      >
                      <div className="iterations-list-item__clock">
                        {(() => {
                          let h = 0;
                          let m = 0;
                          let text = "";

                          let { period } = currentIteration;
                          if (!isNaN(period) && period != 0) {
                            const date = new Date(period);
                            m = date.getUTCMinutes();
                            text += `${m}м`;

                            h = date.getUTCHours();
                            if (h != 0) {
                              text = `${h}ч ` + text;
                            }
                          }

                          return (
                            <>
                              {text == ""
                                ? <ClockCircleFilled />
                                : <span className="iterations-list-item__clock-time">{text}</span>
                              }
                            </>
                          )
                        })()}
                      </div>
                      </Popover>
    
                      {index > 0 && (
                        <CrossButton
                          className="iterations-list-item__delete"
                          onClick={() => {
                            const { iterations } = data[currentDay - 1];
                            iterations.splice(index, 1);
                            onChange(iterations, false, false);
                          }}
                        />
                      )}
                    </li>
                  )
                })
            }
          </ol>
          <button
            className="iterations-button"
            onClick={() => {
              if (iterations.length == 0) {
                iterations = [new Iteration(
                  data[currentDay - 1].isChanged
                    ? calculatedRate
                    : null
                  )];
                }
              iterations.push(new Iteration());
              onChange(iterations);
            }}
          
          >
            Добавить
          <span className="visually-hidden">итерацию</span>

          </button>
        </div>
      </>
    );
  }
}