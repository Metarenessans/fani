import React from 'react'

import './style.scss'
import { Button, Tooltip, Select } from 'antd/es'
const { Option } = Select;

import NumericInput from "../../../../../common/components/numeric-input"
import CustomSelect from "../../../../../common/components/custom-select"

import round from "../../../../../common/utils/round"
import num2str from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'


export default class Footer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="page-footer">
        <div className="page-footer-header-section">
          <div className="page-footer-header-section-col">

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Начальный депозит
              </span>

              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={1_000_000}
                  onBlur={() => ""}
                  format={formatNumber}
                  unsigned="true"
                  min={0}
                />
              </span>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Текущий пассивн. доход
              </span>

              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={1_000_000}
                  onBlur={() => ""}
                  format={formatNumber}
                  unsigned="true"
                  min={0}
                  suffix="/мес."
                />
              </span>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Инструмент пассивного дохода
              </span>

              <Select
                value={"ОФЗ 1"}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
              >
                <Option key={0} value={"ОФЗ 1"}>ОФЗ 1</Option>
                <Option key={1} value={"ОФЗ 2"}>ОФЗ 2</Option>
                <Option key={2} value={"ОФЗ 3"}>ОФЗ 3</Option>
              </Select>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Инструмент пассивн. дохода
              </span>

              <CustomSelect
                options={[1, 2, 3, 4, 5]}
                format={val => {
                  return val;
                  // let years = Number((val / 260).toFixed(2));
                  // let suffix = "";
                  // if (val >= 260) {
                  //   suffix = ` (${years} ${num2str(Math.floor(years), ["год", "года", "лет"])})`;
                  // }

                  // return `${val}${suffix}`;
                }}
                // value={this.state.days[this.state.mode]}
                value={1}
                min={1}
                max={2_600}
                onChange={value => {
                  console.log(value);
                  //   let { mode } = this.state;
                  //   let days = [...this.state.days];

                  //   days[mode] = value;
                  //   let currentDay = Math.min(value, this.state.currentDay);
                  //   const data = this.buildData(value, true);
                  //   const dataLength = data.length;

                  //   this.setState({ days, dataLength, currentDay }, this.recalc);

                  //   // validation
                  //   let withdrawal = this.state.withdrawal[mode];
                  //   let depoStart = this.state.depoStart[mode];

                  //   if (mode == 1) {
                  //     this.incomePersantageCustomInput?.current?.setErrorMsg(
                  //       this.checkFn2(this.state.incomePersantageCustom, value)
                  //     );
                  //   }
                  //   this.withdrawalInput?.current?.setErrorMsg(this.checkFn(withdrawal, depoStart, value)[0]);
                }}
              />
            </div>
          </div>
          
          <div className="page-footer-header-section-col">

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Желаемый пассивн. доход
              </span>

              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={1_000_000}
                  onBlur={() => ""}
                  format={formatNumber}
                  unsigned="true"
                  min={0}
                />
              </span>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Требуемый депозит
              </span>

              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={1_000_000}
                  onBlur={() => ""}
                  format={formatNumber}
                  unsigned="true"
                  min={0}
                />
              </span>
            </div>

            <div className="page-footer-col page-footer-col--fluid">
              <span className="page-footer-key" >
                Требуемая ставка активных инвестиций
              </span>

              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={0.56}
                  onBlur={() => ""}
                  format={formatNumber}
                  unsigned="true"
                  min={0}
                  suffix="% / день"
                />
              </span>
            </div>
            
          </div>

          <svg className="page-footer-header-arrow" width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 30L16 16L2 2" stroke="#3D5AB8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <p className="page-footer-title">Пассивный доход</p>

        <div className="page-footer-bottom-section">

          <div className="page-footer-bottom-col">
            <p>Покрывает 10% текущих расходов</p>
            <p>Покрывает 5% расходов через 1 год</p>
            <p>Покрывает 1% расходов через 3 года</p>
          </div>
          
          <div className="page-footer-bottom-col">
            <p>Покрывает 50% желаемого уровня жизни через 1 год</p>
            <p>Покрывает 80% желаемого уровня жизни через 3 года</p>
            <p>Покрывает 120% желаемого уровня жизни через 5 лет</p>
          </div>

          <svg className="page-footer-bottom-arrow" width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 30L16 16L2 2" stroke="#3D5AB8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

        </div>
      </div>
    )
  }
}
