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

export default class SecondStep extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  render() {
    let { } = this.props;

    let { data } = this.state

    return (
      <>
        <div className="second-step">
          <div className="title">
            Анализ состояния
          </div>

          <div className="second-step-table">

            {/* col */}
            <div className="second-step-table-first-column">
              
              <div className="second-step-table-first-column-title">
                Состояния
              </div>

              <div className="title title--green">
                Нормальные
              </div>

              <div className="second-step-table-first-column-row-container">
                
                <div className="second-step-table-first-column-row">
                  <p>Спокойствие</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Собранность</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Смелость</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Уверенность</p>
                </div>

                <div className="title title--red">
                  Искаженные
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Жалость</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Жадность</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Эго (я прав)</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Эйфория</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Вина</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Обида</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Гнев</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Апатия</p>
                </div>

                <div className="second-step-table-first-column-row">
                  <p>Стагнация</p>
                </div>
              </div>




            </div>
            {/* col */}

            {/* col */}
            <div className="second-step-table-second-column">
              <div className="second-column-title-container">
                <p>До входа</p>
                <p>Во время<br/>сделки  </p>
                <p>После   <br/>закрытия</p>
              </div>
              
              <div className="second-column-empty-row"/>

              <div className="second-column-row-container" aria-label="Спокойствие">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия"/>
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Собранность">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия"/>
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Смелость">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия"/>
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Уверенность">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки"/>
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия"/>
                </div>
              </div>
            
              <div className="second-column-empty-row second-column-empty-row--second" />


              <div className="second-column-row-container" aria-label="Жалость">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Жадность">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Это (я прав)">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Эйфория">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Вина">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Обида">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Гнев">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Апатия">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Стагнация">
                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="До входа" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="Во время сделки" />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox className="check-box" aria-label="После закрытия" />
                </div>
              </div>
              
            </div>
            {/* col */}

            {/* col */}
            <div className="second-step-table-third-column">
              <div className="table-third-column-title">
                Мотивационные драйверы
              </div>

              <div className="title title--green">
                Нормальные
              </div>

              <div className="table-third-column-row-container">
                
                <div className="table-third-column-row-container-row">
                  <p>Видение рынка</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка навыка входа</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка навыка выхода</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка пребывания в сделке</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка среднесрочного анализа</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Создание торгового алгоритма</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="title title--red">
                  Искаженные
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Скука</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Азарт</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Желание торговать</p>
                  <div className="third-column-row-check-box">
                    <Checkbox className="check-box" aria-label="До входа" />
                  </div>
                </div>

              </div>
            </div>
            {/* col */}

          </div>
        </div>
      </>
    )
  }
}
