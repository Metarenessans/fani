import React from 'react'
const { Provider, Consumer } = React.createContext();
import ReactDOM from 'react-dom'

import clsx from 'clsx'
import Header from "./components/header"

import {
  Button,
  Input,
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

import params from "../../../common/utils/params"
import round               from "../../../common/utils/round";
import formatNumber        from "../../../common/utils/format-number"

import { cloneDeep, isEqual } from "lodash"

import { Tools, Tool, template, parseTool } from "../../../common/tools"

import CrossButton           from "../../../common/components/cross-button"
import NumericInput          from "../../../common/components/numeric-input"
import Dashboard             from "./components/Dashboard"
import TradeLog              from "./components/trade-log"
import SecondStep            from "./components/second-step"
import ThirdStep             from "./components/third-step"
import FourthStep             from "./components/fourth-step"

import { Dialog, dialogAPI } from "../../../common/components/dialog"

/* API */
import fetch from "../../../common/api/fetch"
import { applyTools } from "../../../common/api/fetch/tools"
import { fetchInvestorInfo, applyInvestorInfo } from "../../../common/api/fetch/investor-info"
import fetchSavesFor from "../../../common/api/fetch-saves"
import fetchSaveById from "../../../common/api/fetch/fetch-save-by-id"

import "../sass/style.sass"
import { message } from 'antd';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      step:           1,
      extraStep:  false,
      extraSaved: false,
      loading:    false,
      customTools:   [],
      currentSaveIndex: 0,

      loading: false,
      saved:   false,
      id:       null,

      // DashboardData
      rowData: new Array(5).fill(0).map( _ => {
        return {
          // значения для селекта с инструментами
          currentToolCode: "SBER",

          isSaved: false,

          // firstStep
          enterTime:   null,
          long:       false,
          short:      false,
          impulse:    false,
          postponed:  false,
          levels:     false,
          breakout:   false,
          result:         0,
          practiceStep:   0,

          // second step
          calmnessBefore:       0,
          calmnessDuring:       0,
          calmnessAfter:        0,

          collectednessBefore:  0,
          collectednessDuring:  0,
          collectednessAfter:   0,
          
          braveryBefore:        0,
          braveryDuring:        0,
          braveryAfter:         0,
          
          confidenceBefore:     0,
          confidenceDuring:     0,
          confidenceAfter:      0,
          
          compassionBefore:     0,
          compassionDuring:     0,
          compassionAfter:      0,
          
          greedinessBefore:     0,
          greedinessDuring:     0,
          greedinessAfter:      0,
          
          egoBefore:            0,
          egoDuring:            0,
          egoAfter:             0,
          
          euphoriaBefore:       0,
          euphoriaDuring:       0,
          euphoriaAfter:        0,
          
          faultBefore:          0,
          faultDuring:          0,
          faultAfter:           0,
          
          resentmentBefore:     0,
          resentmentDuring:     0,
          resentmentAfter:      0,
          
          angerBefore:          0,
          angerDuring:          0,
          angerAfter:           0,
          
          apathyBefore:         0,
          apathyDuring:         0,
          apathyAfter:          0,

          stagnationBefore:     0,
          stagnationDuring:     0,
          stagnationAfter:      0,



          
          marketVision:   false,
          entrySkill:     false,
          exitSkill:      false,
          dealStay:       false,
          mediumTermStay: false,
          tradeAlgorithm: false,
          boredom:        false,
          excitement:     false,
          tradeDesire:    false,

          // third step
          amy:                             false,
          tmo:                             false,
          recapitulation:                  false,
          archetypesWork:                  false,
          transactionTimeChange:           false,
          noneWithdrawPendingApplications: false,
          noReenterAfterClosingStopLoss:   false,
          noDisablingRobot:                false,
          inputVolumeControl:              false,
          makeFaniCalculate:               false,
          enterResultsInFani:              false,
          screenshotTransactions:          false,
          keyBehavioralPatternsIdentify:   false,
        }
      })
    };

    this.state = {
      ...this.initialState,
      
      currentRowIndex:   0,
      toolsLoading:  false,
      changed:       false,
      searchVal:        "",

      tools:        [],
      saves:        [],
    };

    // Bindings
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.fetchSaveById = fetchSaveById.bind(this, "Tradelog");
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { 
      id, 
      saves, 
      rowData, 
    } = this.state;

    if (prevState.step == 2 && this.state.step == 1) {
      document.getElementById("trade-slider").scrollIntoView();
    }
    
    if (prevState.step !== this.state.step && this.state.step == 2) {
      document.getElementById("second-step").scrollIntoView();
    }

    if (prevState.step !== this.state.step && this.state.step == 3) {
      document.getElementById("trade-slider").scrollIntoView();
    }

    if (prevState.rowData != rowData) {
      this.setState({ changed: true });
    }

    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }

  componentDidMount() {
    this.fetchInitialData();
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  // Fetching everithing we need to start working
  fetchInitialData() {
    this.fetchTools()
      .then(() => this.fetchSaves())
      .catch(error => console.error(error))
  }

  fetchTools() {
    return new Promise(resolve => {
      const { investorInfo } = this.state;
      const requests = [];
      const parsedTools = [];
      this.setState({ toolsLoading: true })
      for (let request of ["getFutures", "getTrademeterInfo"]) {
        requests.push(
          fetch(request)
            .then(response => Tools.parse(response.data, { investorInfo, useDefault: true }))
            .then(tools => Tools.sort(parsedTools.concat(tools)))
            .then(tools => parsedTools.push(...tools))
            .catch(error => this.showAlert(`Не удалось получить инстурменты! ${error}`))
        )
      }

      Promise.all(requests)
        .then(() => this.setStateAsync({ tools: parsedTools, toolsLoading: false }))
        .then(() => resolve())
    })
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      fetch("getTradelogSnapshots")
        .then(response => {
          const saves = response.data.sort((l, r) => r.dateUpdate - l.dateUpdate);
          this.setState({ saves, loading: false });
        })

      fetch("getLastModifiedTradelogSnapshot")
        .then(response => {
          // TODO: нужен метод проверки адекватности ответа по сохранению для всех проектов
          if (!response.error && response.data?.name) {
            const pure = params.get("pure") === "true";
            if (!pure) {
              this.setState({ loading: true });
              return this.extractSave(response.data)
                .then(resolve)
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
          const {changed} = this.state;
          this.setState({ changed: false });
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

            this.setStateAsync({ saves, loading: false }).then(() => {
              if (!response.error && response.data?.name) {
                this.extractSave(response.data)
              }
            })
          }
        })
    });
  }

  showMessageDialog(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
  }

  // TODO:
  packSave() {
    const { rowData } = this.state;

    const json = {
      static: {
        rowData
      },
    };

    console.log("Packed save:", json);
    return json;
  }

  extractSave(save) {
    const { saves, investorInfo } = this.state;
    let staticParsed;

    let state = {};

    try {
      let lastUpdated = save.dateUpdate || save.dateCreate;
      console.log('Extracting save:', save, "last updated:", new Date(lastUpdated * 1_000).toLocaleString("ru").replace(/\./g, "/"));

      staticParsed = JSON.parse(save.static);
      console.log("Parsed static", staticParsed);
      
      const initialState = cloneDeep(this.initialState);
      
      state.rowData = staticParsed.rowData ?? initialState.rowData;

      state.id = save.id;
      state.saved = true;
      state.loading = false;
    }
    catch (e) {
      state = {
        id: save?.id || 0,
        saved: true
      };
    }

    console.log('Parsing save finished!', state);
    return this.setStateAsync(state);
  }

  reset() {
    const initialState = cloneDeep(this.initialState);
    console.log(initialState);
    return this.setStateAsync(initialState);
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

      fetch("addTradelogSnapshot", "POST", data)
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
      if (dev) {
        resolve();
      }

      if (!id) {
        reject("id must be present!");
      }

      const json = this.packSave();
      const data = {
        id,
        name,
        static: JSON.stringify(json.static),
      };
      fetch("updateTradelogSnapshot", "POST", data)
        .then(response => {
          console.log("Updated!", response);
          resolve();
        })
        .catch(error => console.error(error));
    })
  }

  delete(id = 0) {
    console.log(`Deleting id: ${id}`);

    return new Promise((resolve, reject) => {
      fetch("deleteTradelogSnapshot", "POST", { id })
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
            this.reset();

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

  showAlert(errorMessage = "") {
    console.log(`%c${errorMessage}`, "background: #222; color: #bada55");
    message.error(errorMessage);
    // if (!dev) {
    //   this.setState({ errorMessage }, () => dialogAPI.open("dialog-msg"));
    // }
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools);
  }

  getOptions() {
    return this.getTools().map((tool, idx) => {
      return {
        idx: idx,
        label: String(tool),
      };
    });
  }


  getTitleJSX() {
    const { saves, currentSaveIndex } = this.state;
    let titleJSX = <span>Бинарный журнал сделок</span>;
    if (saves && saves[currentSaveIndex - 1]) {
      titleJSX = <span>{saves[currentSaveIndex - 1].name}</span>;
    }

    return titleJSX;
  }

  /**
   * Возвращает название текущего сейва (по дефолту возвращает строку "Калькулятор Инвестиционных Стратегий") */
  getTitle() {
    return this.getTitleJSX().props.children;
  }

  render() {
    let { 
      step, 
      extraStep, 
      currentRowIndex, 
      rowData,
      extraSaved,
      loading,
      saves,
      currentSaveIndex,
      saved,
      changed,
    } = this.state;

    let { currentToolCode, isSaved } = rowData[currentRowIndex];

    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">
            <div className="hdOptimize" >
              <div 
                className="main-content"
                style={{
                  overflow:
                    document.querySelector(".trade-slider-active") ? "hidden" : ""
                }}
              >
                <Header
                  title={this.getTitleJSX()}
                  loading={loading}
                  saves={saves}
                  currentSaveIndex={currentSaveIndex}
                  changed={changed}
                  saved={saved}
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
                <div className="container">

                  {/* <Dashboard
                    key={rowData}
                    rowData={rowData}
                    currentRowIndex={currentRowIndex}
                    setCurrentRowIndex={currentRowIndex => this.setState({ currentRowIndex }) }
                    onChange={(prop, value, index) => {
                      const rowDataClone = [...rowData];
                      rowDataClone[index][prop] = value;
                      this.setState({ rowData: rowDataClone })
                    }}
                    allPracticeStepsModify={(value) => {
                      const rowDataClone = 
                      [...rowData].map(row => {
                        row.practiceStep = value;
                        return row;
                      });
                      this.setState({ rowData: rowDataClone })
                    }}
                  />

                  <div className="add-button-container">
                    <Button
                      className="custom-btn"
                      onClick={() => {
                        const dataClone = [...rowData];
                        dataClone.push({ ...rowData });
                        dataClone[dataClone.length - 1].practiceStep = dataClone[0].practiceStep
                        this.setState({ rowData: dataClone });
                      }}
                      style={ document.querySelector(".trade-slider-active") && ({display: "none"}) }
                    >
                      <PlusOutlined aria-label="Добавить день" />
                      Добавить день
                    </Button>
                  </div> */}

                  <div className="trade-slider-active" id="trade-slider">
                    <div className="trade-slider-container">


                      <div className="trade-slider-top">
                        <Button
                          className={"day-button"}
                          onClick={e => this.setState({ currentRowIndex: currentRowIndex - 1, step: 1, extraStep: false})}
                          disabled={currentRowIndex == 0}
                        >
                          {"<< Предыдущий день"}
                        </Button>

                        <p>День {currentRowIndex + 1}</p>
                        <CrossButton
                          className="cross-button"
                          disabled={rowData.length == 1}
                          onClick={() => {
                            document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                            document.querySelector(".dashboard").classList.remove("dashboard-active");
                            let rowDataClone = [...rowData];
                            rowDataClone.splice(currentRowIndex, 1);

                            this.setState({  
                              rowData: rowDataClone,
                              extraStep: false,
                              step:          1,
                              currentRowIndex: currentRowIndex == 0 ? 0 : currentRowIndex - 1
                            });
                          }}
                        />

                        <Button
                          className={"day-button"}
                          disabled={currentRowIndex + 1 == rowData.length}
                          onClick={e => this.setState({ currentRowIndex: currentRowIndex + 1, step: 1, extraStep: false})}
                        >
                          {"Следующий день >>"}
                        </Button>
                      </div>

                      <div className="trade-slider-middle">
                        
                        <div 
                          className={clsx("trade-slider-middle-step", step >= 1 && ("blue-after-element") )}
                          onClick={e => this.setState({ step: 1, extraStep: false })}
                        >
                          <svg fill={step >= 1 ? "#4859b4" : "#cacaca"} height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><path d="M452 16H60C26.916 16 0 42.916 0 76v280c0 33.084 26.916 60 60 60h143.639l34.472 68.944a20.001 20.001 0 0 0 35.778 0L308.361 416H452c33.084 0 60-26.916 60-60V76c0-33.084-26.916-60-60-60zm20 340c0 11.028-8.972 20-20 20H296c-7.576 0-14.5 4.28-17.889 11.056L256 431.279l-22.111-44.223A20.001 20.001 0 0 0 216 376H60c-11.028 0-20-8.972-20-20V76c0-11.028 8.972-20 20-20h392c11.028 0 20 8.972 20 20z" /><path d="M136 176c-11.046 0-20 8.954-20 20v120c0 11.046 8.954 20 20 20s20-8.954 20-20V196c0-11.046-8.954-20-20-20z" /><circle cx="136" cy="116" r="20" /><path d="M376 116H256c-11.046 0-20 8.954-20 20s8.954 20 20 20h120c11.046 0 20-8.954 20-20s-8.954-20-20-20zM376 196H256c-11.046 0-20 8.954-20 20s8.954 20 20 20h120c11.046 0 20-8.954 20-20s-8.954-20-20-20zM376 276H256c-11.046 0-20 8.954-20 20s8.954 20 20 20h120c11.046 0 20-8.954 20-20s-8.954-20-20-20z" /></svg>

                          <span
                            style={{ color: step >= 1 ? "#4859b4" : "#cacaca" }}
                          >Торговая<br />стратегия</span>
                        </div>

                        <div 
                          className={clsx("trade-slider-middle-step", step >= 2 && ("blue-after-element"))}
                          onClick={ () => this.setState({ step: 2, extraStep: false })}
                        >
                          <svg fill={step >= 2 ? "#4859b4" : "#cacaca"} height="512" viewBox="0 0 512 512" width="512"  xmlns="http://www.w3.org/2000/svg"><path d="M492 110H384c-11.046 0-20 8.954-20 20v342h-34V20c0-11.046-8.954-20-20-20H202c-11.046 0-20 8.954-20 20v452h-34V270c0-11.046-8.954-20-20-20H20c-11.046 0-20 8.954-20 20v222c0 11.046 8.954 20 20 20h472c11.046 0 20-8.954 20-20V130c0-11.046-8.954-20-20-20zM108 472H40V290h68zM222 40h68v432h-68zm250 432h-68V150h68z" /></svg>

                          <span
                            style={{ color: step >= 2 ? "#4859b4" : "#cacaca" }}
                          >Анализ<br /> состояния</span>
                        </div>

                        <div
                          className={clsx("trade-slider-middle-step", step >= 3 && ("blue-after-element"))}
                          onClick={e => {
                            this.setState({ step: 3, extraStep: false });
                          }}
                        >
                          <svg fill={step >= 3 ? "#4859b4" : "#cacaca"} height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><path d="M30 256C30 131.383 131.383 30 256 30c46.867 0 91.563 14.211 129.196 40.587h-29.074c-8.284 0-15 6.716-15 15s6.716 15 15 15h70.292c8.284 0 15-6.716 15-15V15.295c0-8.284-6.716-15-15-15s-15 6.716-15 15v37.339C366.987 18.499 312.91 0 256 0 187.62 0 123.333 26.629 74.98 74.98 26.629 123.333 0 187.62 0 256c0 44.921 11.871 89.182 34.33 127.998 2.78 4.806 7.818 7.49 12.997 7.49 2.55 0 5.134-.651 7.499-2.019 7.17-4.149 9.619-13.325 5.471-20.496C40.477 334.718 30 295.652 30 256zM477.67 128.002c-4.15-7.171-13.328-9.619-20.496-5.47-7.17 4.149-9.619 13.325-5.471 20.496C471.523 177.281 482 216.346 482 256c0 124.617-101.383 226-226 226-46.863 0-91.551-14.215-129.18-40.587h29.058c8.284 0 15-6.716 15-15s-6.716-15-15-15H85.587c-8.284 0-15 6.716-15 15v70.292c0 8.284 6.716 15 15 15s15-6.716 15-15v-37.376C145.013 493.475 199.083 512 256 512c68.38 0 132.667-26.629 181.02-74.98C485.371 388.667 512 324.38 512 256c0-44.923-11.871-89.184-34.33-127.998z" /><path d="M389.413 225.863a15.003 15.003 0 0 0-1.499-11.382l-30-51.962a14.998 14.998 0 0 0-20.49-5.49l-17.076 9.859A108.742 108.742 0 0 0 301 155.679V136c0-8.284-6.716-15-15-15h-60c-8.284 0-15 6.716-15 15v19.678a108.838 108.838 0 0 0-19.348 11.209l-17.076-9.859a14.996 14.996 0 0 0-20.49 5.49l-30 51.962a15.001 15.001 0 0 0 5.49 20.49l16.993 9.81a110.892 110.892 0 0 0 0 22.438l-16.993 9.81a15.003 15.003 0 0 0-5.49 20.49l30 51.962a15.004 15.004 0 0 0 9.108 6.989 14.988 14.988 0 0 0 11.382-1.499l17.076-9.859A108.68 108.68 0 0 0 211 356.32V376c0 8.284 6.716 15 15 15h60c8.284 0 15-6.716 15-15v-19.678a108.777 108.777 0 0 0 19.348-11.209l17.076 9.859a15.003 15.003 0 0 0 11.382 1.499 14.994 14.994 0 0 0 9.108-6.989l30-51.962a15.001 15.001 0 0 0-5.49-20.49l-16.993-9.81a110.892 110.892 0 0 0 0-22.438l16.993-9.81a15.006 15.006 0 0 0 6.989-9.109zm-55.032 14.041C335.455 245.167 336 250.583 336 256s-.545 10.833-1.619 16.096a15 15 0 0 0 7.196 15.992l12.856 7.422-15 25.98-12.963-7.484a15.002 15.002 0 0 0-17.458 1.772c-8.18 7.261-17.517 12.67-27.751 16.078a15 15 0 0 0-10.262 14.232V361h-30v-14.912a15 15 0 0 0-10.262-14.232c-10.234-3.408-19.571-8.817-27.751-16.078a15 15 0 0 0-17.458-1.772l-12.963 7.484-15-25.98 12.856-7.422a15 15 0 0 0 7.196-15.992C176.545 266.833 176 261.417 176 256s.545-10.833 1.619-16.096a15 15 0 0 0-7.196-15.992l-12.856-7.422 15-25.98 12.963 7.484a14.998 14.998 0 0 0 17.458-1.772c8.18-7.261 17.517-12.67 27.752-16.078a15.002 15.002 0 0 0 10.261-14.232V151h30v14.912a15.002 15.002 0 0 0 10.261 14.232c10.235 3.408 19.572 8.817 27.752 16.078a15 15 0 0 0 17.458 1.772l12.963-7.484 15 25.98-12.856 7.422a14.998 14.998 0 0 0-7.198 15.992z" /><path d="M256 201c-30.327 0-55 24.673-55 55s24.673 55 55 55 55-24.673 55-55-24.673-55-55-55zm0 80c-13.785 0-25-11.215-25-25s11.215-25 25-25 25 11.215 25 25-11.215 25-25 25z" /></svg>

                          <span
                            className="elaboration-step"
                            style={{ color: step >= 3 ? "#4859b4" : "#cacaca" }}
                          >
                            Проработка
                          </span>
                        </div>

                        <div
                          className="trade-slider-middle-step"
                          onClick={() => this.setState({ extraStep: true, step: 3 })}
                        >
                          { !isSaved && (
                          <svg fill={extraStep === true ? "#4859b4" : "#cacaca"} height="512pt" viewBox="0 -11 512 512" width="512pt" xmlns="http://www.w3.org/2000/svg"><path d="m502.7 353.98-98.438-79.187c-4.965-3.996-10.649-5.793-16.2-5.793-13.41 0-26.062 10.477-26.062 25.8v131.27c0 14.934 12.316 24.93 25.223 24.93 5.89 0 11.906-2.082 16.93-6.734l23.066-21.356 26.812 54.871c3.469 7.098 10.582 11.223 17.985 11.223 2.945 0 5.937-.652 8.765-2.035 9.922-4.848 14.035-16.824 9.188-26.75l-26.77-54.781 3.535-1.676 26.082-6.266c20.172-4.844 26.012-30.543 9.883-43.516zM402 391.777V324.31l51.738 41.62a40.708 40.708 0 0 0-4.133 1.684l-38.582 18.285a40.054 40.054 0 0 0-9.023 5.88zM452 0H60C26.914 0 0 26.914 0 60v332c0 44.113 35.887 80 80 80h221c11.047 0 20-8.953 20-20s-8.953-20-20-20H80c-22.055 0-40-17.945-40-40V121h432v149c0 11.047 8.953 20 20 20s20-8.953 20-20V60c0-33.086-26.914-60-60-60zm-81 40c11.027 0 20 8.973 20 20s-8.973 20-20 20-20-8.973-20-20 8.973-20 20-20zm100 20c0 11.027-8.973 20-20 20s-20-8.973-20-20 8.973-20 20-20 20 8.973 20 20zM40 60c0-11.027 8.973-20 20-20h254.441A59.657 59.657 0 0 0 311 60a59.66 59.66 0 0 0 3.8 21H40zm285 251.25v9.5c0 28.195-20.508 50.824-48.02 54.668V387c0 11.047-8.953 20-20 20s-20-8.953-20-20v-11.043c-12.566-.45-24.308-5.426-33.238-14.14-9.531-9.31-14.781-21.81-14.781-35.204 0-11.047 8.953-20 20-20s20 8.953 20 20c0 5.352 4.25 9.387 9.89 9.387h29.786c9.328 0 16.363-6.555 16.363-15.25v-9.5c0-8.984-7.344-16.297-16.363-16.297h-18.328c-31.02 0-56.254-25.363-56.254-56.543v-2.703c0-15.113 5.894-29.21 16.605-39.691 7.356-7.196 16.422-12.13 26.32-14.465v-13.547c0-11.047 8.954-20 20-20s20 8.953 20 20v12.86c23.32 4.28 41.02 24.284 41.02 48.253 0 11.043-8.953 20-20 20s-20-8.957-20-20c0-5.707-5.27-9.117-10.363-9.117h-17.328c-9.27 0-16.254 6.754-16.254 15.707v2.7c0 9.124 7.289 16.546 16.254 16.546h18.328c31.078 0 56.363 25.254 56.363 56.297zm0 0" />
                          </svg>
                          )}

                          { isSaved && (
                            <svg fill={extraStep ? "#4859b4" : "#cacaca"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M212.895 319.868c7.811 7.811 20.474 7.811 28.284 0l99.453-99.452c7.81-7.811 7.81-20.474 0-28.284-7.811-7.811-20.475-7.811-28.285 0l-85.31 85.31-27.384-27.384c-7.811-7.811-20.474-7.811-28.284 0-7.81 7.811-7.811 20.474 0 28.284l41.526 41.526z" /><path d="M416 0H96C84.954 0 76 8.954 76 20v376a20.003 20.003 0 0 0 9.709 17.15l160 96a20.001 20.001 0 0 0 20.58 0l160.001-96A20 20 0 0 0 436 396V20c0-11.046-8.954-20-20-20zm-20 384.676-140 84-140-84V40h280v344.676z" /></svg>
                          )}

                          <span style={{ color: extraStep ? "#4859b4" : "#cacaca" }}>
                            Корректировка
                          </span>
                        </div>
                      </div>

                      <div className="trade-slider-steps">
                        {/* {step == 1 && (
                          <TradeLog
                            key={rowData}
                            rowData={rowData}
                            tools={this.state.tools}
                            searchVal={this.state.searchVal}
                            setSeachVal={ val => this.setState({searchVal: val}) }
                            currentToolCode={currentToolCode}
                            currentRowIndex={currentRowIndex}
                            toolsLoading={this.state.toolsLoading}
                            onChange={(prop, value, index) => {
                              const rowDataClone = [...rowData];
                              rowDataClone[index][prop] = value;
                              this.setState({ rowData: rowDataClone })
                            }}
                            isToolsDropdownOpen={ value => {
                              this.setState({ isToolsDropdownOpen: value })
                            }}
                          />
                        )} */}

                        {/* {step == 2 && (
                          <SecondStep
                            rowData={rowData}
                            currentRowIndex={currentRowIndex}
                            onChange={(prop, value, index) => {
                              const rowDataClone = [...rowData];
                              rowDataClone[index][prop] = value;
                              this.setState({ rowData: rowDataClone })
                            }}
                          />
                        )} */}

                        {true && (
                        // {step == 3 && (
                          // <ThirdStep
                          //   rowData={rowData}
                          //   currentRowIndex={currentRowIndex}
                          //   onChange={(prop, value, index) => {
                          //     const rowDataClone = [...rowData];
                          //     rowDataClone[index][prop] = value;
                          //     this.setState({ rowData: rowDataClone })
                          //   }}
                          //   onClickTab={(boolean) => this.setState({ extraStep: boolean })}
                          // />
                           <FourthStep/>
                        )}

                      </div>

                      {/* <div className="trade-slider-bottom">
                        {step == 1 && (
                          <Button
                            className="custom-btn custom-btn--slider"
                            onClick={e => {
                              this.setState({ step: 1, extraStep: false });
                              document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                              document.querySelector(".dashboard").classList.remove("dashboard-active");
                            }}
                            disabled={step > 1}
                          >
                            Закрыть
                          </Button>
                        )}
                        
                        {step > 1 && (
                          <Button
                            className="custom-btn custom-btn--slider"
                            onClick={e => {
                              this.setState({ step: step - 1, extraStep: false })
                            }}
                            disabled={step == 1}
                          >
                            Назад
                          </Button>
                        )}

                        {step < 3 && (
                          <Button 
                            className="custom-btn custom-btn--slider next-button"
                            onClick={e => {
                              this.setState({ step: step + 1 })
                            }}
                            disabled={step == 3}
                          >
                            Далее
                          </Button>
                        )}

                        {(() => {
                          if (step == 3 && !extraSaved) {
                            return (
                              <Button
                                className="custom-btn custom-btn--slider"
                                onClick={() => {
                                  const rowDataClone = [...rowData];
                                  rowDataClone[currentRowIndex].isSaved = true;
                                  this.update(this.getTitle());
                                  this.setState({
                                    rowData: rowDataClone, 
                                    extraStep: true, 
                                    extraSaved: true,
                                  })
                                }}
                              >
                                Сохранить
                              </Button>
                            )
                          }
                          
                          if (step == 3 && extraSaved) {
                            return (
                              <Button
                                className="custom-btn custom-btn--slider"
                                onClick={e => {
                                  this.setState({ step: 1, extraStep: false, extraSaved: false, changed: false});
                                  document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                                  document.querySelector(".dashboard").classList.remove("dashboard-active");
                                }}
                              >
                                Закрыть
                              </Button>
                            )
                          }

                        })()}
                      </div> */}

                    </div>
                  </div>

                </div>
              </div>
            </div>

          </main>
          {/* /.main */}

          {(() => {
            const { saves, id } = this.state;
            const currentTitle = this.getTitle();
            let namesTaken = saves.slice().map(save => save.name);
            let name = id ? currentTitle : "Новое сохранение";

            /**
             * Проверяет, может ли данная строка быть использована как название сейва
             * 
             * @param {String} nameToValidate
             * 
             * @returns {Array<String>} Массив ошибок (строк). Если текущее название валидно, массив будет пустым
             */
            const validate = (nameToValidate = "") => {
              nameToValidate = nameToValidate.trim();

              let errors = [];
              if (nameToValidate != currentTitle) {
                let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(nameToValidate);
                if (nameToValidate.length < 3) {
                  errors.push("Имя должно содержать не меньше трех символов!");
                }
                else if (test) {
                  errors.push(`Нельзя использовать символ "${test[0]}"!`);
                }
                if (namesTaken.indexOf(nameToValidate) > -1) {
                  console.log();
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
                      maxLength={30}
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
            title="Удаление сохранения"
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

        </div>
      </Provider>
    );
  }
}

export { App, Consumer }