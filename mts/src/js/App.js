import React from 'react'
import {
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Pagination,
} from 'antd/es'

import {
  SettingFilled,
  WarningOutlined,
} from '@ant-design/icons'

import $              from "jquery"
import {ajax}         from "jquery"
import params         from "./utils/params"
import round          from "./utils/round";
import formatNumber   from "./utils/format-number"
import typeOf         from "./utils/type-of"
import fractionLength from "./utils/fraction-length"

import Info                from "./components/Info/Info"
import Stack               from "./components/stack"
import CustomSlider        from "./components/custom-slider"
import CrossButton         from "./components/cross-button"
import NumericInput        from "./components/numeric-input"
import {Dialog, dialogAPI} from "./components/dialog"

const { Option } = Select;

import "../sass/style.sass"

const dev = false;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initial = {

      depo: 1000000,

      page: 1,
      priceRange: [0, 0],
      percentage: 0,

      customTools: [],
      currentToolIndex: 0,
      
    };

    this.state = Object.assign({
      id:                 null,
      saved:              false,
      saves:              [],
      currentSaveIndex:   0,

      tools:       [],
      propsToShowArray: [
        "shortName",
        "stepPrice",
        "priceStep",
        "averageProgress",
        "guaranteeValue",
        "currentPrice",
        "lotSize",
        "dollarRate"
      ],
      toolTemplate: {
        code:            "",
        shortName:       "",
        name:            "",
        stepPrice:       0,
        priceStep:       0,
        averageProgress: 0,
        guaranteeValue:  0,
        currentPrice:    0,
        lotSize:         0,
        dollarRate:      0,

        isFuters: false,

        points: [
          [70,  70],
          [156, 55],
          [267, 41],
          [423, 27],
          [692, 13],
          [960, 7 ],
        ]
      },
    }, JSON.parse(JSON.stringify( this.initial )));
  }

  componentDidMount() {
    this.bindEvents();

    this.fetchTools()
      .then(tools => this.unpackTools(tools))
      .then(() => this.updatePriceRange(this.getCurrentTool()))
      .catch(err => console.log(err));

    this.fetchDepoStart()
      .then(depo => this.setState({ depo: depo || 10000 }))
      .catch(err => console.log(err));

    this.fetchSaves()
      .then(saves => {
        if (saves.length) {
          const pure = params.get("pure") === "true";
          if (!pure) {
            let found = false;
            console.log(saves);

            for (let index = 0, p = Promise.resolve(); index < saves.length; index++) {
              p = p.then(_ => new Promise(resolve => {
                const save = saves[index];
                const id   = save.id;
                this.fetchSaveById(id)
                  .then(save => {
                    const corrupt = !this.validateSave();
                    if (!corrupt && !found) {
                      found = true;
                      // Try to load it
                      this.extractSave(Object.assign(save, { id }));
                      this.setState({ currentSaveIndex: index + 1 });
                    }

                    saves[index].corrupt = corrupt;
                    this.setState({ saves });
                    resolve();
                  });
              }));
            }
          }
        }
        else {
          console.log("No saves found!");
        }

        this.setState({ saves });
      })
      .catch(err => this.showMessageDialog(`Не удалось получить сохранения! ${err}`));
  }

  updatePriceRange(tool) {
    return new Promise(resolve => {
      const currentPrice = tool.currentPrice;
      this.setState({ priceRange: [currentPrice, currentPrice] }, () => resolve());
    })
  }

  showMessageDialog(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  bindEvents() {
    
  }

  parseTool(str) {
    let arr = str
      .replace(/\,/g, ".")
      .split(/\t+/g)
      .map(n => (n + "").replace(/\"/g, "").replace(/(\d+)\s(\d+)/, "$1$2"));
    
    let obj = {
      name:             arr[0],
      stepPrice:       +arr[1],
      priceStep:       +arr[2],
      averageProgress: +arr[3],
      guaranteeValue:  +arr[4],
      currentPrice:    +arr[5],
      lotSize:         +arr[6],
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

  unpackTools(tools) {
    let { toolTemplate } = this.state;

    return new Promise((resolve, reject) => {

      if (!tools || tools.length === 0) {
        reject(`"tools" is not an array or it's simply empty!`, tools);
      }
  
      let t = [];
      for (let tool of tools) {
        if (tool.price == 0 || !tool.volume) {
          continue;
        }

        let template = Object.assign({}, toolTemplate);
  
        let obj = Object.assign(template, {
          code:             tool.code            || "code",
          shortName:        tool.shortName       || "shortName",
          name:             tool.fullName        || "fullName",
          stepPrice:       +tool.stepPrice       || 0,
          priceStep:       +tool.priceStep       || 0,
          averageProgress: +tool.averageProgress || 0,
          guaranteeValue:  +tool.guarantee       || 0,
          currentPrice:    +tool.price           || 0,
          lotSize:         +tool.lotVolume       || 0,
          dollarRate:      +tool.dollarRate      || 0,
  
          isFuters: true,
  
          points: [
            [70,  70],
            [156, 55],
            [267, 41],
            [423, 27],
            [692, 13],
            [960, 7 ],
          ]
        });
        t.push(obj);
      }
      
      if (t.length > 0) {
        let { tools } = this.state;
        tools = tools.concat(t);
  
        this.setState({ tools }, resolve);
      }
      else {
        resolve();
      }

    });
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
      this.showMessageDialog(String(e));

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

    this.setState(state, () => console.log(this.state));
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

      this.sendRequest("addMtsSnapshot", "POST", data)
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
      this.sendRequest("updateMtsSnapshot", "POST", data)
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
      this.sendRequest("deleteMtsSnapshot", "POST", { id })
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
              .catch(err => this.showMessageDialog(err));
          }
          else {
            this.reset()
              .catch(err => this.showMessageDialog(err));

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

  sendRequest(url = "", method = "GET", data = {}) {
    return new Promise((resolve, reject) => {
      console.log(`Sending ${url} request...`);
      ajax({
        url: `https://fani144.ru/local/php_interface/s1/ajax/?method=${url}`,
        method,
        data,
        success: res => {
          const parsed = JSON.parse(res);
          if (parsed.error) {
            reject(parsed.message);
          }

          resolve(parsed);
        },
        error: err => reject(err)
      });
    });
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      this.sendRequest("getMtsSnapshots")
        .then(res => {
          const savesSorted = res.data.sort((a, b) => a.dateCreate < b.dateCreate);
          const saves = savesSorted.map(save => ({
            name: save.name,
            id:   save.id,
          }));
          resolve(saves);
        })
        .catch(err => reject(err));
    });
  }

  fetchSaveById(id) {
    return new Promise((resolve, reject) => {
      if (typeof id === "number") {
        console.log("Trying to fetch id:" + id);
        this.sendRequest("getMtsSnapshot", "GET", { id })
          .then(res => resolve(res))
          .catch(err => reject(err));
      }
      else {
        reject("id must be a number!", id);
      }
    });
  }

  fetchTools() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures",
        success: res => {
          var data = JSON.parse(res).data;
          resolve(data);
        },
        error: (err) => reject(err),
      });
    })
  }

  fetchDepoStart() {
    return new Promise((resolve, reject) => {
      console.log("Fetching depoStart!");
      $.ajax({
        url: "/local/php_interface/s1/ajax/?method=getInvestorInfo",
        success: res => {
          var parsed = JSON.parse(res);
          var depo = Number(parsed.data.deposit);
          resolve(depo);
        },
        error: err => reject(err)
      });
    });
  }

  getCurrentTool() {
    const { tools, currentToolIndex } = this.state;
    return tools[currentToolIndex] ||
      // Fallback
      this.parseTool(`Золото (GOLD-6.20)	7,95374	0,1000	70	13 638,63	1 482,9	1`);
  }

  getToolName(tool = {}) {
    let name = "";
    if (tool.shortName) {
      name += `${tool.shortName}`;
    }
    if (tool.code) {
      name += ` (${tool.code})`;
    }

    return name;
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "МТС";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    const { depo, page, percentage, priceRange } = this.state;

    const currentTool = this.getCurrentTool();

    const priceRangeSorted = priceRange.sort((l, r) => l - r);
    let planIncome = priceRangeSorted[1] - priceRangeSorted[0];
    // if (percentage < 0) {
    //   planIncome *= -1;
    // }

    const contracts = Math.floor(depo * (Math.abs(percentage) / 100) / currentTool.guaranteeValue);

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
                    <label className="labeled-select main-top__select stack-exception">
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
                              .catch(err => this.showMessageDialog(err));
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

                  <div className="main-top__footer">

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
                      onClick={e => dialogAPI.open("dialog3", e.target)}
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
                <Stack className="main-content__left">

                  <label>
                    <span className="visually-hidden">Торговый инструмент</span>
                    <Select
                      value={this.state.currentToolIndex}
                      onChange={currentToolIndex => {
                        this.setState({ currentToolIndex });
                        this.updatePriceRange(this.getTools()[currentToolIndex]);
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
                        const { tools, customTools } = this.state
                        let arr = []
                          .concat(tools)
                          .concat(customTools);
                        return arr.length > 0
                          ? (
                            arr
                              // Оставляем только фьючи
                              // .filter(el => el.isFuters)
                              .map(tool => this.getToolName(tool))
                              .map((value, index) => (
                                <Option key={index} value={index}>{value}</Option>
                              ))
                          )
                          : <Option key={0} value={0}>Загрузка...</Option>
                      })()}
                    </Select>
                  </label>
                  {/* Торговый инструмент */}

                  {(() => {
                    const fraction = fractionLength(currentTool.priceStep);
                    const price   = round(currentTool.currentPrice, fraction);
                    const percent = round(price / 100, fraction);
                    const max = round(price + percent, fraction);
                    const min = round(price - percent, fraction);
                    const step = (max - min) / 20;

                    return (
                      <div className="mts-slider1">
                        <span className="mts-slider1-middle">
                          <b>Текущая цена</b><br />
                          ({formatNumber(price)})
                        </span>
                        <span className="mts-slider1-top">
                          <b>{formatNumber(round(max, 2))}</b>
                          &nbsp;
                          (+1% от цены)
                        </span>
                        <span className="mts-slider1-bottom">
                          <b>{formatNumber(round(min, 2))}</b>
                          &nbsp;
                          (-1% от цены)
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
                          // filter={val => val + "%"}
                          onChange={priceRange => {
                            this.setState({ priceRange })
                          }}
                        />
                      </div>
                    )
                  })()}

                  <div className="card main-content-stats">
                    <div className="main-content-stats__wrap">
                      <div className="main-content-stats__row">
                        <span>Риск движения против</span>
                        <span className="main-content-stats__val">
                          {(() => {
                            const risk = 
                                contracts 
                              * planIncome
                              / currentTool.priceStep 
                              * currentTool.stepPrice 
                              / depo
                              * 100;
                            return `${formatNumber(round(risk, 1))}%`
                          })()}
                        </span>
                      </div>
                      <div className="main-content-stats__row">
                        <span>Прибыль</span>
                        <span className="main-content-stats__val">
                          {(() => {
                            const income = contracts * planIncome / currentTool.priceStep * currentTool.stepPrice;

                            const ratio = income / depo * 100;
                            let suffix = round(ratio, 2);
                            if (suffix > 0) {
                              suffix = "+" + suffix;
                            }
                            
                            return `${formatNumber(Math.floor(income))} (${suffix}%)`
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                </Stack>

                <Stack className="main-content__right">
                  {(() => {
                    return (
                      <div className={
                        ["mts-slider2"].concat(percentage >= 0 ? "right" : "")
                          .join(" ")
                          .trim()
                      }>
                        <span className="mts-slider2-middle">
                          Загрузка:
                          <b style={{
                            color: `var(--${percentage >= 0 ? "accent-color" : "danger-color"})`
                          }}>
                            {formatNumber(Math.abs(percentage))}%
                          </b>
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
                          max={100}
                          step={1}
                          precision={1}
                          tooltipVisible={false}
                          onChange={(range = []) => {
                            const percentage = range[0] + range[1];
                            this.setState({ percentage })
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
                          defaultValue={1}
                          onChange={e => console.log(e)} 
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                        </Radio.Group>
                      </div>

                      <div className="main-content-options__row">
                        <span className="main-content-options__label">КОД</span>
                        <Radio.Group
                          className="main-content-options__radio"
                          defaultValue={1}
                          onChange={e => console.log(e)}
                        >
                          <Radio value={1}>1 день</Radio>
                          <Radio value={2}>2 день</Radio>
                          <Radio value={3}>
                            Выберите<br className="sm-only" /> день
                          </Radio>
                        </Radio.Group>
                      </div>
                    </div>
                  </div>
                  {/* Mods */}

                  <div className="mts-table">
                    <h3>Статистика КОД</h3>
                    <table>
                      <tr>
                        <th>День</th>
                        <th>План</th>
                        <th>Факт</th>
                        <th>Доходность</th>
                      </tr>
                      {new Array(5).fill(0).map((value, index) =>
                        <tr>
                          <td>{((page - 1) * 5) + (index + 1)}</td>
                          <td>1</td>
                          <td><Input defaultValue="1" /></td>
                          <td><Input defaultValue="1" /></td>
                        </tr>
                      )}
                    </table>
                    <Pagination 
                      className="mts-table__paginator"
                      onChange={page => {
                        this.setState({ page })
                      }}
                      defaultCurrent={1}
                      total={50}
                    />
                  </div>
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
                .catch(err => this.showMessageDialog(err));
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
                .catch(err => this.showMessageDialog(err));

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

        <Dialog
          id="dialog3"
          className=""
          confirmText="Добавить"
          onConfirm={e => {
            var { toolTemplate, customTools, propsToShowArray } = this.state;

            const nameExists = (value, tools) => {
              let found = 0;
              console.log(value, tools);
              for (const tool of tools) {
                if (value === tool.shortName) {
                  found++;
                }
              }

              return found > 1;
            };

            var template = Object.assign({}, toolTemplate);
            var tool = template;
            propsToShowArray.map((prop, index) => {
              tool[prop] = toolTemplate[prop];
              if (index === 0) {
                const suffix = customTools.length + 1;
                tool[prop] = `Инструмент ${suffix > 1 ? suffix : ""}`;
              }
            });

            tool.planIncome = round(tool.price / 10, 2);

            customTools.push(tool);

            while (nameExists(tool.shortName, this.getTools())) {
              const end = tool.shortName.match(/\d+$/g)[0];
              tool.shortName = tool.shortName.replace(end, Number(end) + 1);
            }

            this.setState({ customTools }, () => {
              $(".config-table-wrap").scrollTop(9999);
            });
          }}
          cancelText="Закрыть"
        >
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

          <div className="config-table-wrap">
            <table className="table">
              <thead className="table-header">
                <tr className="table-tr">
                  <th className="config-th table-th">Инструмент</th>
                  <th className="config-th table-th">Цена шага</th>
                  <th className="config-th table-th">Шаг цены</th>
                  <th className="config-th table-th">ГО</th>
                  <th className="config-th table-th">Текущая цена</th>
                  <th className="config-th table-th">
                    <Info tooltip="Средний ход (пунктов) за год с учетом аномальных движений">
                      ADR1
                    </Info>
                  </th>
                  <th className="config-th table-th">
                    <Info tooltip="Средний ход (пунктов) за год без учета аномальных движений">
                      ADR2
                    </Info>
                  </th>
                  <th className="config-th table-th"></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {
                  this.state.tools.map((tool, index) =>
                    <tr className="config-tr" key={index}>
                      {
                        this.state.propsToShowArray.map((prop, i) =>
                          <td
                            className="table-td"
                            style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                            key={i}>
                            {tool[prop]}
                          </td>
                        )
                      }
                    </tr>
                  )
                }
                {(() => {
                  const nameExists = (value, tools) => {
                    let found = 0;
                    for (const tool of tools) {
                      if (value === tool.shortName) {
                        found++;
                      }
                    }

                    return found > 1;
                  };

                  var onBlur = (val, index, prop) => {
                    var { customTools, tools } = this.state;
                    customTools[index][prop] = val;
                    if (prop === "shortName") {
                      while (nameExists(customTools[index][prop], this.getTools())) {
                        const end = customTools[index][prop].match(/\d+$/g)[0];
                        customTools[index][prop] = customTools[index][prop].replace(end, Number(end) + 1);
                      }
                    }

                    this.setState({ customTools });
                  };

                  return this.state.customTools.map((tool, index) =>
                    <tr className="config-tr" key={index}>
                      {
                        this.state.propsToShowArray.map((prop, i) =>
                          <td
                            className="table-td"
                            style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                            key={i}>
                            {(() => {
                              const valid = true;

                              return i === 0 ? (
                                <div style={{ position: "relative" }}>
                                  <Input
                                    key={tool[prop] + Math.random()}
                                    className={tool["error"] != null ? "error" : ""}
                                    defaultValue={tool[prop]}
                                    onBlur={e => onBlur(e.target.value, index, prop)}
                                    onKeyDown={e => {
                                      if (
                                        [
                                          13, // Enter
                                          27  // Escape
                                        ].indexOf(e.keyCode) > -1
                                      ) {
                                        e.target.blur();
                                        onBlur(e.target.value, index, prop);
                                      }
                                    }}
                                  />
                                  <span style={{
                                    position: "absolute",
                                    left: "0",
                                    top: "100%",
                                    color: "var(--danger-color)",
                                    fontSize: ".7em",
                                    textAlign: "center"
                                  }}>{tool["error"]}</span>
                                </div>
                              )
                                : (
                                  <NumericInput
                                    defaultValue={tool[prop]}
                                    onBlur={val => onBlur(val, index, prop)}
                                  />
                                )
                            })()}
                          </td>
                        )
                      }
                      <td className="table-td" key={index}>
                        <Tooltip title="Удалить">
                          <button
                            className="cross-button config__delete"
                            aria-label="Удалить"
                            onClick={e => {
                              var { customTools } = this.state;
                              customTools.splice(index, 1);
                              this.setState({ customTools });
                            }}>
                            <span>&times;</span>
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
          {/* /.config-talbe-wrap */}
        </Dialog>
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

      </div>
    );
  }
}

export default App;