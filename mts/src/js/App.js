import React from 'react'
import {
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Pagination,
  InputNumber
} from 'antd/es'
const { Option } = Select;

import {
  LoadingOutlined,
  SettingFilled,
  WarningOutlined
} from "@ant-design/icons"

import fetch          from "../../../common/api/fetch"
import params         from "../../../common/utils/params"
import round          from "../../../common/utils/round";
import formatNumber   from "../../../common/utils/format-number"
import typeOf         from "../../../common/utils/type-of"
import fractionLength from "../../../common/utils/fraction-length"
import promiseWhile   from "../../../common/utils/promise-while"
import { Tools, template } from "../../../common/tools"

import {
  Chart,
  updateChartMinMax,
  updateChartScaleMinMax,
  updateChartZoom
} from "./components/chart"

import Stack                   from "../../../common/components/stack"
import CrossButton             from "../../../common/components/cross-button"
import { Dialog, dialogAPI }   from "../../../common/components/dialog"

import "../sass/style.sass";

import Config                  from "../../../common/components/config"
import NumericInput            from "../../../common/components/numeric-input"
import SettingsGenerator       from "./components/settings-generator"
import CustomSlider            from "../../../common/components/custom-slider"

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initial = {

      loading: true,
      loadingChartData: true,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },

      depo: 1000000,
      mode: 0,
      chance: 50,
      page: 1,
      priceRange: [null, null],
      percentage: 0,
      days: 1,
      data: null,

      customTools: [],
      currentToolCode: "SBER",

      id:                 null,
      saved:              false,
      risk:               0.5,
    };

    this.state = {
      ...this.initial,
      ...{
        saves:              [],
        currentSaveIndex:   0,
        tools:              [],
      } 
    };
  }

  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData();
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  fetchCompanyQuotes(options) {
    const initial = options?.initial;
    this.setState({ loadingChartData: true });

    let from = new Date();
    let to   = new Date();
    from.setMonth(from.getMonth() - 1);

    from = Math.floor(+from / 1000);
    to   = Math.floor(+to   / 1000);

    const tool = this.getCurrentTool();
    let method = "getCompanyQuotes";

    if (tool.dollarRate == 0 && !initial) {
      method = "getPeriodFutures";
      from = tool.firstTradeDate;
      to   = tool.lastTradeDate;
    }

    let body = {
      code: tool.code,
      from,
      to,
    };
    
    if (tool.dollarRate != 0) {
      body = {
        ...body,
        region: tool.dollarRate != 1 ? "US" : "RU",
      };
    }

    fetch(method, "GET", body)
      .then(response => {
        console.log(response);
        if (this.state.currentToolCode == tool.code) {
          const data = response.data;
          this.setState({ data, loadingChartData: false });
        }
      })
      .catch(error => console.error(error));
  }

  // ----------
  // Fetch
  // ----------

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchInvestorInfo();
    this.fetchCompanyQuotes({ initial: true });
    this.fetchTools()
      .then(() => this.fetchCompanyQuotes());
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      fetch("getMtsSnapshots")
        .then(res => {
          const savesSorted = res.data.sort((a, b) => a.dateCreate < b.dateCreate);
          const saves = savesSorted.map(save => ({
            name: save.name,
            id:   save.id,
          }));
          resolve(saves);
        })
        .catch(error => reject(error));
    });
  }

  fetchSaveById(id) {
    return new Promise((resolve, reject) => {
      if (typeof id === "number") {
        console.log("Trying to fetch id:" + id);
        fetch("getMtsSnapshot", "GET", { id })
          .then(res => resolve(res))
          .catch(err => reject(err));
      }
      else {
        reject("id must be a number!", id);
      }
    });
  }

  fetchTools() {
    return new Promise((resolve) => {
      for (let request of [
        "getFutures",
        "getTrademeterInfo"
      ]) {
        fetch(request)
          .then(response => Tools.parse(response.data, { investorInfo: this.state.investorInfo }))
          .then(tools => Tools.sort(this.state.tools.concat(tools)))
          .then(tools => this.setStateAsync({ tools }))
          .then(() => this.updatePriceRange(this.getCurrentTool()))
          .then(resolve)
          .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
      }
    })
  }

  fetchInvestorInfo() {
    fetch("getInvestorInfo")
      .then(response => {
        const { deposit, status, skill } = response.data;
        return new Promise(resolve => {
          this.setState({ investorInfo: { status, skill } }, () => resolve(deposit));
        });
      })
      .then(depo => this.setState({ depo: depo || 10000 }))
      .catch(error => {
        this.showAlert(`Не удалось получить начальный депозит! ${error}`)
        if (dev) {
          this.setState({ depo: 12_000_000 });
        }
      });
  }

  updatePriceRange(tool) {
    return new Promise(resolve => {
      const currentPrice = tool.currentPrice;
      this.setState({ priceRange: [currentPrice, currentPrice] }, () => resolve());
    })
  }

  showAlert(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  bindEvents() {
    
  }

  packSave() {
    let { depo, customTools } = this.state;

    const json = {
      static: {
        depo,
        customTools,
        current_date: "#"
      },
    };

    console.log("Save packed!", json);
    return json;
  }

  validateSave() {
    return true;
  }

  extractSave(save) {
    const onError = e => {
      this.showAlert(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        console.log(saves, currentSaveIndex - 1);
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    let staticParsed;

    let state = {};

    try {
      staticParsed = JSON.parse(save.data.static);
      console.log("staticParsed", staticParsed);

      let m = staticParsed.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.depo        = staticParsed.depo || this.state.depo;
      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tools.create(tool, { investorInfo: this.state.investorInfo }));

      state.id = save.id;
      state.saved = true;
    }
    catch (e) {
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    this.setState(state);
  }

  reset() {
    return new Promise(resolve => {
      const state = JSON.parse(JSON.stringify(this.initial));
      this.setState(state, () => resolve());
    })
  }

  save(name = "") {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject("Name is empty!");
      }

      const json = this.packSave();
      const data = {
        name,
        static: JSON.stringify(json.static),
      };

      fetch("addMtsSnapshot", "POST", data)
        .then(res => {
          console.log(res);

          let id = Number(res.id);
          if (id) {
            console.log("Saved with id = ", id);
            this.setState({ id }, () => resolve(id));
          }
          else {
            reject(`Произошла незвестная ошибка! Пожалуйста, повторите действие позже еще раз`);
          }
        })
        .catch(err => reject(err));
    });
  }

  update(name = "") {
    const { id } = this.state;
    return new Promise((resolve, reject) => {
      if (!id) {
        reject("id must be present!");
      }

      const json = this.packSave();
      const data = {
        id,
        name,
        static: JSON.stringify(json.static),
      };
      fetch("updateMtsSnapshot", "POST", data)
        .then(res => {
          console.log("Updated!", res);
          resolve();
        })
        .catch(err => console.log(err));
    })
  }

  delete(id = 0) {
    console.log(`Deleting id: ${id}`);

    return new Promise((resolve, reject) => {
      fetch("deleteMtsSnapshot", "POST", { id })
        .then(() => {
          let {
            id,
            saves,
            saved,
            changed,
            currentSaveIndex,
          } = this.state

          saves.splice(currentSaveIndex - 1, 1);

          currentSaveIndex = Math.min(Math.max(currentSaveIndex, 1), saves.length);

          if (saves.length > 0) {
            id = saves[currentSaveIndex - 1].id;
            this.fetchSaveById(id)
              .then(save => this.extractSave(Object.assign(save, { id })))
              .then(() => this.setState({ id }))
              .catch(err => this.showAlert(err));
          }
          else {
            this.reset()
              .catch(err => this.showAlert(err));

            saved = changed = false;
          }

          this.setState({
            saves,
            saved,
            changed,
            currentSaveIndex,
          }, resolve);
        })
        .catch(err => reject(err));
    });
  }

  getCurrentTool() {
    const { tools, currentToolCode } = this.state;

    return tools.find(tool => tool.code == currentToolCode) || Tools.create();
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  getToolIndexByCode(code) {
    const tools = this.getTools();
    if (!code || !tools.length) {
      return 0;
    }
    
    let index = tools.indexOf( tools.find(tool => tool.code == code) );
    if (index < 0) {
      index = 0;
    }

    return index;
  }

  getCurrentToolIndex() {
    let { currentToolCode } = this.state;
    return this.getToolIndexByCode(currentToolCode);
  }

  getToolByCode(code) {
    const { tools } = this.state;
    return tools.find(tool => tool.code == code) || Tools.create();
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "Моделирование Торговой Стратегии";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    let { mode, depo, data, chance, page, percentage, priceRange, days, risk } = this.state;

    const currentTool = this.getCurrentTool();
    const isLong = percentage >= 0;
    const priceRangeSorted = [...priceRange].sort((l, r) => l - r);
    const planIncome = priceRangeSorted[1] - priceRangeSorted[0];
    const contracts = Math.floor(depo * (Math.abs(percentage) / 100) / currentTool.guarantee);

    const disabledModes = [
      currentTool.isFutures && currentTool.volume < 1e9,
      currentTool.isFutures && currentTool.volume < 1e9 || depo <= 600000,
      depo <= 100000
    ];
    if (disabledModes[mode]) {
      mode = disabledModes.indexOf(false);
    }

    const fraction = fractionLength(currentTool.priceStep);
    const price   = round(currentTool.currentPrice, fraction);
    let percent = currentTool.adrDay;
    if (days == 5) {
      percent = currentTool.adrWeek;
    }
    else if (days == 20) {
      percent = currentTool.adrMonth;
    }

    const max = round(price + percent, fraction);
    const min = round(price - percent, fraction);

    let income = contracts * planIncome / currentTool.priceStep * currentTool.stepPrice;
    income *= mode == 0 ? 0.6 : 0.9;

    const ratio = income / depo * 100;
    let suffix = round(ratio, 2);
    if (suffix > 0) {
      suffix = "+" + suffix;
    }

    const kod = round(ratio / days, 2);

    const GetPossibleRisk = () => {
      let { depo, percentage, priceRange, risk } = this.state;
      let possibleRisk = 0;

      let enterPoint = isLong ? priceRange[0] : priceRange[1];

      let stopSteps =
        (depo * risk / 100)
        /
        currentTool.stepPrice
        /
        // Number((contracts || 1))
        (contracts || 1)
        *
        currentTool.stepPrice;

      if (risk != 0 && percentage != 0) {
        possibleRisk =
          round(enterPoint + (isLong ? -stopSteps : stopSteps), 2);
        updateChartMinMax(this.state.priceRange, isLong, possibleRisk)
      }

      return possibleRisk
    }


    let possibleRisk = 0;

    let enterPoint = isLong ? priceRange[0] : priceRange[1];

    let stopSteps =
      (depo * risk / 100)
      /
      currentTool.stepPrice
      /
      (contracts || 1)
      *
      currentTool.stepPrice;

    if (risk != 0 && percentage != 0) {
      possibleRisk =
        round(enterPoint + (isLong ? -stopSteps : stopSteps), 2);
        updateChartMinMax(this.state.priceRange, isLong, possibleRisk)
    }

    return (
      <div className="page">

        <main className="main">

          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">

                {/* Select */}
                {(() => {
                  const { saves, currentSaveIndex } = this.state;

                  return (dev || saves.length > 0) && (
                    <label hidden className="labeled-select main-top__select stack-exception">
                      <span className="labeled-select__label labeled-select__label--hidden">
                        Сохраненный калькулятор
                      </span>
                      <Select
                        value={currentSaveIndex}
                        onSelect={val => {
                          const { saves } = this.state;

                          this.setState({ currentSaveIndex: val });

                          if (val === 0) {
                            this.reset()
                              .catch(err => console.warn(err));
                          }
                          else {
                            const id = saves[val - 1].id;
                            this.fetchSaveById(id)
                              .then(save => this.extractSave(Object.assign(save, { id })))
                              .catch(err => this.showAlert(err));
                          }

                        }}>
                        <Option key={0} value={0}>Не выбрано</Option>
                        {saves.map((save, index) =>
                          <Option key={index + 1} value={index + 1}>
                            {save.name}
                            {save.corrupt && (
                              <WarningOutlined style={{
                                marginLeft: ".25em",
                                color: "var(--danger-color)"
                              }}/>
                            )}
                          </Option>
                        )}
                      </Select>
                    </label>
                  )
                })()}

                <Stack>

                  <div className="page__title-wrap">
                    <h1 className="page__title">
                      { this.getTitle() }
                      { (dev || this.state.id) && (
                        <CrossButton
                          className="main-top__remove"
                          onClick={e => dialogAPI.open("dialog4", e.target)}/>
                      )}
                    </h1>
                  </div>

                  <div className="main-top__footer" hidden>

                    <Button
                      className={
                        [
                          "custom-btn",
                          "custom-btn--secondary",
                          "main-top__save",
                        ]
                          .concat(this.state.changed ? "main-top__new" : "")
                          .join(" ")
                          .trim()
                      }
                      onClick={e => {
                        const { saved, changed } = this.state;

                        if (saved && changed) {
                          this.update(this.getTitle());
                          this.setState({ changed: false });
                        }
                        else {
                          dialogAPI.open("dialog1", e.target);
                        }

                      }}>
                      { (this.state.saved && !this.state.changed) ? "Изменить" : "Сохранить" }
                    </Button>
                    
                    {
                      this.state.saves.length > 0 ? (
                        <a
                          className="custom-btn custom-btn--secondary main-top__save"
                          href="#pure=true" 
                          target="_blank"
                        >
                          Добавить новый
                        </a>
                      )
                      : null
                    }

                  </div>

                  <Tooltip title="Настройки">
                    <button
                      className="settings-button js-open-modal main-top__settings"
                      onClick={e => dialogAPI.open("config", e.target)}
                    >
                      <span className="visually-hidden">Открыть конфиг</span>
                      <SettingFilled className="settings-button__icon" />
                    </button>
                  </Tooltip>
                </Stack>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
          {/* /.main-top */}

          <div className="main-content">

            <div className="container">

              <div className="main-content__wrap">
                {(() => {
                  const STEP_IN_EACH_DIRECTION = 20;
                  const step  = (max - min) / (STEP_IN_EACH_DIRECTION * 2);
                  
                  return (
                    <Stack className="main-content__left">

                      <label>
                        <span className="visually-hidden">Торговый инструмент</span>
                        <Select
                          value={this.getCurrentToolIndex()}
                          onChange={currentToolIndex => {
                            const tools = this.getTools();
                            const currentToolCode = tools[currentToolIndex].code; 
                            this.setStateAsync({ currentToolCode })
                              .then(() => this.updatePriceRange(this.getToolByCode(currentToolCode)))
                              .then(() => this.fetchCompanyQuotes());
                          }}
                          disabled={this.getTools().length == 0}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          style={{ width: "100%" }}
                        >
                          {(() => {
                            let tools = this.getTools();
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
                      </label>
                      {/* Торговый инструмент */}

                      <div className="mts-slider1">
                        <span className="mts-slider1-middle">
                          <b>Текущая цена</b><br />
                          ({formatNumber(price)})
                        </span>
                        <span className="mts-slider1-top">
                          <b>{formatNumber(round(max, fraction))}</b>
                          &nbsp;
                          (+{round(percent / currentTool.currentPrice * 100, 2)}%)
                        </span>
                        <span className="mts-slider1-bottom">
                          <b>{formatNumber(round(min, fraction))}</b>
                          &nbsp;
                          (-{round(percent / currentTool.currentPrice * 100, 2)}%)
                        </span>
                        <CustomSlider
                          className="mts-slider1__input"
                          range
                          vertical
                          value={priceRange}
                          min={min}
                          max={max}
                          step={step}
                          precision={1}
                          tooltipPlacement="left"
                          tipFormatter={val => formatNumber((val).toFixed(fraction))}
                          onChange={priceRange => {
                            this.setState({ priceRange });
                            updateChartMinMax(priceRange, isLong, possibleRisk);
                          }}
                        />
                      </div>

                      <div className="card main-content-stats">
                        <div className="main-content-stats__wrap">

                          <div className="main-content-stats__row">
                            <span>Точка входа</span>
                            <NumericInput
                              min={min}
                              max={max}
                              unsigned="true"
                              format={number => formatNumber(round(number, fraction))}
                              round={false}
                              defaultValue={(isLong ? priceRange[0] : priceRange[1]) || 0}
                              onBlur={value => {
                                const callback = () => {
                                  let possibleRisk = GetPossibleRisk()
                                  updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                                };

                                // ЛОНГ: то есть точка входа - снизу (число меньше)
                                if (isLong) {
                                  if (value > priceRange[1]) {
                                    this.setState({ priceRange: [priceRange[1], value] }, callback);
                                  }
                                  else {
                                    this.setState({ priceRange: [value, priceRange[1]] }, callback);
                                  }
                                }
                                // ШОРТ: то есть точка входа - сверху (число больше)
                                else {
                                  if (value < priceRange[0]) {
                                    this.setState({ priceRange: [value, priceRange[0],] }, callback);
                                  }
                                  else {
                                    this.setState({ priceRange: [priceRange[0], value] }, callback);
                                  }
                                }
                              }}
                            />
                          </div>

                          <div className="main-content-stats__row">
                            <span>Точка выхода</span>
                            <NumericInput
                              min={min}
                              max={max}
                              unsigned="true"
                              format={number => formatNumber(round(number, fraction))}
                              round={false}
                              defaultValue={(isLong ? priceRange[1] : priceRange[0]) || 0}

                              onBlur={value => {
                                const callback = () => {
                                  updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                                };

                                // ЛОНГ: то есть точка выхода - сверху (число меньше)
                                if (isLong) {
                                  if (value < priceRange[0]) {
                                    this.setState({ priceRange: [value, priceRange[0]] }, callback);
                                  }
                                  else {
                                    this.setState({ priceRange: [priceRange[0], value] }, callback);
                                  }
                                }
                                // ШОРТ: то есть точка выхода - снизу (число больше)
                                else {
                                  if (value > priceRange[0]) {
                                    this.setState({ priceRange: [priceRange[0], value] }, callback);
                                  }
                                  else {
                                    this.setState({ priceRange: [value, priceRange[0]] }, callback);
                                  }
                                }
                                
                              }}
                            />
                            
                          </div>

                          <div className="main-content-stats__row">
                            <span>Величина хода</span>
                            <span className="main-content-stats__val">
                              {formatNumber(round(Math.abs(priceRange[0] - priceRange[1]), fraction))}
                            </span>
                          </div>
                          
                          <div className="main-content-stats__row">
                            <span>Контрактов</span>
                            <span className="main-content-stats__val">
                              {contracts}
                            </span>
                          </div>

                          <div className="main-content-stats__row">
                            <span>Вероятность</span>
                            <NumericInput 
                              unsigned="true"
                              key={mode + chance * Math.random()} 
                              disabled={mode == 0}
                              defaultValue={mode == 0 ? 0.5 : chance} 
                              onBlur={chance => this.setState({ chance })}
                              suffix="%"
                            />
                          </div>

                          <div className="main-content-stats__row">
                            <span>Риск движения против</span>
                            <NumericInput
                              min={0}
                              max={100}
                              unsigned="true"
                              suffix="%"
                              format={number => formatNumber(round(number, fraction))}
                              round={false}
                              // defaultValue={formatNumber(round(mode, 1))}
                              defaultValue={ risk }

                              onBlur={ risk => {
                                this.setState({risk});
                                let possibleRisk = GetPossibleRisk();
                                updateChartMinMax(this.state.priceRange, isLong, possibleRisk);
                              }}
                            />
                          </div>

                          <div className="main-content-stats__row">
                            <span>Stop Loss</span>
                            <span className="main-content-stats__val">
                              {formatNumber(round(possibleRisk, 2))}
                            </span>
                          </div>

                          {(() => {
                            return (
                              <>
                                <div className="main-content-stats__row">
                                  <span>Прибыль</span>
                                  <span className="main-content-stats__val">
                                    {`${formatNumber(Math.floor(income))} (${suffix}%)`}
                                  </span>
                                </div>

                                <div className="main-content-stats__row">
                                  <span>КОД</span>
                                  <span className="main-content-stats__val">
                                    {`${formatNumber(kod)}%`}
                                  </span>
                                </div>
                              </>
                            )
                          })()}

                        </div>
                      </div>

                    </Stack>
                  )
                })()}

                <Stack className="main-content__right">
                  <Chart 
                    className="mts__chart"
                    key={currentTool.toString() + this.state.loadingChartData}
                    min={min}
                    max={max}
                    priceRange={priceRange}
                    loading={this.state.loadingChartData}
                    tool={currentTool}
                    data={data}
                    days={days}
                  />

                  {(() => {
                    return (
                      <div className={
                        ["mts-slider2"].concat(percentage >= 0 ? "right" : "")
                          .join(" ")
                          .trim()
                      }>
                        <span className="mts-slider2-middle">
                          Загрузка:{" "}

                          <NumericInput
                            format={number => round(number, 2)}
                            suffix="%"
                            round={"false"}
                            key={percentage}
                            defaultValue={percentage}
                            onBlur={ percentage => this.setState({ percentage }) }
                          />
                        </span>

                        <CustomSlider
                          className="mts-slider2__input"
                          // key={percentage}
                          style={{
                            "--primary-color": percentage >= 0 ? "var(--accent-color)" : "var(--danger-color)",
                            "--primary-color-lighter": percentage >= 0 ? "var(--accent-color-lighter)" : "var(--danger-color-lighter)",
                          }}
                          range
                          value={[0, percentage].sort((l, r) => l - r)}
                          min={-100}
                          max= {100}
                          step= {.5}
                          precision={1}
                          tooltipVisible={false}
                          onChange={(range = []) => {
                            let { tools, investorInfo } = this.state;
                            const percentage = range[0] + range[1];

                            investorInfo.type = percentage >= 0 ? "LONG" : "SHORT";
                            tools = tools.map(tool => tool.update(investorInfo));

                            updateChartMinMax(this.state.priceRange, percentage >= 0, possibleRisk);
                            this.setState({
                              investorInfo,
                              percentage, 
                              tools,
                            })
                          }}
                        />

                        <span aria-hidden="true" className="mts-slider2-short">Short</span>
                        <span aria-hidden="true" className="mts-slider2-long">Long</span>
                      </div>
                    )
                  })()}
                  {/* long-short */}

                  <div className="main-content-options">
                    <div className="main-content-options__wrap">
                      <div className="main-content-options__row">
                        <span className="main-content-options__label">Алгоритм МАНИ 144</span>
                        <Radio.Group 
                          className="main-content-options__radio"
                          value={mode}
                          onChange={e => this.setState({ mode: e.target.value })} 
                        >
                          <Radio value={0} disabled={disabledModes[0]}>
                            стандарт
                          </Radio>
                          <Radio value={1} disabled={disabledModes[1]}>
                            смс<span style={{ fontFamily: "serif", fontWeight: 300 }}>+</span>тор
                          </Radio>
                          <Radio value={2} disabled={disabledModes[2]}>
                            лимитник
                          </Radio>
                        </Radio.Group>

                        <button
                          className="settings-button js-open-modal main-content-options__settings"
                          onClick={e => dialogAPI.open("settings-generator", e.target)}
                        >
                          <span className="visually-hidden">Открыть конфиг</span>
                          <SettingFilled className="settings-button__icon" />
                        </button>

                      </div>

                      <div className="main-content-options__row">
                        <span className="main-content-options__label">Дней в позиции</span>
                        <Radio.Group
                          className="main-content-options__radio"
                          key={days}
                          defaultValue={days}
                          onChange={e => {
                            const days = e.target.value;

                            const fraction = fractionLength(currentTool.priceStep);
                            const price    = round(currentTool.currentPrice, fraction);
                            let percent = currentTool.adrDay;
                            if (days == 5) {
                              percent = currentTool.adrWeek;
                            }
                            else if (days == 20) {
                              percent = currentTool.adrMonth;
                            }

                            const max = round(price + percent, fraction);
                            const min = round(price - percent, fraction);

                            this.setState({ days });
                            updateChartScaleMinMax(min, max);
                            updateChartZoom(days);
                          }}
                        >
                          <Radio value={1}>день</Radio>
                          <Radio value={5}>неделя</Radio>
                          <Radio value={20}>месяц</Radio>
                        </Radio.Group>
                      </div>
                    </div>
                  </div>
                  {/* Mods */}

                  {(() => {
                    const period = Math.min(days, 5);

                    return (
                      <div className="mts-table">
                        <h3>Статистика КОД</h3>
                        <table>
                          <thead>
                            <tr>
                              <th>День</th>
                              <th>План %</th>
                              <th>Факт %</th>
                              <th>Доходность</th>
                            </tr>
                          </thead>
                          <tbody>
                            {new Array(period).fill(0).map((value, index) =>
                              <tr key={index}>
                                <td>{((page - 1) * period) + (index + 1)}</td>
                                <td>{kod}</td>
                                <td><Input defaultValue="1"/></td>
                                <td><Input defaultValue="1"/></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        <Pagination
                          key={days}
                          style={{display: days < 20 ? "none" : "flex"}}
                          className="mts-table__paginator"
                          onChange={page => {
                            this.setState({ page })
                          }}
                          defaultCurrent={1}
                          pageSize={period}
                          total={days}
                        />
                      </div>
                    )
                  })()}
                </Stack>
              </div>

            </div>
            {/* /.container */}

          </div>

        </main>
        {/* /.main */}

        {(() => {
          let { saves, id } = this.state;
          let namesTaken = saves.slice().map(save => save.name);
          let name = (id) ? this.getTitle() : "Новое сохранение";

          function validate(str = "") {
            str = str.trim();

            let errors = [];

            let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(str);
            if (str.length < 3) {
              errors.push("Имя должно содержать не меньше трех символов!");
            }
            else if (test) {
              errors.push(`Нельзя использовать символ "${test[0]}"!`);
            }
            if (!id) {
              if (namesTaken.indexOf(str) > -1) {
                errors.push(`Сохранение с таким именем уже существует!`);
              }
            }

            return errors;
          }

          class ValidatedInput extends React.Component {

            constructor(props) {
              super(props);

              let { defaultValue } = props;

              this.state = {
                error: "",
                value: defaultValue || ""
              }
            }

            vibeCheck() {
              const { validate } = this.props;
              let { value } = this.state;

              let errors = validate(value);
              this.setState({ error: (errors.length > 0) ? errors[0] : "" });
              return errors;
            }

            render() {
              const { validate, label } = this.props;
              const { value, error } = this.state;

              return (
                <label className="save-modal__input-wrap">
                  {
                    label
                      ? <span className="save-modal__input-label">{label}</span>
                      : null
                  }
                  <Input
                    className={
                      ["save-modal__input"]
                        .concat(error ? "error" : "")
                        .join(" ")
                        .trim()
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    value={value}
                    maxLength={20}
                    onChange={e => {
                      let { value } = e.target;
                      let { onChange } = this.props;

                      this.setState({ value });

                      if (onChange) {
                        onChange(value);
                      }
                    }}
                    onKeyDown={e => {
                      // Enter
                      if (e.keyCode === 13) {
                        let { value } = e.target;
                        let { onBlur } = this.props;

                        let errors = validate(value);
                        if (errors.length === 0) {
                          if (onBlur) {
                            onBlur(value);
                          }
                        }

                        this.setState({ error: (errors.length > 0) ? errors[0] : "" });
                      }
                    }}
                    onBlur={() => {
                      this.vibeCheck();
                    }} />

                  <span className={
                    ["save-modal__error"]
                      .concat(error ? "visible" : "")
                      .join(" ")
                      .trim()
                  }>
                    {error}
                  </span>
                </label>
              )
            }
          }

          let onConfirm = () => {
            let { id, data, saves, currentSaveIndex } = this.state;

            if (id) {
              this.update(name)
                .then(() => {
                  saves[currentSaveIndex - 1].name = name;
                  this.setState({
                    saves,
                    changed: false,
                  })
                })
                .catch(err => this.showAlert(err));
            }
            else {
              const onResolve = (id) => {
                let index = saves.push({ id, name });
                console.log(saves);

                this.setState({
                  data,
                  saves,
                  saved: true,
                  changed: false,
                  currentSaveIndex: index,
                });
              };

              this.save(name)
                .then(onResolve)
                .catch(err => this.showAlert(err));

              if (dev) {
                onResolve();
              }
            }
          }

          let inputJSX = (
            <ValidatedInput
              label="Название сохранения"
              validate={validate}
              defaultValue={name}
              onChange={val => name = val}
              onBlur={() => { }} />
          );
          let modalJSX = (
            <Dialog
              id="dialog1"
              className="save-modal"
              title={"Сохранение"}
              onConfirm={() => {
                if (validate(name).length) {
                  console.error(validate(name)[0]);
                }
                else {
                  onConfirm();
                  return true;
                }
              }}
            >
              {inputJSX}
            </Dialog>
          );

          return modalJSX;
        })()}
        {/* Save Popup */}

        <Dialog
          id="dialog4"
          title="Удаление трейдометра"
          confirmText={"Удалить"}
          onConfirm={() => {
            const { id } = this.state;
            this.delete(id)
              .then(() => console.log("Deleted!"))
              .catch(err => console.warn(err));
            return true;
          }}
        >
          Вы уверены, что хотите удалить {this.getTitle()}?
        </Dialog>
        {/* Delete Popup */}

        <Config
          id="config"
          title="Инструменты"
          template={template}
          tools={this.state.tools}
          toolsInfo={[
            { name: "Инструмент",   prop: "name"         },
            { name: "Код",          prop: "code"         },
            { name: "Цена шага",    prop: "stepPrice"    },
            { name: "Шаг цены",     prop: "priceStep"    },
            { name: "ГО",           prop: "guarantee"    },
            { name: "Текущая цена", prop: "currentPrice" },
            { name: "Размер лота",  prop: "lotSize"      },
            { name: "Курс доллара", prop: "dollarRate"   },
            { name: "ADR",          prop: "adrDay"       },
            { name: "ADR неделя",   prop: "adrWeek"      },
            { name: "ADR месяц",    prop: "adrMonth"     },
          ]}
          customTools={this.state.customTools}
          onChange={customTools => this.setState({ customTools })}

          insertBeforeDialog={
            <label className="input-group input-group--fluid mts-config__depo">
              <span className="input-group__label">Размер депозита:</span>
              <NumericInput
                className="input-group__input"
                key={this.state.depo}
                defaultValue={this.state.depo}
                format={formatNumber}
                min={10000}
                max={Infinity}
                onBlur={val => {
                  const { depo } = this.state;
                  if (val == depo) {
                    return;
                  }

                  this.setState({ depo: val, changed: true });
                }}
              />
            </label>
          }
        />
        {/* Инструменты */}

        {(() => {
          const { errorMessage } = this.state;
          return (
            <Dialog
              id="dialog-msg"
              title="Сообщение"
              hideConfirm={true}
              cancelText="ОК"
            >
              {errorMessage}
            </Dialog>
          )
        })()}
        {/* Error Popup */}

        <Dialog
          id="settings-generator"
          pure={true}
        >
          <SettingsGenerator
            depo={this.state.depo}
            tools={this.getTools()}
            load={percentage}
            onClose={() => {
              dialogAPI.close("settings-generator");
            }}
          />
        </Dialog>
        {/* ГЕНА */}

      </div>
    );
  }
}

export default App;