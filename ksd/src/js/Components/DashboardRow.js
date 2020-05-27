import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip, Select } from 'antd/es'

import NumericInput from "../Components/NumericInput"
import CustomSelect from "../Components/CustomSelect/CustomSelect"
import round from "../round"
import formatNumber from "../formatNumber"

const { Option } = Select;

export default class DashboardRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Загрузка депо%
      percentage: 10,

      selectedToolIndex: 0,
      planIncome:        null
    };
  }

  getTool() {
    const { selectedToolIndex } = this.state;
    const { tools } = this.props;
    return tools[selectedToolIndex];
  }

  getPlanIncome() {
    const { mode } = this.props;
    var planIncome = this.getTool().planIncome;
    if (this.state.planIncome) {
      planIncome = this.state.planIncome;
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

  render() {
    const { selectedToolIndex, percentage } = this.state;
    const { mode, depo, tools } = this.props;

    const blackSwan = this.getBlackSwan();

    var planIncome = this.getPlanIncome();

    var contracts = Math.floor( depo * (percentage / 100) / this.getTool().guaranteeValue );
    
    var income = contracts * planIncome / this.getTool().priceStep * this.getTool().stepPrice;
    var incomePercentage = (income / depo) * 100;
    var risk = 
      contracts 
      * this.getTool().adr[1] 
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
              className="dashboard__select dashboard__select--wide" 
              value={selectedToolIndex}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={selectedToolIndex => {
                this.setState({ selectedToolIndex })
              }}
            >
              {                
                tools.map((tool, index) =>
                  <Option key={index} value={index} title={tool.name}>{ tool.code }</Option>
                )
              }
            </Select>
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Цена / ГО</span>
          <span className="dashboard-val">
            { formatNumber(this.getTool().price) } /<br/>
            { formatNumber(this.getTool().guaranteeValue) }
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Загрузка</span>
          <span className="dashboard-val">
            <CustomSelect
              className="dashboard__select"
              optionsDefault={new Array(10).fill(0).map((n, i) => 10 * (i + 1))}
              formatOption={val => val + "%"}
              min={1}
              max={100}
              onChange={val => this.setState({ percentage: val })}
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
                    key={this.getTool().code}
                    className="dashboard__input" 
                    defaultValue={this.getPlanIncome()}
                    format={val => formatNumber( round(val, 4) )}
                    onBlur={val => this.setState({ planIncome: val })}
                  />
                )
                : formatNumber(round(this.getPlanIncome(), 2))
            }
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col dashboard-col--wide">
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