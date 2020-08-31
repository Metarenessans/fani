import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip, Select } from 'antd/es'

import NumericInput from "../components/numeric-input"
import CustomSelect from "../components/custom-select"

import round        from "../utils/round"
import formatNumber from "../utils/format-number"

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
    const { mode } = this.props;
    var planIncome = this.getTool().planIncome;
    if (this.props.planIncome) {
      planIncome = this.props.planIncome;
    }

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

  render() {
    let { selectedToolName, percentage } = this.props;
    const { mode, depo, tools, onChange } = this.props;

    selectedToolName = (selectedToolName != null) ? selectedToolName : tools[0].shortName;

    const blackSwan = this.getBlackSwan();

    var planIncome = this.getPlanIncome();

    var contracts = Math.floor( depo * (percentage / 100) / this.getTool().guaranteeValue );
    
    var income = contracts * planIncome / this.getTool().priceStep * this.getTool().stepPrice;
    var incomePercentage = (income / depo) * 100;
    var risk = 
      contracts 
      * this.getTool().adr1
      / this.getTool().priceStep
      * this.getTool().stepPrice 
      / depo 
      * 100;
    if (mode > 0) {
      risk = contracts * planIncome / this.getTool().priceStep * this.getTool().stepPrice / depo * 100;
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
          <span className="dashboard-key">Цена / ГО</span>
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
            {
              mode == 0
                ? (
                  <NumericInput 
                    key={this.getPlanIncome()}
                    className="dashboard__input" 
                    defaultValue={this.getPlanIncome()}
                    format={val => formatNumber( round(val, 4) )}
                    onBlur={val => onChange("planIncome", val)}
                  />
                )
                : formatNumber(round(this.getPlanIncome(), 2))
            }
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
          <span className="dashboard-key">К депо</span>
          <span className="dashboard-val">
            { round(incomePercentage, 2) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">К загрузке </span>
          <span className="dashboard-val">
            { round((incomePercentage / percentage) * 100, 2) }%
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
            { round(100 - (percentage + risk), 2) }%
          </span>
        </div>
        {/* col */}

      </div>
    )
  }
}