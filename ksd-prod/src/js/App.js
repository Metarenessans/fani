import React from 'react'
const { Provider, Consumer } = React.createContext();
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Typography,
  Spin,
  Input,
  Switch,
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

import "../../../common/api/fetch";

import $                   from "jquery"
import params              from "../../../common/utils/params"
import round               from "../../../common/utils/round";
import formatNumber        from "../../../common/utils/format-number"
import typeOf              from "../../../common/utils/type-of"
import promiseWhile        from "../../../common/utils/promise-while"
import fractionLength      from "../../../common/utils/fraction-length"
import readyTools          from "../../../common/adr.json"
import { Tools, template } from "../../../common/tools"

import Info                  from "./components/Info/Info"
import Header                from "./components/header"
import CrossButton           from "../../../common/components/cross-button"
import NumericInput          from "../../../common/components/numeric-input"
import CustomSlider          from "../../../common/components/custom-slider"
import Config                from "../../../common/components/config"
import { Dialog, dialogAPI } from "../../../common/components/dialog"
import Stack                 from "../../../common/components/stack"
import DashboardRow          from "./components/DashboardRow"

/* API */
import fetch             from "../../../common/api/fetch"
import { applyTools }    from "../../../common/api/fetch/tools"
import { fetchInvestorInfo, applyInvestorInfo } from "../../../common/api/fetch/investor-info"
import fetchSavesFor     from "../../../common/api/fetch-saves"
import fetchSaveById     from "../../../common/api/fetch/fetch-save-by-id"

import "../sass/style.sass"

const defaultToolData = {
  percentage: 10,
  selectedToolName: "SBER"
};

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {

      id: null,

      loading: false,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },
      isLong: true,

      data: [{ ...defaultToolData }],

      // Режим
      mode: 0,
      //Размер депозита
      depo: 1000000,
      
      customTools: [],

      sortProp:  null,
      sortDESC:  true,

      saved: false,
      
      currentSaveIndex: 0,
    };

    this.state = {
      ...this.initialState,
      ...{

        tools: [],

        saves: [],
        
      },
    };

    this.state.loading = true;

    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.applyTools        = applyTools.bind(this);
    this.fetchSaveById     = fetchSaveById.bind(this, "ksd");
  }

  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData();
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  fetchInitialData() {
    this.fetchInvestorInfo();
    this.fetchTools();
    if (dev) {
      this.loadFakeSave();
      return;
    }
    this.fetchSaves();
  }

  loadFakeSave() {
    this.setState({ loading: true });

    setTimeout(() => {
      let { saves } = this.state;
      let save = {
        dateCreate: 1595544839,
        id: 20,
        name: "Fresh KSD",
        static: `{"depo":1000000,"sortProp":"incomePercentage","sortDESC":true,"mode":0,"data":[{"percentage":10,"guarantee":9175.6,"contracts":10,"income":9270,"incomePercentage":0.927,"loadingPercentage":9.27,"risk":0.927,"freeMoney":89.07300000000001,"selectedToolName":"LKOH-12.20"},{"percentage":10,"guarantee":6784.8,"contracts":14,"income":14423.64672,"incomePercentage":1.442364672,"loadingPercentage":14.424,"risk":1.442364672,"freeMoney":88.557635328,"selectedToolName":"BR-12.20"},{"percentage":10,"guarantee":13399.5,"contracts":7,"income":15325.124639999998,"incomePercentage":1.5325124639999999,"loadingPercentage":15.325,"risk":1.5325124639999999,"freeMoney":88.467487536,"selectedToolName":"GOLD-12.20"},{"percentage":10,"guarantee":4340.2,"contracts":23,"income":8165,"incomePercentage":0.8165,"loadingPercentage":8.165,"risk":0.8165,"freeMoney":89.1835,"selectedToolName":"SBPR-12.20"},{"percentage":10,"guarantee":4919.5,"contracts":20,"planIncome":127.9,"income":2558,"incomePercentage":0.25579999999999997,"loadingPercentage":2.558,"risk":0.25579999999999997,"freeMoney":89.7442,"selectedToolName":"LKOH"},{"percentage":10,"guarantee":1396.2,"contracts":71,"planIncome":3.84,"income":2726.3999999999996,"incomePercentage":0.27263999999999994,"loadingPercentage":2.726,"risk":0.27263999999999994,"freeMoney":89.72736,"selectedToolName":"MOEX"},{"percentage":10,"guarantee":6597.7,"contracts":15,"income":15420,"incomePercentage":1.542,"loadingPercentage":15.42,"risk":1.542,"freeMoney":88.458,"selectedToolName":"Si-12.20"},{"percentage":10,"guarantee":877.9,"contracts":113,"income":5401.400000000001,"incomePercentage":0.5401400000000001,"loadingPercentage":5.401,"risk":0.5401400000000001,"freeMoney":89.45985999999999,"selectedToolName":"MAGN-12.20"},{"percentage":10,"guarantee":862.9,"contracts":115,"income":5405,"incomePercentage":0.5405,"loadingPercentage":5.405,"risk":0.5405,"freeMoney":89.4595,"selectedToolName":"MOEX-12.20"},{"percentage":10,"guarantee":862.9,"contracts":115,"income":5405,"incomePercentage":0.5405,"loadingPercentage":5.405,"risk":0.5405,"freeMoney":89.4595,"selectedToolName":"MIX-12.20"}],"customTools":[],"current_date":"#"}`,
        data: {
        },
        error: false,
        id: 20
      };
  
      const index = 0;
      this.extractSave(save);
  
      saves[index] = {
        id:      save.data.id,
        name:    save.data.name,
      };
      this.setState({ 
        saves, 
        currentSaveIndex: index + 1,
        loading: false
      });
    }, 1500);
  }

  fetchInvestorInfo() {
    fetchInvestorInfo()
      .then(this.applyInvestorInfo)
      .then(response => {
        let { deposit } = response.data;
        return this.setStateAsync({ depo: deposit || 10000 });
      })
      .catch(error => console.error(error))
  }
  
  fetchTools() {
    for (let request of ["getFutures", "getTrademeterInfo"]) {
      fetch(request)
        .then(response => Tools.parse(response.data, { investorInfo: this.state.investorInfo }))
        .then(tools => Tools.sort(this.state.tools.concat(tools)))
        .then(tools => this.setState({ tools }))
        .catch(error => this.showMessageDialog(`Не удалось получить инстурменты! ${error}`))
    }
  }

  fetchSaves() {
    fetchSavesFor("ksd")
      .then(response => {
        const saves = response.data;
        return new Promise(resolve => this.setState({ saves, loading: false }, () => resolve(saves)))
      })
      .then(saves => {
        if (saves.length) {
          const pure = params.get("pure") === "true";
          if (!pure) {
            const save = saves[0];
            const { id } = save;

            this.setState({ loading: true });
            this.fetchSaveById(id)
              .then(response => this.extractSave(response.data))
              .catch(error => console.error(error));
          }
        }
      })
      .catch(reason => this.showAlert(`Не удалось получить сохранения! ${reason}`));
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
    let { depo, sortProp, sortDESC, mode, data, customTools } = this.state;

    const json = {
      static: {
        depo,
        sortProp,
        sortDESC,
        mode,
        data,
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

    const { saves } = this.state;

    let staticParsed;

    let state = {};
    let failed = false;

    const getSaveIndex = save => {
      for (let i = 0; i < saves.length; i++) {
        let currentSave = saves[i];
        if (Object.keys(currentSave).every(key => currentSave[key] == save[key])) {
          return i;
        }
      }
      return -1;
    };

    const savePure = { ...save };
    delete savePure.static;

    // console.log(saves, savePure, getSaveIndex(savePure));

    try {

      staticParsed = JSON.parse(save.static);
      staticParsed.data.map(item => {
        delete item.selectedToolCode;
        return item;
      });

      console.log("static", save.static);
      console.log("staticParsed", staticParsed);

      let m = staticParsed.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.mode = m;
      state.sortProp = staticParsed.sortProp || null;
      state.sortDESC = staticParsed.sortDESC || true;
      state.depo = staticParsed.depo || this.state.depo;
      state.data = staticParsed.data;
      state.data = state.data
        .map(item => {
          delete item.planIncome;
          return item;
        });
      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tools.create(tool, { investorInfo: this.state.investorInfo }));

      state.id      = save.id;
      state.saved   = true;
      state.loading = false;
      state.currentSaveIndex = getSaveIndex(savePure) + 1;
    }
    catch (e) {
      failed = true;
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    this.setState(state);
  }

  reset() {
    return new Promise(resolve => this.setState(JSON.parse(JSON.stringify(this.initialState)), () => resolve()))
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

      fetch("addKsdSnapshot", "POST", data)
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
      fetch("updateKsdSnapshot", "POST", data)
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
      fetch("deleteKsdSnapshot", "POST", { id })
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

            this.setState({ loading: true });
            this.fetchSaveById(id)
              .then(response => this.extractSave(response.data))
              .catch(error => console.error(error));
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

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "КСД";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    const { mode, data, sortProp, sortDESC, isLong } = this.state;

    // console.log(
    //   data.map(entry => `${entry.selectedToolName}: ${entry.incomePercentage}`)
    // );

    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">

            <Header
              onSaveChange={currentSaveIndex => {
                const { saves } = this.state;

                this.setState({ currentSaveIndex });

                if (currentSaveIndex === 0) {
                  this.reset();
                }
                else {
                  const id = saves[currentSaveIndex - 1].id;
                  this.setState({ loading: true });
                  this.fetchSaveById(id)
                    .then(response => this.extractSave(response.data))
                    .catch(error => this.showAlert(error));
                }
              }}
              onSave={e => {
                const { saved, changed } = this.state;

                if (saved && changed) {
                  this.update(this.getTitle());
                  this.setState({ changed: false });
                }
                else {
                  dialogAPI.open("dialog1", e.target);
                }
              }}
            >
              <Radio.Group
                className="tabs"
                key={mode}
                defaultValue={mode}
                name="radiogroup"
                onChange={e => this.setState({ mode: e.target.value, changed: true })}
              >
                <Radio className="tabs__label tabs__label--1" value={0}>
                  Произвольный
                  <span className="prefix">ход цены</span>
                </Radio>
                <Radio className="tabs__label tabs__label--1" value={1}>
                  Повышенный
                  <span className="prefix">ход цены</span>
                </Radio>
                <Radio className="tabs__label tabs__label--1" value={2}>
                  Аномальный
                  <span className="prefix">ход цены</span>
                </Radio>
                <Radio className="tabs__label tabs__label--2" value={3}>
                  Черный лебедь
                  <span className="prefix">ход цены</span>
                </Radio>
              </Radio.Group>

              <Tooltip title="Настройки">
                <button
                  className="settings-button js-open-modal main-top__settings"
                  onClick={e => dialogAPI.open("config", e.target)}
                >
                  <span className="visually-hidden">Открыть конфиг</span>
                  <SettingFilled className="settings-button__icon" />
                </button>
              </Tooltip>
            </Header>

            <div className="main-content">

              <div className="container">

                <div className="main-content__switch-long-short-wrapper">
                  <Switch
                    className="main-content__switch-long-short"
                    key={isLong + ""}
                    checkedChildren="LONG"
                    unCheckedChildren="SHORT"
                    defaultChecked={isLong}
                    onChange={isLong => {
                      const { tools } = this.state;
                      const investorInfo = this.state.investorInfo;
                      investorInfo.type = isLong ? "LONG" : "SHORT";

                      this.setStateAsync({ investorInfo })
                        .then(() => this.setStateAsync({ tools: tools.map(tool => tool.update(investorInfo)) }))
                    }}
                  />
                </div>

                <div className="dashboard">
                  {(() => {
                    let data = [...this.state.data];
                    if (sortProp != null && sortDESC != null) {
                      data = data.sort((l, r) => sortDESC ? r[sortProp] - l[sortProp] : l[sortProp] - r[sortProp])
                    }

                    return (
                      this.state.tools.length > 0
                        ? (
                          data.map((item, index) =>
                            <DashboardRow
                              key={index + Math.random()}
                              item={item}
                              index={index}
                              sortProp={sortProp}
                              sortDESC={sortDESC}
                              mode={this.state.mode}
                              depo={this.state.depo}
                              percentage={item.percentage}
                              selectedToolName={item.selectedToolName}
                              planIncome={item.planIncome}
                              tools={this.getTools()}
                              onSort={(sortProp, sortDESC) => {
                                if (sortProp !== this.state.sortProp) {
                                  sortDESC = true;
                                }
                                this.setState({ sortProp, sortDESC })
                              }}
                              onUpdate={state => {
                                // console.log(data[index], state);
                                data[index] = state;
                                this.setState({ data });
                              }}
                              onChange={(prop, val) => {
                                data[index][prop] = val;
                                if (prop == "selectedToolName") {
                                  data[index].planIncome = null;
                                }
                                this.setState({ data, changed: true });
                              }}
                              onDelete={index => {
                                data.splice(index, 1);
                                this.setState({ data })
                              }}
                            />
                          )
                        )
                        : (
                          <span className="dashboard__loading">
                            <Spin
                              className="dashboard__loading-icon"
                              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
                              />
                            Подождите, инструменты загружаются...
                          </span>
                        )
                    );
                  })()}
                </div>

                <footer className="main__footer">

                  <Button className="custom-btn main__save"
                    onClick={() => {
                      const { data } = this.state;
                      data.push({ ...defaultToolData });
                      this.setState({ data })
                    }}>
                    <PlusOutlined aria-label="Добавить" />
                    инструмент
                  </Button>

                </footer>
                
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
            ]}
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}

            insertBeforeDialog={
              <label className="input-group input-group--fluid ksd-config__depo">
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

        </div>
      </Provider>
    );
  }
}

export { App, Consumer }