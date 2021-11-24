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
import CrossButton from "../../../../common/components/cross-button"

import round from "../../../../common/utils/round"
import num2str from "../../../../common/utils/num2str"
import formatNumber from "../../../../common/utils/format-number"
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
      stats,
      title,
      numericKeys,
      multiplier,
    } = this.props;

    multiplier = multiplier ?? 1;

    const extraPeriodColumns = data.map(row => row.desirable).filter(val => !!val);

    const containerElement = React.createRef();

    return (
      <div className={clsx("dashboard", "dashboard--stats")} ref={containerElement}>

        <div className="dashboard-inner-wrap">
          {/* Перебор массива и рендеринг каждой отдельной строки */}
          {data.map((currentData, rowIndex) => {

            return (
              <div
                className={clsx(
                  "dashboard-inner",
                  rowIndex > 0 && "row-height-fix",
                  extraPeriodColumns && ("dashboard-inner-width-fix"),
                  rowIndex == data.length - 1 && "reset-height"
                )}
                key={rowIndex}
              >
                {/* col */}
                <div className="dashboard-col dashboard-col--tools">

                  {/* Выводится только в последней строке */}
                  <span className="dashboard-key dashboard-key-result">
                    {title}
                  </span>
                </div>
                {/* col */}

                {/* col */}
                <div className="dashboard-col ">

                  {/* Выводится только в последней строке */}
                  <span className="dashboard-key dashboard-key-result">
                    {formatNumber(data[0] * multiplier)}
                  </span>

                </div>
                {/* col */}

                {/* col */}
                <div className="dashboard-col">
                  {/* Выводится только в последней строке */}
                  <span className="dashboard-key dashboard-key-result">
                    {formatNumber(data[1] * multiplier)}
                  </span>
                </div>
                {/* col */}

                <div className={clsx(
                  "dashboard-extra-container",
                  "scroll-hide",
                  extraPeriodColumns && "fixed-width")}
                >
                  {(() => {
                    return (
                      numericKeys.map((numericKey, columnIndex) =>
                        <div className="dashboard-col">

                          {/* Выводится только в последней строке */}
                          <span className="dashboard-key dashboard-key-result">
                            {formatNumber(data[columnIndex + 2] * multiplier)}
                          </span>

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
                      <span className="dashboard-key dashboard-key-result">
                        {formatNumber(data[numericKeys.length + 2] * multiplier)}
                      </span>
                    </div>
                    {/* col */}

                    <div className="dashboard-extra-container scroll-hide">
                      {(() => {
                        {/* Перебор массива и рендеринг каждой отдельного стобца */ }
                        return (
                          numericKeys.map((numericKey, columnIndex) =>
                            <div className="dashboard-col">

                              <span className="dashboard-key dashboard-key-result">
                                {formatNumber(data[numericKeys.length + 2 + columnIndex] * multiplier)}
                              </span>

                            </div>
                          )
                        )
                      })()}
                    </div>
                  </div>
                )}

              </div>
            )
          }
          )}

        </div>

      </div>
    )
  }
}