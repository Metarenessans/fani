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
    let { onClickTab } = this.props;

    let { data } = this.state

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
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>

              <div className="third-step-table-row-container-row">
                <p>ТМО</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>

              <div className="third-step-table-row-container-row">
                <p>Перепросмотр</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>

              <div className="third-step-table-row-container-row">
                <p>Работа с архетипами</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
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
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Не снимать отложенные заявки, выставленные до этого</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Не перезаходить после закрытия по Stop-Loss</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Не выключать робота</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Контролировать объём входа</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Делать расчёты ФАНИ</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Заносить результаты в ФАНИ</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Фиксировать сделки в скриншотах</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
            
              <div className="third-step-table-row-container-row">
                <p>Веделять ключевые поведенченские паттерны и модели</p>
                <div className="third-step-table-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>
              </div>
          </div>
        </div>
        {/* col */}
      </div>
    )
  }
}


