import React from 'react'

import { Button, Tooltip, Select } from 'antd/es'
const { Option } = Select;

import NumericInput from "../../../../common/components/numeric-input"
import CustomSelect from "../../../../common/components/custom-select"

import round        from "../../../../common/utils/round"
import num2str      from "../../../../common/utils/num2str"
import formatNumber from "../../../../common/utils/format-number"

import extRateReal  from "../utils/rate"

import Stack from '../../../../common/components/stack'

import clsx from 'clsx'
import { isEqual } from 'lodash';

export default class ActiveIncomeCalculator extends React.Component {
  constructor(props) {
    super(props);

    const { depo, desirableStatsArr } = this.props;

    const targetPassiveIncome = desirableStatsArr[0];

    this.state = {
      depo,
      days: 22,
      rate: 0.56,
      targetPassiveIncome,
      income: 0,
      targetYears: 1,
    }
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      depo,
      days,
      rate,
      targetPassiveIncome,
      targetYears
    } = this.state;
    const { statsArr, desirableStatsArr, incomeStatsArr, numericKeys, tax } = this.props;

    if (prevProps.depo != this.props.depo) {
      this.setState({ depo: Math.max(this.props.depo, 10_000) });
    }

    const _targetPassiveIncome = desirableStatsArr[numericKeys.indexOf(targetYears)];
    if (prevProps.desirableStatsArr[prevProps.numericKeys.indexOf(prevState.targetYears)] != _targetPassiveIncome) {
      this.setState({ targetPassiveIncome: _targetPassiveIncome });
    }

    const index = numericKeys.indexOf(targetYears);
    if (
      prevState.depo                  != depo                                           || 
      prevState.days                  != days                                           || 
      (prevState.targetPassiveIncome  != targetPassiveIncome && prevState.rate == rate) ||
      prevProps.incomeStatsArr[index] != incomeStatsArr[index]
    ) {
      // TODO: что делать, если значение будет положительным?
      const lackingPassiveIncome = targetPassiveIncome - incomeStatsArr[index];
  
      const endDepo = depo + lackingPassiveIncome;

      let rate = extRateReal(depo, endDepo, 0, 1, 0, 1, days, 0, 0, 0, {}).rate * 100;
      if (isNaN(rate) || rate < 0.001) {
        this.updateRate(0.001);
      }
      else {
        this.setState({ rate });
      }
    }
  }

  updateRate(rate) {
    const { depo, days, targetYears } = this.state;
    const { incomeStatsArr, numericKeys } = this.props;
    const index = numericKeys.indexOf(targetYears);

    const depoEnd = Math.round(extRateReal(depo, null, 0, 1, 0, 1, days, 0, 0, 0, {}, { customRate: rate / 100 }).sum);
    const targetPassiveIncome = depoEnd - depo + incomeStatsArr[index];
    this.setState({ rate, targetPassiveIncome });
  }

  render() {
    const {
      depo,
      days,
      rate,
      targetYears,
      targetPassiveIncome
    } = this.state;
    const { statsArr, desirableStatsArr, incomeStatsArr, numericKeys, tax } = this.props;

    // TODO: что делать, если значение будет положительным?
    const index = numericKeys.indexOf(targetYears);
    const lackingPassiveIncome = this.state.targetPassiveIncome - incomeStatsArr[index];
    
    const endDepo = depo + lackingPassiveIncome;
    const activeIncome = endDepo - depo;

    const minTargetPassiveIncome = Math.floor(extRateReal(depo, null, 0, 1, 0, 1, days, 0, 0, 0, {}, { customRate: 0.001 / 100 }).sum) - depo;

    return (
      <div className="page-footer">
        <h2 className="page-footer-header-title page-footer-header-title--uppercase">Требуемый активный доход</h2>
        <div className="page-footer-header-section">
          <div className="page-footer-header-section-col">
            <svg className="page-footer-arrow page-footer-arrow--second" width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 30L16 16L2 2" stroke="#3D5AB8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Начальный депозит
              </span>
              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={depo}
                  onBlur={depo => this.setState({ depo })}
                  format={formatNumber}
                  unsigned="true"
                  min={10_000}
                />
              </span>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Торговых дней
              </span>
              <CustomSelect
                options={[50, 100].concat(new Array(10).fill(0).map((n, i) => 260 * (i + 1)))}
                format={value => {
                  let years = Number((value / 260).toFixed(2));
                  let suffix = "";
                  if (value >= 260) {
                    suffix = ` (${years} ${num2str(Math.floor(years), ["год", "года", "лет"])})`;
                  }
                  if (value == 22) {
                    suffix = " (1 месяц)";
                  }
                  return `${value} ${num2str(value, ["день", "дня", "дней"])}${suffix}`;
                }}
                value={days}
                min={1}
                max={2600}
                onChange={days => this.setState({ days })}
              />
            </div>

            <Stack space="1em">
              <p className="page-footer-info-line">
                <span className="page-footer-info-line__key">Текущий активный доход</span>
                {" "}
                — {formatNumber(incomeStatsArr[index])}
              </p>
              <p className="page-footer-info-line">
                <span className="page-footer-info-line__key">Недостающий активный доход</span>
                {" "}
                — {formatNumber(Math.abs(lackingPassiveIncome))}
              </p>
            </Stack>

          </div>

          <div className="page-footer-header-section-col">

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Требуемый активный доход

                <Select
                  className="page-footer-col__select"
                  value={targetYears}
                  onChange={targetYears => {
                    // const targetPassiveIncome = desirableStatsArr[numericKeys.indexOf(targetYears)];
                    // const days = 260 * targetYears;
                    // this.setState({ targetYears, targetPassiveIncome, days })
                    this.setState({ targetYears })
                  }}
                >
                  {numericKeys.map((key, index) =>
                    <Option value={key} key={index}>{"через " + key + " " + num2str(key, ["год", "года", "лет"])}</Option>
                  )}
                </Select>

              </span>
              <NumericInput
                className="page-footer__input"
                key={Math.random()}
                defaultValue={targetPassiveIncome}
                onChange={(e, textValue, jsx) => {
                  const value = jsx.parse(textValue);
                  jsx.setErrorMsg(
                    value <= (incomeStatsArr[index] + minTargetPassiveIncome)
                      ? "Недостающий доход не может быть меньше нуля"
                      : ""
                  );
                }}
                onBlur={(value, textValue, jsx) => {
                  const targetPassiveIncome = value <= (incomeStatsArr[index] + minTargetPassiveIncome)
                    ? (incomeStatsArr[index] + minTargetPassiveIncome) + 1
                    : value;
                  jsx.setErrorMsg("");
                  this.setState({ targetPassiveIncome })
                }}
                format={formatNumber}
                unsigned="true"
                min={1}
                suffix="/мес."
              />
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key page-footer-key--center" >
                Ставка активных инвестиций
              </span>
              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={rate}
                  format={value => formatNumber(round(value, 3))}
                  onBlur={rate => {
                    if (rate == round(this.state.rate, 3)) {
                      return;
                    }
                    this.updateRate(rate)
                  }}
                  unsigned="true"
                  min={0.001}
                  suffix="% / день"
                />
              </span>
            </div>

            <Stack space="1em">
              <p className="page-footer-info-line">
                <span className="page-footer-info-line__key">
                  Активный доход за период
                  {" "}
                  {formatNumber(Math.round(activeIncome / ((100 - tax) / 100)))}₽
                  {" "}
                  / НДФЛ
                </span>
                {" "}
                — {formatNumber(Math.round(activeIncome / ((100 - tax) / 100)) - activeIncome)}₽
              </p>
              <p className="page-footer-info-line">
                <span className="page-footer-info-line__key">Чистый активный доход</span>
                {" "}
                — {formatNumber(Math.abs(activeIncome))}
              </p>
            </Stack>
            
          </div>
        </div>
      </div>
    )
  }
}
