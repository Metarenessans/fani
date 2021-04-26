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

    let { percentage, selectedToolName, planIncome } = this.props;

    this.state = {
      percentage,
      selectedToolName,
      planIncome,

      tooltipText: "",
      tooltipVisible: false,

      tooltipPlacement: "top",

      searchVal: "",
      planIncomeCustom: ""
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

  getPlanIncome() {
    const { mode, item } = this.props;
    const currentTool = this.getCurrentTool();
    const realSelectedToolName = currentTool.getSortProperty();
    
    var planIncome;

    if (mode == 0) {
      // В приоритете введенное значение, если его нет - откатываемся к дефолтному
      planIncome = item.planIncome != null && item.realSelectedToolName == realSelectedToolName 
        ? item.planIncome 
        : currentTool.adrDay;
    }
    else {
      var m;
      if (mode == 1) {
        m = 4;
      }
      else if (mode == 2) {
        m = 2;
      }
      else if (mode == 3) {
        m = 1;
      }

      planIncome = this.getBlackSwan() / m;
    }

    return planIncome;
  }

  getBlackSwan() {
    return this.getCurrentTool().currentPrice * 0.1;
  }

  update() {

  }

  getToolIndexByCode(code) {
    const { tools, selectedToolName } = this.props;
    if (!code || !tools.length) {
      return 0;
    }

    return Tools.getToolIndexByCode(tools, selectedToolName);
  }

  getCurrentTool() {
    const { tools } = this.props;
    return tools[this.getCurrentToolIndex()] || Tools.create();
  }

  getCurrentToolIndex() {
    const { selectedToolName } = this.props;
    return this.getToolIndexByCode(selectedToolName);
  }

  render() {
    const { tooltipVisible, tooltipText, planIncomeCustom } = this.state;
    let { selectedToolName, percentage, item } = this.props;
    const {
      index,
      sortProp,
      sortDESC,
      mode,
      depo,
      tools,
      onSort,
      onChange,
      onUpdate,
      onDelete,
    } = this.props;

    selectedToolName = (selectedToolName != null) ? selectedToolName : tools[0].getSortProperty();
    
    const currentTool      = this.getCurrentTool();
    const currentToolIndex = this.getCurrentToolIndex();

    const realSelectedToolName = tools[currentToolIndex].getSortProperty();

    var planIncome = this.getPlanIncome();

    var contracts = Math.floor( depo * (percentage / 100) / currentTool.guarantee );
    
    var income = contracts * planIncome / currentTool.priceStep * currentTool.stepPrice;
    var incomePercentage = (income / depo) * 100;
    var loadingPercentage = round((incomePercentage / percentage) * 100, 3);
    var risk = 
      contracts 
      * currentTool.adrDay
      / currentTool.priceStep
      * currentTool.stepPrice 
      / depo 
      * 100;
    if (mode > 0) {
      risk = contracts * planIncome / currentTool.priceStep * currentTool.stepPrice / depo * 100;
    }

    var freeMoney = 100 - (percentage + risk);

    const SortButton = function(props) {
      const className = "dashboard-key__sort-toggle";
      const prop = props.prop;
      return (
        <div className="dashboard-key__sort-toggle-wrap">
          <button 
            className={
              []
                .concat(className)
                .concat(prop === sortProp && sortDESC != null ? "active" : "")
                .concat(
                  prop === sortProp && (sortDESC != null && !sortDESC) 
                    ? "reversed" 
                    : ""
                )
                .join(" ")
                .trim()
            }
            onClick={e => {
              let val;
              if (sortDESC == null) {
                val = true;
              }
              else {
                val = sortDESC ? !sortDESC : undefined;
              }
  
              onSort(prop, val);
            }}
          ></button>
        </div>
      );
    }

    const itemUpdated = {
      percentage,
      // ГО
      guarantee: currentTool.guarantee,
      // Контракты
      contracts,
      // Ход
      planIncome: mode == 0 ? planIncome : null,
      // Руб
      income,
      // К депо
      incomePercentage,
      // К загрузке
      loadingPercentage,
      // Риск
      risk,
      // Свободно
      freeMoney,
      // Выбранный инструмент
      selectedToolName,
      // Идентификатор реального найденного инструмента
      realSelectedToolName,

      updatedOnce: item.updatedOnce,
    };

    // console.log(item.realSelectedToolName, realSelectedToolName);
    if (item.realSelectedToolName != realSelectedToolName) {
      // console.log(item, itemUpdated);
      // delete itemUpdated.planIncome;
      // itemUpdated.updatedOnce = false;
      // console.log("!");
    }
    
    if (!isEqual(itemUpdated, item)) {
      // console.log(item, itemUpdated);
      onUpdate(itemUpdated)
      // setTimeout(() => onUpdate(itemUpdated), 50);
    }

    const container = React.createRef();

    return (
      <div className="dashboard-row" ref={container}>
        <div className="dashboard-col dashboard-col--wide">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val">
            <Select
              // key={currentToolIndex}
              className="dashboard__select dashboard__select--wide" 
              value={currentToolIndex}
              onChange={currentToolIndex => {
                onChange("selectedToolName", tools[currentToolIndex].getSortProperty());
              }}
              disabled={tools.length == 0}
              showSearch
              // onSearch={(value) => this.setState({ searchVal: value })}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: "100%" }}
            >
              {(() => {
                if (tools.length) {
                  let options = tools.map((tool) => String(tool));
                  // options = sortInputFirst(this.state.searchVal, options);
                  return options.map((value, index) => (
                    <Option key={index} value={index}>
                      {value}
                    </Option>
                  ));
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
        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">
            <span className="dashboard-key-inner">
              Цена /{" "}
              <Tooltip title={"Гарантийное обеспечение"} placement={this.state.tooltipPlacement}>
                ГО
              </Tooltip>
              <SortButton prop="guarantee" />
            </span>
          </span>
          <span className="dashboard-val dashboard-val--wrap">
            <span className="no-wrap">{formatNumber(currentTool.currentPrice)}</span>
            &nbsp;/&nbsp;
            <span className="no-wrap">{formatNumber(currentTool.guarantee)}</span>
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip title={"Объём депозита в процентах на вход в сделку"} placement={this.state.tooltipPlacement}>
              Загрузка %
            </Tooltip>  
          </span>
          <span className="dashboard-val">
            <CustomSelect
              key={percentage}
              className="dashboard__select"
              options={new Array(10).fill(0).map((n, i) => 10 * (i + 1))}
              // format={val => val + "%"}
              allowFraction={2}
              min={0.01}
              max={100}
              value={percentage}
              onChange={val => onChange("percentage", val)}
              suffix="%"
            />
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Контракты</span>
          <span className="dashboard-val">
            { contracts }
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">
            <Tooltip title={"Предполагаемые изменения цены"} placement={this.state.tooltipPlacement}>
              Ход
            </Tooltip>
            {" "}$/₽
          </span>
          <span className="dashboard-val">
            {(() => {
              const fraction = fractionLength(currentTool.priceStep);
              
              let timeout;
              const planIncomeTooltip = Number(planIncomeCustom == "" ? planIncome : planIncomeCustom);
              const steps = round(planIncomeTooltip / currentTool.priceStep, 2);

              return mode == 0
                ? (
                  <Tooltip 
                    title={`${+(planIncomeTooltip).toFixed(fraction)} = ${steps} п`}
                    visible={tooltipVisible}
                  >
                    <NumericInput
                      key={Math.random()}
                      className="dashboard__input"
                      defaultValue={+(planIncome).toFixed(fraction)}
                      unsigned="true"
                      format={formatNumber}
                      min={0}
                      onBlur={value => {
                        value = Number(value);
                        onChange("planIncome", value);
                        this.setState({ planIncomeCustom: "" })
                      }}
                      onChange={(e, value = "") => {
                        this.setState({ planIncomeCustom: value })
                      }}
                      onFocus={e => this.setState({ tooltipVisible: true })}
                      onMouseEnter={e => {
                        if (timeout) {
                          clearTimeout(timeout);
                        }
                        this.setState({ tooltipVisible: true });
                      }}
                      onMouseLeave={e => {
                        if (e.target == document.activeElement) {
                          return;
                        }
                        timeout = setTimeout(() => this.setState({ tooltipVisible: false }), 500)
                      }}
                    />
                  </Tooltip>
                )
                : formatNumber((planIncome).toFixed(fraction)) 
            })()}
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip title={"Прибыль в рублях к депозиту на заданную загрузку при предполагаемом ходе цены"} placement={this.state.tooltipPlacement}>
              Руб.
            </Tooltip>
          </span>
          <span className="dashboard-val">
            { formatNumber( Math.round(income) ) }
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <span className="dashboard-key-inner">
              К депо
              <SortButton prop="incomePercentage" />
            </span>
          </span>
          <span className="dashboard-val">
            { formatNumber(round(incomePercentage, 2)) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <span className="dashboard-key-inner">
              К загрузке
              <SortButton prop="loadingPercentage" />
            </span>
          </span>
          <span className="dashboard-val">
            { formatNumber(round(loadingPercentage, 2)) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip title={"Процент убытка при движении цены в противоположную от позиции сторону"} placement={this.state.tooltipPlacement}>
              Риск
            </Tooltip>
          </span>
          <span className="dashboard-val">
            { round(risk, 2) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip title={"Доступные средства на депозите с учётом загрузки и риска"} placement={this.state.tooltipPlacement}>
              Свободно
            </Tooltip>
          </span>
          <span className="dashboard-val">
            { round(freeMoney, 2) }%
          </span>
        </div>
        {/* col */}

        <CrossButton 
          aria-hidden={index == 0 ? "true" : "false"}
          className={["dashboard-row__delete"].concat(index == 0 ? "invisible" : "").join(" ").trim()}
          onClick={e => onDelete(index)}
        />
      </div>
    )
  }
}