import React, { useState, useEffect } from 'react'
import {
  Button, Input, Select, Switch, Tooltip, Radio
} from 'antd/es'

import {
  LoadingOutlined,
} from "@ant-design/icons"

import "wicg-inert"

import "./style.scss"

import LockIcon     from "./icons/Lock"
import DownloadIcon from "./icons/Download"
import CodeIcon     from "./icons/CodeIcon"
import CloseIcon    from "./icons/CloseIcon"
import CodePanel    from "./code-panel"

import createTabs       from "./tabs"
import BurgerButton     from "./burger-button"
import TemplateRow      from "./template-row"
import ReversedByingRow from "./reversed-bying-row"
import Table            from "./table"
import { Tools }        from '../../../../../common/tools'
import CrossButton      from '../../../../../common/components/cross-button'
import NumericInput     from '../../../../../common/components/numeric-input'
import CustomSlider     from '../../../../../common/components/custom-slider'
import { Dialog, dialogAPI } from '../../../../../common/components/dialog'

import stepConverter from './step-converter'
import createData    from './data'

import round          from '../../../../../common/utils/round'
import formatNumber   from '../../../../../common/utils/format-number'
import fractionLength from '../../../../../common/utils/fraction-length'

const SettingsGenerator = props => {

  const { onClose } = props;

  const [risk, setRisk] = useState(0.5);
  const [comission, setComission] = useState(0);
  const [load, setLoad] = useState(dev ? 10 : props.load || 0);

  const tools = props.tools?.length ? props.tools : Tools.createArray();
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const currentTool = tools[currentToolIndex];
  const fraction = fractionLength(currentTool.priceStep);

  const optionBase = {
    inPercent:  false,
    preferredStep: "",                  // Желаемый ход
    length:        dev ? 10 : "",       // Кол-во закрытий 
    percent:       dev ? 5  : "",       // % закрытия
    stepInPercent: dev ? 2  : "",       // Шаг
  };
  const [presets, setPresets] = useState([
    { 
      name: "Стандарт", 
      type: "Стандарт",
      options: {
        mode: 'evenly',
        ...optionBase,
        customData: [{...optionBase, length: 1}]
      }
    },
    { name: "СМС + ТОР", type: "СМС + ТОР" },
    { 
      name: "Лимитник",
      type: "Лимитник",
      options: {
        "основной": {
          mode: dev ? 'custom' : 'evenly',
          ...optionBase,
          customData: [{ ...optionBase, length: 1 }]
        },
        "Обратные докупки (ТОР)": {
          ...optionBase
        }
      }
    }
  ]);
  const [newPresetName, setNewPresetName] = useState("МТС");
  const [currentPresetName, setCurrentPresetName] = useState("Лимитник");
  const currentPreset = presets.find(preset => preset.name == currentPresetName);
  const currentPresetIndex = presets.indexOf(currentPreset);

  let investorDepo = props?.depo || 1_000_000;

  const [depo, setDepo] = useState(
    investorDepo != null
      ? currentPreset.type == "Лимитник"
        ? Math.floor(investorDepo)
        : Math.floor(investorDepo * .25)
      : 0
  );

  if (currentPreset.type == "Лимитник") {
    investorDepo = depo;
  }

  const [secondaryDepo, setSecondaryDepo] = useState(
    investorDepo != null
      ? Math.floor(investorDepo * .75)
      : 0
  );

  // Прямые профитные докупки 
  const [isProfitableBying, setProfitableBying] = useState(false);
  // Обратные профитные докупки 
  const [isReversedProfitableBying, setReversedProfitableBying] = useState(false);
  // Зеркальные докупки 
  const [isMirrorBying, setMirrorBying] = useState(false);
  // Обратные докупки (ТОР)
  const [isReversedBying, setReversedBying] = useState(dev ? true : false);

  const [menuVisible, setMenuVisible] = useState(false);

  const depoAvailable = investorDepo * (load / 100);

  const hasExtraDepo = currentPreset.type != "Лимитник" && (depo < depoAvailable);

  let root = React.createRef();
  let menu = React.createRef();

  const ItemOptions = props => {
    const locked = props.locked == true;
    const onDelete = props.onDelete;

    return (
      <ul className="preset-options">
        <li>
          <button className="round-btn" aria-label="Скачать">
            <DownloadIcon />
          </button>
        </li>
        <li>
          <button 
            className={
              ["round-btn"]
                .concat(!locked ? "preset-options__delete" : "")
                .join(" ")
                .trim()
            } 
            disabled={locked} 
            aria-label={"Удалить"}
            onClick={e => onDelete && onDelete(e)}
          >
            {locked ? <LockIcon /> : <CloseIcon />}
          </button>
        </li>
      </ul>
    )
  };

  const makeUnique = (value, arr) => {

    const alreadyExists = (value, arr) => {
      for (let el of arr) {
        if (el == value) {
          return true;
        }
      }

      return false;
    };

    while ( alreadyExists(value, arr) ) {
      const found = value.match(/\d+$/g);
      if (found) {
        const end = found[0];
        value = value.replace(end, Number(end) + 1);
      }
      else {
        value += " 2";
      }
    }

    return value;
    
  };

  let contractsTotal = 0;
  if (currentTool) {
    contractsTotal = Math.floor(investorDepo / currentTool.guarantee);
  }

  let contracts = 0;
  if (currentTool) {
    contracts = Math.floor(depoAvailable / currentTool.guarantee);
  }

  const options = {
    currentPreset,
    currentTool,
    contractsTotal,
    contracts,
    comission
  };

  let data = [];
  data['основной'] = createData('основной', options);
  data['Обратные докупки (ТОР)'] = createData('Обратные докупки (ТОР)', { ...options, isBying: true });

  const mainData = data['основной'];

  const totalIncome = mainData.length
    ? mainData[mainData.length - 1]?.incomeWithComission
    : 0;

  function updatePresetProperty(subtype, property, value) {
    const presetsCopy = [...presets];

    let insert = { [property]: value };
    if (typeof property == 'object') {
      insert = property;
    }

    const currentPresetCopy = {
      ...currentPreset,
      options: {
        ...currentPreset.options,
        [subtype]: {
          ...currentPreset.options[subtype],
          ...insert
        }
      }
    };
    presetsCopy[currentPresetIndex] = currentPresetCopy;
    setPresets(presetsCopy);
  }

  // componentDidMount
  useEffect(() => {
    createTabs();
  }, []);

  useEffect(() => {

    if (currentPreset.type == "Лимитник") {
      setDepo(investorDepo);
    }
    
    // setDepo(Math.floor(investorDepo * .25));
    // setSecondaryDepo(Math.floor(investorDepo * .75));

  }, [investorDepo]);

  // При изменении инструмента меняем желаемый ход во всех инпутах
  useEffect(() => {

    const presetsCopy = [...presets];

    // TODO: Не забыть!
    // Меняем желаемый ход
    // const { preferredStep, customData } = currentPreset.options;
    // const currentPresetCopy = {
    //   ...currentPreset,
    //   options: {
    //     ...currentPreset.options,

    //     preferredStep: preferredStep == "" ? preferredStep : currentTool.adrDay,

    //     customData: customData.map(row => {
    //       row.preferredStep = row.preferredStep == "" ? row.preferredStep : currentTool.adrDay
    //       return row;
    //     })
    //   }
    // };
    // presetsCopy[currentPresetIndex] = currentPresetCopy;
    // setPresets(presetsCopy);

  }, [currentTool.code]);

  return (
    <>
      <div 
        className="settings-generator"
        onClick={e => {
          if (menuVisible && e.target == root.current) {
            setMenuVisible(false);
          }
        }}
        ref={root}
      >

        <div 
          className={
            ["settings-generator-menu"]
              .concat(menuVisible ? "visible" : "")
              .join(" ")
              .trim()
          }
          ref={menu}
        >

          <div className="settings-generator__header">

            <Input className="settings-generator-menu__search" placeholder="Поиск настроек" />

            <Tooltip title="Добавить настройку">
              <button 
                className="settings-generator-menu__add"
                aria-label="Добавить новую настройку"
                onClick={e => {
                  dialogAPI.open("settings-generator-add-popup");
                }}
              >
                +
              </button>
            </Tooltip>

          </div>
          {/* settings-generator__header */}

          <ul className="settings-generator-menu-list">
            {presets.map((preset, index) =>
              <li 
                className={
                  ["settings-generator-menu-list-item"]
                    .concat(index == currentPresetIndex ? "selected" : "")
                    .join(" ")
                    .trim()
                }
                key={index}
              >
                <button className="settings-generator-menu-list-item__name">
                  {preset.name}
                </button>
                <ItemOptions 
                  locked={index < 3} 
                  onDelete={e => {
                    const presetsCopy = [...presets];
                    presetsCopy.splice(index, 1);
                    setPresets(presetsCopy);
                  }}
                />
              </li>
            )}
          </ul>
          
        </div>

        <div 
          className="settings-generator-content"
          inert={menuVisible ? "true" : null}
        >

          <div className="settings-generator__header">

            <BurgerButton 
              key={menuVisible}
              active={menuVisible}
              className="settings-generator__burger-button" 
              onClick={e => setMenuVisible(!menuVisible)}
            />

            <h3 className="settings-generator__title">Генератор настроек МАНИ 144</h3>

            <CrossButton 
              className="settings-generator__close js-dialog-focus-first"
              onClick={e => {
                if (onClose) {
                  onClose(e);
                }
              }}
            />

          </div>

          <div className="settings-generator-content__inner">

            <div className="settings-generator-content-header">

              <div
                className="settings-generator-content-header__title-wrap"
              >

                <h3
                  key={Math.random()}
                  className="settings-generator-content-header__title"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onKeyDown={e => {
                    const key = e.key.toLowerCase();
                    if (key == "enter" || key == "escape") {
                      e.target.blur();
                    }
                  }}
                  onBlur={e => {
                    let name = e.target.innerText;

                    const presetsCopy = [...presets];
                    const currentPreset = presetsCopy.find( preset => preset.name == currentPresetName );
                    currentPreset.name = name;

                    const namesArray = presetsCopy.map(preset => preset.name);

                    if ( namesArray.filter(n => n == name).length > 1 ) {
                      name = makeUnique( name, namesArray );
                    }
                    
                    currentPreset.name = name;
                    setCurrentPresetName(name);
                    setPresets(presetsCopy);
                  }}
                >
                  {currentPresetName}
                </h3>

                <button className="round-btn settings-generator-content-header__download" aria-label="Скачать">
                  <DownloadIcon />
                </button>
              </div>

              <ul className="settings-generator-content-header-options">
                <li>
                  <Button className="custom-btn">Сохранить</Button>
                </li>
              </ul>

            </div>
            {/* settings-generator-content-header */}

            <div className="settings-generator-content__row settings-generator-content__row--1">

              <div className="settings-generator-content__row-col-half">

                <label className="input-group">
                  <span className="input-group__label">Инструмент</span>
                  <Select
                    value={currentToolIndex}
                    onChange={index => {
                      setCurrentToolIndex(index);
                    }}
                    disabled={tools.length == 0}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: "100%" }}
                  >
                    {tools.length
                      ?
                        tools
                          .map(tool => String(tool))
                          .map((value, index) => <Select.Option key={index} value={index}>{value}</Select.Option>) 
                      :
                        <Select.Option key={0} value={0}>
                          <LoadingOutlined style={{ marginRight: ".2em" }} /> Загрузка...
                        </Select.Option>
                    }
                  </Select>
                </label>
                {/* Торговый инструмент */}

                <label className="input-group">
                  <span className="input-group__label">Комиссия</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={comission}
                    format={formatNumber}
                    unsigned="true"
                    onBlur={val => {
                      setComission(val);
                    }}
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">Основной депо</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={depo}
                    format={formatNumber}
                    unsigned="true"
                    onBlur={value => {
                      setDepo(value);
                    }}
                  />
                </label>

                {
                  currentPreset.type != "Лимитник" &&
                    <label className="input-group">
                      <span className="input-group__label">Плечевой депо</span>
                      <NumericInput
                        className="input-group__input"
                        defaultValue={secondaryDepo}
                        format={formatNumber}
                        unsigned="true"
                        min={10000}
                        max={Infinity}
                        onBlur={val => {
                          
                        }}
                      />
                    </label>
                }

              </div>
              {/* row-col-half */}

              <div className="settings-generator-content__row-col-half settings-generator-content__pairs-wrap">
                {(() => {
                  const PairJSX = props => {
                    let { name, value, formatValue } = props;
                    if (formatValue == null) {
                      formatValue = true;
                    }

                    return (
                      <div className="settings-generator-content__pair">
                        <span className="settings-generator-content__pair-key">{name}</span>
                        <span className="settings-generator-content__pair-val">
                          {formatValue ? formatNumber(value) : value}
                        </span>
                      </div>
                    )
                  };

                  return (
                    <>
                      <PairJSX 
                        name="Контрактов max."
                        value={contractsTotal}
                      />
                      <PairJSX
                        name={"Контракты" + (hasExtraDepo ? " (осн./плеч.)" : "")}
                        value={
                          <span>
                            {formatNumber(contracts)}
                            {depo < depoAvailable &&
                              <>
                                {window.innerWidth < 768 ? <br /> : " "}
                                (
                                  {formatNumber(Math.floor(depo / currentTool.guarantee))}
                                  /
                                  {formatNumber(Math.floor((depoAvailable - depo) / currentTool.guarantee))}
                                )
                              </>
                            }
                          </span>
                        }
                        formatValue={false}
                      />
                      <PairJSX 
                        name="Прибыль"
                        value={round(totalIncome, 1)}
                      />
                      <PairJSX
                        name="Убыток (риск)"
                        value={round(investorDepo * risk / 100, fraction)}
                      />
                    </>
                  )

                })()}

              </div>
              {/* row-col-half */}

            </div>
            {/* row */}

            <div className="settings-generator-content__row">

              <div className="settings-generator-content__row-col-half">

                <div className="settings-generator-slider__wrap">

                  <div className="settings-generator-slider__label">
                    Загрузка
                    <span className="settings-generator-slider__value">
                      {load}%
                    </span>
                  </div>
                  <CustomSlider 
                    className="settings-generator-slider"
                    value={load}
                    onChange={value => setLoad(value)}
                  />

                </div>
                
              </div>
              {/* row-col-half */}

              <div className="settings-generator-content__row-col-half settings-generator-content__after-slider">

                <label className="input-group">
                  <span className="input-group__label">Риск (стоп)</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={risk}
                    format={val => formatNumber(round(val, fraction))}
                    unsigned="true"
                    onBlur={value => {
                      if (value == round(risk, fraction)) {
                        value = risk;
                      }
                      setRisk(value)
                    }}
                    suffix="%"
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">Риск (стоп)</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={
                      (investorDepo * risk / 100)
                      /
                      currentTool.stepPrice
                      /
                      (contracts || 1)
                    }
                    format={val => formatNumber(Math.floor(val))}
                    unsigned="true"
                    onBlur={riskInSteps => {
                      setRisk(
                        riskInSteps
                        *
                        currentTool.stepPrice
                        *
                        (contracts || 1)
                        /
                        investorDepo
                        *
                        100
                      );
                    }}
                    suffix="п"
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">Риск (стоп)</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={investorDepo * risk / 100}
                    format={value => formatNumber(round(value, fraction))}
                    unsigned="true"
                    onBlur={riskInMoney => {
                      setRisk(riskInMoney / investorDepo * 100);
                    }}
                    suffix="₽"
                  />
                </label>
                
              </div>
              {/* row-col-half */}

            </div>
            {/* row */}

            <div style={{ width: '100%' }}>
              <div className="settings-generator-content__row-header-wrap">
                <h3 className="settings-generator-content__row-header">
                  Закрытие основного депозита
                </h3>

                <label className="switch-group">
                  <Switch
                    checked={isMirrorBying}
                    onChange={val => setMirrorBying(val)}
                  />
                  <span className="switch-group__label">Зеркальные докупки</span>
                </label>
              </div>

              <div className="settings-generator-content__row-header-modes">
                <Radio.Group
                  className="settings-generator-content__row-header-modes-select"
                  value={currentPreset.options["основной"].mode}
                  onChange={e => updatePresetProperty("основной", "mode", e.target.value)}
                >
                  <Radio value={'evenly'}>равномерно</Radio>
                  <Radio value={'custom'}>задать самому</Radio>
                  <Radio value={'fibonacci'}>по Фибоначчи</Radio>
                </Radio.Group>
              </div>

              {
                currentPreset.options["основной"].mode == 'custom'
                  ? 
                  <>
                    {currentPreset.options["основной"].customData
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
                                  let { inPercent, preferredStep } = currentPreset.options["основной"].customData[i];

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

                                  const customDataCopy = [...currentPreset.options["основной"].customData];
                                  customDataCopy[i] = {
                                    ...customDataCopy[i],
                                    preferredStep,
                                    inPercent: !inPercent,
                                  };

                                  updatePresetProperty("основной", "customData", customDataCopy);
                                }}
                              >
                                {!customDataRow.inPercent ? "$" : "%"}
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
                                const customDataCopy = [...currentPreset.options["основной"].customData];
                                customDataCopy[i] = {
                                  ...customDataCopy[i],
                                  preferredStep,
                                };

                                updatePresetProperty("основной", "customData", customDataCopy);
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
                                const customDataCopy = [...currentPreset.options["основной"].customData];
                                customDataCopy[i] = {
                                  ...customDataCopy[i],
                                  percent,
                                };

                                updatePresetProperty("основной", "customData", customDataCopy);
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
                                const customDataCopy = [...currentPreset.options["основной"].customData];
                                customDataCopy[i] = {
                                  ...customDataCopy[i],
                                  length,
                                };

                                updatePresetProperty("основной", "customData", customDataCopy);
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
                              const presetsCopy = [...presets];
                              const currentPresetCopy = {...currentPreset};
                              currentPresetCopy.options["основной"].customData.splice(i, 1);
                              setPresets(presetsCopy);
                            }}
                          />
                          
                          <div className="settings-generator-content__print-group">
                            <span>Суммарный % закрытия</span>
                            <b>{(() => {
                              return round(
                                mainData
                                  .filter(row => row.group == i)
                                  .map(row => row.contracts)
                                  .reduce((prev, next) => prev + next, 0)
                                /
                                (contracts || 1)
                                *
                                100,
                                1
                              );
                            })()}%</b>
                          </div>

                        </div>
                      )
                    }
                    <Button
                      className="custom-btn settings-generator-content__opt-row-btn"
                      onClick={e => {
                        updatePresetProperty("основной", {
                          customData: [
                            ...currentPreset.options["основной"].customData,
                            { ...optionBase, length: 1 }
                          ]
                        } );
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
                        {currentPreset.options["основной"].mode != 'fibonacci' &&
                          <button
                            className="settings-generator-content__step-mode-switcher"
                            onClick={e => {
                              let { inPercent, preferredStep } = currentPreset.options["основной"];

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

                              updatePresetProperty("основной", {
                                inPercent:     !inPercent,
                                preferredStep: preferredStep,
                              });
                            }}
                          >
                            {!currentPreset.options["основной"].inPercent ? "$" : "%"}
                          </button>
                        }
                      </span>
                      <NumericInput
                        className="input-group__input"
                        disabled={currentPreset.options["основной"].mode == 'fibonacci'}
                        defaultValue={
                          currentPreset.options["основной"].mode == 'fibonacci'
                            ? currentTool.adrDay
                            : currentPreset.options["основной"].preferredStep
                        }
                        placeholder={
                          currentPreset.options["основной"].inPercent
                            ? stepConverter.fromStepToPercents(currentTool.adrDay, currentTool.currentPrice)
                            : currentTool.adrDay
                        }
                        format={formatNumber}
                        unsigned="true"
                        min={0}
                        onBlur={preferredStep => {
                          updatePresetProperty("основной", { preferredStep })
                        }}
                        suffix={
                          currentPreset.options["основной"].mode != 'fibonacci' && 
                          currentPreset.options["основной"].inPercent 
                            ? "%" 
                            : undefined
                        }
                      />
                    </label>

                    <label className="input-group">
                      <span className="input-group__label">Кол-во закрытий</span>
                      <NumericInput
                        className="input-group__input"
                        disabled={currentPreset.options["основной"].mode == 'fibonacci'}
                        defaultValue={
                          currentPreset.options["основной"].mode == 'fibonacci'
                            ? mainData.length
                            : currentPreset.options["основной"].length
                        }
                        format={formatNumber}
                        unsigned="true"
                        placeholder="1"
                        min={1}
                        onBlur={length => {
                          updatePresetProperty("основной", { length });
                        }}
                      />
                    </label>

                    <label className="input-group">
                      <span className="input-group__label">% закрытия</span>
                      <NumericInput
                        className="input-group__input"
                        disabled={currentPreset.options["основной"].mode == 'fibonacci'}
                        defaultValue={currentPreset.options["основной"].percent}
                        format={formatNumber}
                        unsigned="true"
                        min={0}
                        onBlur={percent => {
                          updatePresetProperty("основной", { percent });
                        }}
                      />
                    </label>

                    <label className="input-group">
                      <span className="input-group__label">Шаг в %</span>
                      <NumericInput
                        className="input-group__input"
                        disabled={currentPreset.options["основной"].mode == 'fibonacci'}
                        defaultValue={currentPreset.options["основной"].stepInPercent}
                        format={formatNumber}
                        unsigned="true"
                        min={0}
                        onBlur={stepInPercent => {
                          updatePresetProperty("основной", { stepInPercent });
                        }}
                      />
                    </label>

                    <div className="settings-generator-content__print-group">
                      <span>Суммарный % закрытия</span>
                      <b>{
                        round(
                          mainData
                            .map(row => row.contracts)
                            .reduce((acc, curr) => acc + curr, 0)
                          /
                          (contracts || 1)
                          *
                          100
                          , 1
                        )
                      }%</b>
                    </div>

                  </div>
              }
            </div>

            <div style={{ width: '100%' }} hidden={!hasExtraDepo}>
              <h3 className="settings-generator-content__row-header">Закрытие плечевого депозита</h3>
              <TemplateRow />
            </div>

            <label className="switch-group">
              <Switch 
                checked={isProfitableBying} 
                onChange={val => setProfitableBying(val)}
              />
              <span className="switch-group__label">Прямые профитные докупки</span>
            </label>

            <div style={{ width: '100%' }} hidden={!isProfitableBying}>
              <TemplateRow />
            </div>

            <label className="switch-group">
              <Switch 
                checked={isReversedProfitableBying} 
                onChange={val => setReversedProfitableBying(val)}
              />
              <span className="switch-group__label">Обратные профитные докупки</span>
            </label>

            <div style={{ width: '100%' }} hidden={!isReversedProfitableBying}>
              <TemplateRow />
            </div>

            <label className="switch-group">
              <Switch
                checked={isReversedBying}
                onChange={val => setReversedBying(val)}
              />
              <span className="switch-group__label">Обратные докупки (ТОР)</span>
            </label>

            <div style={{ width: '100%' }} hidden={!isReversedBying}>
              <ReversedByingRow
                data={data["Обратные докупки (ТОР)"]}
                contracts={contractsTotal - contracts}
                options={currentPreset.options["Обратные докупки (ТОР)"]}
                onPercentChange={percent => 
                  updatePresetProperty("Обратные докупки (ТОР)", { percent })
                }
                onLengthChange={length => 
                  updatePresetProperty("Обратные докупки (ТОР)", { length })
                }
                onStepInPercentChange={stepInPercent =>
                  updatePresetProperty("Обратные докупки (ТОР)", { stepInPercent })
                }
              />
            </div>

            {/* Начало таблицы */}
            <div className="settings-generator-table-wrap">

              <div className="settings-generator-table-header">

                <div
                  className="settings-generator-table-tabs"
                  role="tablist"
                  aria-label="Таблицы" // TODO: придумать название, которое будет лучше описывать контент
                >

                  <Button className="custom-btn"
                          role="tab"
                          aria-selected="true"
                          aria-controls="settings-generator-tab1"
                          id="settings-generator-tab1-control"
                  >
                    Закрытие основного депо
                  </Button>

                  {currentPreset.type != "Лимитник" &&
                    <Button className="custom-btn"
                            tabIndex="-1"
                            role="tab"
                            aria-selected="false"
                            aria-controls="settings-generator-tab2"
                            id="settings-generator-tab2-control"
                            hidden={!hasExtraDepo}>
                      Закрытие плечевого депо
                    </Button>
                  }

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab3"
                          id="settings-generator-tab3-control"
                          hidden={!isProfitableBying}>
                    Прямые докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab4"
                          id="settings-generator-tab4-control"
                          hidden={!isReversedProfitableBying}>
                    Обратные докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab5"
                          id="settings-generator-tab5-control"
                          hidden={!isMirrorBying}>
                    Зеркальные докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab6"
                          id="settings-generator-tab6-control"
                          hidden={!isReversedBying}>
                    Обратные докупки (ТОР)
                  </Button>

                  <Button className="settings-generator-table__show-code"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-code"
                          id="settings-generator-code-control"
                  >
                    <span className="visually-hidden">Показать код</span>
                    <CodeIcon />
                  </Button>
                  {/*  */}

                </div>
                {/* tablist */}

              </div>
              {/* header */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab1"
                   aria-labelledby="settings-generator-tab1-control">
                
                <Table data={mainData} />
                
              </div>
              {/* tabpanel */}

              {currentPreset.type != "Лимитник" &&
                <div tabIndex="0"
                    role="tabpanel"
                    id="settings-generator-tab2"
                    aria-labelledby="settings-generator-tab2-control"
                    hidden>

                  <Table data={data['плечевой']} />

                </div>
              }
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab3"
                   aria-labelledby="settings-generator-tab3-control"
                   hidden>
                
                <Table data={data['прямые профит докупки']} isBying={true} />

              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab4"
                   aria-labelledby="settings-generator-tab4-control"
                   hidden>
                
                <Table data={data['обратные профит докупки']} isBying={true} />
                
              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab5"
                   aria-labelledby="settings-generator-tab5-control"
                   hidden>
                
                <Table data={data['Зеркальные докупки']} isBying={true} />
                
              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab6"
                   aria-labelledby="settings-generator-tab6-control"
                   hidden>
                
                <Table data={data['Обратные докупки (ТОР)']} isBying={true} />
                
              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-code"
                   aria-labelledby="settings-generator-code-control"
                   hidden>
                
                <CodePanel data={mainData} />
                
              </div>
              {/* tabpanel */}

            </div>
            {/* table-wrap */}

          </div>
          {/* inner */}

        </div>
        {/* content */}

      </div>

      <Dialog
        id="settings-generator-add-popup"
        title="Добавить настройку по шаблону"
        confirmText="Добавить"
        onConfirm={e => {
          const presetsCopy = [...presets];
          let name = makeUnique(newPresetName, presetsCopy.map(preset => preset.name));

          presetsCopy.push({ name, type: newPresetName });
          setPresets(presetsCopy);
          setCurrentPresetName(name);

          return true;
        }}
        hideCancel={true}
      >
        <Select
          defaultValue={newPresetName}
          onChange={name => {
            setNewPresetName(name);
          }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          style={{ width: "100%" }}
        >
          <Select.Option value={"МТС"}>Создать новый на основе МТС</Select.Option>
          <Select.Option value={"Стандарт"}>Стандарт</Select.Option>
          <Select.Option value={"СМС + ТОР"}>СМС + ТОР</Select.Option>
          <Select.Option value={"Лимитник"}>Лимитник</Select.Option>
        </Select>
      </Dialog>
    </>
  );
}

export default SettingsGenerator;
