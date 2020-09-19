import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip, Select } from 'antd/es'

import NumericInput from "../components/numeric-input"
import CustomSelect from "../components/custom-select"
import CrossButton  from "../components/cross-button"

import isEqual        from "../utils/is-equal"
import round          from "../utils/round"
import formatNumber   from "../utils/format-number"
import fractionLength from "../utils/fraction-length"

const { Option } = Select;

export default class DashboardRow extends React.Component {
  constructor(props) {
    super(props);

    const { mode, depo, tools, onChange } = this.props;
    let { percentage, selectedToolName, planIncome } = this.props;

    this.state = {
      percentage,
      selectedToolName,
      planIncome
    };
  }

  getTool() {
    const { tools, selectedToolName } = this.props;

    let selectedToolIndex = 0;
    if (selectedToolName != null) {
      for (let i = 0; i < tools.length; i++) {
        let tool = tools[i];
        if (tool.shortName === selectedToolName) {
          selectedToolIndex = i;
          break;
        }
      }
    }

    return tools[selectedToolIndex] || {
      code: "",
      shortName: "",
      name: "",
      stepPrice: 0,
      priceStep: 1,
      price: 1,
      averageProgress: 0,
      guaranteeValue: 1,
      currentPrice: 1,
      lotSize: 0,
      dollarRate: 0,
      adr1: 1,
      adr2: 1,

      isFuters: false,
    };
  }

  getPlanIncome() {
    const { mode, item } = this.props;
    const currentTool = this.getTool();
    var planIncome = currentTool.planIncome;
    // console.log(planIncome);

    // if (item.planIncome !== this.props.planIncome) {
    //   planIncome = this.props.planIncome;
    // }

    planIncome = this.getBlackSwan() / 8;

    if (mode > 0) {
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
    return this.getTool().price * 0.2;
  }

  getToolName(tool = {}) {
    var name = "";
    if (tool.shortName) {
      name += `${tool.shortName}`;
    }
    if (tool.code) {
      name += ` (${tool.code})`;
    }

    return name;
  }

  update() {

  }

  render() {
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

    selectedToolName = (selectedToolName != null) ? selectedToolName : tools[0].shortName;

    const currentTool = this.getTool();
    const blackSwan = this.getBlackSwan();

    var planIncome = this.getPlanIncome();

    var contracts = Math.floor( depo * (percentage / 100) / currentTool.guaranteeValue );
    
    var income = contracts * planIncome / currentTool.priceStep * currentTool.stepPrice;
    var incomePercentage = (income / depo) * 100;
    var loadingPercentage = (incomePercentage / percentage) * 100;
    var risk = 
      contracts 
      * currentTool.adr1
      / currentTool.priceStep
      * currentTool.stepPrice 
      / depo 
      * 100;
    if (mode > 0) {
      risk = contracts * planIncome / currentTool.priceStep * currentTool.stepPrice / depo * 100;
    }

    var freeMoney = 100 - (percentage + risk);

    const itemUpdated = {
      percentage,
      // ГО
      guaranteeValue: currentTool.guaranteeValue,
      // Контракты
      contracts,
      // Ход
      planIncome,
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
      // Имя инструмента
      selectedToolName,
    };

    if (!isEqual(itemUpdated, item)) {
      onUpdate(itemUpdated);
    }

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

    return (
      <div className="dashboard-row">

        <div className="dashboard-col dashboard-col--wide">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val">
            <Select
              key={selectedToolName}
              className="dashboard__select dashboard__select--wide" 
              value={selectedToolName}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={selectedToolName => onChange("selectedToolName", selectedToolName)}
            >
              {                
                tools.map((tool, index) =>
                  <Option key={index} value={tool.shortName} title={tool.name}>
                    { this.getToolName(tool) }
                  </Option>
                )
              }
            </Select>
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            Цена / ГО
            <SortButton prop="guaranteeValue" />
          </span>
          <span className="dashboard-val dashboard-val--wrap">
            <span className="no-wrap">{formatNumber(this.getTool().price)}</span>
            &nbsp;/&nbsp;
            <span className="no-wrap">{formatNumber(this.getTool().guaranteeValue)}</span>
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Загрузка</span>
          <span className="dashboard-val">
            <CustomSelect
              key={percentage}
              className="dashboard__select"
              options={new Array(10).fill(0).map((n, i) => 10 * (i + 1))}
              formatOption={val => val + "%"}
              min={1}
              max={100}
              value={percentage}
              onChange={val => onChange("percentage", val)}
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
          <span className="dashboard-key">Ход</span>
          <span className="dashboard-val">
            {(() => {
              const fraction = fractionLength(currentTool.priceStep);
              // console.log(currentTool.priceStep, fraction);

              return mode == 0
                ? (
                  <NumericInput
                    key={Math.random()}
                    className="dashboard__input"
                    defaultValue={planIncome}
                    format={val => formatNumber((val).toFixed(fraction))}
                    onBlur={val => onChange("planIncome", val)}
                  />
                )
                : formatNumber((planIncome).toFixed(fraction)) 
            })()}
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col dashboard-col--semiwide">
          <span className="dashboard-key">Руб.</span>
          <span className="dashboard-val">
            { formatNumber( round(income, 2) ) } руб.
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            К депо
            <SortButton prop="incomePercentage" />
          </span>
          <span className="dashboard-val">
            { round(incomePercentage, 2) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            К загрузке
            <SortButton prop="loadingPercentage" />
          </span>
          <span className="dashboard-val">
            { round(loadingPercentage, 2) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Риск</span>
          <span className="dashboard-val">
            { round(risk, 1) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Свободно</span>
          <span className="dashboard-val">
            { round(freeMoney, 2) }%
          </span>
        </div>
        {/* col */}

        {index > 0 &&
          <CrossButton 
            className="dashboard-row__delete"
            onClick={e => onDelete(index)}
          />
        }

      </div>
    )
  }
}