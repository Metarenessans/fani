import React, { useState, useEffect, useRef } from 'react'
import {
  Button, Input, Select, Switch, Tooltip
} from 'antd/es'

import {
  LoadingOutlined,
} from "@ant-design/icons"

import "wicg-inert"

import optionsTemplate from "./options-template"

import "./style.scss"

import LockIcon     from "./icons/Lock"
import DownloadIcon from "./icons/Download"
import CodeIcon     from "./icons/CodeIcon"
import CloseIcon    from "./icons/CloseIcon"
import CodePanel    from "./code-panel"
import SGRow        from "./sgrow"

import createTabs       from "./tabs"
import BurgerButton     from "./burger-button"
import Table            from "./table"
import { Tool, Tools }        from '../../../../../common/tools'
import CrossButton      from '../../../../../common/components/cross-button'
import NumericInput     from '../../../../../common/components/numeric-input'
import CustomSlider     from '../../../../../common/components/custom-slider'
import { Dialog, dialogAPI } from '../../../../../common/components/dialog'

import createData    from './data'

import round          from '../../../../../common/utils/round'
import formatNumber   from '../../../../../common/utils/format-number'
import fractionLength from '../../../../../common/utils/fraction-length'
import { keys } from 'lodash'
import stepConverter from './step-converter'

const SettingsGenerator = props => {

  const { onClose, toolsLoading, onToolSelectFocus, onToolSelectBlur } = props;

  const investorInfo = props.investorInfo || {};

  const [isLong, setIsLong] = useState(true);
  const [risk, setRisk] = useState(100);
  const [isRiskStatic, setIsRiskStatic] = useState(true);
  const [comission, setComission] = useState(0);
  const [load, setLoad] = useState(dev ? 20 : props.load || 0);

  const [tools, setTools] = useState(props.tools?.length ? props.tools : Tools.createArray());
  const [currentToolCode, setCurrentToolCode] = useState("SBER");
  const currentToolIndex = Math.max(tools.indexOf(tools.find(tool => tool.code == currentToolCode)), 0);
  const currentTool = tools[currentToolIndex] || Tools.create();
  const fraction = fractionLength(currentTool.priceStep);

  const initialCurrentTab = "Закрытие основного депозита";
  const [currentTab, setCurrentTab] = useState(initialCurrentTab);
  const prevCurrentTab = useRef();

  const [presets, setPresets] = useState([
    {
      name: "СМС + ТОР",
      type: "СМС + ТОР",
      options: {
        [initialCurrentTab]: {
          closeAll: false,
          mode: "custom",
          customData: [{ ...optionsTemplate, length: 1 }]
        },
        "Закрытие плечевого депозита": {
          closeAll: false,
          mode: "custom",
          customData: [{ ...optionsTemplate, length: 1 }]
        },
        "Обратные докупки (ТОР)": {
          mode: "custom",
          customData: [{ ...optionsTemplate, length: 1 }]
        },
        "Прямые профитные докупки": {
          mode: "custom",
          customData: [{ ...optionsTemplate, length: 1 }]
        },
        "Обратные профитные докупки": {
          mode: "custom",
          customData: [{ ...optionsTemplate, length: 1 }]
        },
      }
    },
    { 
      name: "Лимитник",
      type: "Лимитник",
      options: {
        [initialCurrentTab]: {
          closeAll: false,
          mode: "custom",
          customData: [{ ...optionsTemplate, length: 1 }]
        },
        "Обратные докупки (ТОР)": {
          mode: "custom",
          closeAll: false,
          customData: [{ ...optionsTemplate, length: 1 }]
        },
      }
    },
    { 
      name: "Стандарт",
      type: "Стандарт",
      options: {
        [initialCurrentTab]: {
          closeAll: false,
          ...optionsTemplate,
          mode: "custom",
          modes: ["evenly", "custom", "fibonacci"],
          customData: [{ ...optionsTemplate, length: 1 }]
        },
        "Прямые профитные докупки": {
          ...optionsTemplate,
          mode: "custom",
          modes: ["evenly", "custom"],
          customData: [{ ...optionsTemplate, length: 1 }]
        },
      }
    }
  ]);
  const [newPresetName, setNewPresetName] = useState("МТС");
  const [currentPresetName, setCurrentPresetName] = useState(dev ? "Стандарт" : "Лимитник");
  const currentPreset = presets.find(preset => preset.name == currentPresetName);
  const currentPresetIndex = presets.indexOf(currentPreset);

  const [investorDepo, setInvestorDepo] = useState(props?.depo || 1_000_000);

  const [depo, setDepo] = useState(
    investorDepo != null
      ? currentPreset.type == "Лимитник"
        ? Math.floor(investorDepo)
        : Math.floor(investorDepo * .25)
      : 0
  );

  const [secondaryDepo, setSecondaryDepo] = useState(
    investorDepo != null
      ? currentPreset.type == "Лимитник"
        ? 0
        : Math.floor(investorDepo * .75)
      : 0
  );

  // Прямые профитные докупки 
  const [isProfitableBying, setProfitableBying] = useState(false);
  // Обратные профитные докупки 
  const [isReversedProfitableBying, setReversedProfitableBying] = useState(false);
  // Зеркальные докупки 
  const [isMirrorBying, setMirrorBying] = useState(false);
  // Обратные докупки (ТОР)
  // По дефолту включен в СМС + ТОР
  const [isReversedBying, setReversedBying] = useState(currentPreset.type == "СМС + ТОР");

  const [menuVisible, setMenuVisible] = useState(false);

  const depoSum = depo + secondaryDepo;
  const depoAvailable = (depo + secondaryDepo) * (load / 100);

  let root = React.createRef();
  let menu = React.createRef();

  const ItemOptions = props => {
    const locked = props.locked == true;
    const onDelete = props.onDelete;

    return (
      <ul className="preset-options">
        <li>
          <Tooltip title="Скачать файл">
            <button className="round-btn" aria-label="Скачать">
              <DownloadIcon />
            </button>
          </Tooltip>
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
    contractsTotal = Math.floor((depo + secondaryDepo) / currentTool.guarantee);
  }

  let contractsSecondary = 0;
  if (currentTool) {
    contractsSecondary = Math.floor((depoAvailable - depo) / currentTool.guarantee);
    if (contractsSecondary < 0) {
      contractsSecondary = 0;
    }
  }

  let contracts = 0;
  if (currentTool) {
    contracts = Math.floor(depoAvailable / currentTool.guarantee);
  }

  // Плечевой депо есть только в режиме СМС + ТОР
  const hasExtraDepo = (["СМС + ТОР"].indexOf(currentPreset.type) > -1) && contractsSecondary > 0;

  const options = {
    currentPreset,
    currentTool,
    contractsTotal,
    contracts,
    contractsSecondary,
    comission,
  };

  let data = [];

  let profitableByingArray = [];
  if (currentPreset.options["Прямые профитные докупки"]) {
    profitableByingArray = createData('Прямые профитные докупки', {
      ...options,
      isBying: true,
      on: isProfitableBying
    });
  }

  let reverseProfitableByingArray = [];
  if (currentPreset.options["Обратные профитные докупки"]) {
    reverseProfitableByingArray = createData('Обратные профитные докупки', {
      ...options,
      isBying: true,
      on: isReversedProfitableBying
    });
  }

  data[initialCurrentTab] = createData(initialCurrentTab, {
    ...options,
    profitableByingArray,
  });
  const mainData = data[initialCurrentTab];

  if (currentPreset.options["Закрытие плечевого депозита"]) {
    data['Закрытие плечевого депозита'] = createData('Закрытие плечевого депозита', {
      ...options,
      on: hasExtraDepo,
    });
  }

  if (currentPreset.options["Зеркальные докупки"]) {
    data['Зеркальные докупки'] = createData(initialCurrentTab, {
      ...options,
      isBying: true,
      on: isMirrorBying
    });
  }

  if (currentPreset.options["Прямые профитные докупки"]) {
    data['Прямые профитные докупки'] = profitableByingArray;
  }

  if (currentPreset.options["Обратные профитные докупки"]) {
    data['Обратные профитные докупки'] = reverseProfitableByingArray;
  }

  if (currentPreset.options["Обратные докупки (ТОР)"]) {
    data['Обратные докупки (ТОР)'] = createData('Обратные докупки (ТОР)', {
      ...options,
      mainData,
      isBying: true,
      on: isReversedBying
    });
  }

  const totalIncome = mainData.length
    ? mainData[mainData.length - 1]?.incomeWithComission
    : 0;

  function updatePresetProperty(subtype, property, value) {
    const presetsCopy = [...presets];

    let insert = { [property]: value };
    if (typeof property == 'object') {
      insert = { ...property };
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

    const handleCodeControlClick = e => {
      const currentTab = prevCurrentTab.current;

      if (e.target.ariaSelected == "true") {
        const tab = Array.prototype.find.call(
          document.querySelectorAll(`[role="tab"]`),
          it => it.textContent == currentTab
        );

        setTimeout(() => tab?.click(), 0);
      }
    };

    const codeControlButton = document.querySelector("#settings-generator-code-control");
    codeControlButton.addEventListener("click", handleCodeControlClick);

    createTabs();

    return () => {
      codeControlButton.removeEventListener("click", handleCodeControlClick);
    }
  }, []);

  useEffect(() => {
    prevCurrentTab.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    // Плечевой депо есть только в режиме СМС + ТОР
    if (currentPreset.type == "СМС + ТОР") {
      setDepo(Math.floor(investorDepo * .25));
      setSecondaryDepo(Math.floor(investorDepo * .75));
    }
    else {
      setDepo(investorDepo);
      setSecondaryDepo(0);
    }

    setRisk(currentPreset.type == "СМС + ТОР" ? 300 : 100);

  }, [currentPreset.type, investorDepo]);

  // При изменении инструмента меняем желаемый ход во всех инпутах
  useEffect(() => {

    // TODO: Не забыть!
    // Меняем желаемый ход

    const presetsCopy = [...presets];

    let currentPresetCopy = { ...currentPreset };
    
    keys(currentPreset.options).map(key => {
      const { preferredStep, customData } = currentPreset.options[key];

      const obj = {
        preferredStep: preferredStep == "" ? preferredStep : currentTool.adrDay,
        customData: customData?.map(row => {
          row.preferredStep = row.preferredStep == "" ? row.preferredStep : currentTool.adrDay
          return row;
        })
      };

      currentPresetCopy = {
        ...currentPresetCopy,
        options: {
          ...currentPresetCopy.options,
          [key]: {
            ...currentPresetCopy.options[key],
            ...obj
          }
        }
      };

    });

    presetsCopy[currentPresetIndex] = currentPresetCopy;
    setPresets(presetsCopy);

  }, [currentTool.code]);

  useEffect(() => {
    setTools(props.tools?.length ? props.tools : Tools.createArray());
  }, [props.tools]);

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
                <button className="settings-generator-menu-list-item__name"
                        onClick={e => setCurrentPresetName(preset.name)}>
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
            
            <Tooltip title="Закрыть генератор настроек">
              <CrossButton 
                className="settings-generator__close js-dialog-focus-first"
                onClick={e => {
                  if (onClose) {
                    onClose(e);
                  }
                }}
              />
            </Tooltip>

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
                <Tooltip title="Скачать файл">
                  <button className="round-btn settings-generator-content-header__download" aria-label="Скачать">
                    <DownloadIcon />
                  </button>
                </Tooltip>
              </div>

              <ul className="settings-generator-content-header-options">
                <li>
                  <Tooltip title="Сохранить текущие настройки">
                    <Button className="custom-btn">Сохранить</Button>
                  </Tooltip>
                </li>
              </ul>

            </div>
            {/* settings-generator-content-header */}

            <div className="settings-generator-content__row settings-generator-content__row--1">

              <div className="settings-generator-content__row-col-half">

                <label className="input-group">
                  <span className="input-group__label">Инструмент</span>
                  <Select
                    onFocus={() => onToolSelectFocus()}
                    onBlur={() => onToolSelectBlur()}
                    loading={toolsLoading}
                    disabled={toolsLoading}
                    value={toolsLoading && tools.length == 0 ? 0 :currentToolIndex}
                    onChange={index => setCurrentToolCode(tools[index].code)}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: "100%" }}
                  >
                    {toolsLoading && tools.length == 0
                      ?
                        <Select.Option key={0} value={0}>
                          <LoadingOutlined style={{ marginRight: ".2em" }} /> Загрузка...
                        </Select.Option>
                      :
                        tools
                          .map(tool => String(tool))
                          .map((value, index) => <Select.Option key={index} value={index}>{value}</Select.Option>) 
                    }
                  </Select>
                </label>
                {/* Торговый инструмент */}

                <label className="input-group">
                  <span className="input-group__label">
                    <Tooltip title="Комиссия в рублях за сделку (вход + выход)">
                      Комиссия
                    </Tooltip>
                  </span>
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
                    onBlur={depo => {
                      setDepo(depo);
                    }}
                  />
                </label>

                {
                  ["СМС + ТОР"].indexOf(currentPreset.type) > -1 &&
                    <label className="input-group">
                      <span className="input-group__label">Плечевой депо</span>
                      <NumericInput
                        className="input-group__input"
                        defaultValue={secondaryDepo}
                        format={formatNumber}
                        unsigned="true"
                        min={10000}
                        max={Infinity}
                        onBlur={secondaryDepo => {
                          setSecondaryDepo(secondaryDepo);
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
                        name={
                          <Tooltip title="Максимальное количество контрактов на депозит">
                            Контрактов max.
                          </Tooltip>
                        }
                        value={contractsTotal}
                      />
                      <PairJSX
                        name={
                          <Tooltip title="Количество контрактов на заданный объём загрузки">
                            {"Контракты" + (hasExtraDepo ? " (осн./плеч.)" : "")}
                          </Tooltip>
                        }
                        value={
                          <span>
                            {formatNumber(contracts)}
                            {hasExtraDepo &&
                              <>
                                {window.innerWidth < 768 ? <br /> : " "}
                                (
                                  {formatNumber(contracts - contractsSecondary)}
                                  /
                                  {formatNumber(contractsSecondary)}
                                )
                              </>
                            }
                          </span>
                        }
                        formatValue={false}
                      />
                      <PairJSX 
                        name={
                          <Tooltip title="Величина прибыли с учётом алгоритмов разгрузки">
                            Прибыль
                          </Tooltip>
                        }
                        value={round(totalIncome, 1)}
                      />
                      <PairJSX
                        name={
                          <Tooltip title="Величина убытка при закрытии позиции по стопу">
                            Убыток (риск)
                          </Tooltip>
                        }
                        value={round((depo + secondaryDepo) * risk / 100, fraction)}
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

                <div className="settings-generator-content__row-col-custom settings-generator-slider__label-wrap">

                  <label className="settings-generator-slider__label input-group">
                    <span className="input-group__label">
                      <Tooltip title="Объём депозита в процентах на вход в сделку">
                        Загрузка
                      </Tooltip>
                    </span>
                    <span className="settings-generator-slider__value">
                      <NumericInput
                        className="input-group__input"
                        defaultValue={load}
                        format={value => formatNumber(round(value, fraction))}
                        unsigned="true"
                        onBlur={value => setLoad(value)}
                        suffix="%"
                      />
                    </span>
                  </label>
                  <Tooltip title="Направление позиции">
                    <Switch
                      className="settings-generator-slider__switch-long-short"
                      checkedChildren="LONG"
                      unCheckedChildren="SHORT"
                      checked={isLong}
                      onChange={isLong => {
                        setIsLong(isLong);
                        const updatedTools = [...tools];
                        updatedTools[currentToolIndex].update({ ...investorInfo, type: isLong ? "LONG" : "SHORT" })
                        setTools(updatedTools);
                      }}
                    />
                  </Tooltip>

                </div>

                <div className="settings-generator-slider__wrap">

                  <CustomSlider 
                    className="settings-generator-slider"
                    value={load}
                    step={0.01}
                    onChange={value => setLoad(value)}
                  />

                </div>
                
              </div>
              {/* row-col-half */}

              <div className="settings-generator-content__row-col-half settings-generator-content__after-slider">

                <div className="input-group">
                  <div className="risk-label-wrap">
                    <span className="input-group__label">
                      <Tooltip title="Stop loss в процентах, пунктах или рублях на весь депозит">
                        Риск (стоп)
                      </Tooltip>
                    </span>
                    <button className="risk-label__switch"
                            onClick={() => setIsRiskStatic(!isRiskStatic)}>
                      {isRiskStatic ? "статический" : "динамический"}
                    </button>
                  </div>
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
                </div>

                <label className="input-group">
                  <span className="input-group__label visually-hidden">Риск (стоп)</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={
                      (depoSum * risk / 100)
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
                        depoSum
                        *
                        100
                      );
                    }}
                    suffix="п"
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label visually-hidden">Риск (стоп)</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={depoSum * risk / 100}
                    format={value => formatNumber(round(value, fraction))}
                    unsigned="true"
                    onBlur={riskInMoney => {
                      setRisk(riskInMoney / depoSum * 100);
                    }}
                    suffix="₽"
                  />
                </label>
                
              </div>
              {/* row-col-half */}

            </div>
            {/* row */}

            {/* Закрытие основного депозита */}
            <div style={{ width: '100%' }}>
              <div className="settings-generator-content__row-header-wrap">
                <h3 className="settings-generator-content__row-header">
                  Закрытие основного депозита
                </h3>

                <Tooltip title={
                  currentPreset.options[initialCurrentTab].closeAll
                    ? "Закрывать все открытые контракты"
                    : "Закрывать строго согласно массиву (возможно закрытие не всех контрактов)"
                }>
                  <Switch
                    className="settings-generator-content__row-header-close-all"
                    checked={currentPreset.options[initialCurrentTab].closeAll}
                    checkedChildren="100%"
                    unCheckedChildren="100%"
                    onChange={closeAll => updatePresetProperty(initialCurrentTab, { closeAll })}
                  />
                </Tooltip>

                <label className="switch-group settings-generator-content__row-header-mirror-switch">
                  <Switch
                    checked={isMirrorBying}
                    onChange={val => setMirrorBying(val)}
                  />
                  <span className="switch-group__label">Зеркальные докупки (СМС)</span>
                </label>
              </div>

              <SGRow
                options={currentPreset.options[initialCurrentTab]}
                onModeChange={mode => updatePresetProperty(initialCurrentTab, { mode })}
                onPropertyChange={mappedValue => updatePresetProperty(initialCurrentTab, mappedValue)}
                data={data[initialCurrentTab]}
                contracts={contracts}
                currentTool={currentTool}
                stepsToPercentConverter={currentPreset.type == "Лимитник" ? stepConverter.complexFromStepsToPercent : undefined}
                percentToStepsConverter={currentPreset.type == "Лимитник" ? stepConverter.complexFromPercentToSteps : undefined}
              />

            </div>

            {/* Закрытие плечевого депозита */}
            {hasExtraDepo && 
              <div style={{ width: '100%', marginTop: "0.7em" }}>
                <div className="settings-generator-content__row-header-wrap">
                <h3 className="settings-generator-content__row-header">Закрытие плечевого депозита</h3>

                  <Tooltip title={
                    currentPreset.options["Закрытие плечевого депозита"].closeAll
                      ? "Закрывать все открытые контракты"
                      : "Закрывать строго согласно массиву (возможно закрытие не всех контрактов)"
                  }>
                    <Switch
                      className="settings-generator-content__row-header-close-all"
                      checked={currentPreset.options["Закрытие плечевого депозита"].closeAll}
                      checkedChildren="100%"
                      unCheckedChildren="100%"
                      onChange={closeAll => updatePresetProperty("Закрытие плечевого депозита", { closeAll })}
                    />
                  </Tooltip>
                </div>

                <SGRow
                  options={currentPreset.options["Закрытие плечевого депозита"]}
                  onModeChange={mode => updatePresetProperty("Закрытие плечевого депозита", { mode })}
                  onPropertyChange={mappedValue => updatePresetProperty("Закрытие плечевого депозита", mappedValue)}
                  data={data["Закрытие плечевого депозита"]}
                  contracts={contracts}
                  currentTool={currentTool}
                />
              </div>
            }

            {/* Прямые профитные докупки */}
            {currentPreset.options["Прямые профитные докупки"] &&
              <>
                <label className="switch-group">
                  <Switch
                    checked={isProfitableBying}
                    onChange={checked => setProfitableBying(checked)}
                  />
                  <span className="switch-group__label">Прямые профитные докупки</span>
                </label>

                <div style={{ width: '100%' }} hidden={!isProfitableBying}>
                  <SGRow
                    isBying={true}
                    preferredStepLabel="Прямой ход"
                    data={data["Прямые профитные докупки"]}
                    options={currentPreset.options["Прямые профитные докупки"]}
                    onModeChange={mode => updatePresetProperty("Прямые профитные докупки", { mode })}
                    onPropertyChange={mappedValue => updatePresetProperty("Прямые профитные докупки", mappedValue)}
                    contracts={contractsTotal - contracts}
                    currentTool={currentTool}
                  />
                </div>
              </>
            }

            {/* Обратные профитные докупки */}
            {currentPreset.options["Обратные профитные докупки"] &&
              <>
                <label className="switch-group">
                  <Switch
                    checked={isReversedProfitableBying}
                    onChange={checked => setReversedProfitableBying(checked)}
                  />
                  <span className="switch-group__label">Обратные профитные докупки</span>
                </label>

                <div style={{ width: '100%' }} hidden={!isReversedProfitableBying}>
                  <SGRow
                    isBying={true}
                    data={data["Обратные профитные докупки"]}
                    options={currentPreset.options["Обратные профитные докупки"]}
                    contracts={contractsTotal - contracts}
                    currentTool={currentTool}
                    onPropertyChange={mappedValue => updatePresetProperty("Обратные профитные докупки", mappedValue)}
                  />
                </div>
              </>
            }

            {/* Обратные докупки (ТОР) */}
            {currentPreset.options["Обратные докупки (ТОР)"] &&
              <>
                <label className="switch-group">
                  <Switch
                    checked={isReversedBying}
                    onChange={checked => setReversedBying(checked)}
                  />
                  <span className="switch-group__label">Обратные докупки (ТОР)</span>
                </label>

                <div style={{ width: '100%' }} hidden={!isReversedBying}>
                  <SGRow
                    isBying={true}
                    data={data["Обратные докупки (ТОР)"]}
                    options={currentPreset.options["Обратные докупки (ТОР)"]}
                    contracts={contractsTotal - contracts}
                    currentTool={currentTool}
                    onPropertyChange={mappedValue => updatePresetProperty("Обратные докупки (ТОР)", mappedValue)}
                  />
                </div>
              </>
            }

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
                          onClick={e => setCurrentTab(initialCurrentTab)}>
                    Закрытие основного депо<span className="visually-hidden">зита</span>
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab2"
                          id="settings-generator-tab2-control"
                          hidden={!hasExtraDepo}
                          onClick={e => setCurrentTab("Закрытие плечевого депозита")}>
                    Закрытие плечевого депо<span className="visually-hidden">зита</span>
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab3"
                          id="settings-generator-tab3-control"
                          hidden={!isProfitableBying}
                          onClick={e => setCurrentTab("Прямые профитные докупки")}>
                    Прямые докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab4"
                          id="settings-generator-tab4-control"
                          hidden={true}
                          // hidden={!isReversedProfitableBying}
                          onClick={e => setCurrentTab("Обратные профитные докупки")}>
                    Обратные докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab5"
                          id="settings-generator-tab5-control"
                          hidden={!isMirrorBying}
                          onClick={e => setCurrentTab("Зеркальные докупки")}>
                    Зеркальные докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab6"
                          id="settings-generator-tab6-control"
                          hidden={!isReversedBying}
                          onClick={e => setCurrentTab("Обратные докупки (ТОР)")}>
                    Обратные докупки (ТОР)
                  </Button>

                  <Button className="settings-generator-table__show-code"
                          id="settings-generator-code-control"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-code">
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

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab2"
                   aria-labelledby="settings-generator-tab2-control"
                   hidden>

                {currentPreset.type != "Лимитник" &&
                  <Table data={data['Закрытие плечевого депозита']} />
                }

              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab3"
                   aria-labelledby="settings-generator-tab3-control"
                   hidden>
                
                <Table data={data['Прямые профитные докупки']} isBying={true} />

              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab4"
                   aria-labelledby="settings-generator-tab4-control"
                   hidden>
                
                <Table data={data['Обратные профитные докупки']} isBying={true} />
                
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
                
                <CodePanel currentPreset={currentPreset}
                           data={data} 
                           tool={currentTool}
                           contracts={contracts}
                           risk={risk}
                           isRiskStatic={isRiskStatic}/>
                
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