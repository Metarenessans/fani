import React from 'react'
import { Button, Tooltip, Select, Progress, Checkbox, TimePicker } from 'antd/es'
import moment from 'moment'

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

import { Tools, Tool, template, parseTool } from "../../../../../common/tools"

import NumericInput from "../../../../../common/components/numeric-input"
import sortInputFirst from "../../../../../common/utils/sort-input-first"
import CrossButton from "../../../../../common/components/cross-button"

import TimeRangePicker from "../time-range-picker"

import round from "../../../../../common/utils/round"
import num2str from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'
import { data } from 'jquery'

import "./style.scss"

const { Option } = Select;

function onChangeTime(time, timeString) {
  console.log(timeString, "timeString");
}

export default class TradeLog extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {};
  }

  getOptions() {
    let { tools } = this.props;
    return tools.map((tool, idx) => {
      return {
        idx: idx,
        label: String(tool),
      };
    });
  }

  getCurrentToolIndex() {
    const { currentToolCode } = this.props;
    
    let { tools } = this.props;
    return Tools.getToolIndexByCode(tools, currentToolCode);
  }

  getSortedOptions() {
    let { searchVal } = this.props
    return sortInputFirst(searchVal, this.getOptions());
  }

  render() {
    let { 
      onChange, 
      currentRowIndex, 
      rowData, 
      tools, 
      setSeachVal,
      toolsLoading,
      isToolsDropdownOpen,
    } = this.props;

    let {
      enterTime,
      long,
      short,
      impulse,
      postponed,
      levels,
      breakout,
      result,
    } = rowData[currentRowIndex];

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
                {/* Торговый инструмент */}
                <Select
                  key={currentRowIndex}
                  value={toolsLoading && tools.length == 0 ? 0 : this.getCurrentToolIndex()}
                  onChange={currentToolIndex => {
                    const currentTool = tools[currentToolIndex];
                    const currentToolCode = currentTool.code;
                    onChange("currentToolCode", currentToolCode, currentRowIndex)
                  }}
                  // onFocus={() => {
                  //   isToolsDropdownOpen(true)
                  // }}
                  // onBlur={() => isToolsDropdownOpen(false)}
                  disabled={toolsLoading}
                  loading ={toolsLoading}
                  showSearch
                  onSearch={(value) => setSeachVal(value)}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{ width: "100%" }}
                >
                  {(() => {
                    if (toolsLoading && tools.length == 0) {
                      return (
                        <Option key={0} value={0}>
                          <LoadingOutlined style={{ marginRight: ".2em" }} />
                          Загрузка...
                        </Option>
                      )
                    }
                    else {
                      return this.getSortedOptions().map((option) => (
                        <Option key={option.idx} value={option.idx}>
                          {option.label}
                        </Option>
                      ));
                    }
                  })()}
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
                <div className="time-picker-container">
                  <TimePicker 
                    key={currentRowIndex}
                    format={'HH:mm'}
                    allowClear={true}
                    onChange={onChangeTime}
                    defaultValue={enterTime != null ? moment(new Date(enterTime), 'HH:mm') : null}
                    placeholder="Введите время"
                    onChange={time => {
                      let value = +time;
                      console.log(value);
                      onChange("enterTime", value, currentRowIndex);
                    }}
                    placeholder="введите время"
                  />
                </div>
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
                  <Checkbox
                    key={currentRowIndex}
                    checked={long}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("long", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--second trade-log-table-val--short">
                  Short
                </div>
                <div className="check-box-container check-box-container--second">
                  <Checkbox
                    checked={short}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("short", value, currentRowIndex)
                    }}
                  />
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
                  <Checkbox
                    checked={impulse}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("impulse", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--second">
                  Отложенный
                </div>

                <div className="check-box-container check-box-container--second">
                  <Checkbox
                    checked={postponed}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("postponed", value, currentRowIndex)
                    }}
                  />
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
                  <Checkbox
                    checked={levels}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("levels", value, currentRowIndex)
                    }}
                  />
                </div>
              </div>

              <div className="trade-log-table-row">
                <div className="trade-log-table-val trade-log-table-val--second">
                  Пробои
                </div>
                <div className="check-box-container check-box-container--second">
                  <Checkbox
                    checked={breakout}
                    onChange={(val) => {
                      let value = val.target.checked
                      onChange("breakout", value, currentRowIndex)
                    }}
                  />
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
                  defaultValue={result || 0}
                  onBlur={(val) => {
                    onChange("result", val, currentRowIndex)
                  }}
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
