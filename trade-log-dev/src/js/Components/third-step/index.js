import React from 'react'
import { Button, Tooltip, Select, Progress, Checkbox } from 'antd/es'

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

export default class ThirdStep extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  render() {
    let { onClickTab, onChange, currentRowIndex, rowData } = this.props;

    let { data } = this.state

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
      <div className="third-step">

        {/* col */}
        <div 
          className="third-step-column"
          onClick={() => onClickTab(false)}
        >

          <div className="title third-step-column-title">
            Внутренняя проработка
          </div>

          <div className="third-step-table">

            <div className="third-step-table-title">
              Технология
            </div>

            <div className="third-step-table-row-container">

              <div className="third-step-table-row-container-row">
                <p>ЭМИ</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={amy}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("amy", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="third-step-table-row-container-row">
                <p>ТМО</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={tmo}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("tmo", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="third-step-table-row-container-row">
                <p>Перепросмотр</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={recapitulation}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("recapitulation", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="third-step-table-row-container-row">
                <p>Работа с архетипами</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={archetypesWork}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("archetypesWork", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* col */}

        {/* col */}
        <div
          className="third-step-column"
          onClick={() => onClickTab(true)}
        >

          <div className="title">
            Внесение корректировок в тс
          </div>

          <div className="third-step-table">

            <div className="third-step-table-title">
              Практические шаги
            </div>
            
            <div className="third-step-table-row-container">

              <div className="third-step-table-row-container-row">
                <p>Изменить время на сделку</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={transactionTimeChange}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("transactionTimeChange", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Не снимать отложенные заявки, выставленные до этого</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
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
            
              <div className="third-step-table-row-container-row">
                <p>Не перезаходить после закрытия по Stop-Loss</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={noReenterAfterClosingStopLoss}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("noReenterAfterClosingStopLoss", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Не выключать робота</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={noDisablingRobot}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("noDisablingRobot", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Контролировать объём входа</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={inputVolumeControl}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("inputVolumeControl", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Делать расчёты ФАНИ</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={makeFaniCalculate}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("makeFaniCalculate", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Заносить результаты в ФАНИ</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={enterResultsInFani}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("enterResultsInFani", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Фиксировать сделки в скриншотах</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={screenshotTransactions}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("screenshotTransactions", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Выделять ключевые поведенченские паттерны и модели</p>
                <div className="third-step-table-check-box">
                  <Checkbox
                    className="check-box"
                    key={currentRowIndex}
                    checked={keyBehavioralPatternsIdentify}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("keyBehavioralPatternsIdentify", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
          </div>
        </div>
        {/* col */}
      </div>
    )
  }
}


