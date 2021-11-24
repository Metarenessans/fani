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
import CustomSelect from "../../../../common/components/custom-select"

import round from "../../../../common/utils/round"
import num2str from "../../../../common/utils/num2str"
import formatNumber from "../../../../common/utils/format-number"
import clsx from 'clsx'

const { Option } = Select;

let scrollInitiator;

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

// TODO: добавить PropTypes или JSDoc с описанием всех пропсов и зачем они нужны
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
      firstSubtitle,
      secondTitle,
      thirdTitle,
      thirdTitleVerticalLine,
      rowButton,
      extraPeriodColumns,
      stats,
      rowButtonColor,
      extendable,
      canRemoveLastRow,
      showSum,
      firstColumnContent,
      fixedWidth,
      sumTitle,
      onPeriodChange,
      onUpdateOptions,
      goal,
      progressGoalPrimary,
      progressGoalSecondary,
      minRows
    } = this.props;
    onChange = onChange || (() => console.log("Oh nein cringe"));
    showSum = showSum ?? true;
    canRemoveLastRow = canRemoveLastRow ?? false;
    minRows = minRows ?? 0;

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
            disabled={!onRemoveRow || data.length == minRows}
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
          {data.map((currentData, rowIndex) =>
            <div
              className={clsx(
                "dashboard-inner",
                (rowIndex > 0 || rowIndex == data.length - 1) && "row-height-fix",
                extraPeriodColumns && "dashboard-inner-width-fix",
                (!showSum && rowIndex == data.length - 1) && "reset-height"
              )}
              key={rowIndex}
            >
              {/* col */}
              <div className="dashboard-col dashboard-col--tools">
                <span className={"dashboard-key dashboard-tool"} hidden={rowIndex > 0}>
                  {firstSubtitle}
                </span>
                <span
                  className={clsx(
                    "dashboard-val",
                    "dashboard-val--tool",
                    rowIndex % 2 && "background-fix"
                  )}
                >
                  {firstColumnContent
                    ? firstColumnContent(rowIndex)
                    :
                    <CustomSelect
                      type="text"
                      options={options}
                      value={currentData.currentTool}
                      onChange={value => onChange("currentTool", value, rowIndex)}
                      onAddOption={(newOption, options) => onUpdateOptions(options)}
                    />
                  }
                </span>

                {/* Выводится только в последней строке */}
                {showSum && showSum && rowIndex == data.length - 1 && (
                  <span className="dashboard-key dashboard-key-result dashboard-key-summ">
                    {sumTitle || "Сумма:"}
                  </span>
                )}
              </div>
              {/* col */}

              {/* col */}
              <div className="dashboard-col ">

                <span className="dashboard-key" hidden={rowIndex > 0}>
                  Сейчас
                </span>

                <span
                  className={clsx("dashboard-val dashboard-val--tool",
                    rowIndex % 2 && "background-fix"
                  )}
                >
                  <NumericInput
                    className="dashboard__input"
                    defaultValue={currentData.now}
                    onBlur={value => onChange("now", value, rowIndex)}
                    format={formatNumber}
                    unsigned="true"
                    min={0}
                  />
                </span>

                {/* Выводится только в последней строке */}
                {showSum && rowIndex == data.length - 1 && (
                  <span className="dashboard-key dashboard-key-result">
                    {(() => {
                      const value = data.map(row => row.now).reduce((acc, curr) => acc + curr, 0);
                      const goal = progressGoalPrimary?.[0];
                      const printedValue = value == 0 ? 0 : round(goal / value * 100, 2);

                      return (
                        <>
                          {formatNumber(value)}
                          {goal != null &&
                            <Tooltip title="Покрытие расходов пассивным доходом">
                              <Progress
                                percent={round(goal / value * 100, 2)}
                                format={_ => printedValue + "%"}
                                status={printedValue >= 100 ? "success" : "normal"}
                              />
                            </Tooltip>
                          }
                        </>
                      )
                    })()}
                  </span>
                )}

              </div>
              {/* col */}

              {/* col */}
              <div className="dashboard-col">

                <span className="dashboard-key" hidden={rowIndex > 0}>
                  1 год
                </span>

                <span
                  className={clsx("dashboard-val dashboard-val--tool",
                    rowIndex % 2 && "background-fix"
                  )}
                >
                  <NumericInput
                    className="dashboard__input"
                    defaultValue={currentData[1]}
                    onBlur={value => onChange("1", value, rowIndex)}
                    format={formatNumber}
                    unsigned="true"
                    min={0}
                  />
                </span>

                {/* Выводится только в последней строке */}
                {showSum && rowIndex == data.length - 1 && (
                  <span className="dashboard-key dashboard-key-result">
                    {(() => {
                      const value = data.map(row => row[1]).reduce((acc, curr) => acc + curr, 0);
                      const goal = progressGoalPrimary?.[1];
                      const printedValue = value == 0 ? 0 : round(goal / value * 100, 2);

                      return (
                        <>
                          {formatNumber(value)}
                          {goal != null &&
                            <Tooltip title="Покрытие расходов пассивным доходом">
                              <Progress
                                percent={round(goal / value * 100, 2)}
                                format={_ => printedValue + "%"}
                                status={printedValue >= 100 ? "success" : "normal"}
                              />
                            </Tooltip>
                          }
                        </>
                      )
                    })()}
                  </span>
                )}
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
                  const numericKeys = Object.keys(currentData)
                    .map(key => !isNaN(+key) && key)
                    .filter(value => !!value)
                    .slice(1);

                  return (
                    numericKeys.map((numericKey, columnIndex) =>
                      <div className="dashboard-col">

                        <span className="dashboard-key" hidden={rowIndex > 0}>
                          <NumericInput
                            className="dashboard__input"
                            defaultValue={numericKey}
                            disabled={!onPeriodChange}
                            size={"small"}
                            onBlur={value => onPeriodChange(value, numericKey)}
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

                        <span className={clsx("dashboard-val dashboard-val--tool", rowIndex % 2 && "background-fix")}>
                          <NumericInput
                            className="dashboard__input"
                            defaultValue={currentData[numericKey]}
                            onBlur={value => onChange(numericKey, value, rowIndex)}
                            format={formatNumber}
                            unsigned="true"
                            min={0}
                          />
                        </span>

                        {/* Выводится только в последней строке */}
                        {showSum && rowIndex == data.length - 1 && (
                          <span className="dashboard-key dashboard-key-result">
                            {(() => {
                              const value = data.map(row => row[numericKey]).reduce((acc, curr) => acc + curr, 0);
                              const goal = progressGoalPrimary?.[2 + columnIndex];
                              const printedValue = value == 0 ? 0 : round(goal / value * 100, 2);

                              return (
                                <>
                                  {formatNumber(value)}
                                  {goal != null &&
                                    <Tooltip title="Покрытие расходов пассивным доходом">
                                      <Progress
                                        percent={round(goal / value * 100, 2)}
                                        format={_ => printedValue + "%"}
                                        status={printedValue >= 100 ? "success" : "normal"}
                                      />
                                    </Tooltip>
                                  }
                                </>
                              )
                            })()}
                          </span>
                        )}

                      </div>
                    )
                  )
                })()}
              </div>

              {/* extra extra container */}
              {extraPeriodColumns && extraPeriodColumns.length <= data.length && (
                <div className="dashboard-extra-extra-container">
                  {/* col */}
                  <div className="dashboard-col">

                    <span className="dashboard-key" hidden={rowIndex > 0}>
                      <Tooltip title={""}>
                        1 год
                      </Tooltip>
                    </span>

                    <span
                      className={clsx("dashboard-val dashboard-val--tool",
                        rowIndex % 2 && "background-fix"
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
                      {(() => {
                        const value = extraPeriodColumns.map(row => row[1]).reduce((acc, curr) => acc + curr, 0);
                        const printedValue = value == 0 ? 0 : round(goal / value * 100, 2);

                        return (
                          <>
                            {formatNumber(value)}
                            {goal != null &&
                              <Tooltip title="Покрытие расходов пассивным доходом">
                                <Progress
                                  percent={round(goal / value * 100, 2)}
                                  format={_ => printedValue + "%"}
                                  status={printedValue >= 100 ? "success" : "normal"}
                                />
                              </Tooltip>
                            }
                          </>
                        )
                      })()}
                    </span>
                  </div>
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

                            <span className="dashboard-key" hidden={rowIndex > 0}>
                              <NumericInput
                                className="dashboard__input"
                                disabled={!onPeriodChange}
                                defaultValue={numericKey}
                                size={"small"}
                                onBlur={value => onPeriodChange(value, numericKey)}
                                suffix={num2str(numericKey, ["год", "года", "лет"])}
                                unsigned="true"
                                min={1}
                              />
                            </span>

                            <span
                              className={clsx(
                                "dashboard-val",
                                "dashboard-val--tool",
                                rowIndex % 2 && "background-fix"
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
                              {(() => {
                                const value = extraPeriodColumns.map(row => row[numericKey]).reduce((acc, curr) => acc + curr, 0);
                                const printedValue = value == 0 ? 0 : round(goal / value * 100, 2);

                                return (
                                  <>
                                    {formatNumber(value)}
                                    {goal != null &&
                                      <Tooltip title="Покрытие расходов пассивным доходом">
                                        <Progress
                                          percent={round(goal / value * 100, 2)}
                                          format={_ => printedValue + "%"}
                                          status={printedValue >= 100 ? "success" : "normal"}
                                        />
                                      </Tooltip>
                                    }
                                  </>
                                )
                              })()}
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

          {extendable && !extraPeriodColumns && (
            <>
              <Button
                className="custom-btn dashboard__add-column "
                disabled={!onAddColumn}
                onClick={() => onAddColumn()}
                aria-label="Добавить период"
              >
                <span className="dashboard__icon dashboard__icon--plus">+</span>
                период
              </Button>
            </>
          )}
        </div>

        {data.length > 0 && <Footer />}
      </div>
    )
  }
}