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

import NumericInput from "../../../../common/components/numeric-input"
import CrossButton  from "../../../../common/components/cross-button"

import round          from "../../../../common/utils/round"
import num2str        from "../../../../common/utils/num2str"
import formatNumber   from "../../../../common/utils/format-number"
import clsx from 'clsx'
import { data } from 'jquery'
import { result } from 'lodash'

const { Option } = Select;

const setFocusToNextButton = () => {
  document.querySelector(".next-button").scrollTo();
}

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dashboardData: [
        {},
        {},
        {},
        {},
        {},
      ],

      // tradeLogData: [

      // ],
    };
  }

  render() {
    let { currentRowIndex, rowData } = this.props;

    let { dashboardData } = this.state
    
    return (
      <>
        <div className="dashboard">
          <div className="title">
            Пошаговый план проработки
          </div>

          <div className="dashboard-inner">
            {
              (() => {
                return (

                  dashboardData.map((currentData, index) =>
                  
                    <>
                      <div className={clsx("dashboard-row", index === 0 && ("row-height-fix"))}>

                        {/* col */}
                        <div className="dashboard-col">
                          {index === 0 && (
                            <div className="dashboard-key">
                              День
                            </div>
                          )}

                          <div className="dashboard-val">
                            {index + 1}
                          </div>
                        </div>
                        {/* col */}

                        {/* col */}
                        <div className="dashboard-col">
                          {index === 0 && (
                            <div className="dashboard-key">
                              Практический шаг
                            </div>
                          )}

                          <div className="dashboard-val">
                            Some text here
                          </div>
                        </div>
                        {/* col */}

                        {/* col */}
                        <div className="dashboard-col">
                          {index === 0 && (
                            <div className="dashboard-key">
                              Результат
                            </div>
                          )}

                          <div className="dashboard-val">
                            {(() => {
                              let result = rowData[index].result
                               
                              if (result) {
                                return result
                              }

                              else return "-"

                            })()}
                          </div>
                        </div>
                        {/* col */}

                        {/* col */}
                        <div className="dashboard-col">
                          {index === 0 && (
                            <div className={ clsx("dashboard-key", index === 0 && ("key-height-fix")) }/>
                          )}

                          <div className="dashboard-val">
                            <Button
                              className="custom-btn"
                              aria-label="просмотр лога"
                              onClick={() => {
                                setFocusToNextButton()
                                document.querySelector(".trade-slider").classList.add("trade-slider-active")
                                document.querySelector(".dashboard").classList.add("dashboard-active")
                                currentRowIndex(index)
                              }}
                            >
                              Просмотр
                            </Button>
                          </div>
                        </div>
                        {/* col */}
                      </div>
                    </>
                  )
                )
              })()
            }
          </div>
          <div className="add-button-container">
            <Button 
              className="custom-btn"
              onClick={() => {
                const dataClone = [...data];
                dataClone.push({ ...data });
                this.setState({ data: dataClone });
              }}
            >
              <PlusOutlined aria-label="Добавить день" />
              Добавить день
            </Button> 
          </div>
        </div>
      </>
    )
  }
}
