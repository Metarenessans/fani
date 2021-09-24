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
import num2str        from "../../../../common/utils/num2str"
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

export default class DashboardRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      periods: [{}, {}, {}, {}],
      
      tools: [{ name: "Работа" }, { name: "Бизнес" }, { name: "Пассивный доход" }, ]
    };

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
      onChange,
      onAddRow,
      onRemoveRow,
      onAddColumn,
      onRemoveColumn,
      firstTitle,
      secondTitle,
      thirdTitle,
      thirdTitleVerticalLine,
      rowButton,
      rowModifyButtons,
      extraPeriodColumns,
      stats,
      rowButtonColor,
    } = this.props;
    onChange = onChange || (() => console.log("Oh nein cringe"));

    const containerElement = React.createRef();

    const { periods } = this.state;
    
    return (
      <div className="dashboard" ref={containerElement}>
      
        {!stats &&
          <div className="dashboard-header">
            <p>{firstTitle   || ""}</p>
            <p >{secondTitle || ""}</p>
            <p className={thirdTitleVerticalLine && ".trird-title-before-element"}>
              {thirdTitle  || ""}
            </p>
          </div>
        }

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
                <span className={"dashboard-key dashboard-tool"} hidden={rowIndex > 0}>
                  Источник дохода
                </span>
                <span
                  className={clsx("dashboard-val dashboard-val--tool",
                    rowIndex % 2 && "background-fix"
                  )}
                >
                  <Select
                    className="dashboard__select dashboard__select--wide" 
                    value={currentData.currentTool}
                    showSearch
                    style={{ width: "100%" }}
                    onSelect={value => onChange("currentTool", value, rowIndex)}
                  >
                    {["Работа", "Бизнес", "Пассивный доход"].map((label, index) => 
                      <Option value={label} key={index} >{label}</Option>
                    )}
                  </Select>
                </span>

                {/* Выводится только в последней строке */}
                {rowIndex == data.length - 1 && (
                  <span className="dashboard-key dashboard-key-result dashboard-key-summ">
                    Сумма:
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
                    min={10_000}
                  />
                </span>
                
                {/* Выводится только в последней строке */}
                {rowIndex == data.length - 1 && (
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
                    min={10_000}
                  />
                </span>

                {/* Выводится только в последней строке */}
                {rowIndex == data.length - 1 && (
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

                        <span className="dashboard-key" hidden={rowIndex > 0}>
                          <NumericInput
                            className="dashboard__input"
                            defaultValue={numericKey}
                            size={"small"}
                            onBlur={value => ""}
                            suffix={num2str(numericKey , ["год", "года","лет"])}
                            unsigned="true"
                            min={0}
                          />

                          {/* ~~ */}
                          <CrossButton
                            className="dashboard-key__remove-btn"
                            onClick={e => onRemoveColumn(numericKey)}
                          />
                        </span>

                        <span
                          className={clsx("dashboard-val dashboard-val--tool",
                            rowIndex % 2 && "background-fix"
                          )}
                        >
                          <NumericInput
                            className="dashboard__input"
                            defaultValue={currentData[numericKey]}
                            onBlur={value => onChange(numericKey, value, rowIndex)}
                            format={formatNumber}
                            unsigned="true"
                            min={10_000}
                          />
                        </span>

                        {/* Выводится только в последней строке */}
                        {rowIndex == data.length - 1 && (
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
                        defaultValue={1_000_000}
                        onBlur={() => ""}
                        format={formatNumber}
                        unsigned="true"
                        min={0}
                      />
                    </span>

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

                            <span className="dashboard-key" hidden={rowIndex > 0}>
                              <NumericInput
                                className="dashboard__input"
                                defaultValue={years[columnIndex]}
                                size={"small"}
                                onBlur={() => ""}
                                suffix={num2str(years[columnIndex], ["год", "года", "лет"])}
                                unsigned="true"
                                min={0}
                              />
                            </span>

                            <span
                              className={clsx("dashboard-val dashboard-val--tool",
                                rowIndex % 2 && "background-fix"
                              )}
                            >
                              <NumericInput
                                className="dashboard__input"
                                defaultValue={1_000_000}
                                onBlur={() => ""}
                                format={formatNumber}
                                unsigned="true"
                                min={0}
                              />
                            </span>

                            <span
                              className="dashboard-key dashboard-key-result"
                              hidden={rowIndex !== data.length - 1}
                            >
                              {3_000_00}
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
          )}

          {!extraPeriodColumns && (
            <>
              <Button
                className="custom-btn dashboard__add-column "
                onClick={() => onAddColumn()}
                aria-label="Добавить период"
              >
                <PlusOutlined />
                период
              </Button>
            </>
          )}
        </div>
   
        <div className={"row-modify__container"}>
          <Button
            className={clsx("custom-btn", rowButtonColor && "rowButtonColor")}
            onClick={() => onAddRow && onAddRow()}
          >
            <PlusOutlined aria-label="источник дохода" />
            {rowButton}
          </Button>

          <Button
            className={clsx("custom-btn", rowButtonColor && "rowButtonColor")}
            disabled={data.length == 1}
            onClick={() => onRemoveRow && onRemoveRow()}
            >
            <MinusOutlined aria-label="источник дохода"/>
            {rowButton}
          </Button>
        </div>
      </div>
    )
  }
}
