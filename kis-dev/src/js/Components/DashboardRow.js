import React, { useRef } from 'react'
import { Tooltip, Select } from 'antd/es'

import {
  LoadingOutlined,
} from "@ant-design/icons"

import NumericInput from "../../../../common/components/numeric-input"
import CustomSelect from "../../../../common/components/custom-select"
import CrossButton  from "../../../../common/components/cross-button"

import { Tools } from "../../../../common/tools"
import round          from "../../../../common/utils/round"
import formatNumber   from "../../../../common/utils/format-number"
import fractionLength from "../../../../common/utils/fraction-length"
import isEqual        from "../../../../common/utils/is-equal"
import sortInputFirst from "../../../../common/utils/sort-input-first"

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

    let { percentage, selectedToolName, planIncome, toolsLoading, toolsStorage } = this.props;

    this.state = {
    };

    this.onScrollCb = this.onScrollCb.bind(this);
  }

  onScrollCb() {
    onScroll.call(this);
  }

  componentDidMount() {
    addEventListener("scroll", this.onScrollCb);
  }

  componentDidUpdate() {
    onScroll.call(this);
  }

  componentWillUnmount() {
    addEventListener("scroll", this.onScrollCb);
  }


  update() {

  }

  render() {
    const { tooltipVisible, tooltipText, planIncomeCustom } = this.state;
    let { selectedToolName, percentage, item, toolsLoading, toolsStorage } = this.props;
    const {} = this.props;

    const container = React.createRef();

    return (
      <div className="dashboard-row" ref={container}>
        <div className="dashboard-col dashboard-col--tool">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val">
            <Select
              // key={currentToolIndex}
              className="dashboard__select dashboard__select--wide" 
              value={0}
              loading={toolsLoading}
              disabled={toolsLoading}
              showSearch
              style={{ width: "100%" }}
            >
              {(() => {
                if (!toolsLoading) {
                  return ["Недвижимость","Вклад","Трейдинг"].map(
                    (label, index) => {
                      return <Option value={index} key={index} >{label}</Option>
                    }
                  )
                }
                else {
                  return (
                    <Option key={0} value={0}>
                      <LoadingOutlined style={{ marginRight: ".2em" }} />
                      Загрузка...
                    </Option>
                  )
                }
              })()}
            </Select>
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col dashboard-col--main">
          <span className="dashboard-key">
            <span className="dashboard-key-inner" style={{ width: "100%" }}>
              <Tooltip title={""}>
                Первонач. взнос
              </Tooltip>
              {/* ~~ */}
            </span>
          </span>
          {(() => {
            if (toolsLoading) {
              return (
                <span className="dashboard-val dashboard-val--wrap">
                  <LoadingOutlined/>
                </span>
              )
            }
            else {
              return (
                <span className="dashboard-val dashboard-val--wrap">
                  <NumericInput
                    // key={Math.random()}
                    className="dashboard__input"
                    defaultValue={1_000_000}
                    unsigned="true"
                    disabled={toolsLoading}
                    format={formatNumber}
                    min={0}
                  />
                </span>
              ) 
            }
          })()}
        </div>
        <div className="dashboard-col dashboard-col--splitted">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Период
            </Tooltip>  
          </span>
          <span className="dashboard-val dashboard-col--wide">
            {/* <CustomSelect
              className="dashboard__select"
              // className="dashboard__select--tool dashboard__select--custom"
              loading={toolsLoading}
              disabled={toolsLoading}
              defaultValue={256}
              suffix="%"
              options={new Array(10).fill(0).map((n, i) => 10 * (i + 1))}
              allowFraction={2}
              min={0.01}
              max={100}
            /> */}
            <NumericInput
              key={Math.random()}
              className="dashboard__input dashboard__input--custom"
              defaultValue={10 + " лет"}
              unsigned="true"
              disabled={toolsLoading}
              format={formatNumber}
              min={0}
            />

            <NumericInput
              key={Math.random()}
              className="dashboard__input dashboard__input--custom"
              defaultValue={2600 + " дн"}
              unsigned="true"
              disabled={toolsLoading}
              format={formatNumber}
              min={0}
            />
          </span>
        </div>

        <div className="dashboard-col dashboard-col--splitted">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Доход в мес.
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--wide">
            <CustomSelect
              className="dashboard__select"
              loading={toolsLoading}
              disabled={toolsLoading}
              options={new Array(10).fill(0).map((n, i) => 10 * (i + 1) + " %")}
              suffix="%"
            />
        
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={100_000 + "р"}
              unsigned="true"
              disabled={toolsLoading}
              format={formatNumber}
              min={0}
            />
          </span>
        </div>

        <div className="dashboard-col dashboard-col--main">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Вывод в мес.
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--wide">
            <NumericInput
              // key={Math.random()}
              className="dashboard__input"
              defaultValue={-1 * 1_000_000}
              unsigned="true"
              disabled={toolsLoading}
              format={formatNumber}
              min={0}
            />
          </span>
        </div>

        <div className="dashboard-col dashboard-col--main">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Платёж по кред.
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--main">
            <NumericInput
              // key={Math.random()}
              className="dashboard__input"
              defaultValue={1_000_000}
              unsigned="true"
              disabled={toolsLoading}
              format={formatNumber}
              min={0}
            />
          </span>
        </div>

        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Баланс месяц
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--wide">
            900 000р (5%)
          </span>
        </div>

        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Баланс период
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--wide">
            - 1 900 000р (5%)
          </span>
        </div>
      </div>
    )
  }
}
