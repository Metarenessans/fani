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
import extRateReal    from "../utils/rate";


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

    
    const { toolType, depo, firstPay, period, rentIncome, monthAppend, monthOutcome, payRate, profitPercent, ofzVal, activeInvestVal} = item;
    
    // процент платежа в месяц
    const monthPercent = round(payRate / 12, 3)

    // месячный платёж
    const monthPay = round( (depo - firstPay) * monthPercent , 2)

    // упущенная прибыль
    const lostProfit = ((firstPay - (rentIncome - monthPay)) * profitPercent ) / 12

    // баланс по итогу месяца
    const monthEndSum = round((rentIncome - monthPay - lostProfit) - monthOutcome + monthAppend, 2)
    
    //годовая прибыль от ОФЗ
    const ofzProfit = depo * ofzVal
    
    // сумма всех выводов в месяц
    const allMonthOutCome = monthPay + monthOutcome

    // итог от активных инвестиций в зависимости от входящего периода
    const personalInvestProfitVal = period => {
      return (
        extRateReal(depo, null, monthOutcome + monthPay, 30, monthAppend, 30, period, 1, 1, 0, {}, { customRate: activeInvestVal / 100 }).sum
      )
    }

    // возврат необходимого значения на основе (офз, активных инвестиций) и периода - "Трейдинг"
    const finalVal = (activeInvestPeriod, months) => {
      if (ofzVal == 0 && activeInvestVal == 0) {
        return 0
      }

      else {
        if (ofzVal > 0 && activeInvestVal > 0) {
          return (
            months == 1?
              personalInvestProfitVal(activeInvestPeriod) :
              personalInvestProfitVal(activeInvestPeriod) + ofzProfit * period
          )
        }
  
        else if (ofzVal > 0 && activeInvestVal == 0) {
          return (
            months == 1 ?
              depo - allMonthOutCome :
              depo + (ofzProfit * period)
          )
        }
  
        else if (activeInvestVal > 0 && ofzVal == 0) {
          personalInvestProfitVal(activeInvestPeriod)
        }
      }
    }

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
              defaultValue={toolType !== "Вклад"? firstPay : depo}
              onBlur={value => toolType !== "Вклад" ? onChange("firstPay", value) : onChange("depo", value)}
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
              defaultValue={period * 260 }
              onBlur={value => onChange("period", round(value / 260 , 2))}
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
              defaultValue={toolType == "Трейдинг"? 0 : rentIncome}
              disabled={toolType == "Трейдинг"}
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
            {formatNumber(round(toolType == "Трейдинг" ? finalVal(260 / 12, 1) : monthEndSum, 2) ) }
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
              {
                formatNumber(
                  round( toolType == "Трейдинг"?
                    finalVal(260 * period, 12) :
                    monthEndSum * (period * 12)
                  , 2)
                )
              }
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
