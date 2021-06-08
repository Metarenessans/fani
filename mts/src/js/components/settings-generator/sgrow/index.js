import React from 'react'
import { Radio, Button } from 'antd/es'

import NumericInput from '../../../../../../common/components/numeric-input'
import CrossButton  from '../../../../../../common/components/cross-button'

import formatNumber   from '../../../../../../common/utils/format-number'
import fractionLength from '../../../../../../common/utils/fraction-length'
import round          from '../../../../../../common/utils/round'

import stepConverter   from '../step-converter'
import optionsTemplate from "../options-template"

// import "./style.scss"

const names = {
  "evenly":    "равномерно",
  "custom":    "задать самому",
  "fibonacci": "по Фибоначчи",
};

export default function SGRow({
  test,
  preferredStepLabel,
  isBying = false,
  disabled,
  inputs = ["preferredStep", "length", "percent", "stepInPercent"],
  options,
  automaticLength = false,
  onModeChange,
  onPropertyChange,
  data,
  contracts,
  currentTool,
  percentToStepsConverter = stepConverter.fromPercentsToStep,
  stepsToPercentConverter = stepConverter.fromStepToPercents,
}) {

  const { mode: currentMode, modes, preferredStep, inPercent, percent, stepInPercent, length } = options;

  disabled = disabled || currentMode == "fibonacci";

  const fraction = fractionLength(currentTool.priceStep);

  const inputFormatter = (number, digits) => formatNumber(number != "" ? round(number, digits != null ? digits : fraction) : number);

  const contractsArray = data.map(row => row.merged ? -row.contracts : row.contracts);
  const contractsSum = contractsArray.reduce((acc, curr) => acc + curr, 0);
  let sumPercent = contractsSum / (contracts || 1) * 100;
  if (options.closeAll) {
    sumPercent = 100;
  }

  let preferredStepInMoney = preferredStep;
  if (inPercent) {
    if (preferredStep == "") {
      preferredStepInMoney = currentTool.adrDay;
    }
    else {
      preferredStepInMoney = percentToStepsConverter(preferredStep, currentTool, contracts);
    }
  }
  else {
    if (preferredStep == "") {
      preferredStepInMoney = currentTool.adrDay;
    }
  }

  return (
    <div style={{ width: '100%' }}>

      {/* Режимы */}
      {modes
        ?
          modes.length == 1
            ? null
            :
              <div className="settings-generator-content__row-header-modes">
                <Radio.Group
                  className="settings-generator-content__row-header-modes-select"
                  value={currentMode}
                  onChange={e => onModeChange(e.target.value)}
                >
                  {modes.map((mode, index) =>
                    <Radio key={index} value={mode}>{names[mode]}</Radio>
                  )}
                </Radio.Group>
              </div>
        : null
      }

      {
        currentMode == "custom"
          ?
          <>
            {options.customData
              .map((customDataRow, i) =>
                <div
                  className="settings-generator-content__row settings-generator-content__opt-row settings-generator-content__opt-row--custom"
                  key={i}
                >

                  <span className="settings-generator-content__opt-row-number">{i + 1}</span>

                  <label className="input-group">
                    <span className="input-group__label">
                      {preferredStepLabel 
                        ? preferredStepLabel
                        : (!isBying ? "Желаемый" : "Обратный") + " ход"
                      }
                      <button
                        className="settings-generator-content__step-mode-switcher"
                        onClick={e => {
                          let { inPercent, preferredStep } = options.customData[i];

                          if (preferredStep) {
                            // Были в процентах, теперь переводим в доллары
                            if (inPercent) {
                              preferredStep = percentToStepsConverter(preferredStep, currentTool, contracts);
                            }
                            // переводим в проценты
                            else {
                              preferredStep = stepsToPercentConverter(preferredStep, currentTool, contracts);
                            }
                          }
                          
                          const customDataCopy = [...options.customData];
                          customDataCopy[i] = {
                            ...customDataCopy[i],
                            preferredStep,
                            inPercent: !inPercent,
                          };

                          onPropertyChange({
                            customData: customDataCopy
                          })
                        }}
                      >
                        {!customDataRow.inPercent ? "$/₽" : "%"}
                      </button>
                    </span>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={customDataRow.preferredStep}
                      placeholder={
                        customDataRow.inPercent
                          ? round(stepsToPercentConverter(currentTool.adrDay, currentTool, contracts), 4)
                          : currentTool.adrDay
                      }
                      format={number => inputFormatter(number, customDataRow.inPercent ? 4 : undefined)}
                      unsigned="true"
                      min={0}
                      onBlur={preferredStep => {
                        const customDataCopy = [...options.customData];
                        customDataCopy[i] = {
                          ...customDataCopy[i],
                          preferredStep: round(preferredStep, fraction),
                        };

                        onPropertyChange({ customData: customDataCopy })
                      }}
                      suffix={customDataRow.inPercent ? "%" : undefined}
                    />
                  </label>

                  <label className="input-group">
                    <span className="input-group__label">% {isBying ? "докупки" : "закрытия"}</span>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={customDataRow.percent}
                      placeholder={round(100 / (customDataRow.length || 1), fraction)}
                      format={inputFormatter}
                      unsigned="true"
                      min={0}
                      onBlur={percent => {
                        const customDataCopy = [...options.customData];
                        customDataCopy[i] = {
                          ...customDataCopy[i],
                          percent,
                        };

                        onPropertyChange({ customData: customDataCopy })
                      }}
                    />
                  </label>

                  {!automaticLength
                    ? (
                      <label className="input-group">
                        <span className="input-group__label">Кол-во {isBying ? "докупок" : "закрытий"}</span>
                        <NumericInput
                          className="input-group__input"
                          defaultValue={customDataRow.length || 1}
                          placeholder={"1"}
                          format={inputFormatter}
                          unsigned="true"
                          min={1}
                          onBlur={length => {
                            const customDataCopy = [...options.customData];
                            customDataCopy[i] = {
                              ...customDataCopy[i],
                              length,
                            };

                            onPropertyChange({ customData: customDataCopy })
                          }}
                        />
                      </label>
                    )
                    : (
                      <label className="input-group">
                        <span className="input-group__label">Шаг в %</span>
                        <NumericInput
                          className="input-group__input"
                          defaultValue={customDataRow.stepInPercent || 1}
                          placeholder={""}
                          format={number => inputFormatter(number, 2)}
                          unsigned="true"
                          min={1}
                          onBlur={stepInPercent => {
                            const customDataCopy = [...options.customData];
                            customDataCopy[i] = {
                              ...customDataCopy[i],
                              stepInPercent,
                            };

                            onPropertyChange({ customData: customDataCopy })
                          }}
                        />
                      </label>
                    )
                  }


                  <CrossButton
                    className={
                      []
                        .concat("settings-generator-content__opt-row-delete")
                        .concat(i == 0 ? "hidden" : "")
                        .join(" ")
                    }
                    onClick={e => {
                      const customDataCopy = [...options.customData];
                      customDataCopy.splice(i, 1);
                      onPropertyChange({ customData: customDataCopy })
                    }}
                  />

                  <div className="settings-generator-content__print-group">
                    <span>Суммарный % {isBying ? "докупки" : "закрытия"}</span>
                    <b>{(() => {
                      const contractsSum = data
                        .filter(row => row.group == i)
                        .map(row => row.merged ? -row.contracts : row.contracts)
                        .reduce((prev, curr) => prev + curr, 0);

                      let value = round(contractsSum / (contracts || 1) * 100, 1);
                      if (options.closeAll) {
                        value = 100;
                      }
                      return value;
                    })()}%</b>
                  </div>

                </div>
              )
            }
            <Button
              className="custom-btn settings-generator-content__opt-row-btn"
              onClick={e => {
                onPropertyChange({
                  customData: [
                    ...options.customData,
                    { ...optionsTemplate, length: 1 }
                  ]
                });
              }}
            >
              + {isBying ? "Докупка" : "Закрытие"}
            </Button>
          </>
          :
          <div className="settings-generator-content__row settings-generator-content__opt-row">

            {/* Желаемый ход */}
            {inputs.indexOf("preferredStep") != -1 &&
              <label className="input-group">
                <span className="input-group__label">
                  {preferredStepLabel 
                    ? preferredStepLabel
                    : (!isBying ? "Желаемый" : "Обратный") + " ход"
                  }
                  {currentMode != 'fibonacci' &&
                    <button
                      className="settings-generator-content__step-mode-switcher"
                      onClick={e => {
                        let { inPercent, preferredStep } = options;                        
                        
                        if (preferredStep) {
                          // Были в процентах, теперь переводим в доллары
                          if (inPercent) {
                            preferredStep = percentToStepsConverter(preferredStep, currentTool, contracts);
                          }
                          // переводим в проценты
                          else {
                            preferredStep = stepsToPercentConverter(preferredStep, currentTool, contracts)
                          }
                        }

                        onPropertyChange({
                          inPercent:     !inPercent,
                          preferredStep: preferredStep,
                        });
                      }}
                    >
                      {!inPercent ? "$/₽" : "%"}
                    </button>
                  }
                </span>
                <NumericInput
                  className="input-group__input"
                  disabled={disabled}
                  defaultValue={
                    currentMode == 'fibonacci'
                      ? currentTool.adrDay
                      : preferredStep
                  }
                  placeholder={
                    inPercent
                      ? stepsToPercentConverter(currentTool.adrDay, currentTool, contracts)
                      : currentTool.adrDay
                  }
                  format={number => inputFormatter(number, inPercent ? 4 : undefined)}
                  unsigned="true"
                  min={0}
                  onBlur={preferredStep => {
                    onPropertyChange({
                      preferredStep: round(preferredStep, fraction)
                    })
                  }}
                  suffix={
                    currentMode != 'fibonacci' &&
                      inPercent
                      ? "%"
                      : undefined
                  }
                />
              </label>
            }

            {/* Кол-во закрытий */}
            {inputs.indexOf("length") != -1 &&
              <label className="input-group">
                <span className="input-group__label">Кол-во {isBying ? "докупок" : "закрытий"}</span>
                <NumericInput
                  className="input-group__input"
                  disabled={disabled}
                  defaultValue={
                    currentMode == 'fibonacci'
                      ? data.length
                      : length
                  }
                  format={inputFormatter}
                  unsigned="true"
                  placeholder="1"
                  min={1}
                  onBlur={length => onPropertyChange({ length })}
                />
              </label>
            }

            {/* % закрытия */}
            {inputs.indexOf("percent") != -1 &&
              <label className="input-group">
                <span className="input-group__label">% {isBying ? "докупки" : "закрытия"}</span>
                <NumericInput
                  className="input-group__input"
                  disabled={disabled}
                  defaultValue={percent}
                  placeholder={round(100 / (length || 1), fraction)}
                  format={inputFormatter}
                  unsigned="true"
                  min={0}
                  onBlur={percent => onPropertyChange({ percent })}
                />
              </label>
            }

            {/* Шаг в % */}
            {inputs.indexOf("stepInPercent") != -1 &&
              <label className="input-group">
                <span className="input-group__label">Шаг в %</span>
                <NumericInput
                  className="input-group__input"
                  disabled={disabled}
                  defaultValue={stepInPercent}
                  format={number => inputFormatter(number, 2)}
                  placeholder={round(
                    stepConverter.fromStepToPercents((preferredStepInMoney / (length || 1)), currentTool),
                    fraction
                  )}
                  unsigned="true"
                  min={0}
                  onBlur={stepInPercent => onPropertyChange({ stepInPercent })}
                />
              </label>
            }

            <div className="settings-generator-content__print-group">
              <span>Суммарный % {isBying ? "докупки" : "закрытия"}</span>
              <b>{round(sumPercent, 1)}%</b>
            </div>

          </div>
      }

    </div>
  );
}