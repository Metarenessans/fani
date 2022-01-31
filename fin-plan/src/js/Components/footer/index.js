import React from 'react'

import './style.scss'
import { Button, Tooltip, Select } from 'antd/es'
const { Option } = Select;

import NumericInput from "../../../../../common/components/numeric-input"
import CustomSelect from "../../../../../common/components/custom-select"
import Stack        from '../../../../../common/components/stack'

import round        from "../../../../../common/utils/round"
import num2str      from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"

import extRateReal from "../../utils/rate"

import clsx from 'clsx'
import { isEqual } from 'lodash';

export default class Footer extends React.Component {
  constructor(props) {
    super(props);

    const { depo, currentPassiveIncomeToolName } = this.props;

    this.state = {
      depo,
      requiredDepo: 1_000_000,
      days: 260,
      currentPassiveIncomeToolName,
      passiveIncome: 10_000,
      targetPassiveIncome: 80_000,
      requiredRate: 0.921,
      targetYears: 1,
    };
  }

  componentDidMount() {
    const { depo, targetYears } = this.state;
    const { desirableStatsArr, numericKeys, onDepoChange } = this.props;

    const targetPassiveIncome = desirableStatsArr[numericKeys.indexOf(targetYears)];
    this.setState({ targetPassiveIncome });

    this.updatePassiveIncome();

    onDepoChange(depo);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      depo,
      currentPassiveIncomeToolName,
      passiveIncome,
      targetPassiveIncome,
      days,
      targetYears
    } = this.state;
    const {
      userPassiveIncome,
      desirableStatsArr,
      numericKeys,
      onTargetPassiveIncomeChange,
      onDepoChange,
      onCurrentPassiveIncomeToolNameChange,
      onPassiveIncomeChange
    } = this.props;

    const _targetPassiveIncome = desirableStatsArr[numericKeys.indexOf(targetYears)];
    if (prevProps.desirableStatsArr[prevProps.numericKeys.indexOf(prevState.targetYears)] != _targetPassiveIncome) {
      this.setState({ targetPassiveIncome: _targetPassiveIncome });
    }

    if (prevState.passiveIncome != passiveIncome) {
      onPassiveIncomeChange(passiveIncome);
    }

    if (prevState.targetPassiveIncome != targetPassiveIncome) {
      onTargetPassiveIncomeChange(targetPassiveIncome);
    }

    if (prevState.currentPassiveIncomeToolName != currentPassiveIncomeToolName) {
      onCurrentPassiveIncomeToolNameChange(currentPassiveIncomeToolName);
    }

    if (prevState.depo != depo) {
      onDepoChange(depo);
    }

    if (prevProps.depo != this.props.depo) {
      this.setState({ depo: Math.max(this.props.depo, 10_000) });
    }

    if (prevProps.currentPassiveIncomeToolName != this.props.currentPassiveIncomeToolName) {
      this.setState({ currentPassiveIncomeToolName: this.props.currentPassiveIncomeToolName });
    }

    const currentTool = this.getCurrentTool();

    if (
      (
      prevState.depo                         != depo                           ||
      prevState.currentPassiveIncomeToolName != currentPassiveIncomeToolName   ||
      prevState.passiveIncome                != passiveIncome                  ||
      prevState.targetPassiveIncome          != this.state.targetPassiveIncome ||
      prevProps.userPassiveIncome            != userPassiveIncome              ||
      prevState.days                         != days
      )
      &&
      !this.state.rightSideChangedManually
      // (
      //   prevState.requiredRate == this.state.requiredRate
      // )
    ) {
      // Непокрытый пассивный доход в месяц
      const annualPassiveIncome = this.state.targetPassiveIncome - passiveIncome - userPassiveIncome;
      if (annualPassiveIncome > 0) {
        const requiredDepo = Math.round(annualPassiveIncome / 0.85 * 12 / currentTool.rate * 100);

        let requiredRate = extRateReal(depo, requiredDepo, 0, 1, 0, 1, days, 0, 0, 0, {}, {}).rate * 100;
        if (requiredRate < 0.001 || requiredDepo <= depo) {
          requiredRate = 0.001;

          // ~~
          const requiredDepo = Math.floor(
            extRateReal(depo, null, 0, 1, 0, 1, days, 0, 0, 0, {}, { customRate: requiredRate / 100 }).sum
          );
          const targetPassiveIncome = Math.round(requiredDepo * currentTool.rate / 100 / 12 * 0.85)
            + userPassiveIncome
            + passiveIncome;
          this.setState({ requiredDepo, requiredRate, targetPassiveIncome, rightSideChangedManually: false });
        }
        else {
          this.setState({ requiredDepo, requiredRate, rightSideChangedManually: false })
        }
      }
    }

    if (
      prevState.depo                         != depo                         ||
      prevState.currentPassiveIncomeToolName != currentPassiveIncomeToolName ||
      !isEqual(prevProps.passiveIncomeTools, this.props.passiveIncomeTools)
    ) {
      this.updatePassiveIncome();
    }

  }

  getCurrentTool() {
    const { currentPassiveIncomeToolName } = this.state;
    const { passiveIncomeTools } = this.props;
    const tool = passiveIncomeTools.find(tool => tool.name == currentPassiveIncomeToolName);
    return tool || passiveIncomeTools[0];
  }

  updatePassiveIncome() {
    const { depo } = this.state;
    const currentTool = this.getCurrentTool();
    this.setState({ passiveIncome: Math.round(depo * currentTool.rate / 100 / 12 * 0.85) });
  }

  render() {
    const {
      currentPassiveIncomeToolName,
      days,
      depo,
      requiredDepo,
      passiveIncome,
      targetPassiveIncome,
      requiredRate,
      targetYears
    } = this.state;
    const { userPassiveIncome, numericKeys, paymentStatsArr, desirableStatsArr, tax, passiveIncomeTools } = this.props;

    const currentTool = this.getCurrentTool();

    const minDepo = Math.floor(extRateReal(depo, null, 0, 1, 0, 1, days, 0, 0, 0, {}, { customRate: 0.001 / 100 }).sum);

    const defaultPassiveIncome = paymentStatsArr[numericKeys.indexOf(targetYears)];

    return (
      <div className="page-footer">
        <h2 className="page-footer-header-title page-footer-header-title--uppercase">Требуемый пассивный доход</h2>
        <div className="page-footer-header-section">
          <div className="page-footer-header-section-col">

            <svg className="page-footer-arrow" width="18" height="32" viewBox="0 0 18 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 30L16 16L2 2" stroke="#3D5AB8" strokeWidth="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <h2 className="page-footer-header-title">Текущий уровень жизни</h2>

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
                <Tooltip title="После уплаты НДФЛ">
                  Текущий пассивн. доход
                </Tooltip>
              </span>
              <span className="page-footer-val ">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={passiveIncome}
                  onBlur={passiveIncome => {
                    if (passiveIncome == this.state.passiveIncome) {
                      return;
                    }

                    const depo = Math.round(passiveIncome * 12 / currentTool.rate * 100);
                    this.setState({ passiveIncome, depo });
                  }}
                  format={formatNumber}
                  unsigned="true"
                  min={1_000}
                  suffix="/мес."
                />
              </span>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key" >
                Инструмент пассивного дохода
              </span>
              <Select
                value={currentPassiveIncomeToolName}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                onChange={currentPassiveIncomeToolName => this.setState({ currentPassiveIncomeToolName })}
              >
                {passiveIncomeTools.map((tool, index) =>
                  <Option key={index} value={tool.name}>
                    {`${tool.name} (${tool.rate}%/год)`}
                  </Option>
                )}
              </Select>
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
          </div>
          
          <div className="page-footer-header-section-col">

            <h2 className="page-footer-header-title">Желаемый уровень жизни</h2>

            <div className="page-footer-col">
              <span className="page-footer-key">
                <Tooltip title="После уплаты НДФЛ">
                  Требуемый пассивн. доход
                </Tooltip>
                <Select
                  className="page-footer-col__select"
                  value={targetYears}
                  onChange={targetYears => {
                    const targetPassiveIncome = desirableStatsArr[numericKeys.indexOf(targetYears)];
                    const days = 260 * targetYears;
                    this.setState({ targetYears, targetPassiveIncome, days })
                  }}
                >
                  {numericKeys.map((key, index) =>
                    <Option value={key} key={index}>{"через " + key + " " + num2str(key, ["год", "года", "лет"])}</Option>
                  )}
                </Select>
              </span>
              <span className="page-footer-val">
                <NumericInput
                  className="page-footer__input"
                  defaultValue={targetPassiveIncome}
                  key={Math.random()}
                  onChange={(e, textValue, jsx) => {
                    const value = jsx.parse(textValue);
                    jsx.setErrorMsg(
                      value <= passiveIncome + userPassiveIncome
                        ? "Требуемый пассивный доход не может быть меньше текущего"
                        : ""
                    );
                  }}
                  onBlur={(value, textValue, jsx) => {
                    if (value == this.state.targetPassiveIncome) {
                      console.warn("Требуемый пассивн. доход");
                      return;
                    }

                    jsx.setErrorMsg("");
                    const targetPassiveIncome = value <= passiveIncome + userPassiveIncome
                      ? passiveIncome + userPassiveIncome + 1
                      : value
                    this.setState({ targetPassiveIncome, rightSideChangedManually: false })
                  }}
                  format={formatNumber}
                  unsigned="true"
                  min={0}
                  suffix="/мес."
                />
              </span>
            </div>

            <div className="page-footer-col">
              <span className="page-footer-key">
                <Tooltip title="До уплаты НДФЛ">
                  Требуемый депозит
                </Tooltip>
              </span>
              <span className="page-footer-val">
                <NumericInput
                  test="true"
                  key={Math.random()}
                  className="page-footer__input"
                  defaultValue={requiredDepo}
                  onChange={(e, textValue, jsx) => {
                    const value = jsx.parse(textValue);
                    jsx.setErrorMsg(
                      value <= minDepo
                        ? "Требуемый депозит не может быть меньше начального"
                        : ""
                    );
                  }}
                  onBlur={(requiredDepo, textValue, jsx) => {
                    if (requiredDepo == this.state.requiredDepo) {
                      console.warn("Требуемый депозит не изменилася");
                      return;
                    }

                    if (requiredDepo <= minDepo) {
                      requiredDepo = minDepo + 1;
                    }

                    const requiredRate = extRateReal(depo, requiredDepo, 0, 1, 0, 1, days, 0, 0, 0, {}).rate * 100;

                    let targetPassiveIncome = Math.round(requiredDepo * currentTool.rate / 100 / 12 * 0.85)
                      + userPassiveIncome 
                      + passiveIncome;

                    this.setState({ requiredDepo, requiredRate, targetPassiveIncome, rightSideChangedManually: true })
                    jsx.setErrorMsg("");
                  }}
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
                  defaultValue={requiredRate}
                  onBlur={requiredRate => {
                    if (requiredRate == round(this.state.requiredRate, 3)) {
                      console.warn("Требуемая ставка не изменилась");
                      return;
                    }

                    const requiredDepo = Math.floor(
                      extRateReal(depo, null, 0, 1, 0, 1, days, 0, 0, 0, {}, { customRate: requiredRate / 100 }).sum
                    );
                    const targetPassiveIncome = Math.round(requiredDepo * currentTool.rate / 100 / 12 * 0.85)
                      + userPassiveIncome
                      + passiveIncome;
                    this.setState({ requiredRate, requiredDepo, targetPassiveIncome, rightSideChangedManually: true });
                  }}
                  format={value => formatNumber(round(value, 3))}
                  unsigned="true"
                  min={0.001}
                  suffix="% / день"
                />
              </span>
            </div>
            
          </div>
        </div>

        <div className="page-footer-header-section">
          <div className="page-footer-header-section-col">

            <Stack space="1em">
              <p className="page-footer-info-line">
                <span className="page-footer-info-line__key">
                  Текущий пассивный доход
                  {" "}
                  {formatNumber(passiveIncome)}
                  {" "}
                  {userPassiveIncome ? `+ ${formatNumber(userPassiveIncome)}` : null}
                </span>
                {" "}
                — покрытие 
                {" "}
                {formatNumber(round((passiveIncome + userPassiveIncome) / defaultPassiveIncome * 100, 2))}
                % расходов через {targetYears} {num2str(targetYears, ["год", "года", "лет"])}
              </p>
              <Tooltip title="Требуемый - текущий пассивный доход">
                <p className="page-footer-info-line">
                  <span className="page-footer-info-line__key">Недостающий пассивный доход</span>
                  {" "}
                  — {formatNumber(targetPassiveIncome - passiveIncome - userPassiveIncome)}₽
                </p>
              </Tooltip>
            </Stack>

          </div>

          <div className="page-footer-header-section-col">

            <Stack space="1em">
              <p className="page-footer-info-line">
                <span className="page-footer-info-line__key">
                  Требуемый пассивный доход
                  {" "}
                  {formatNumber(Math.round(targetPassiveIncome / ((100 - tax) / 100)))}₽
                  {" "}
                  / НДФЛ
                </span>
                {" "}
                — {formatNumber(Math.round(targetPassiveIncome / ((100 - tax) / 100)) - targetPassiveIncome)}₽
              </p>
              <Tooltip title="Требуемый - текущий пассивный доход - НДФЛ">
                <p className="page-footer-info-line">
                  <span className="page-footer-info-line__key">
                    Чистый пассивный доход
                  </span>
                  {" "}
                  — {formatNumber(Math.round(
                    (targetPassiveIncome / ((100 - tax) / 100))
                    -
                    ((targetPassiveIncome / ((100 - tax) / 100)) - targetPassiveIncome)
                    -
                    userPassiveIncome
                    -
                    passiveIncome
                  ))}/мес
                </p>
              </Tooltip>
            </Stack>

          </div>
        </div>

      </div>
    )
  }
}
