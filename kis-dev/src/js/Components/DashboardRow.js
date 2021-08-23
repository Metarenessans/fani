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
import kisDepositMonth from "../utils/contribution-calc"


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

    
    const { toolType, depo, firstPay, period, rentIncome, monthAppend, monthOutcome, payRate, profitPercent, ofzVal, activeInvestVal, monthPay, investPercent} = item;

    let monthPercent = 0.007

    // упущенная прибыль
    const lostProfit = -round((firstPay - (rentIncome - monthPay)) / 12 * profitPercent)

    // ежемесячный баланс
    let monthBalance = rentIncome - monthPay

    // баланс по итогу месяца
    const monthEndSum = round((lostProfit + monthBalance) + (-monthOutcome) + monthAppend)

    // сумма всех выводов в месяц
    const allMonthOutCome = monthPay + monthOutcome

    // итог от активных инвестиций в зависимости от входящего периода
    const personalInvestProfitVal = period => {
      return (
        extRateReal(depo, null, allMonthOutCome, 21, monthAppend, 21, period, 1, 1, 0, {}, { customRate: activeInvestVal / 100 }).sum
      )
    }

    /** ОФЗ
     * возвращает итоговую сумму
     * @period      период   (количество итераций)
     * @outcome     boolean, все выводы
     * @append      boolean, все пополнения
     * @clearProfit boolean, чистая прибыль от офз
    */
    const resultOfz = (period, outcome, append, clearProfit) => {
      return (
        (extRateReal(depo, null, 
          outcome ? allMonthOutCome : 0, outcome ? 21 : 0,
          append  ? monthAppend     : 0, append  ? 21 : 0,
          period, 1, 1, 0, {}, 
          { customRate: ofzVal }
        ).sum) - (clearProfit ? depo : 0)
      )
    }

    /** инструмент -"Трейдинг"
     * возвращает итоговую сумму
     * @activeInvestPeriod принимает в себя значение в днях
     * @months             принимает 1 месяц / либо 12 месяцев
    */
    const tradeFinalVal = (activeInvestPeriod, months) => {
      const { activeInvestVal, ofzVal } = item
      
      if (ofzVal == 0 && activeInvestVal == 0) {
        return 0
      }

      else {
        if (ofzVal > 0 && activeInvestVal > 0) {
          return (
            round(
              months == 1 ?
                // значение месячного итога
                personalInvestProfitVal(activeInvestPeriod) + resultOfz(1, false, false, true) / 12 :
                // значение итога за весь период
                personalInvestProfitVal(activeInvestPeriod) + resultOfz(period, false, false, true)
            )
          )
        }

        // есть только офз
        else if (ofzVal > 0 && activeInvestVal == 0) {
          return (
            round(
              months == 1 ?
                resultOfz(1, false, false, false) / 12 :
                resultOfz(period, false, false, false)
            )
          )
        }

        // есть только активные инвестиции
        else if (ofzVal == 0 && activeInvestVal > 0) {
          return (
            round (
              personalInvestProfitVal(activeInvestPeriod)
            )
          )
        }
      }
    }

    /** инструмент -"Вклад"
     * @total         	      общая сумма на конец периода
       @firstMonthTotalResult	общая сумма на конец первого месяца
       @averageMonthIncome    среднемесячные проценты по вкладу за период
    */
    const contributionFinalVal = kisDepositMonth(investPercent, firstPay, period * 260, allMonthOutCome, monthAppend)

    
    /** Недвижимость
     * возвращает итоговую сумму в зависимости от периода
     * @period      период   (количество месяцев)
    */
    function realtyEndProfit(period) {
      const arr = []

      for (let i = 0; i < period; i++) {
        // ежемесячный баланс
        let monthBalance = (rentIncome + monthAppend) - (monthPay + monthOutcome)

        // упущенная прибыль
        let lostProfit = (firstPay - ((rentIncome + monthAppend) - (monthPay + monthOutcome)) ) / 12 * profitPercent

        // итог
        let endSum = monthBalance - lostProfit

        if (i == 1) {
          let currentBalance = (firstPay - (arr[i - 1].monthBalance + rentIncome - monthPay)) / 12 * profitPercent

          monthBalance = arr[i - 1].monthBalance + (rentIncome + monthAppend) - (monthPay + monthOutcome);
          lostProfit = currentBalance;
          endSum = monthBalance + -lostProfit;
        }

        if (i == 2) {
          monthBalance = arr[i - 1].monthBalance + (rentIncome + monthAppend) - (monthPay + monthOutcome);
          lostProfit   = arr[i - 1].lostProfit + (firstPay - monthBalance) / 12 * profitPercent;
          endSum       = monthBalance + -lostProfit;
        }

        if (i > 2) {
          monthBalance = arr[i - 1].monthBalance + (rentIncome + monthAppend) - (monthPay + monthOutcome);
          lostProfit   = arr[i - 1].lostProfit + (firstPay - monthBalance) / 12 * profitPercent;
          endSum       = monthBalance + -lostProfit;
        }

        arr[i] = {
          monthBalance : round(monthBalance),
          lostProfit   : round(lostProfit),
          endSum       : round(endSum)
        }
      }

      return arr[arr.length - 1].endSum
    }

    return (
      <div className="dashboard-row" ref={container}>
        {/* col */}
        <div className="dashboard-col dashboard-col--tool">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val dashboard-val--tool">
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
              defaultValue={toolType == "Трейдинг" ? depo : firstPay}
              onBlur={value => onChange("firstPay", value)}
              format={formatNumber}
              unsigned="true"
              min={0}
              max={depo}
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
          <span className="dashboard-val dashboard-col--wide dashboard-val--period">
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

          <span className="dashboard-key dashboard-key--passive">
            <Tooltip title={""}>
              Пассивный доход в месяц
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            <NumericInput
              key={item}
              className="dashboard__input"
              defaultValue={
                toolType == "Трейдинг" ?
                  round( resultOfz(1, false, false, true) / 12 ) :
                  (toolType == "Вклад" ? round(contributionFinalVal.averageMonthIncome) : rentIncome)
              }
              disabled={toolType !== "Недвижимость"}
              onBlur={value => onChange( "rentIncome", round(value, 2) )}
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

          <span className="dashboard-key dashboard-key--month">
            <Tooltip title={""}>
              Баланс по итогам месяца
            </Tooltip>
          </span>

          <span className="dashboard-val dashboard-col--main">
            {formatNumber(round(toolType !== "Недвижимость" ?
              (toolType == "Вклад" ? contributionFinalVal.firstMonthTotalResult : tradeFinalVal(260 / 12, 1) ) :
              realtyEndProfit(1))
            ) }
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
                  round(
                    toolType !== "Недвижимость"?
                      (toolType == "Вклад" ? contributionFinalVal.total : tradeFinalVal(260 * period, 12)) :
                      realtyEndProfit(period * 12)
                  )
                )
              }
            </span>
          </span>

        </div>
        {/* col */}
        
        {/* dialog button */}
        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">Настройка</span>
          <span className="dashboard-val dashboard-val--config dashboard-col--config">
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
