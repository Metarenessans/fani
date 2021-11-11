import React, { useContext } from 'react'
import { StateContext } from "../../App"
import { cloneDeep } from 'lodash'
import { Button, Tooltip, Select, Progress, Checkbox, Input } from 'antd/es'

import {
  PlusOutlined,
  MinusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import NumericInput from "../../../../../common/components/numeric-input"
import CrossButton from "../../../../../common/components/cross-button"

import round from "../../../../../common/utils/round"
import num2str from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'
import { data } from 'jquery'

import "./style.scss"

const { Option } = Select;

export default class FourthStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StateContext.Consumer>
        {context => {
          const { state } = context;
          const { data, currentRowIndex }  = state;

          const {
            technology,
            customTechnology,
            practiceWorkTasks,
            customPracticeWorkTasks,
          } = data[currentRowIndex];

          const {
            amy,            
            tmo,            
            recapitulation, 
            archetypesWork, 
          } = technology;

          const {
            transactionTimeChange,
            noneWithdrawPendingApplications,
            noReenterAfterClosingStopLoss,
            noDisablingRobot,
            inputVolumeControl,
            makeFaniCalculate,
            enterResultsInFani,
            screenshotTransactions,
            keyBehavioralPatternsIdentify,
          } = practiceWorkTasks;

          return (
            <div className="fourth-step">
              <div className="title">
                Внутренняя проработка
              </div>

              <div className="pactice-container">
                <a className="trade-log-button" target="_blank" href="https://www.youtube.com/">
                  Техники внутренней проработки
                </a>
              </div>
              <div className="column-container">
                {/* col */}
                <div className="fourth-step-column">
                  <div className="fourth-step-table">

                    <div className="fourth-step-table-title">
                      Технология
                    </div>

                    <div className="fourth-step-table-row-container">

                      <div className="fourth-step-table-row-container-row">
                        <p>ЭМИ</p>
                        <div className="fourth-step-table-check-box">
                          <Checkbox
                            className="green"
                            key={currentRowIndex}
                            checked={amy}
                            onChange={val => {
                              let value = val.target.checked
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].technology.amy = value;
                              context.setState({ data });
                            }}
                          />
                        </div>
                      </div>

                      <div className="fourth-step-table-row-container-row">
                        <p>ТМО</p>
                        <div className="fourth-step-table-check-box">
                          <Checkbox
                            className="green"
                            key={currentRowIndex}
                            checked={tmo}
                            onChange={val => {
                              let value = val.target.checked
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].technology.tmo = value;
                              context.setState({ data });
                            }}
                          />
                        </div>
                      </div>

                      <div className="fourth-step-table-row-container-row">
                        <p>Перепросмотр</p>
                        <div className="fourth-step-table-check-box">
                          <Checkbox
                            className="green"
                            key={currentRowIndex}
                            checked={recapitulation}
                            onChange={val => {
                              let value = val.target.checked
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].technology.recapitulation = value;
                              context.setState({ data });
                            }}
                          />
                        </div>
                      </div>

                      <div className="fourth-step-table-row-container-row">
                        <p>Работа с архетипами</p>
                        <div className="fourth-step-table-check-box">
                          <Checkbox
                            className="green"
                            key={currentRowIndex}
                            checked={archetypesWork}
                            onChange={val => {
                              let value = val.target.checked
                              const data = cloneDeep(state.data);
                              data[currentRowIndex].technology.archetypesWork = value;
                              context.setState({ data });
                            }}
                          />
                        </div>
                      </div>

                      {customTechnology.map((item, index) => {
                        const { name, value } = customTechnology[index]
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <Input
                              defaultValue={name}
                              onBlur={ val => {
                                const data = cloneDeep(state.data);
                                data[currentRowIndex].customTechnology[index].name = val;
                                context.setState({ data });
                              }}  
                            />
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                key={value}
                                checked={value}
                                onChange={val => {
                                  let value = val.target.checked
                                  const data = cloneDeep(state.data);
                                  data[currentRowIndex].customTechnology[index].value = value;
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}

                    </div>
                  </div>
                    <div className="fourth-step-add-button-container">
                      <Button 
                        className="trade-log-button"
                        onClick={() => {
                          const data = cloneDeep(state.data);
                          const customTechnology = cloneDeep(data[currentRowIndex].customTechnology);
                          customTechnology.push({
                            name: "Новая технология " + customTechnology.length,
                            value: ""
                          });
                          data[currentRowIndex].customTechnology = customTechnology;
                          context.setState({ data });
                        }}
                      >Добавить технологию</Button>
                    </div>
                </div>
                {/* col */}

                {/* col */}
                <div
                  className="fourth-step-column"
                >
                  <div className="fourth-step-table">

                    <div className="fourth-step-table-title">
                      Практические задачи на отработку
                    </div>
                    
                    <div className="fourth-step-table-row-container">
                      {Object.keys(practiceWorkTasks).map((key, index) => {
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <p>{key}</p>
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                checked={practiceWorkTasks[key]}
                                onChange={val => {
                                  let value = val.target.checked;
                                  const data = cloneDeep(state.data);
                                  data[currentRowIndex].practiceWorkTasks[key] = value;
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}

                      {customPracticeWorkTasks.map((item, index) => {
                        const { name, value } = customPracticeWorkTasks[index]
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <Input
                              defaultValue={name}
                              onBlur={e => {
                                let val = e.target.value;
                                const dataClone = [...customPracticeWorkTasks];
                                dataClone[index]["name"] = val
                                this.setState({ customPracticeWorkTasks: dataClone });
                              }}
                            />
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                key={value}
                                checked={value}
                                onChange={(val) => {
                                  let value = val.target.checked;
                                  const dataClone = [...customPracticeWorkTasks];
                                  dataClone[index]["value"] = value;
                                  this.setState({ customPracticeWorkTasks: dataClone });
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                <div className="fourth-step-add-button-container">
                  <Button
                    className="trade-log-button"
                    onClick={() => {
                      const data = cloneDeep(state.data);
                      const customPracticeWorkTasks = cloneDeep(data[currentRowIndex].customPracticeWorkTasks);
                      customPracticeWorkTasks.push({
                        name:  "Новая задача " +  customPracticeWorkTasks.length,
                        value: ""
                      });
                      data[currentRowIndex].customPracticeWorkTasks = customPracticeWorkTasks;
                      context.setState({ data });
                    }}
                  >Добавить задачу</Button>
                </div>
                </div>
                {/* col */}
              </div>
            </div>
          )
        }}
      </StateContext.Consumer>
    )
  }
}


