import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip, Select } from 'antd/es'

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  LoadingOutlined,
  QuestionCircleFilled,
  SettingFilled,
} from "@ant-design/icons"

import NumericInput from "../../../../common/components/numeric-input"
import CustomSelect from "../../../../common/components/custom-select"
import CrossButton  from "../../../../common/components/cross-button"

import { Tools, template } from "../../../../common/tools"
import round          from "../../../../common/utils/round"
import formatNumber   from "../../../../common/utils/format-number"
import fractionLength from "../../../../common/utils/fraction-length"
import croppString    from "../../../../common/utils/cropp-string"
import { merge, cloneDeep as clone, isEqual } from 'lodash'

const { Option } = Select;

export default class DashboardRow extends React.Component {
  constructor(props) {
    super(props);

    let { percentage, selectedToolName, planIncome } = this.props;

    this.state = {
      percentage,
      selectedToolName,
      planIncome,

      tooltipText: "",
      tooltipVisible: false
    };
  }

  getPlanIncome() {
    const { mode, item, index } = this.props;
    const currentTool = this.getCurrentTool();
    var planIncome;
    // console.log(currentTool, item);

    if (mode == 0) {
      if (index == 0) {
      }
      // В приоритете введенное значение, если его нет - откатываемся к дефолтному
      planIncome = item.planIncome != null ? item.planIncome : currentTool.adrDay;
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
    const { tooltipVisible, tooltipText } = this.state;
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
      realSelectedToolName: tools[this.getCurrentToolIndex()].getSortProperty(),

      updatedOnce: item.updatedOnce,
    };

    if (!
      (
        currentTool.getSortProperty() == selectedToolName ||
        currentTool.code              == selectedToolName
      )
    ) {
      // delete itemUpdated.planIncome;
    }
    
    if (!isEqual(itemUpdated, item)) {
      // console.log(item, itemUpdated);
      onUpdate(itemUpdated);
    }

    return (
      <div className="dashboard-row">

        <div className="dashboard-col dashboard-col--wide">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val">
            <Select
              key={currentToolIndex}
              className="dashboard__select dashboard__select--wide" 
              value={currentToolIndex}
              onChange={currentToolIndex => {
                onChange("selectedToolName", tools[currentToolIndex].getSortProperty());
              }}
              disabled={tools.length == 0}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: "100%" }}
            >
              {(() => {
                if (tools.length) {
                  return tools
                    .map(tool => String(tool))
                    .map((value, index) => <Option key={index} value={index}>{value}</Option>)
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
            Цена / ГО
            <SortButton prop="guarantee" />
          </span>
          <span className="dashboard-val dashboard-val--wrap">
            <span className="no-wrap">{formatNumber(this.getCurrentTool().currentPrice)}</span>
            &nbsp;/&nbsp;
            <span className="no-wrap">{formatNumber(this.getCurrentTool().guarantee)}</span>
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
          <span className="dashboard-key">Ход $/₽</span>
          <span className="dashboard-val">
            {(() => {
              const fraction = fractionLength(currentTool.priceStep);
              let timeout;
              if (!tooltipText) {
                this.setState({
                  tooltipText: `${(planIncome).toFixed(fraction)} = ${round(planIncome / currentTool.priceStep, 2)} п`
                })
              }

              return mode == 0
                ? (
                  <Tooltip 
                    title={tooltipText}
                    visible={tooltipVisible}
                  >
                    <NumericInput
                      key={Math.random()}
                      className="dashboard__input"
                      defaultValue={planIncome}
                      format={val => formatNumber((val).toFixed(fraction))}
                      onBlur={val => onChange("planIncome", val)}
                      onChange={(e, value = "") => {
                        value = Number(value);
                        const tooltipText = `${+(value).toFixed(fraction)} = ${round((value) / currentTool.priceStep, 2)} п`;
                        this.setState({ tooltipText })
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
          <span className="dashboard-key">Руб.</span>
          <span className="dashboard-val">
            { formatNumber( Math.round(income) ) }
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            К депо
            <SortButton prop="incomePercentage" />
          </span>
          <span className="dashboard-val">
            { formatNumber(round(incomePercentage, 2)) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            К загрузке
            <SortButton prop="loadingPercentage" />
          </span>
          <span className="dashboard-val">
            { formatNumber(round(loadingPercentage, 2)) }%
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Риск</span>
          <span className="dashboard-val">
            { round(risk, 2) }%
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

        <CrossButton 
          aria-hidden={index == 0 ? "true" : "false"}
          className={["dashboard-row__delete"].concat(index == 0 ? "invisible" : "").join(" ").trim()}
          onClick={e => onDelete(index)}
        />

      </div>
    )
  }
}