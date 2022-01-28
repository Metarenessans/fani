import React from 'react'
import {
  Select,
  Button,
  Tooltip,
  Switch,
} from "antd/es"

import {
  SettingFilled,
  LoadingOutlined,
} from '@ant-design/icons'

import { Tools } from "../../../../common/tools"

import NumericInput from "../../../../common/components/numeric-input"
import CustomSelect from "../../../../common/components/custom-select"
import Value        from "../../../../common/components/value"

import formatNumber from "../../../../common/utils/format-number"
import round        from "../../../../common/utils/round"
import num2str      from "../../../../common/utils/num2str"

const { Option } = Select;

export default class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    const { data } = this.props;
    
    this.state = {
      drawdown: (data.drawdown != null) ? data.drawdown : this.props.depo * 0.1,
      searchVal: ""
    };

    if (this.props.onRef) {
      this.props.onRef(this, this.props.index);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { drawdown } = this.props.data;
    if (drawdown != prevProps.data.drawdown) {
      this.setState({ drawdown });
    }
  }

  parseTool(str) {
    var arr = str
      .replace(/\,/g, ".")
      .split(/\t/g)
      .map(n => (n + "").replace(/\"/g, "").replace(/(\d+)\s(\d+)/, "$1$2"));
    
    var obj = {
      name:             arr[0],
      stepPrice:       +arr[1] || 0,
      priceStep:       +arr[2] || 0,
      averageProgress: +arr[3] || 0,
      guarantee:       +arr[4] || 0,
      currentPrice:    +arr[5] || 0,
      lotSize:         +arr[6] || 0,
      dollarRate:      +arr[7] || 0,

      points: [
        [ 70,  70 ],
        [ 156, 55 ],
        [ 267, 41 ],
        [ 423, 27 ],
        [ 692, 13 ],
        [ 960,  7 ],
      ]
    };
    return obj;
  }

  getCurrentTool() {
    const { data } = this.props;
    const { selectedToolName } = data;
    return this.getToolByName(selectedToolName);
  }

  getToolByName(name) {
    const { tools } = this.props;
    const index = Tools.getToolIndexByCode(tools, name);
    return tools[index] ?? Tools.createArray()[0];
  }

  getCurrentToolIndex() {
    const { tools, data } = this.props;

    const selectedToolName = data.selectedToolName;

    let selectedToolIndex = 0;
    if (selectedToolName != null) {
      for (let i = 0; i < tools.length; i++) {
        let tool = tools[i];
        if (tool.getSortProperty() === selectedToolName) {
          return i;
        }
      }
    }

    return 0;
  }
  
  getContracts() {
    const { onContractsChange, items, depo, tools, index } = this.props;
    
    if (items && depo) {
      const currentTool = this.getCurrentTool();
      const contracts = round( (depo * 0.1) / (currentTool?.guarantee) );

      if (contracts !== null) {
        onContractsChange(index, contracts, "contracts");
      }
    }
  }

  render() {
    const { 
      index,
      onDelete,
      onCopy,
      onOpenConfig,
      onChange,
      depo,
      data,
      tools,
      onBlur,
      onFocus,
      toolsLoading,
      onChangeTool,
      onContractsChange,
      loading
    } = this.props;

    const drawdown           = this.state.drawdown;
    const contracts          = data.contracts;
    const stepExpected       = data.stepExpected;
    const additionalLoading  = data.additionalLoading;
    const directUnloading    = data.directUnloading;
    const isLong             = data.isLong;
    
    let investorInfo = {...this.props.investorInfo};
    investorInfo.type = isLong ? "LONG" : "SHORT";
    
    let currentTool = this.getCurrentTool();
    if (currentTool.update) {
      currentTool.update(investorInfo, { useDefault: true });
    }

    const currentToolIndex = Tools.getToolIndexByCode(tools, data.selectedToolName);

    let selectedToolName = data.selectedToolName;
    if (selectedToolName == null && this.props.tools.length) {
      selectedToolName = this.props.tools[0].getSortProperty();
    }

    let rubbles = contracts * currentTool.guarantee;

    var additionalLoading2 = data.additionalLoading2 || additionalLoading;
    var stepExpected2 = data.stepExpected2 || stepExpected;

    const freeMoney = depo - drawdown - rubbles;
    const pointsAgainst = drawdown / (contracts * currentTool.stepPrice);
    
    const incomeExpected = 
      // (Депозит * процент догрузки) / ГО
      ((depo * (additionalLoading / 100)) / currentTool.guarantee) * 
      // Ожидаемый ход / шаг цены * цена шага
      (stepExpected / currentTool.priceStep * currentTool.stepPrice);
      // // Кол-во контрактов
      // contracts * 
      // // Ожидаемый ход / шаг цены * цена шага
      // (stepExpected / currentTool.priceStep * currentTool.stepPrice);

    const incomeExpected2 = ((depo * (additionalLoading2 / 100)) / currentTool.guarantee) * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice) + contracts * (stepExpected2 / currentTool.priceStep * currentTool.stepPrice);

    function AddButton(props) {
      var className = props.className || ""; 

      return (
        <Button
          className={"custom-btn tool-header__add-btn"
            .split(/\s+/g)
            .concat(className)
            .join(" ")
            .trim()
          }
          onClick={() => {
            if (onCopy) {
              onCopy();
            }
          }}>
          + инструмент
        </Button>
      )
    }

    return (
      <div className="tool">
        <Tooltip title="Удалить">
          <button
            className="tool__delete delete-btn"
            aria-label="Удалить"
            onClick={() => {
              if (onDelete) {
                onDelete();
              }
            }}>
            <span>&times;</span>
          </button>
        </Tooltip>

        <header className="card tool-header">

          <div className="tool-header-top">

            <label className="tool-header__select">
              <span className="input-group__title search__title">Торговый инструмент</span>
              <Select
                key={toolsLoading || selectedToolName}
                onBlur={onBlur}
                onFocus={onFocus}
                value={toolsLoading && this.props.tools.length == 0 ? 0 : currentToolIndex}
                loading= {toolsLoading || loading || tools.length == 0}
                disabled={toolsLoading || loading || tools.length == 0}
                onChange={index => {
                  let name = this.props.tools[index].getSortProperty();
                  onChange("selectedToolName", name, this);
                  onChangeTool(index);
                  // this.getContracts(index, "contracts");
                }}
                showSearch
                onSearch={(value) => this.setState({ searchVal: value })}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
              >
                {(() => {
                  if (tools.length == 0) {
                    return (
                      <Option key={0} value={0}>
                        <LoadingOutlined style={{ marginRight: ".2em" }} />
                                  Загрузка...
                      </Option>
                    )
                  }
                  else {
                    return tools.map((tool, index) => (
                      <Option key={index} value={index} title={String(tool)}>
                        {String(tool)}
                      </Option>
                    ))
                  }
                })()}
              </Select>
            </label>

            <label className="input-group">
              <span className="input-group__title">
                <Tooltip title="Текущий убыток по инструменту">
                  Просадка
                </Tooltip>
              </span>
              <NumericInput
                className="input-group__input tool__drawdown"
                key={drawdown}
                defaultValue={round(drawdown, 1)}
                unsigned="true"
                min={1}
                onBlur={drawdown => {
                  onChange("drawdown", drawdown);
                  this.setState({ drawdown });
                  // if (this.props.onDrawdownChange) {
                  //   this.props.onDrawdownChange(val, this.recalc.bind(this));
                  // }
                }}
                format={formatNumber}
              />
            </label>

            <label className="input-group">
              <span className="input-group__title">
                <Tooltip title="Объём убыточной позиции в контрактах (лотах)">
                  Контрактов
                </Tooltip>
              </span>
              <NumericInput
                className="input-group__input"
                key={contracts}
                defaultValue={contracts}
                round
                unsigned="true"
                min={1}
                onBlur={val => {
                  onChange("contracts", val);
                }}
                format={formatNumber}
              />
            </label>

            <div className="tool-header-top-tail">
              <div className="tool-header-top-tail__wrap">
                <AddButton />

                <label className="switch tool-header__long-short">
                  <Tooltip title="Направление позиции">
                    <Switch
                      className="switch__input"
                      key={isLong + Math.random()}
                      checkedChildren="LONG"
                      unCheckedChildren="SHORT"
                      defaultChecked={isLong}
                      onChange={val => {
                        onChange("isLong", val);
                      }}
                    />
                  </Tooltip>
                  {/* <span className="switch__label">SHORT</span> */}
                </label>

                {index == 0 && (
                  <Tooltip title="Настройки">
                    <button
                      className="settings-button tool-header__settings"
                      onClick={e => {
                        if (onOpenConfig) {
                          onOpenConfig(e);
                        }
                      }}>
                      <span className="visually-hidden">Открыть конфиг</span>
                      <SettingFilled className="settings-button__icon" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
            {
              
            }

          </div>

          <div className="tool-header-bottom">
            <div className="tool-header-bottom__wrap">

              <div className="tool-pair">
                <h3 className="tool-pair-key">
                  <Tooltip title="Объём задействованного депозита в процентах">
                      Загрузка:
                  </Tooltip>
                </h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + `%`}>
                    {(() => {
                      var value = (drawdown + currentTool.guarantee * contracts) / depo * 100;
                      return round(value, 1);
                    })()}
                  </Value>
                </span>
              </div>

              <div className="tool-pair">
                <h3 className="tool-pair-key">
                  <Tooltip title="Текущий убыток по инструменту">
                      Просадка:
                  </Tooltip>
                </h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + "%"}>
                    {(() => {
                      let val = (drawdown / depo) * 100;
                      val = Math.min(val, 100);

                      return -round(val, 1)
                    })()}
                  </Value>
                </span>
              </div>

              <div className="tool-pair">
                <h3 className="tool-pair-key">
                  <Tooltip title="Остаток на счёте с учетом просадки и загрузки">
                      Свободный депозит:
                  </Tooltip>
                </h3>
                <span className="tool-pair-val">
                  <Value format={val => formatNumber(val) + " руб."}>
                    {(() => {
                      const value = depo - (drawdown + contracts * currentTool.guarantee);
                      return round(value, 1);
                    })()}
                  </Value>
                </span>
              </div>
              
              <div className="tool-pair">
                <h3 className="tool-pair-key">
                  <Tooltip title="Цена приобретения позиции">
                      Средняя цена:
                  </Tooltip>
                </h3>
                <span className="tool-pair-val">
                  {(() => {
                    const search = /\.\d+$/g.exec(String(currentTool.currentPrice));
                    const fractionLength = search ? search[0].slice(1).length : 0;

                    const value = currentTool.currentPrice + (pointsAgainst * currentTool.priceStep) * (isLong ? 1 : -1);

                    return <Value format={formatNumber} isDefault="true">{(value).toFixed(fractionLength)}</Value>
                  })()}
                </span>
              </div>

              <div className="tool-pair">
                <h3 className="tool-pair-key">
                  <Tooltip title="Движение цены в пунктах  против направления позиции">
                      Пунктов:
                  </Tooltip>
                </h3>
                <span className="tool-pair-val">
                  <Value format={formatNumber} isDefault="true">
                    {Math.round(-pointsAgainst)}
                  </Value>
                </span>
              </div>

            </div>
          </div>
        </header>
        {/* top horizontal card */}

        <div className="tool-main">
          <div className="tool-main__wrap">

            <div className="tool-main-card card">
              <header className="tool-main-card-header">
                <h2 className="tool-main-card__title">
                  <Tooltip title=" Условие движения цены в сторону направления позиции ">
                      Позитивный сценарий
                  </Tooltip>
                </h2>
                <label className="switch tool-main-card-header__switch">
                  <Switch
                    className="switch__input"
                    checked={directUnloading}
                    onChange={val => {
                      onChange("directUnloading", val);
                    }} 
                  />
                  <span className="switch__label">
                    <Tooltip title="Прямая разгрузка позиции">
                        Прямая
                    </Tooltip>
                  </span>
                </label>
              </header>
              
              {(() => {
                var iterations = 
                  +(drawdown / incomeExpected).toFixed(1) /
                   (directUnloading ? 1 : .6);
                var incomeForIteration = (incomeExpected * (directUnloading ? 1 : .6)).toFixed(1);
                  
                return (
                  <div className="tool-main-card-body">

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            <Tooltip title="Объём для усреднения позиции">
                              Догрузка
                            </Tooltip>
                          </span>
                          <CustomSelect
                            key={additionalLoading}
                            options={
                              [5].concat(new Array(7).fill(0).map((val, i) => 10 * (i + 1)))
                            }
                            format={val => val + "% от депо"}
                            value={additionalLoading}
                            min={1}
                            max={100}
                            onChange={value => onChange("additionalLoading", value)}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const contracts = depo * (additionalLoading / 100) / currentTool.guarantee;
                            return `${additionalLoading}% = ${formatNumber(round(contracts, 2))} контрактов`;
                          })()}
                        </p>
                      </div>
                      
                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          <Tooltip title="Количество повторений усреднения и разгрузки для ликвидации просадки">
                            Итераций:
                          </Tooltip>
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(iterations, 2)) }
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            <Tooltip title="Планируемое движение цены в сторону позиции после усреднения">
                              Ожидаемый ход (руб/$)
                            </Tooltip>
                          </span>
                          <NumericInput
                            className="input-group__input"
                            min={currentTool.priceStep}
                            unsigned="true"
                            defaultValue={stepExpected}
                            key={Math.random()}
                            onChange={(e, val, jsx) => {
                              let errMsg = "";
                              if (val > currentTool.currentPrice) {
                                errMsg = "Длина хода больше текущей цены!";
                              }
                              jsx.setState({ errMsg });
                            }}
                            onBlur={val => {
                              if (val == 0) {
                                val = 0.1;
                              }
                              onChange("stepExpected", val);
                              // this.setState({ stepExpected: val }, this.recalc)
                            }}
                            format={formatNumber}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const steps = round(stepExpected / currentTool.priceStep, 2);
                            return `${formatNumber(stepExpected)} ₽/$ = ${formatNumber(steps)} ${num2str(Math.floor(steps), ["шаг", "шага", "шагов"])} цены`;
                          })()}
                        </p>
                      </div>

                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          <Tooltip title="Сумма дохода в рублях за каждую итерацию">
                            Прибыль <br className="hide-xs" />
                            за итерацию:
                          </Tooltip>
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={val => formatNumber(round(val, 3))}>
                            {incomeForIteration}
                          </Value>
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">
                          <Tooltip title="Количество повторений усреднения и разгрузки для ликвидации просадки">
                            Итераций
                          </Tooltip>
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(iterations, 2)) }
                        </span>
                      </div>
                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">
                          <Tooltip title="Сумма дохода в рублях за каждую итерацию">
                            Прибыль за итерацию
                          </Tooltip>
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={formatNumber}>{incomeForIteration}</Value>
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })()}
            </div>
            
            <div className="tool-main-card card">
              <header className="tool-main-card-header">
                <h2 className="tool-main-card__title">
                  <Tooltip title="Условие движения цены против направления позиции">
                      Негативный сценарий
                  </Tooltip>
                </h2>
              </header>

              {(() => {
                var deposit = Math.round(freeMoney - (incomeExpected2 ? incomeExpected2 : incomeExpected));

                var loss = (
                  incomeExpected2
                    ? -incomeExpected2
                    : -incomeExpected
                ).toFixed(1) - drawdown;

                return (
                  <div className="tool-main-card-body">

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            <Tooltip title="Объём для усреднения позиции">
                              Догрузка
                            </Tooltip>
                          </span>
                          <CustomSelect
                            key={additionalLoading2}
                            options={
                              [5].concat(new Array(7).fill(0).map((val, i) => 10 * (i + 1)))
                            }
                            format={val => val + "% от депо"}
                            value={additionalLoading2}
                            min={1}
                            max={100}
                            onChange={value => onChange("additionalLoading2", value)}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const contracts = depo * (additionalLoading2 / 100) / currentTool.guarantee;
                            return `${additionalLoading2}% = ${formatNumber(round(contracts, 2))} контрактов`;
                          })()}
                        </p>
                      </div>


                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          <Tooltip title="Остаток на счёте с учетом просадки и загрузки">
                            Депозит:
                          </Tooltip>
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(deposit, 2)) }
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row">

                      <div className="tool-main-card-body-left">
                        <label className="input-group">
                          <span className="input-group__title input-group__title--left">
                            <Tooltip title="Планируемое движение цены против направления позиции после усреднения">
                              Ожидаемый ход (руб/$)
                            </Tooltip>
                          </span>
                          <NumericInput
                            className="input-group__input"
                            min={currentTool.priceStep}
                            unsigned="true"
                            defaultValue={stepExpected2 != null ? stepExpected2 : stepExpected}
                            key={Math.random()}
                            onChange={(e, val, jsx) => {
                              let errMsg = "";
                              if (val > currentTool.currentPrice) {
                                errMsg = "Длина хода больше текущей цены!";
                              }
                              jsx.setState({ errMsg });
                            }}
                            onBlur={val => {
                              if (val == 0) {
                                val = 0.1;
                              }
                              onChange("stepExpected2", val);
                              // this.setState({ stepExpected2: val }, this.recalc)
                            }}
                            format={formatNumber}
                          />
                        </label>

                        <p className="tool-main-card-body-left__info">
                          {(() => {
                            const steps = round((stepExpected2 != null ? stepExpected2 : stepExpected) / currentTool.priceStep, 2);
                            return `${formatNumber(stepExpected2 != null ? stepExpected2 : stepExpected)} ₽/$ = ${formatNumber(steps)} ${num2str(Math.floor(steps), ["шаг", "шага", "шагов"])} цены`;
                          })()}
                        </p>
                      </div>


                      <div className="tool-main-card-body-pair">
                        <h3 className="tool-main-card-body-pair-key">
                          Суммарная<br className="hide-xs" />
                          просадка
                        </h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={val => formatNumber(round(val, 3))}>{loss}</Value>
                        </span>
                      </div>

                    </div>

                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Депозит</h3>
                        <span className="tool-main-card-body-pair-val">
                          { formatNumber(round(deposit, 2)) }
                        </span>
                      </div>
                    </div>
                    
                    <div className="tool-main-card-body__row--mobile">
                      <div className="tool-main-card-body-pair tool-main-card-body-pair--mobile">
                        <h3 className="tool-main-card-body-pair-key">Суммарная просадка</h3>
                        <span className="tool-main-card-body-pair-val">
                          <Value format={formatNumber}>{loss}</Value>
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })()}
              
            </div>
          
          </div>
        </div>
        {/* main */}

        <footer className="tool-footer">
          <AddButton className="tool-header__add-btn--mobile" />
        </footer>
        {/* footer */}
      </div>
    )
  }
}