import React from 'react'
import { Button, Tooltip, Select, Progress, Checkbox, TimePicker } from 'antd/es'

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

export default class TradeLog extends React.Component {
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
        <div className="trade-log">

          <div className="title">
            Информация о сделке
          </div>

          <div className="trade-log-table">

            {/* col */}
            <div className="trade-log-table-col">
              <div className="trade-log-table-key">
                Инструмент
              </div>

              <div className="trade-log-table-val trade-log-table-val--base trade-log-table-val-tool">
                <Select
                  value={"Инструменты"}
                >
                  {["Инструменты", "Инструмент", "Инструменты"].map((label, index) => <Option value={label} key={index} >{label}</Option>)}
                </Select>
              </div>
            </div>
            {/* col */}

            {/* col */}
            <div className="trade-log-table-col">
              <div className="trade-log-table-key">
                Время входа
              </div>

              <div className="trade-log-table-val trade-log-table-val--base trade-log-table-val-time">
                <TimePicker
                  format={'HH:mm'}
                  placeholder="введите время"
                  allowClear={true}
                />
              </div>
            </div>
            {/* col */}

            {/* col */}
            <div className="trade-log-table-col">
              <div className="trade-log-table-key">
                Направление
              </div>
              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--first trade-log-table-val--long">
                  Long
                </div>
                <div className="check-box-container check-box-container--first">
                  <Checkbox />
                </div>
              </div>

              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--second trade-log-table-val--short">
                  Short
                </div>
                <div className="check-box-container check-box-container--second">
                  <Checkbox/>
                </div>
              </div>
            </div>
            {/* col */}

            {/* col */}
            <div className="trade-log-table-col">
              <div className="trade-log-table-key">
                Метод входа
              </div>
              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--first">
                  Импульс
                </div>
                <div className="check-box-container check-box-container--first">
                  <Checkbox />
                </div>
              </div>

              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--second">
                  Отложенный
                </div>

                <div className="check-box-container check-box-container--second">
                  <Checkbox />
                </div>
              </div>
            </div>
            {/* col */}

            {/* col */}
            <div className="trade-log-table-col">
              <div className="trade-log-table-key">
                Сигнал
              </div>
              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--first">
                  Уровни
                </div>
                <div className="check-box-container check-box-container--first">
                  <Checkbox />
                </div>
              </div>

              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--second">
                  Пробои
                </div>
                <div className="check-box-container check-box-container--second">
                  <Checkbox />
                </div>
              </div>
            </div>
            {/* col */}

            {/* col */}
            <div className="trade-log-table-col trade-log-table-col--final">

              <div className="trade-log-table-key trade-log-table-key--final">
                Итог
              </div>

              <div className="trade-log-table-val trade-log-table-val--final">
                <NumericInput
                  className=""
                  defaultValue={15}
                  unsigned="true"
                  min={0}
                  suffix={"%"}
                />
              </div>

            </div>
            {/* col */}
            
          </div>
        </div>
      </>
    )
  }
}
