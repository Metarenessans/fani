import React from 'react'
import { Radio, Button } from 'antd/es'

import NumericInput from '../../../../../../common/components/numeric-input'
import CrossButton  from '../../../../../../common/components/cross-button'

import formatNumber   from '../../../../../../common/utils/format-number'
import fractionLength from '../../../../../../common/utils/fraction-length'
import round          from '../../../../../../common/utils/round'

import stepConverter from '../step-converter'

// import "./style.scss"

const names = {
  "evenly":    "равномерно",
  "custom":    "задать самому",
  "fibonacci": "по Фибоначчи",
};

export default function SGRow({
  modes = [],
  options,
  onModeChange,
  onPropertyChange,
  data,
  contracts,
  currentTool,
}) {
  const { mode: currentMode, preferredStep, inPercent, percent, stepInPercent, length } = options;

  const fraction = fractionLength(currentTool.priceStep);

  const contractsSum = data
    .map(row => row.contracts)
    .reduce((acc, curr) => acc + curr, 0);

  const sumPercent = contractsSum / (contracts || 1) * 100;

  return (
    <div style={{ width: '100%' }}>

      {/* Режимы */}
      {modes?.length && (
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
      )}

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
                      Желаемый ход
                      <button
                        className="settings-generator-content__step-mode-switcher"
                        onClick={e => {
                          let { inPercent, preferredStep } = options.customData[i];

                          if (preferredStep) {
                            // Были в процентах, теперь переводим в доллары
                            if (inPercent) {
                              preferredStep = stepConverter.fromPercentsToStep(preferredStep, currentTool.currentPrice);
                            }
                            // переводим в проценты
                            else {
                              preferredStep = stepConverter.fromStepToPercents(preferredStep, currentTool.currentPrice)
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
                          ? stepConverter.fromStepToPercents(currentTool.adrDay, currentTool.currentPrice)
                          : currentTool.adrDay
                      }
                      format={formatNumber}
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
                    <span className="input-group__label">% закрытия</span>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={customDataRow.percent}
                      format={formatNumber}
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

                  <label className="input-group">
                    <span className="input-group__label">Кол-во закрытий</span>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={customDataRow.length || 1}
                      placeholder={"1"}
                      format={formatNumber}
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
                    <span>Суммарный % закрытия</span>
                    <b>{(() => {
                      const contractsSum = data
                        .filter(row => row.group == i)
                        .map(row => row.contracts)
                        .reduce((prev, next) => prev + next, 0);

                      return round(contractsSum / (contracts || 1) * 100, 1);
                    })()}%</b>
                  </div>

                </div>
              )
            }
            <Button
              className="custom-btn settings-generator-content__opt-row-btn"
              onClick={e => {
                updatePresetProperty(initialCurrentTab, {
                  customData: [
                    ...options.customData,
                    { ...optionBase, length: 1 }
                  ]
                });
              }}
            >
              + закрытие
                    </Button>
          </>
          :
          <div className="settings-generator-content__row settings-generator-content__opt-row">

            <label className="input-group">
              <span className="input-group__label">
                Желаемый ход
                {currentMode != 'fibonacci' &&
                  <button
                    className="settings-generator-content__step-mode-switcher"
                    onClick={e => {
                      let { inPercent, preferredStep } = options;

                      if (preferredStep) {
                        // Были в процентах, теперь переводим в доллары
                        if (inPercent) {
                          preferredStep = stepConverter.fromPercentsToStep(preferredStep, currentTool.currentPrice);
                        }
                        // переводим в проценты
                        else {
                          preferredStep = stepConverter.fromStepToPercents(preferredStep, currentTool.currentPrice)
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
                disabled={currentMode == 'fibonacci'}
                defaultValue={
                  currentMode == 'fibonacci'
                    ? currentTool.adrDay
                    : preferredStep
                }
                placeholder={
                  inPercent
                    ? stepConverter.fromStepToPercents(currentTool.adrDay, currentTool.currentPrice)
                    : currentTool.adrDay
                }
                format={formatNumber}
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

            <label className="input-group">
              <span className="input-group__label">Кол-во закрытий</span>
              <NumericInput
                className="input-group__input"
                disabled={currentMode == 'fibonacci'}
                defaultValue={
                  currentMode == 'fibonacci'
                    ? data.length
                    : length
                }
                format={formatNumber}
                unsigned="true"
                placeholder="1"
                min={1}
                onBlur={length => onPropertyChange({ length })}
              />
            </label>

            <label className="input-group">
              <span className="input-group__label">% закрытия</span>
              <NumericInput
                className="input-group__input"
                disabled={currentMode == 'fibonacci'}
                defaultValue={percent}
                format={formatNumber}
                unsigned="true"
                min={0}
                onBlur={percent => onPropertyChange({ percent })}
              />
            </label>

            <label className="input-group">
              <span className="input-group__label">Шаг в %</span>
              <NumericInput
                className="input-group__input"
                disabled={currentMode == 'fibonacci'}
                defaultValue={stepInPercent}
                format={formatNumber}
                unsigned="true"
                min={0}
                onBlur={stepInPercent => onPropertyChange({ stepInPercent })}
              />
            </label>

            <div className="settings-generator-content__print-group">
              <span>Суммарный % закрытия</span>
              <b>{round(sumPercent, 1)}%</b>
            </div>

          </div>
      }

    </div>
  );
}