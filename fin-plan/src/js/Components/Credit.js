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

export default class DashboardRow extends React.Component {
  constructor(props) {
    super(props);

    this.onScrollCb = this.onScrollCb.bind(this);
  }

  onScrollCb() {
    onScroll.call(this);
  }

  componentDidMount() {
    // addEventListener("scroll", this.onScrollCb);
  }

  componentDidUpdate() {
    // onScroll.call(this);
  }

  componentWillUnmount() {
    // addEventListener("scroll", this.onScrollCb);
  }

  render() {
    let {
      data,
      options,
      onChange,
      onExtraChange,
      onAddRow,
      onRemoveRow,
      onAddColumn,
      onRemoveColumn,
      firstTitle,
      secondTitle,
      thirdTitle,
      thirdTitleVerticalLine,
      rowButton,
      extraPeriodColumns,
      stats,
      rowButtonColor,
      extendable,
      showSum,
      numericKeys,
      fixedWidth,
    } = this.props;
    onChange = onChange || (() => console.log("Oh nein cringe"));
    showSum = showSum ?? true;

    const containerElement = React.createRef();

    const Footer = props => (
      <div className="row-modify__container">
        <Button
          className={clsx("custom-btn", rowButtonColor && "rowButtonColor")}
          disabled={!onAddRow}
          onClick={() => onAddRow()}
        >
          <span className="dashboard__icon dashboard__icon--plus">+</span>
          {rowButton}
        </Button>

        {data.length > 0 &&
          <Button
            className={clsx("custom-btn", rowButtonColor && "rowButtonColor")}
            disabled={!onRemoveRow || data.length == 0}
            onClick={() => onRemoveRow()}
          >
            <span className="dashboard__icon">—</span>
            {rowButton}
          </Button>
        }
      </div>
    );

    return (
      <div
        className={clsx(
          "dashboard",
          extraPeriodColumns && "extended-height",
          !showSum && "no-sum",
          data.length == 0 && "empty"
        )}
        ref={containerElement}
      >

        {!stats &&
          <div className="dashboard-header">
            <p>{firstTitle || ""}</p>
            {data.length == 0 && <Footer />}
            <p >{secondTitle || ""}</p>
            <p className={thirdTitleVerticalLine && "trird-title-before-element"}>
              {thirdTitle || ""}
            </p>
          </div>
        }

        <div className="dashboard-inner-wrap">
          {/* Перебор массива и рендеринг каждой отдельной строки */}
          {data.map((currentData, rowIndex) => {
            return (
              new Array(2).fill(0).map((v, i) =>
                <div
                  className={clsx(
                    "dashboard-inner",
                    (rowIndex > 0 || rowIndex == data.length - 1 || i == 1) && "row-height-fix",
                    extraPeriodColumns && "dashboard-inner-width-fix",
                    (!showSum && rowIndex == data.length - 1 && i == 1) && "reset-height"
                  )}
                  key={Math.random()}
                >
                  {/* col */}
                  <div className="dashboard-col dashboard-col--tools">
                    <span className={"dashboard-key dashboard-tool"} hidden={rowIndex > 0 || i == 1}>
                      Условия кредита
                    </span>
                    <span
                      className={clsx("dashboard-val", "dashboard-val--tool", (i == 1) && "background-fix")}
                    >
                      {i == 0 ? "Сумма кредита " + (rowIndex + 1) : "Платеж по кредиту " + (rowIndex + 1)}
                    </span>
                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="dashboard-col ">

                    <span className="dashboard-key" hidden={rowIndex > 0 || i == 1}>
                      Сейчас
                    </span>

                    <span className={clsx("dashboard-val dashboard-val--tool", (i == 1) && "background-fix")}>
                      <NumericInput
                        className="dashboard__input"
                        defaultValue={i == 0 ? currentData.now : currentData.payment}
                        onBlur={value => onChange(i == 0 ? "now" : "payment", value, rowIndex)}
                        format={formatNumber}
                        unsigned="true"
                        min={0}
                      />
                    </span>

                  </div>
                  {/* col */}

                  {/* col */}
                  <div className="dashboard-col">

                    <span className="dashboard-key" hidden={rowIndex > 0 || i == 1}>
                      1 год
                    </span>

                    <span className={clsx("dashboard-val dashboard-val--tool", (i == 1) && "background-fix")}>
                      <NumericInput
                        className="dashboard__input"
                        // disabled={true}
                        defaultValue={(i == 1
                          ? currentData["now_" + 1] ? (currentData.payment_1 ?? currentData.payment) : 0
                          : (currentData.now_1 ?? currentData[1])
                        ) || 0}
                        onBlur={value => onChange(i == 1 ? ("payment_" + 1) : ("now_" + 1), value, rowIndex)}
                        format={formatNumber}
                        unsigned="true"
                        min={0}
                      />
                    </span>
                  </div>
                  {/* col */}

                  <div
                    className={clsx(
                      "dashboard-extra-container",
                      "scroll-hide",
                      (fixedWidth || extraPeriodColumns) && "fixed-width"
                    )}
                  >
                    {(() => {
                      return (
                        numericKeys.map((numericKey, columnIndex) =>
                          <div className="dashboard-col" key={columnIndex}>

                            <span className="dashboard-key" hidden={rowIndex > 0 || i == 1}>
                              <NumericInput
                                className="dashboard__input"
                                defaultValue={numericKey}
                                disabled={true}
                                size={"small"}
                                onBlur={value => ""}
                                suffix={num2str(numericKey, ["год", "года", "лет"])}
                                unsigned="true"
                                min={0}
                              />

                              <CrossButton
                                className="dashboard-key__remove-btn"
                                disabled={!onRemoveColumn}
                                onClick={e => onRemoveColumn(numericKey)}
                              />
                            </span>

                            <span className={clsx("dashboard-val dashboard-val--tool", (i == 1) && "background-fix")}>
                              <NumericInput
                                className="dashboard__input"
                                // disabled={true}
                                defaultValue={(i == 1
                                  ? currentData["now_" + numericKey]
                                    ? (currentData["payment_" + numericKey] ?? currentData.payment)
                                    : 0
                                  : (currentData["now_" + numericKey] ?? currentData[numericKey])
                                ) || 0}
                                onBlur={value => onChange(i == 1 ? ("payment_" + numericKey) : ("now_" + numericKey), value, rowIndex)}
                                format={formatNumber}
                                unsigned="true"
                                min={0}
                              />
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
                      {extraPeriodColumns[rowIndex][1] && (
                        <div className="dashboard-col">

                          <span className="dashboard-key" hidden={rowIndex > 0 || i == 1}>
                            <Tooltip title={""}>
                              1 год
                            </Tooltip>
                          </span>

                          <span
                            className={clsx("dashboard-val dashboard-val--tool",
                              (i == 1) && "background-fix"
                            )}
                          >
                            <NumericInput
                              className="dashboard__input"
                              defaultValue={extraPeriodColumns[rowIndex][1]}
                              onBlur={value => onExtraChange("1", value, rowIndex)}
                              format={formatNumber}
                              unsigned="true"
                              min={0}
                            />
                          </span>

                          {/* Выводится только в последней строке */}
                          <span
                            className="dashboard-key dashboard-key-result"
                            hidden={rowIndex !== data.length - 1}
                          >
                            {formatNumber(extraPeriodColumns.map(row => row[1]).reduce((acc, curr) => acc + curr, 0))}
                          </span>
                        </div>
                      )}
                      {/* col */}

                      <div className="dashboard-extra-container scroll-hide">
                        {(() => {
                          const numericKeys = Object.keys(data[rowIndex])
                            .map(key => !isNaN(+key) && key)
                            .filter(value => !!value)
                            .slice(1);

                          return (
                            numericKeys.map((numericKey, columnIndex) =>
                              <div className="dashboard-col" key={columnIndex}>

                                <span className="dashboard-key" hidden={rowIndex > 0 || i == 1}>
                                  <NumericInput
                                    className="dashboard__input"
                                    defaultValue={numericKey}
                                    disabled={true}
                                    size={"small"}
                                    onBlur={value => "!"}
                                    suffix={num2str(numericKey, ["год", "года", "лет"])}
                                    unsigned="true"
                                    min={0}
                                  />
                                </span>

                                <span
                                  className={clsx(
                                    "dashboard-val",
                                    "dashboard-val--tool",
                                    (i == 1) && "background-fix"
                                  )}
                                >
                                  <NumericInput
                                    className="dashboard__input"
                                    defaultValue={extraPeriodColumns[rowIndex][numericKey]}
                                    onBlur={value => onExtraChange(numericKey, value, rowIndex)}
                                    format={formatNumber}
                                    unsigned="true"
                                    min={0}
                                  />
                                </span>

                                <span
                                  className="dashboard-key dashboard-key-result"
                                  hidden={rowIndex !== data.length - 1}
                                >
                                  {formatNumber(extraPeriodColumns.map(row => row[numericKey]).reduce((acc, curr) => acc + curr, 0))}
                                  <Progress percent={30} />
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
            )
          })}
        </div>

        {data.length > 0 && <Footer />}
      </div>
    )
  }
}