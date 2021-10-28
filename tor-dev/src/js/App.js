import React from 'react'
const { Provider, Consumer } = React.createContext();
import { Input } from 'antd/es'

import {} from '@ant-design/icons'

import params       from "../../../common/utils/params";
import formatNumber from "../../../common/utils/format-number"

import { cloneDeep, isEqual } from "lodash"

import NumericInput          from "../../../common/components/numeric-input"
import Config                from "../../../common/components/config"
import { Dialog, dialogAPI } from "../../../common/components/dialog"
import { Tools, Tool, template }   from "../../../common/tools"
import Dashboard             from "./components/Dashboard"
import Header                from "./components/header"
import round                 from "../../../common/utils/round"

/* API */
import fetch             from "../../../common/api/fetch"
import { applyTools }    from "../../../common/api/fetch/tools"
import { fetchInvestorInfo, applyInvestorInfo } from "../../../common/api/fetch/investor-info"
import fetchSavesFor     from "../../../common/api/fetch-saves"
import fetchSaveById     from "../../../common/api/fetch/fetch-save-by-id"
import syncToolsWithInvestorInfo from "../../../common/utils/sync-tools-with-investor-info"

import "../sass/style.sass"

class App extends React.Component {

constructor(props) {
    super(props);

    this.initialState = {

      id: null,

      investorInfo: {
        status: "KSUR",
        type:   "LONG",
      },

      loading: false,

      // Депозит
      depo: 1_000_000,

      items: [{
        id: 1,
        selectedToolName: "SBER",
        drawdown:         null,

        // Контрактов
        contracts: 1,
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
        freeMoney:     0,
        // Прошло пунктов против
        pointsAgainst: 0,
        // 
        incomeExpected: 0,
      }],

      customTools: [],

      saved: false,

      currentSaveIndex: 0,

      toolsLoading: true,

      isFocused: false,

      currentToolIndex:  0,
    };

    this.state = {
      ...this.initialState,
      ...{
        tools: [],

        saves: [],
      }
    };

    this.state.loading = true;

    
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.applyTools        = applyTools.bind(this);
    this.fetchSaveById     = fetchSaveById.bind(this, "tor");
  }
  
  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData();
  }

  // ~~
  componentDidUpdate(prevProps, prevState) {
    const { id, saves, items } = this.state;
    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }

  // ~~
  getContracts() {
    const { items, depo, tools} = this.state;

    if (items, depo, tools) {
      items.map((item, index) => {
        const selectedToolName = items[index].selectedToolName;
        const selectedToolindex = Tools.getIndexByCode(selectedToolName, tools);
        const currentTool = tools[selectedToolindex];
        const contracts = round((depo * 0.1) / (currentTool?.guarantee));

        let itemsClone = [...items];
        itemsClone[index] = contracts;
        
        if (contracts != null) {
          this.setState({ items: 12 });
          // this.setState({ items: itemsClone });
        }
      })
    }
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  bindEvents() {

  }

  fetchInitialData() {
    this.fetchInvestorInfo();
    this.fetchTools()
      .then(() => this.setFetchingToolsTimeout())
      if (dev) {
        // this.loadFakeSave();
        return;
      }
      this.fetchSaves()
        .then(() => this.getContracts())
  }

  loadFakeSave() {
    this.setState({ loading: true });

    setTimeout(() => {
      let { saves } = this.state;
      let save = {
        error: false,
        data: {
          id: 21,
          name: "Новое сохранение",
          dateCreate: 1602504603,
          static: `{"depo":1000000,"items":[{"id":1,"selectedToolName":"AFLT-3.21","drawdown":100000,"contracts":40,"additionalLoading":45,"stepExpected":10,"directUnloading":true,"isLong":false,"freeMoney":0,"pointsAgainst":0,"incomeExpected":0,"additionalLoading2":45,"stepExpected2":10}],"customTools":[],"current_date":"#"}`
        }
      };
  
      const index = 0;
      this.extractSave(save.data);
  
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
    fetch("getInvestorInfo")
      .then(response => this.applyInvestorInfo(response))
      .then(response => {
        console.log(response);
        return this.setStateAsync({ depo: response.data.deposit || 10_000 })
      })
      .then(syncToolsWithInvestorInfo.bind(this, null, { useDefault: true }))
      .catch(err => this.showAlert(`Не удалось получить начальный депозит! ${err}`));
  }
  
  setFetchingToolsTimeout() {
    new Promise(resolve => {
      setTimeout(() => {
        if (!document.hidden) {
          this.prefetchTools()
            .then(() => {
              const { isToolsDropdownOpen } = this.state;
              if (!isToolsDropdownOpen) {
                this.imitateFetchcingTools()
                  .then(() => resolve());
              }
              else {
                console.log('no way!');
                resolve();
              }
            });
        }
        else resolve();

      }, dev ? 6_000 : 1 * 60 * 1_000);

    }).then(() => this.setFetchingToolsTimeout())
  }

  imitateFetchcingTools() {
    return new Promise((resolve, reject) => {
      if (Tools.storage?.length) {
        this.setStateAsync({ toolsLoading: true });
        const newTools = Tools.storage;

        setTimeout(() => {
          this.setState({
            tools: newTools,
            toolsLoading: false,
          }, () => resolve());
        }, 2_000);
      }
      else {
        resolve();
      }
    })
  }

  prefetchTools() {
    return new Promise(resolve => {
      Tools.storage = [];
      const requests = [];
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        const { investorInfo } = this.state;
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
            .then(tools => Tools.sort(Tools.storage.concat(tools)))
            .then(tools => {
              Tools.storage = [...tools];
            })
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.all(requests).then(() => resolve())
    })
  }

  fetchTools() {
    return new Promise(resolve => {
      let first = true;
      const requests = [];
      this.setState({ toolsLoading: true });
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        const { investorInfo } = this.state;
        fetch(request)
          .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
          .then(tools => Tools.sort(this.state.tools.concat(tools)))
          .then(tools => this.setStateAsync({ tools }))
          .then(syncToolsWithInvestorInfo.bind(this, null, { useDefault: true }))
          .then(() => {
            if (first) {
              first = false;
              const selectedToolName = this.getTools()[0].getSortProperty();
              this.setStateAsync({ selectedToolName });
            }
          })
          .catch(error => console.error(error));
      }

    Promise.all(requests)
      .then(() => this.setStateAsync({ toolsLoading: false }))
      .then(() => resolve())
    })
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {

      fetchSavesFor("tor")
        .then(response => {
          const saves = response.data.sort((l, r) => r.dateUpdate - l.dateUpdate);
          return new Promise(resolve => this.setState({ saves, loading: false }, () => resolve(saves)))
        })
  
      fetch("getLastModifiedTorSnapshot")
        .then(response => {
          // TODO: нужен метод проверки адекватности ответа по сохранению для всех проектов
          if (!response.error && response.data?.name) {
            const pure = params.get("pure") === "true";
            if (!pure) {
              this.setState({ loading: true });
              return this.extractSave(response.data)
                .then(resolve())
                .catch(error => reject(error));
            }
          }
          resolve();
        })
        .catch(reason => {
          this.showAlert(`Не удалось получить сохранения! ${reason}`);
          reject(reason);
        })
        .finally(() => {
          if (dev) {
            const response = {
              "error": false,
              "data": {
                "id": 0,
                "name": null,
                "dateCreate": 0,
                "dateUpdate": 0,
                "static": null
              }
            };
  
            const saves = [{
              "id": response.data.id,
              "name": response.data.name,
              "dateCreate": response.data.dateCreate,
            }];
  
            this.setStateAsync({ saves }).then(() => {
              if (!response.error && response.data?.name) {
                this.extractSave(response.data)
              }
            })
          }
        })
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

  packSave() {
    let { items, customTools } = this.state;

    const json = {
      static: {
        items,
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

    const { saves } = this.state;

    let staticParsed;

    let state = {};

    try {

      staticParsed = JSON.parse(save.static);
      console.log(save);
      console.log("staticParsed", staticParsed);

      state.items = staticParsed.items;

      state.customTools = staticParsed.customTools || [];
      state.customTools = state.customTools
        .map(tool => Tool.fromObject(tool, { investorInfo: this.state.investorInfo }));

      state.id      = save.id;
      state.saved   = true;
      state.loading = false;
      state.currentSaveIndex = saves.indexOf( saves.find(currSave => currSave.id == save.id) ) + 1;
    }
    catch (e) {
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    return this.setStateAsync(state)
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

      fetch("addTorSnapshot", "POST", data)
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
      fetch("updateTorSnapshot", "POST", data)
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
      fetch("deleteTorSnapshot", "POST", { id })
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

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "ТОР";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    // console.log(this.getContracts(0), "getContracts")
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
            />

            <div className="main-content">
              <div className="container">

                {
                  this.state.items.map((obj, index) =>
                    <Dashboard
                      toolsLoading={this.state.toolsLoading}
                      onFocus={() => this.setState({ isToolsDropdownOpen: true })}
                      onBlur={() => {
                        this.setStateAsync({ isToolsDropdownOpen: false })
                          .then(() => this.imitateFetchcingTools());
                      }}
                      index={index}
                      investorInfo={this.state.investorInfo}
                      items={this.state.items}
                      loading={this.state.loading}
                      tools={this.getTools()}
                      data={obj}
                      depo={this.state.depo}
                      onChange={(prop, val, jsx) => {
                        const { items } = this.state;

                        if (prop == "selectedToolName") {
                          items[index].stepExpected = jsx.getToolByName(val).priceStep * 100;
                          this.setStateAsync({ isToolsDropdownOpen: false })
                            .then(() => this.imitateFetchcingTools());
                        }
                        items[index][prop] = val;
                        this.setState({ items, changed: true });
                      }}
                      // ~~
                      onContractsChange={ (index, value, name) => {
                        const { items } = this.state
                        const itemsClone = [...items];
                        itemsClone[index][name] = value;

                        this.setState({ items: itemsClone })
                      }}
                      onDrawdownChange={(val, cb) => {
                        this.setState({ drawdown: val }, cb);
                      }}
                      onOpenConfig={e => {
                        dialogAPI.open("config", e.target);
                      }}
                      onCopy={() => {
                        let { items } = this.state;

                        var copy = Object.assign({}, items[index]);
                        copy.id = Math.random();
                        items.push(copy);

                        this.setState({ items });
                      }}
                      onDelete={() => {
                        let { items } = this.state;

                        if (items.length > 1) {
                          items.splice(index, 1);
                          this.setState({ items });
                        }
                      }}
                      onChangeTool={ value => {
                        const { currentToolIndex } = this.state;
                        this.setState({ currentToolIndex: value });
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
            templateContructor={Tool}
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
              <label className="input-group input-group--fluid tor-config__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput
                  className="input-group__input"
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