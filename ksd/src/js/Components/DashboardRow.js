import React from "react";
import { Tooltip } from "antd";
import { isEqual, cloneDeep } from "lodash";
import clsx from "clsx";

import {
  LoadingOutlined
} from "@ant-design/icons";

import NumericInput from "../../../../common/components/numeric-input";
import CustomSelect from "../../../../common/components/custom-select";
import CrossButton  from "../../../../common/components/cross-button";
import ToolSelect   from "../../../../common/components/tool-select";

import { Tools, Tool } from "../../../../common/tools";
import round           from "../../../../common/utils/round";
import formatNumber    from "../../../../common/utils/format-number";
import fractionLength  from "../../../../common/utils/fraction-length";

import DashboardKey from "./DashboardKey";

const withoutFunctions = obj => {
  const stringified = JSON.stringify(obj);
  const parsed = JSON.parse(stringified);
  return parsed;
};

export default class DashboardRow extends React.Component {

  constructor(props) {
    super(props);

    let { percentage, selectedToolName, planIncome, toolsLoading } = this.props;

    this.state = {
      percentage,
      selectedToolName,
      planIncome,

      tooltipText: "",
      tooltipVisible: false,

      tooltipPlacement: "top",

      calculatedToolIndex: this.getCurrentToolIndex(),

      searchVal: "",
      planIncomeCustom: ""
    };
  }

  onScroll = () => {
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
        this.setState({ tooltipPlacement: "bottom" });
      }
    }
    else {
      if (this.state.tooltipPlacement == "bottom") {
        this.setState({ tooltipPlacement: "top" });
      }
    }
  };

  componentDidMount() {
    addEventListener("scroll", this.onScroll);
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(prevProps.tools, this.props.tools) || 
      !isEqual(prevProps.item,  this.props.item)
    ) {
      this.setState({ 
        calculatedToolIndex: this.getCurrentToolIndex()
      });
    }
  }

  componentWillUnmount() {
    removeEventListener("scroll", this.onScroll);
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

  getToolIndexByCode(code) {
    const { tools, selectedToolName } = this.props;
    if (!code || !tools.length) {
      return 0;
    }

    return Tools.getToolIndexByCode(tools, selectedToolName);
  }

  getCurrentTool() {
    if (this.currentTool) {
      return this.currentTool;
    }

    const { tools } = this.props;
    return tools[this.state.calculatedToolIndex] || Tools.createArray()[0];
  }

  getCurrentToolIndex() {
    const { selectedToolName } = this.props;
    return this.getToolIndexByCode(selectedToolName);
  }
  
  render() {
    const { tooltipVisible, tooltipText, planIncomeCustom } = this.state;
    let { selectedToolName, percentage, item, toolsLoading } = this.props;
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
      onDropdownClose
    } = this.props;

    selectedToolName = (selectedToolName != null) ? selectedToolName : tools[0].getSortProperty();

    const currentToolIndex = this.state.calculatedToolIndex;
    
    this.currentTool  = tools[currentToolIndex] ?? Tools.createArray()[0];
    /** @type {Tool} */
    const currentTool = this.currentTool;
    const selectedToolRegion = currentTool.region;

    const realSelectedToolName = tools[currentToolIndex].getSortProperty();

    const toolNotFound =
      selectedToolName.slice(0, currentTool.isFutures ? 2 : undefined) !==
      realSelectedToolName.slice(0, currentTool.isFutures ? 2 : undefined);

    var planIncome = this.getPlanIncome();

    var contracts = Math.floor(depo * (percentage / 100) / currentTool.guarantee);
    
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
            className={clsx(
              className,
              prop === sortProp && sortDESC != null ? "active" : "",
              prop === sortProp && (sortDESC != null && !sortDESC)
                ? "reversed"
                : ""
            )}
            type="button"
            onClick={e => {
              let value;
              if (sortDESC == null) {
                value = true;
              }
              else {
                value = sortDESC ? !sortDESC : undefined;
              }
  
              onSort(prop, value);
            }}
          ></button>
        </div>
      );
    };

    this.updated = {
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
      // Выбранный инструмент
      selectedToolRegion,
      // Идентификатор реального найденного инструмента
      realSelectedToolName,

      updatedOnce: item.updatedOnce
    };

    const pureItem = cloneDeep(item);
    delete pureItem.isToolsDropdownOpen;

    if (!isEqual(this.updated, pureItem)) {
      onUpdate(this.updated);
    }

    return (
      <div className="dashboard-row">
        <div className="dashboard-col dashboard-col--wide">
          <span className="dashboard-key">Инструмент</span>
          <span className="dashboard-val">
            <ToolSelect
              errorMessage={toolNotFound && <span>Код инструмента не найден</span>}
              errorTrigger="hover"
              className={clsx(
                "dashboard__select",
                "dashboard__select--wide"
              )}
              value={currentToolIndex}
              onChange={currentToolIndex => {
                onDropdownClose();
                onChange("isToolsDropdownOpen", false);
                onChange("selectedToolName", tools[currentToolIndex].getSortProperty());
              }}
              onFocus={() => onChange("isToolsDropdownOpen", true)}
              onBlur={() => {
                onChange("isToolsDropdownOpen", false);
                onDropdownClose();
              }}
            />
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col dashboard-col--narrow">
          <DashboardKey sortProp="guarantee" onSort={onSort}>
            Цена
            {" / "}
            <Tooltip title="Гарантийное обеспечение" placement={this.state.tooltipPlacement}>
              ГО
            </Tooltip>
          </DashboardKey>
          <span className="dashboard-val dashboard-val--wrap">
            {toolsLoading
              ?
                <LoadingOutlined />
              :
                <>
                  <span className="no-wrap">{formatNumber(currentTool.currentPrice)}</span>
                  {" / "}
                  <span className="no-wrap">{formatNumber(currentTool.guarantee)}</span>
                </>
            }
          </span>
        </div>
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip 
              title="Объём депозита в процентах на вход в сделку" 
              placement={this.state.tooltipPlacement}
            >
              Загрузка %
            </Tooltip>  
          </span>
          <span className="dashboard-val">
            <CustomSelect
              className="dashboard__select"
              // loading={toolsLoading}
              disabled={toolsLoading}
              onFocus={() => {
                console.log("custom select focus");
                onChange("isToolsDropdownOpen", true);
              }}
              onBlur={() => {
                console.log("custom select blur");
                onChange("isToolsDropdownOpen", false);
                onDropdownClose();
              }}
              options={new Array(10).fill(0).map((n, i) => 10 * (i + 1))}
              allowFraction={2}
              min={0.01}
              max={100}
              value={percentage}
              onChange={value => onChange("percentage", value)}
              suffix="%"
            />
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">Контракты</span>
                <span className="dashboard-val">
                  {contracts}
                </span>
          {/* {
            toolsLoading
              ?
                <span className="dashboard-val dashboard-val--wrap">
                  <LoadingOutlined />
                </span>
              :
          } */}
        </div>
        {/* col */}
        <div className="dashboard-col dashboard-col--narrow">
          <span className="dashboard-key">
            <Tooltip 
              title="Предполагаемые изменения цены" 
              placement={this.state.tooltipPlacement}
            >
              Ход
            </Tooltip>
            {" "}
            $/₽
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
                    title={`${formatNumber(+(planIncomeTooltip).toFixed(fraction))} = ${formatNumber(steps)} п`}
                    visible={tooltipVisible}
                  >
                    <NumericInput
                      className="dashboard__input"
                      defaultValue={+(planIncome).toFixed(fraction)}
                      unsigned="true" 
                      disabled={toolsLoading}
                      format={formatNumber}
                      min={0}
                      onBlur={value => {
                        value = Number(value);
                        onChange("planIncome", value);
                        onChange("isToolsDropdownOpen", false);
                        onDropdownClose();
                        this.setState({ planIncomeCustom: "", tooltipVisible: false });
                      }}
                      onChange={(e, value = "") => {
                        this.setState({ planIncomeCustom: value });
                      }}
                      onFocus={e => {
                        this.setState({ tooltipVisible: true });
                      }}
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
                        timeout = setTimeout(() => this.setState({ tooltipVisible: false }), 500);
                      }}
                    />
                  </Tooltip>
                )
                : formatNumber((planIncome).toFixed(fraction)); 
            })()}
          </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip 
              title="Прибыль в рублях к депозиту на заданную загрузку при предполагаемом ходе цены" 
              placement={this.state.tooltipPlacement}
            >
              Руб.
            </Tooltip>
          </span>
          {
          //   toolsLoading
          //   ?
          //   <span className="dashboard-val dashboard-val--wrap">
          //     <LoadingOutlined />
          //   </span>
          //   :
            <span className="dashboard-val">
              {formatNumber(Math.round(income))}
            </span>
          }
        </div>
        {/* col */}
        <div className="dashboard-col">
          <DashboardKey sortProp="incomePercentage" onSort={onSort}>
            К депо
          </DashboardKey>
          {/* {toolsLoading
            ?
            <span className="dashboard-val dashboard-val--wrap">
              <LoadingOutlined />
            </span>
            :
          } */}
            <span className="dashboard-val">
              {formatNumber(round(incomePercentage, 2))}%
            </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <DashboardKey sortProp="loadingPercentage" onSort={onSort}>
            К загрузке
          </DashboardKey>
          {/* {toolsLoading
            ?
            <span className="dashboard-val dashboard-val--wrap">
              <LoadingOutlined />
            </span>
            :
          } */}
            <span className="dashboard-val">
              {formatNumber(round(loadingPercentage, 2))}%
            </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip 
              title="Процент убытка при движении цены в противоположную от позиции сторону"
              placement={this.state.tooltipPlacement}
            >
              Риск
            </Tooltip>
          </span>
          {/* {toolsLoading
            ?
            <span className="dashboard-val dashboard-val--wrap">
              <LoadingOutlined />
            </span>
            :
          } */}
            <span className="dashboard-val">
              {round(risk, 2)}%
            </span>
        </div>
        {/* col */}
        <div className="dashboard-col">
          <span className="dashboard-key">
            <Tooltip 
              title="Доступные средства на депозите с учётом загрузки и риска"
              placement={this.state.tooltipPlacement}
            >
              Свободно
            </Tooltip>
          </span>
          {/* {toolsLoading
            ?
            <span className="dashboard-val dashboard-val--wrap">
              <LoadingOutlined />
            </span>
            :
          } */}
            <span className="dashboard-val">
              {round(freeMoney, 2)}%
            </span>
        </div>
        {/* col */}

        <CrossButton 
          aria-hidden={index == 0}
          className={clsx("dashboard-row__delete", index == 0 && "invisible")}
          onClick={e => onDelete(index)}
        />
      </div>
    );
  }
}