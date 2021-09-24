import React from 'react'
import { Button, Tooltip, Select, Progress } from 'antd/es'

import {
  PlusOutlined,
  MinusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import NumericInput from "../../../../common/components/numeric-input"
import CrossButton  from "../../../../common/components/cross-button"

import round          from "../../../../common/utils/round"
import num2str from "../../../../common/utils/num2str"
import formatNumber   from "../../../../common/utils/format-number"
import clsx from 'clsx'

const { Option } = Select;

function onScroll() {
  if (innerWidth <= 768 || this.props.index > 0) {
    return;
  }

  const dashboardElement = document.querySelector(".dashboard");
  const dashboardElementStart = dashboardElement.getBoundingClientRect().top + window.scrollY;

  const firstRowElement = dashboardElement.querySelector(".dashboard-row:first-child");
  if (!firstRowElement) {
    return;
  }
  const headerElements = firstRowElement.querySelectorAll(".dashboard-key");

  if (pageYOffset > dashboardElementStart) {
    if (this.state.tooltipPlacement == "top") {
      this.setState({ tooltipPlacement: "bottom" })
    }
  }
  else {
    if (this.state.tooltipPlacement == "bottom") {
      this.setState({ tooltipPlacement: "top" });
    }
  }
}

export default class Stats extends React.Component {
  constructor(props) {
    super(props);
  }

  onScrollCb() {
    onScroll.call(this);
  }

  render() {
    let {
      data,
      onChange,
      onAddRow,
      onRemoveRow,
      onAddColumn,
      onRemoveColumn,
      firstTitle,
      secondTitle,
      rowButton,
      rowModifyButtons,
      extraPeriodColumns,
      stats,
    } = this.props;
    onChange = onChange || (() => console.log("Oh nein cringe"));

    const containerElement = React.createRef();

    return (
      <div className={clsx("dashboard", "dashboard--stats")} ref={containerElement}>
        
        <div className="dashboard-inner-wrap">
          {/* Перебор массива и рендеринг каждой отдельной строки */}
          {data.map((currentData, rowIndex) => 
            <div 
              className={clsx(
                "dashboard-inner",
                rowIndex > 0 ? "row-height-fix" : "",
                extraPeriodColumns && ( "dashboard-inner-width-fix")
              )}
              key={rowIndex}
            >
              {/* col */}
              <div className="dashboard-col dashboard-col--tools">
                
                {/* Выводится только в последней строке */}
                {true && (
                  <span className="dashboard-key dashboard-key-result">
                    Баланс на конец года:
                  </span>
                )}
              </div>
              {/* col */}

              {/* col */}
              <div className="dashboard-col ">
                
                {/* Выводится только в последней строке */}
                {true && (
                  <span className="dashboard-key dashboard-key-result">
                    {formatNumber(data.map(row => row.now).reduce((acc, curr) => acc + curr, 0))}
                  </span>
                )}

              </div>
              {/* col */}

              {/* Проходимся в цикле по всем числовым ключам */}
              {/* {data.} */}

              {/* col */}
              <div className="dashboard-col">

                {/* Выводится только в последней строке */}
                {true && (
                  <span className="dashboard-key dashboard-key-result">
                    {formatNumber(data.map(row => row[1]).reduce((acc, curr) => acc + curr, 0))}
                  </span>
                )}
              </div>
              {/* col */}

              <div 
                className={clsx("dashboard-extra-container", "scroll-hide", extraPeriodColumns && "fixed-width")}
                onScroll={e => {
                  const scrollLeft = e.target.scrollLeft;
                  const rows = [...document.querySelectorAll(".dashboard-extra-container")].map(element => {
                    element.scrollLeft = scrollLeft;
                  });
                }}
              >
                {(() => {
                  const numericKeys = Object.keys(currentData)
                    .map(key => !isNaN(+key) && key)
                    .filter(value => !!value)
                    .slice(1);
                  
                  return (
                    numericKeys.map((numericKey, columnIndex) =>
                      <div className="dashboard-col">

                        {/* Выводится только в последней строке */}
                        {true && (
                          <span className="dashboard-key dashboard-key-result">
                            {formatNumber(data.map(row => row[numericKey]).reduce((acc, curr) => acc + curr, 0))}
                          </span>
                        )}

                      </div>
                    )
                  )
                })()}
              </div>

              {/* extra extra container */}
              {extraPeriodColumns && (
                <div className="dashboard-extra-extra-container">
                  {/* col */}
                  <div className="dashboard-col">

                    <span
                      className="dashboard-key dashboard-key-result"
                      hidden={rowIndex !== data.length - 1}
                    >
                      {3_000_00}
                    </span>
                  </div>
                  {/* col */}

                  <div
                    className="dashboard-extra-container scroll-hide"
                    onScroll={e => {
                      const scrollLeft = e.target.scrollLeft;
                      const rows = [...document.querySelectorAll(".dashboard-extra-container")].map(element => {
                        element.scrollLeft = scrollLeft;
                      });
                    }}
                  >
                    {(() => {
                      {/* Перебор массива и рендеринг каждой отдельного стобца */ }
                      let years = [3, 5, 10].concat(
                        new Array(10).fill().map((number, index) => 10 + ((index + 1) * 5))
                      )
                      let { rowModifyButtons } = this.props
                      
                      const numericKeys = Object.keys(currentData)
                        .map(key => !isNaN(+key) && key)
                        .filter(value => !!value)
                        .slice(1);

                      return (
                        numericKeys.map((numericKey, columnIndex) =>
                          <div className="dashboard-col">

                            <span
                              className="dashboard-key dashboard-key-result"
                              hidden={rowIndex !== data.length - 1}
                            >
                              {3_000_00}
                            </span>

                          </div>
                        )
                      )
                    })()}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
   
      </div>
    )
  }
}
