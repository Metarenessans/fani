import React, { useRef } from 'react'
import { Tooltip, Select } from 'antd/es'

import {
  PlusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import NumericInput from "../../../../common/components/numeric-input"
import CustomSelect from "../../../../common/components/custom-select"
import CrossButton  from "../../../../common/components/cross-button"

import { Tools } from "../../../../common/tools"
import round          from "../../../../common/utils/round"
import formatNumber   from "../../../../common/utils/format-number"
import fractionLength from "../../../../common/utils/fraction-length"
import isEqual        from "../../../../common/utils/is-equal"
import sortInputFirst from "../../../../common/utils/sort-input-first"

import { Dialog, dialogAPI } from "../../../../common/components/dialog"

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
    let { selectedToolName, percentage, item, toolsLoading, toolsStorage, onChange, onConfigOpen } = this.props;

    const container = React.createRef();

    const { toolType, percent, incomeMonthly, firstPay, period} = item;
    let calculatedIncome = percent * incomeMonthly;

    return (
      <div className="dashboard-row" ref={container}>
        {/* col */}
        <div className="dashboard-col dashboard-col--tool">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val">
            <Select
              className="dashboard__select dashboard__select--wide" 
              value={toolType}
              showSearch
              style={{ width: "100%" }}
              onSelect={value => onChange("toolType", value)}
            >
              {["Недвижимость", "Вклад", "Трейдинг"].map((label, index) => <Option value={label} key={index} >{label}</Option>)}
            </Select>
          </span>
        </div>
        {/* col */}

        {/* col */}
        <div className="dashboard-col dashboard-col--main">

          <span className="dashboard-key">
            <Tooltip title={""}>
              Первонач. взнос
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={firstPay}
              onBlur={value => onChange("firstPay", value)}
              format={formatNumber}
              unsigned="true"
              min={0}
            />
          </span>

        </div>
        {/* col */}

        <div className="dashboard-col dashboard-col--splitted">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Период
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--wide">
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={period}
              onBlur={value => onChange("period", value)}
              unsigned="true"
              format={formatNumber}
              min={0}
            />
        
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={period * 365}
              onBlur={value => onChange("period", round(value / 365, 2))}
              unsigned="true"
              format={formatNumber}
              min={0}
            />
          </span>
        </div>
        {/* col */}


        {/* <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">
            <Tooltip title={""}>
              Баланс месяц
            </Tooltip>
          </span>
          <span className="dashboard-val dashboard-col--wide">
            {formatNumber(calculatedIncome)}р (5%)
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
        </div> */}
        
        {/* dialog button */}
        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key"> {" "}</span>
          <span className="dashboard-val dashboard-col--wide">
            <Tooltip title="Настроить инструмент">
              <button
                className="settings-button dashboard-col__config"
                aria-label="Открыть"
                onClick={e => {
                  dialogAPI.open("dashboard-config", e.target);
                  onConfigOpen();
                }}>
                <SettingFilled className="settings-button__icon" />
              </button>
            </Tooltip>
          </span>
        </div>
        {/* dialog button */}

      </div>
    )
  }
}
