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

    this.state = {};
  }

  render() {
    let { currentRowIndex, onChange, rowData } = this.props;

    let {
      calmnessBefore,
      calmnessDuring,
      calmnessAfter,

      collectednessBefore,
      collectednessDuring,
      collectednessAfter,

      braveryBefore,
      braveryDuring,
      braveryAfter,
      
      confidenceBefore,
      confidenceDuring,
      confidenceAfter,
      
      compassionBefore,
      compassionDuring,
      compassionAfter,
      
      greedinessBefore,
      greedinessDuring,
      greedinessAfter,
      
      egoBefore,
      egoDuring,
      egoAfter,
      
      euphoriaBefore,
      euphoriaDuring,
      euphoriaAfter,
      
      faultBefore,
      faultDuring,
      faultAfter,
      
      resentmentBefore,
      resentmentDuring,
      resentmentAfter,
      
      angerBefore,
      angerDuring,
      angerAfter,
      
      apathyBefore,
      apathyDuring,
      apathyAfter,
      
      stagnationBefore,
      stagnationDuring,
      stagnationAfter,
      

      marketVision,
      entrySkill,
      exitSkill,
      dealStay,
      mediumTermStay,
      tradeAlgorithm,
      boredom,
      excitement,
      tradeDesire,
    } = rowData[currentRowIndex]

    return (
      <>
        <div className="second-step" id="second-step">
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
              <div className="second-column-title-row">
                <div className="second-column-title-container">
                  <p>До входа</p>
                </div>
                <div className="second-column-title-container">
                  <p>Во время<br />сделки  </p>
                </div>
                <div className="second-column-title-container">
                  <p>После   <br />закрытия</p>
                </div>
               
              </div>
              
              <div className="second-column-empty-row"/>

              <div className="second-column-row-container" aria-label="Спокойствие">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box" aria-label="До входа"
                    checked={calmnessBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("calmnessBefore", value, currentRowIndex)
                    }}
                  />
                   
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box" aria-label="Во время сделки"
                    checked={calmnessDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("calmnessDuring", value, currentRowIndex)
                    }}
                  />
                   
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box" aria-label="После закрытия"
                    checked={calmnessAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("calmnessAfter", value, currentRowIndex)
                    }}
                  />
                   
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Собранность">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={collectednessBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("collectednessBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box" 
                    aria-label="Во время сделки"
                    checked={collectednessDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("collectednessDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={collectednessAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("collectednessAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Смелость">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={braveryBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("braveryBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={braveryDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("braveryDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={braveryAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("braveryAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Уверенность">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={confidenceBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("confidenceBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={confidenceDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("confidenceDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={confidenceAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("confidenceAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>
            
              <div className="second-column-empty-row second-column-empty-row--second" />


              <div className="second-column-row-container" aria-label="Жалость">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={compassionBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("compassionBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={compassionDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("compassionDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={compassionAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("compassionAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Жадность">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={greedinessBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("greedinessBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={greedinessDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("greedinessDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={greedinessAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("greedinessAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Это (я прав)">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={egoBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("egoBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={egoDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("egoDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={egoAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("egoAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Эйфория">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={euphoriaBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("euphoriaBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={euphoriaDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("euphoriaDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={euphoriaAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("euphoriaAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Вина">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={faultBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("faultBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={faultDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("faultDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={faultAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("faultAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Обида">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={resentmentBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("resentmentBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={resentmentDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("resentmentDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={resentmentAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("resentmentAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Гнев">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={angerBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("angerBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={angerDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("angerDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={angerAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("angerAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Апатия">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={apathyBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("apathyBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={apathyDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("apathyDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={apathyAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("apathyAfter", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="second-column-row-container" aria-label="Стагнация">
                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="До входа"
                    checked={stagnationBefore}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("stagnationBefore", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="Во время сделки"
                    checked={stagnationDuring}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("stagnationDuring", value, currentRowIndex)
                    }}
                  />
                </div>

                <div className="second-column-row-check-box">
                  <Checkbox
                    className="check-box"
                    aria-label="После закрытия"
                    checked={stagnationAfter}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("stagnationAfter", value, currentRowIndex)
                    }}
                  />
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
                    <Checkbox
                      checked={marketVision}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("marketVision", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка навыка входа</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={entrySkill}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("entrySkill", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка навыка выхода</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={exitSkill}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("exitSkill", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка пребывания в сделке</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={dealStay}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("dealStay", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Отработка среднесрочного анализа</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={mediumTermStay}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("mediumTermStay", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Создание торгового алгоритма</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={tradeAlgorithm}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("tradeAlgorithm", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="title title--red">
                  Искаженные
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Скука</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={boredom}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("boredom", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Азарт</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={excitement}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("excitement", value, currentRowIndex)
                      }}
                    />
                  </div>
                </div>

                <div className="table-third-column-row-container-row">
                  <p>Желание торговать</p>
                  <div className="third-column-row-check-box">
                    <Checkbox
                      checked={tradeDesire}
                      onChange={(val) => {
                        let value = val.target.checked
                        onChange("tradeDesire", value, currentRowIndex)
                      }}
                    />
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
