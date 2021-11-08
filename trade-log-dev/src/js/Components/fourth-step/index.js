import React from 'react'
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

    this.state = {
      firstColumnExtraRows: [],
      secondColumnExtraRows: []
      
    };
  }

  render() {
    let { onClickTab, onChange, currentRowIndex, rowData } = this.props;

    let { firstColumnExtraRows, secondColumnExtraRows } = this.state

    let {
      amy,
      tmo,
      recapitulation,
      archetypesWork,
      transactionTimeChange,
      noneWithdrawPendingApplications,
      noReenterAfterClosingStopLoss,
      noDisablingRobot,
      inputVolumeControl,
      makeFaniCalculate,
      enterResultsInFani,
      screenshotTransactions,
      keyBehavioralPatternsIdentify,
    } = rowData[currentRowIndex]

    return (
      <div className="fourth-step">
        <div className="title">
          Внутренняя проработка
        </div>

        <div className="pactice-container">
          <a className="trade-log-button" href="https://www.youtube.com/">
            Техники внутренней проработки
          </a>
        </div>
        <div className="column-container">
          {/* col */}
          <div 
            className="fourth-step-column"
            onClick={() => onClickTab(false)}
          >
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
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("amy", value, currentRowIndex)
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
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("tmo", value, currentRowIndex)
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
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("recapitulation", value, currentRowIndex)
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
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("archetypesWork", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                {firstColumnExtraRows.map((item, index) => {
                  const { name, value } = firstColumnExtraRows[index]
                  return (
                    // ~~
                    <div className="fourth-step-table-row-container-row">
                      <Input
                        defaultValue={name}
                        onBlur={e => {
                          let val = e.target.value;
                          const dataClone = [...firstColumnExtraRows];
                          dataClone[index]["name"] = val
                          this.setState({ firstColumnExtraRows: dataClone });
                        }}  
                        onEnter={e => {
                          let val = e.target.value;
                          const dataClone = [...firstColumnExtraRows];
                          dataClone[index]["name"] = val
                          this.setState({ firstColumnExtraRows: dataClone });
                        }}  
                      />
                      <div className="fourth-step-table-check-box">
                        <Checkbox
                          className="green"
                          key={value}
                          checked={value}
                          onChange={(val) => {
                            let value = val.target.checked;
                            const dataClone = [...firstColumnExtraRows];
                            dataClone[index]["value"] = value;
                            this.setState({ firstColumnExtraRows: dataClone });
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
                    const dataClone = [...firstColumnExtraRows];
                    dataClone.push({ name: "", value: null });
                    this.setState({ firstColumnExtraRows: dataClone });
                  }}
                >Добавить</Button>
              </div>
          </div>
          {/* col */}

          {/* col */}
          <div
            className="fourth-step-column"
            onClick={() => onClickTab(true)}
          >
            <div className="fourth-step-table">

              <div className="fourth-step-table-title">
                Практические задачи на отработку
              </div>
              
              <div className="fourth-step-table-row-container">

                <div className="fourth-step-table-row-container-row">
                  <p>Изменить время на сделку</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={transactionTimeChange}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("transactionTimeChange", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Не снимать отложенные заявки, выставленные до этого</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={noneWithdrawPendingApplications}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("noneWithdrawPendingApplications", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Не перезаходить после закрытия по Stop-Loss</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={noReenterAfterClosingStopLoss}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("noReenterAfterClosingStopLoss", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Не выключать робота</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={noDisablingRobot}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("noDisablingRobot", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Контролировать объём входа</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={inputVolumeControl}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("inputVolumeControl", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Делать расчёты ФАНИ</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={makeFaniCalculate}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("makeFaniCalculate", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Заносить результаты в ФАНИ</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={enterResultsInFani}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("enterResultsInFani", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Фиксировать сделки в скриншотах</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={screenshotTransactions}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("screenshotTransactions", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>
              
                <div className="fourth-step-table-row-container-row">
                  <p>Выделять ключевые поведенченские паттерны и модели</p>
                  <div className="fourth-step-table-check-box">
                    <Checkbox
                      className="green"
                      key={currentRowIndex}
                      checked={keyBehavioralPatternsIdentify}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("keyBehavioralPatternsIdentify", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

              {secondColumnExtraRows.map((item, index) => {
                const { name, value } = secondColumnExtraRows[index]
                return (
                  // ~~
                  <div className="fourth-step-table-row-container-row">
                    <Input
                      defaultValue={name}
                      onBlur={e => {
                        let val = e.target.value;
                        const dataClone = [...secondColumnExtraRows];
                        dataClone[index]["name"] = val
                        this.setState({ secondColumnExtraRows: dataClone });
                      }}
                    />
                    <div className="fourth-step-table-check-box">
                      <Checkbox
                        className="green"
                        key={value}
                        checked={value}
                        onChange={(val) => {
                          let value = val.target.checked;
                          const dataClone = [...secondColumnExtraRows];
                          dataClone[index]["value"] = value;
                          this.setState({ secondColumnExtraRows: dataClone });
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          <div className="fourth-step-add-button-container">
            <Button
              className="trade-log-button"
              onClick={() => {
                const dataClone = [...secondColumnExtraRows];
                dataClone.push({ ...secondColumnExtraRows });
                this.setState({ secondColumnExtraRows: dataClone });
              }}
            >Добавить</Button>
          </div>
          </div>
          {/* col */}
        </div>
      </div>
    )
  }
}


