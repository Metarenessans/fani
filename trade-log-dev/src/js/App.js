import React from 'react'
const { Provider, Consumer } = React.createContext();
import ReactDOM from 'react-dom'

import clsx from 'clsx'

import {
  Button,
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

import round               from "../../../common/utils/round";
import formatNumber        from "../../../common/utils/format-number"

import CrossButton           from "../../../common/components/cross-button"
import NumericInput          from "../../../common/components/numeric-input"
import Dashboard             from "./components/Dashboard"
import TradeLog              from "./components/trade-log"
import SecondStep            from "./components/second-step"
import ThirdStep             from "./components/third-step"

import "../sass/style.sass"

const defaultToolData = {};

const setFocusToNextButton = () => {
  document.querySelector(".next-button").focus();
}

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
    };

    this.state = {
      ...this.initialState,

      step: 1,
      extraStep: false,
      day:  1,
      isSaved: false,
    };
  }


  render() {
    let { step, extraStep, day, isSaved } = this.state;
    
    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">
            <div className="hdOptimize" >
              <div className="main-content">

                <div className="container">
                  
                  <Dashboard
                    onChange={(prop, value, index) => {
                      const dataClone = [...data];
                      data[index][prop] = value;
                      this.setState({ data: dataClone })
                    }}
                    onAddRow={() => {
                      const dataClone = [...data];
                      dataClone.push({ ...defaultToolData });
                      this.setState({ data: dataClone });
                    }}
                    onRemoveRow={() => {
                      const dataClone = [...data];
                      dataClone.pop();
                      this.setState({ data: dataClone });
                    }}
                  />

                  <div className="trade-slider">
                    <div className="trade-slider-container">


                      <div className="trade-slider-top">
                        <Button
                          className={"day-button"}
                          onClick={e => this.setState({ day: day - 1 })}
                          disabled={day == 1}
                        >
                          {"<< Предыдущий день"}
                        </Button>

                        <p>День {day}</p>

                        <Button
                          className={"day-button"}
                          onClick={e => this.setState({ day: day + 1 })}
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
                          >Информация<br /> о сделке</span>
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

                          <span style={{ color: extraStep  ? "#4859b4" : "#cacaca" }} >
                            Корректировка
                          </span>
                        </div>
                      </div>

                      <div className="trade-slider-steps">
                        {step == 1 && (
                          <TradeLog />
                        )}

                        {step == 2 && (
                          <SecondStep />
                        )}

                        {step == 3 && (
                          <ThirdStep
                            onClickTab={(boolean) => this.setState({ extraStep: boolean })}
                          />
                        )}
                      </div>

                      <div className="trade-slider-bottom">
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
                            onClick={e => this.setState({ step: step - 1, extraStep: false })}
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
                              setFocusToNextButton()
                            }}
                            disabled={step == 3}
                          >
                            Далее
                          </Button>
                        )}
                        
                        {(() => {
                          if (step == 3 && !isSaved) {
                            return (
                              <Button
                                className="custom-btn custom-btn--slider"
                                onClick={() => this.setState({ isSaved: true, extraStep: true })}
                              >
                                Сохранить
                              </Button>
                            )
                          }
                          
                          if (step == 3 && isSaved) {
                            return (
                              <Button
                                className="custom-btn custom-btn--slider"
                                onClick={e => {
                                  this.setState({ step: 1, extraStep: false, isSaved: false });
                                  document.querySelector(".trade-slider").classList.remove("trade-slider-active");
                                  document.querySelector(".dashboard").classList.remove("dashboard-active");
                                }}
                              >
                                Закрыть
                              </Button>
                            )
                          }

                        })()}
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>

          </main>
          {/* /.main */}

        </div>
      </Provider>
    );
  }
}

export { App, Consumer }