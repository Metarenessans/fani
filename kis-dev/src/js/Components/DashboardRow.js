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

import round          from "../../../../common/utils/round"
import num2str from "../../../../common/utils/num2str"
import formatNumber   from "../../../../common/utils/format-number"

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

    let { percentage, selectedToolName, planIncome, toolsLoading, toolsStorage, index } = this.props;

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
    let {item, onChange, onConfigOpen, onDelete,index } = this.props;
    const container = React.createRef();
    
    const { toolType, firstPay, period, rentIncome, monthAppend, monthOutcome, payRate, depo, ofzValue, lineConfigIndex} = item;
    
    // процент платежа в месяц
    let monthPercent = round(payRate / 12, 3)

    // месячный платёж
    let monthPay = round( (depo - firstPay) * monthPercent , 2)

    // упущенная прибыль
    let lostProfit = ( (firstPay - (rentIncome - monthPay)) * ofzValue ) / 12

    // баланс по итогу месяца
    let monthEndSum = round((rentIncome - monthPay - lostProfit) - monthOutcome + monthAppend, 2)
  
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
              className="dashboard__input"
              defaultValue={period}
              onBlur={value => onChange("period", value)}
              unsigned="true"
              format={formatNumber}
              min={0}
              suffix={ num2str(period, ["год", "года", "лет"]) }
            />
        
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={period * (toolType == "Недвижимость"? 365 : 248) }
              onBlur={value => onChange("period", round( value / (toolType == "Недвижимость" ? 365 : 248) , 2))}
              unsigned="true"
              onFocus={value => formatNumber(value)}
              format={formatNumber}
              min={0}
              suffix="дн"
            />
          </span>
        </div>
        {/* col */}

        {/* col */}
        <div className="dashboard-col dashboard-col--main">

          <span className="dashboard-key">
            <Tooltip title={""}>
              Ежемесячный доход
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            <NumericInput
              key={item}
              className="dashboard__input"
              defaultValue={rentIncome}
              onBlur={value => onChange("rentIncome", value)}
              format={formatNumber}
              unsigned="true"
              min={0}
            />
          </span>

        </div>
        {/* col */}

        {/* col */}
        <div className="dashboard-col dashboard-col--main">

          <span className="dashboard-key">
            <Tooltip title={""}>
              Ежемесячный вывод
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={monthOutcome}
              onBlur={value => onChange("monthOutcome", value)}
              format={formatNumber}
              unsigned="true"
              min={0}
              max={rentIncome}
            />
          </span>

        </div>
        {/* col */}

        {/* col */}
        <div className="dashboard-col dashboard-col--main">

          <span className="dashboard-key">
            <Tooltip title={""}>
              Ежемесячное пополнение
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            <NumericInput
              key={Math.random()}
              className="dashboard__input"
              defaultValue={monthAppend}
              onBlur={value => onChange("monthAppend", value)}
              format={formatNumber}
              unsigned="true"
              min={0}
            />
          </span>

        </div>
        {/* col */}

        {/* col */}
        <div className="dashboard-col dashboard-col--main">

          <span className="dashboard-key">
            <Tooltip title={""}>
              Баланс по итогам месяца
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            {formatNumber(monthEndSum)}
          </span>

        </div>
        {/* col */}

        {/* col */}
        <div className="dashboard-col dashboard-col--main">

          <span className="dashboard-key">
            <Tooltip title={""}>
              Баланс по итогам периода
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main ">
            <span className="dashboard__input">
              { formatNumber( round( monthEndSum * (period * 12), 2) ) }
            </span>
          </span>

        </div>
        {/* col */}
        
        {/* dialog button */}
        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">Настройка</span>
          <span className="dashboard-val dashboard-val--config dashboard-col--wide">
            <button
              className="settings-button dashboard-col__config"
              aria-label="Открыть"
              onClick={e => {
                dialogAPI.open("dashboard-config", e.target);
                onConfigOpen();
              }}>
              <SettingFilled className="settings-button__icon" />
            </button>
          </span>
        </div>
        {/* dialog button */}

        <CrossButton
          aria-hidden={index == 0 ? "true" : "false"}
          className={["dashboard-row__delete"].concat(index == 0 ? "invisible" : "").join(" ").trim()}
          onClick={e => onDelete(index)}
        />
      </div>
    )
  }
}
