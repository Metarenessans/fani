import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Switch,
  Typography,
  Tag
} from 'antd/es'

import {
  PlusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

const { Option } = Select;
const { Group } = Radio;
const { Text, Title } = Typography;

import { ajax } from "jquery"
import $        from "jquery"

import Stack        from "./components/stack"
import CrossButton  from "./components/cross-button"
import CustomSlider from "./components/custom-slider"
import NumericInput from "./components/numeric-input"
import Tool         from "./components/Tool"
import { Dialog, dialogAPI } from "./components/dialog"

import num2str from "./utils/num2str"
import params from "./utils/params";
import formatNumber from "./utils/format-number"

import "../sass/style.sass"

const dev = false;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initial = {

      // Депозит
      depo: 2000000,

      items: [{
        id: 1,
        selectedToolName: null,
        drawdown:         null,

        // Контрактов
        contracts: 40,
        // Просадка

        // Догрузка (в процентах)
        additionalLoading: 20,
        // Ожидаемый ход (в долларах)
        stepExpected: 1,

        directUnloading: true,

        isLong: false,

        // ===================
        // Вычисляемые значения
        // ===================

        // Свободные деньги
        freeMoney: 0,
        // Прошло пунктов против
        pointsAgainst: 0,
        // 
        incomeExpected: 0,
      }],

    };

    this.state = Object.assign({
      id:                 null,
      saved:              false,
      saves:              [],
      currentSaveIndex:   0,

      configVisible: false,

      toolTemplate: {
        code:            "",
        shortName:       "",
        name:            "",
        stepPrice:       1,
        priceStep:       1,
        averageProgress: 1,
        guaranteeValue:  1,
        currentPrice:    1,
        lotSize:         1,
        dollarRate:      1,
      },
      tools: [],
      customTools: [],
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
      
    }, JSON.parse(JSON.stringify(this.initial)));
  }
  
  componentDidMount() {
    this.bindEvents();

    this.fetchTools()
      .then(tools => this.unpackTools(tools))
      .catch(err => console.log(err))

    this.fetchDepoStart()
      .then(depo => {
        var { items } = this.state;

        if (!depo) {
          depo = this.state.depo;
        }
        else {
          for (const item of items) {
            item.drawdown = depo * .1;
          }
          console.log(items);
        }

        this.setState({ depo, items });
      })
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
                const id = save.id;
                this.fetchSaveById(id)
                  .then(save => {
                    const corrupt = !this.validateSave(save);
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

  unpackTools(tools) {
    return new Promise((resolve, reject) => {
      console.log(tools);
      if (!tools || tools.length == 0) {
        console.error("Weird but what i got is not an array or it's simply empty!");
        return;
      }
  
      var t = [];
      for (let tool of tools) {
        if (tool.price == 0 || !tool.volume) {
          continue;
        }
  
        var obj = {
          code:      tool.code || "code",
          shortName: tool.shortName || "shortName",
          name: tool.fullName || "fullName",
          stepPrice: +tool.stepPrice || 0,
          priceStep: +tool.priceStep || 0,
          averageProgress: +tool.averageProgress || 0,
          guaranteeValue: +tool.guarantee || 0,
          currentPrice: +tool.price || 0,
          lotSize: +tool.lotVolume || 0,
          dollarRate: +tool.dollarRate || 0,
        };
        t.push(obj);
      }
  
      if (t.length > 0) {
        let { tools } = this.state;
        const sorted = t.sort((a, b) => a.code.localeCompare(b.code));
        tools = tools.concat(sorted);

        this.setState({ tools }, resolve);
      }
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

  packSave() {
    let { items, depo, customTools } = this.state;

    const json = {
      static: {
        depo,
        items,
        customTools,
        current_date: "#"
      },
    };

    console.log("Save packed!", json);
    return json;
  }

  validateSave(save) {
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

    const {
      depoEnd,
      defaultPassiveIncomeTools,
    } = this.state;

    let staticParsed;

    let state = {};
    let failed = false;

    try {

      staticParsed = JSON.parse(save.data.static);

      console.log("staticParsed", staticParsed);

      state.depo = staticParsed.depo || this.state.depo;
      state.items = staticParsed.items;
      state.customTools = staticParsed.customTools || [];

      state.id = save.id;
      state.saved = true;
    }
    catch (e) {
      failed = true;
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    this.setState(state, () => console.log(this.state));
  }

  reset() {
    return new Promise(resolve => this.setState(JSON.parse(JSON.stringify(this.initial)), () => resolve()))
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

      this.sendRequest("addTorSnapshot", "POST", data)
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
      this.sendRequest("updateTorSnapshot", "POST", data)
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
      this.sendRequest("deleteTorSnapshot", "POST", { id })
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
      this.sendRequest("getTorSnapshots")
        .then(res => {
          const savesSorted = res.data.sort((a, b) => a.dateCreate < b.dateCreate);
          const saves = savesSorted.map(save => ({
            name: save.name,
            id: save.id,
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
        this.sendRequest("getTorSnapshot", "GET", { id })
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
      ajax({
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
      ajax({
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

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "Калькулятор ТОР";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
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
                              }} />
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
                      {this.getTitle()}
                      {(dev || this.state.id) && (
                        <CrossButton
                          className="main-top__remove"
                          onClick={e => dialogAPI.open("dialog4", e.target)} />
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
                      {(this.state.saved && !this.state.changed) ? "Изменить" : "Сохранить"}
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

                </Stack>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
          {/* /.main-top */}

          <div className="main-content">
            <div className="container">

              {
                this.state.items.map((obj, index) =>
                  <Tool
                    key={Math.random()}
                    index={index}
                    tools={this.getTools()}
                    data={obj}

                    depo={this.state.depo}
                    // drawdown={this.state.drawdown}
                    // additionalLoading={this.state.additionalLoading}
                    // stepExpected={this.state.stepExpected}

                    onChange={(prop, val) => {
                      const { items } = this.state;
                      items[index][prop] = val;
                      this.setState({ items, changed: true });
                    }}

                    onDrawdownChange={(val, cb) => {
                      this.setState({ drawdown: val }, cb);
                    }}
                    onOpenConfig={e => {
                      dialogAPI.open("dialog3", e.target);
                    }}
                    onCopy={(e, i) => {
                      let { items } = this.state;

                      var copy = Object.assign({}, items[index]);
                      copy.id = Math.random();
                      items.push(copy);

                      this.setState({ items });
                    }}
                    onDelete={(e, i) => {
                      let { items } = this.state;

                      if (items.length > 1) {
                        items.splice(index, 1);
                        this.setState({ items });
                      }

                    }}
                    onRef={ref => {
                      // let { items } = this.state;
                      // items[0] = ref;
                      // this.setState({ items });
                    }}
                  />
                )
              }
            
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
            let { id, data, currentDay, saves, currentSaveIndex } = this.state;

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
          title="Настройка инструментов"
          confirmText="Добавить"
          onConfirm={e => {
            var { toolTemplate, customTools, propsToShowArray } = this.state;

            const nameExists = (value, tools) => {
              let found = 0;
              // console.log(value, tools);
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
          <label className="input-group input-group--fluid tor-config__depo">
            <span className="input-group__label">Депозит</span>
            <NumericInput
              className="input-group__input"
              defaultValue={this.state.depo}
              round
              onBlur={val => this.setState({ depo: val }, this.recalc)}
              format={formatNumber}
            />
          </label>
          <div className="config-table-wrap">
            <table className="table">
              <thead className="table-header">
                <tr className="table-tr">
                  <th className="config-th table-th">Инструмент</th>
                  <th className="config-th table-th">Цена шага</th>
                  <th className="config-th table-th">Шаг цены</th>
                  <th className="config-th table-th">Средний ход</th>
                  <th className="config-th table-th">ГО</th>
                  <th className="config-th table-th">Текущая цена</th>
                  <th className="config-th table-th">Размер лота</th>
                  <th className="config-th table-th">Курс доллара</th>
                  <th className="config-th table-th"></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {
                  this.state.tools.map((tool, i) =>
                    <tr className="config-tr" key={i}>
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
                  const { customTools, propsToShowArray } = this.state;

                  const nameExists = (value, tools) => {
                    let found = 0;
                    // console.log(value, tools);
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

                  return customTools.map((tool, index) =>
                    <tr className="config-tr" key={index}>
                      {
                        propsToShowArray.map((prop, i) =>
                          <td
                            className="table-td"
                            style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                            key={i}>
                            {
                              i === 0 ? (
                                <Input
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
                              )
                                : (
                                  <NumericInput
                                    defaultValue={tool[prop]}
                                    onBlur={val => onBlur(val, index, prop)}
                                  />
                                )
                            }
                          </td>
                        )
                      }
                      <td className="table-td" key={index}>
                        <Tooltip title="Удалить">
                          <button
                            className="config__delete x-button"
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
        </Dialog>

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