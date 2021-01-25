import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import {
  Button, Input, Select, Slider, Switch, Tooltip, Tabs, Radio
} from 'antd/es'

import {
  LoadingOutlined,
} from "@ant-design/icons"

import "wicg-inert"

import LockIcon     from "./icons/Lock"
import DownloadIcon from "./icons/Download"
import CodeIcon     from "./icons/CodeIcon"
import CloseIcon    from "./icons/CloseIcon"

import createTabs   from "./tabs"
import BurgerButton from "./burger-button"
import { Tools }    from '../../../../../common/tools'
import CrossButton  from '../../../../../common/components/cross-button'
import NumericInput from '../../../../../common/components/numeric-input'
import CustomSlider from '../../../../../common/components/custom-slider'
import { Dialog, dialogAPI } from '../../../../../common/components/dialog'

import round        from '../../../../../common/utils/round'
import roundUp      from '../../../../../common/utils/round-up'
import formatNumber from '../../../../../common/utils/format-number'

import "./style.scss"

const SGTable = ({ data, closeMode = true }) => {
  if (data == null || data.length == 0) {
    return null;
  }
  
  return (
    <div className="settings-generator-table">
      <div className="settings-generator-table">
        {data.map((row, index) =>
          <table className="settings-generator-table__row">
            <tr className="settings-generator-table__row-header">
              <th>№</th>
              <th>% {closeMode ? 'закрытия' : 'докупки'}</th>
              <th>Ход $/₽</th>
              <th>Кол-во {closeMode ? 'закрытых' : 'докупленных'} контрактов</th>
              <th>
                Контрактов<br />
                в работе
              </th>
              <th>
                Накопленная прибыль<br />
                без комиссии
              </th>
              <th>
                Величина<br />
                комиссии
              </th>
              <th>
                Накопленная прибыль<br />
                с учетом комиссии
              </th>
            </tr>
            <tr>
              <td 
                data-label="№"
                data-label-xs="№"
              >
                {index + 1}
              </td>
              <td 
                data-label="% закрытия"
                data-label-xs="% закр."
              >
                {formatNumber(row.percent)}
              </td>
              <td 
                data-label="Ход $/₽"
                data-label-xs="Ход $/₽"
              >
                {formatNumber(row.points)}
              </td>
              <td 
                data-label="Закрытых контрактов"
                data-label-xs="Закр. контр."
              >
                {formatNumber(Math.floor(row.contracts))}
              </td>
              <td 
                data-label="Контрактов в работе"
                data-label-xs="Контр. в раб."
              >
                {formatNumber(Math.floor(row.contractsLoaded))}
              </td>
              <td 
                data-label="Прибыль без комиссии"
                data-label-xs="Приб. без комиссии"
              >
                {formatNumber(round(row.incomeWithoutComission, 1))}
              </td>
              <td 
                data-label="Величина комиссии"
                data-label-xs="Комиссия"
              >
                {formatNumber(round(row.comission, 1))}
              </td>
              <td 
                data-label="Накопленная прибыль с учетом комиссии"
                data-label-xs="Приб. с уч. комисии"
              >
                {formatNumber(round(row.incomeWithComission, 1))}
              </td>
            </tr>
          </table>
        )}
      </div>
    </div>
  )
};

const SettingsGenerator = props => {

  const { onClose } = props;
  
  const investorDepo = props.depo != null ? props.depo : 1_000_000;
  const [depo, setDepo] = useState(
    investorDepo != null 
      ? Math.floor(investorDepo * .25) 
      : 0
  );
  const [secondaryDepo, setSecondaryDepo] = useState(
    investorDepo != null 
      ? Math.floor(investorDepo * .75)
      : 0
  );

  const [comission, setComission] = useState(0);
  const [load, setLoad] = useState(props.load || 0);

  const tools = props.tools?.length ? props.tools : [ Tools.create() ];
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const currentTool = tools[currentToolIndex];

  const optionBase = {
    preferredStep: currentTool.adrDay,       // Желаемый ход
    length:        1,                        // Кол-во закрытий 
    percent:       0,                        // % закрытия
    stepInPercent: 0,                        // Шаг
  };
  const [presets, setPresets] = useState([
    { 
      name: "Стандарт", 
      type: "Стандарт",
      options: {
        mode: 'evenly', // evenly / custom / fibonacci
        ...optionBase,
        customData: [{...optionBase}]
      }
    },
    { name: "СМС + ТОР", type: "СМС + ТОР" },
    { name: "Лимитник",  type: "Лимитник" }
  ]);
  const [newPresetName, setNewPresetName] = useState("МТС");
  const [currentPresetName, setCurrentPresetName] = useState("Стандарт");
  const currentPreset = presets.find(preset => preset.name == currentPresetName);
  const currentPresetIndex = presets.indexOf(currentPreset);

  // Flags
  const [mirrorOn, setMirrorOn] = useState(false);
  const [reversedOn, setReversedOn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const depoAvailable = investorDepo * (load / 100);

  const hasExtraDepo = (depo < depoAvailable);

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

  const presetRules = {
    blockStartIndicies: [0, 4, 8],
    blockLengths: [4, 4, 16],
    percents: [9.5, 9.5, 1.5],
    multipliers: [
      [2, 3, 5, 8],
      [13, 15, 18, 20],
      new Array((100 - 20) / 5 + 1).fill(0).map((v, i) => 20 + (5 * i))
    ]
  };

  let contractsLeft = contracts;

  // ЗАКРЫТИЕ ОСНОВНОГО ДЕПОЗИТА
  let dataList = [];
  dataList['основной'] = [];
  let length = currentPreset.options.length;
  if (length == null) {
    length = 1;
  }

  if (currentPreset.options.mode == 'fibonacci') {
    length = 24;
  }
  else if (currentPreset.options.mode == 'custom') {
    length = currentPreset.options.customData.length;
  }

  for (let index = 0; index < length; index++) {

    let shouldBreak = false;

    let blockNumber = 1;
    for (let i = 0; i < presetRules.blockStartIndicies.length; i++) {
      if (index >= presetRules.blockStartIndicies[i]) {
        blockNumber = i + 1;
      }
    }

    const blockLen = presetRules.blockLengths[blockNumber - 1];

    let indexInBlock = ((index + 1) - presetRules.blockStartIndicies[blockNumber - 1]) % blockLen;
    if (indexInBlock == 0) {
      indexInBlock = blockLen;
    }

    // % закрытия
    let percent = currentPreset.options.percent;
    if (currentPreset.options.mode == 'fibonacci') {
      percent = presetRules.percents[blockNumber - 1];
    }
    else if (currentPreset.options.mode == 'custom') {
      percent = currentPreset.options.customData[index].percent;
    }

    // Ход
    let points = round(
      (
        // контракты * го = объем входа в деньгах
        (contracts * currentTool.guarantee)
        *
        // величина смещения из массива закрытия
        (percent / 100 * (index + 1))
        *
        // шаг цены
        currentTool.priceStep
      )
      / 
      (
        contracts
        *
        currentTool.stepPrice
      ),
      1
    );
    if (isNaN(points)) {
      points = 0;
    }

    if (currentPreset.options.mode == 'fibonacci') {
      points = currentTool.adrDay / currentTool.priceStep
      const blockPointsMultipliers = presetRules.multipliers[blockNumber - 1];
      const multiplier = blockPointsMultipliers[indexInBlock - 1];
      points = Math.floor(points * multiplier / 100);
    }

    // Если ход больше желаемого хода - массив заканчивается
    let preferredStep = currentPreset.options.preferredStep;
    if (currentPreset.options.mode == 'custom') {
      preferredStep = currentPreset.options.customData[index].preferredStep;
    }

    if (currentPreset.options.mode != 'fibonacci' && points > preferredStep) {
      break;
    }

    // кол-во закрытых контрактов
    let _contracts = roundUp(contracts * percent / 100);
    if (currentPreset.options.mode == 'fibonacci') {
      _contracts = roundUp(contracts * percent / 100)
    }

    if (contractsLeft - _contracts >= 0) {
      contractsLeft -= _contracts;
    }
    else {
      _contracts = contractsLeft;
      contractsLeft = 0;
      shouldBreak = true;
    }

    // Контрактов в работе
    let contractsLoaded = contractsLeft;

    let _comission = _contracts * comission;

    let incomeWithoutComission = contracts * currentTool.stepPrice * points;
    let incomeWithComission = incomeWithoutComission - _comission;

    dataList['основной'][index] = {
      percent,
      points,
      contracts: _contracts,
      contractsLoaded,
      incomeWithoutComission,
      comission: _comission,
      incomeWithComission,
    };

    if (shouldBreak) {
      break;
    }
  }

  // componentDidMount
  useEffect(() => {
    window.addEventListener("resize", function () {
      setIsMobile(window.innerWidth <= 576);
    });
    createTabs();
  }, []);

  useEffect(() => {

    setDepo(Math.floor(investorDepo * .25));
    setSecondaryDepo(Math.floor(investorDepo * .75));

  }, [investorDepo]);

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
                    .concat(index == 0 ? "selected" : "")
                    .join(" ")
                    .trim()
                }
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
                <li>
                  <Button className="custom-btn" disabled>Отменить</Button>
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
                    key={comission}
                    defaultValue={comission}
                    format={formatNumber}
                    onBlur={val => {
                      setComission(val);
                    }}
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">Основной депо</span>
                  <NumericInput
                    className="input-group__input"
                    key={depo}
                    defaultValue={depo}
                    format={formatNumber}
                    onBlur={value => {
                      setDepo(value);
                    }}
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">Плечевой депо</span>
                  <NumericInput
                    className="input-group__input"
                    key={secondaryDepo}
                    defaultValue={secondaryDepo}
                    format={formatNumber}
                    min={10000}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

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
                        name="Прибыль"
                        value={round(dataList['основной'][dataList['основной'].length - 1].incomeWithComission, 1)}
                      />
                      <PairJSX 
                        name={"Контракты" + (hasExtraDepo ? " (осн./плеч.)" : "")}
                        value={
                          <span>
                            {formatNumber(contracts)}
                            {depo < depoAvailable &&
                              <>
                                {window.innerWidth < 768 ? <br/> : " "}
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
                        name="Убыток"
                        value={9999}
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
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={10000}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>
                
              </div>
              {/* row-col-half */}

            </div>
            {/* row */}

            <div style={{ width: '100%' }}>
              <h3 className="settings-generator-content__row-header">Закрытие основного депозита</h3>

              <div className="settings-generator-content__row-header-modes">
                <Radio.Group
                  className="settings-generator-content__row-header-modes-select"
                  value={currentPreset.options.mode}
                  onChange={e => {
                    const presetsCopy = [...presets];
                    const currentPresetCopy = {
                      ...currentPreset,
                      options: {
                        ...currentPreset.options,
                        mode: e.target.value
                      }
                    };
                    presetsCopy[currentPresetIndex] = currentPresetCopy;
                    setPresets(presetsCopy);
                  }}
                >
                  <Radio value={'evenly'}>равномерно</Radio>
                  <Radio value={'custom'}>задать самому</Radio>
                  <Radio value={'fibonacci'}>по Фибоначчи</Radio>
                </Radio.Group>
              </div>

              {
                currentPreset.options.mode == 'custom'
                  ? 
                  <>
                    {currentPreset.options.customData
                      .map((d, i) =>
                        <div 
                          className="settings-generator-content__row settings-generator-content__opt-row"
                          key={i}
                        >

                          <span className="settings-generator-content__opt-row-number">
                            {i + 1}
                          </span>

                          <label className="input-group">
                            <span className="input-group__label">Желаемый ход</span>
                            <NumericInput
                              className="input-group__input"
                              key={currentPreset.options.customData[i].preferredStep}
                              defaultValue={currentPreset.options.customData[i].preferredStep}
                              placeholder={currentTool.adrDay}
                              format={formatNumber}
                              min={0}
                              onBlur={value => {
                                const presetsCopy = [...presets];
                                const currentCustomDataCopy = [...currentPreset.options.customData];
                                currentCustomDataCopy[i] = { ...currentCustomDataCopy[i], preferredStep: value };

                                const currentPresetCopy = {
                                  ...currentPreset,
                                  options: {
                                    ...currentPreset.options,
                                    customData: currentCustomDataCopy
                                  }
                                };
                                presetsCopy[currentPresetIndex] = currentPresetCopy;
                                setPresets(presetsCopy);
                              }}
                            />
                          </label>

                          <label className="input-group">
                            <span className="input-group__label">% закрытия</span>
                            <NumericInput
                              className="input-group__input"
                              key={currentPreset.options.customData[i].percent}
                              defaultValue={currentPreset.options.customData[i].percent}
                              format={formatNumber}
                              min={0}
                              onBlur={value => {
                                const presetsCopy = [...presets];
                                const currentCustomDataCopy = [...currentPreset.options.customData];
                                currentCustomDataCopy[i] = { ...currentCustomDataCopy[i], percent: value };

                                const currentPresetCopy = {
                                  ...currentPreset,
                                  options: {
                                    ...currentPreset.options,
                                    customData: currentCustomDataCopy
                                  }
                                };
                                presetsCopy[currentPresetIndex] = currentPresetCopy;
                                setPresets(presetsCopy);
                              }}
                            />
                          </label>

                          <label className="input-group">
                            <span className="input-group__label">Шаг в %</span>
                            <NumericInput
                              disabled={currentPreset.options.mode == 'fibonacci'}
                              className="input-group__input"
                              key={currentPreset.options.stepInPercent}
                              defaultValue={currentPreset.options.stepInPercent}
                              format={formatNumber}
                              min={0}
                              onBlur={value => {
                                const presetsCopy = [...presets];
                                const currentCustomDataCopy = [...currentPreset.options.customData];
                                currentCustomDataCopy[i] = { ...currentCustomDataCopy[i], stepInPercent: value };

                                const currentPresetCopy = {
                                  ...currentPreset,
                                  options: {
                                    ...currentPreset.options,
                                    customData: currentCustomDataCopy
                                  }
                                };
                                presetsCopy[currentPresetIndex] = currentPresetCopy;
                                setPresets(presetsCopy);
                              }}
                            />
                          </label>

                          <CrossButton 
                            style={{ visibility: i > 0 ? 'visible' : 'hidden' }}
                            className="settings-generator-content__opt-row-delete"
                            onClick={e => {
                              const presetsCopy = [...presets];
                              const currentPresetCopy = {...currentPreset};
                              currentPresetCopy.options.customData.splice(i, 1);
                              setPresets(presetsCopy);
                            }}
                          />
                          
                          {(!isMobile || (isMobile && i == currentPreset.options.customData.length - 1)) &&
                            <div 
                              className="settings-generator-content__print-group"
                              style={!isMobile ? { visibility: i == 0 ? 'visible' : 'hidden' } : {}}
                            >
                              <span>Суммарный % закрытия</span>
                              <b>{dataList['основной']
                                .reduce((acc, curr) => (acc || 0) + (curr.percent || 0), 0)
                              }%</b>
                            </div>
                          }

                        </div>
                      )
                    }
                    <Button
                      className="custom-btn settings-generator-content__opt-row-btn"
                      onClick={e => {
                        const presetsCopy = [...presets];
                        const currentPresetCopy = {
                          ...currentPreset,
                          options: {
                            ...currentPreset.options,
                            customData: [
                              ...currentPreset.options.customData,
                              {...optionBase}
                            ]
                          }
                        };
                        presetsCopy[currentPresetIndex] = currentPresetCopy;
                        setPresets(presetsCopy);
                      }}
                    >
                      + закрытие
                    </Button>
                  </>
                  :
                  <div className="settings-generator-content__row settings-generator-content__opt-row">

                    {currentPreset.options.mode == 'custom'
                      ? '1'
                      : null
                    }

                    <label className="input-group">
                      <span className="input-group__label">Желаемый ход</span>
                      <NumericInput
                        disabled={currentPreset.options.mode == 'fibonacci'}
                        className="input-group__input"
                        key={currentPreset.options.preferredStep}
                        defaultValue={currentPreset.options.preferredStep}
                        placeholder={currentTool.adrDay}
                        format={formatNumber}
                        min={0}
                        onBlur={value => {
                          const presetsCopy = [...presets];
                          const currentPresetCopy = {
                            ...currentPreset,
                            options: {
                              ...currentPreset.options,
                              preferredStep: value
                            }
                          };
                          presetsCopy[currentPresetIndex] = currentPresetCopy;
                          setPresets(presetsCopy);
                        }}
                      />
                    </label>

                    {currentPreset.options.mode == 'custom'
                      ?
                      null
                      :
                      <label className="input-group">
                        <span className="input-group__label">Кол-во закрытий</span>
                        <NumericInput
                          disabled={currentPreset.options.mode == 'fibonacci'}
                          className="input-group__input"
                          key={currentPreset.options.length}
                          defaultValue={currentPreset.options.length}
                          placeholder={1}
                          format={formatNumber}
                          min={1}
                          onBlur={value => {
                            const presetsCopy = [...presets];
                            const currentPresetCopy = {
                              ...currentPreset,
                              options: {
                                ...currentPreset.options,
                                length: value
                              }
                            };
                            presetsCopy[currentPresetIndex] = currentPresetCopy;
                            setPresets(presetsCopy);
                          }}
                        />
                      </label>
                    }

                    <label className="input-group">
                      <span className="input-group__label">% закрытия</span>
                      <NumericInput
                        disabled={currentPreset.options.mode == 'fibonacci'}
                        className="input-group__input"
                        key={currentPreset.options.percent}
                        defaultValue={currentPreset.options.percent}
                        format={formatNumber}
                        min={0}
                        onBlur={value => {
                          const presetsCopy = [...presets];
                          const currentPresetCopy = {
                            ...currentPreset,
                            options: {
                              ...currentPreset.options,
                              percent: value
                            }
                          };
                          presetsCopy[currentPresetIndex] = currentPresetCopy;
                          setPresets(presetsCopy);
                        }}
                      />
                    </label>

                    <label className="input-group">
                      <span className="input-group__label">Шаг в %</span>
                      <NumericInput
                        disabled={currentPreset.options.mode == 'fibonacci'}
                        className="input-group__input"
                        key={currentPreset.options.stepInPercent}
                        defaultValue={currentPreset.options.stepInPercent}
                        format={formatNumber}
                        min={0}
                        onBlur={value => {
                          const presetsCopy = [...presets];
                          const currentPresetCopy = {
                            ...currentPreset,
                            options: {
                              ...currentPreset.options,
                              stepInPercent: value
                            }
                          };
                          presetsCopy[currentPresetIndex] = currentPresetCopy;
                          setPresets(presetsCopy);
                        }}
                      />
                    </label>

                    <div className="settings-generator-content__print-group">
                      <span>Суммарный % закрытия</span>
                      <b>{dataList['основной']
                        .reduce((acc, curr) => (acc || 0) + (curr.percent || 0), 0)
                      }%</b>
                    </div>

                  </div>
              }
            </div>

            <div hidden={!hasExtraDepo}>
              <h3 className="settings-generator-content__row-header">Закрытие плечевого депозита</h3>

              <div className="settings-generator-content__row">

                <div className="settings-generator-content__row-col-half">

                  <label className="input-group">
                    <span className="input-group__label">Кол-во закрытий</span>
                    <NumericInput
                      className="input-group__input"
                      key={0}
                      defaultValue={0}
                      format={formatNumber}
                      min={0}
                      max={Infinity}
                      onBlur={val => {
                        
                      }}
                    />
                  </label>

                  <label className="input-group">
                    <span className="input-group__label">% закрытия</span>
                    <NumericInput
                      className="input-group__input"
                      key={0}
                      defaultValue={0}
                      format={formatNumber}
                      min={0}
                      max={Infinity}
                      onBlur={val => {
                        
                      }}
                    />
                  </label>

                </div>
                {/* half */}

                <div className="settings-generator-content__row-col-half">

                  <label className="input-group">
                    <span className="input-group__label">Шаг</span>
                    <NumericInput
                      className="input-group__input"
                      key={0}
                      defaultValue={0}
                      format={formatNumber}
                      min={0}
                      max={Infinity}
                      onBlur={val => {
                        
                      }}
                    />
                  </label>

                  <div className="settings-generator-content__print-group">
                    <span>Суммарный % закрытия</span>
                    <b>59%</b>
                  </div>

                </div>
                {/* half */}

              </div>
              {/* row */}
            </div>

            <label className="switch-group">
              <Switch 
                checked={mirrorOn} 
                onChange={val => setMirrorOn(val)}
              />
              <span className="switch-group__label">Прямые профитные докупки</span>
            </label>

            <div
              className="settings-generator-content__row"
              hidden={!mirrorOn}
            >

              <div className="settings-generator-content__row-col-half">

                <label className="input-group">
                  <span className="input-group__label">Кол-во закрытий</span>
                  <NumericInput
                    className="input-group__input"
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={0}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">% закрытия</span>
                  <NumericInput
                    className="input-group__input"
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={0}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

              </div>
              {/* half */}

              <div className="settings-generator-content__row-col-half">

                <label className="input-group">
                  <span className="input-group__label">Шаг</span>
                  <NumericInput
                    className="input-group__input"
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={0}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

                <div className="settings-generator-content__print-group">
                  <span>Суммарный % закрытия</span>
                  <b>59%</b>
                </div>

              </div>
              {/* half */}

            </div>
            {/* row */}

            <label className="switch-group">
              <Switch 
                checked={reversedOn} 
                onChange={val => setReversedOn(val)}
              />
              <span className="switch-group__label">Обратные профитные докупки</span>
            </label>

            <div 
              className="settings-generator-content__row"
              hidden={!reversedOn}
            >

              <div className="settings-generator-content__row-col-half">

                <label className="input-group">
                  <span className="input-group__label">Кол-во докупок</span>
                  <NumericInput
                    className="input-group__input"
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={0}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

                <label className="input-group">
                  <span className="input-group__label">% докупки</span>
                  <NumericInput
                    className="input-group__input"
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={0}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

              </div>
              {/* half */}

              <div className="settings-generator-content__row-col-half">

                <label className="input-group">
                  <span className="input-group__label">Шаг</span>
                  <NumericInput
                    className="input-group__input"
                    key={0}
                    defaultValue={0}
                    format={formatNumber}
                    min={0}
                    max={Infinity}
                    onBlur={val => {
                      
                    }}
                  />
                </label>

                <div className="settings-generator-content__print-group">
                  <span>Суммарный % докупки</span>
                  <b>59%</b>
                </div>
                
              </div>
              {/* half */}

            </div>
            {/* row */}

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

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab2"
                          id="settings-generator-tab2-control"
                          hidden={!hasExtraDepo}>
                    Закрытие плечевого депо
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab3"
                          id="settings-generator-tab3-control"
                          hidden={!mirrorOn}>
                    Прямые докупки
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab4"
                          id="settings-generator-tab4-control"
                          hidden={!reversedOn}>
                    Обратные докупки
                  </Button>

                </div>
                {/* tablist */}

                <button className="settings-generator-table__show-code">
                  <CodeIcon />
                </button>

              </div>
              {/* header */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab1"
                   aria-labelledby="settings-generator-tab1-control">
                
                <SGTable data={dataList['основной']} />
                
              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab2"
                   aria-labelledby="settings-generator-tab2-control"
                   hidden>

                <SGTable data={dataList['плечевой']} />

              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab3"
                   aria-labelledby="settings-generator-tab3-control"
                   hidden>
                
                <SGTable data={dataList['прямые профит докупки']} closeMode={false} />

              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab4"
                   aria-labelledby="settings-generator-tab4-control"
                   hidden>
                
                <SGTable data={dataList['обратные профит докупки']} closeMode={false} />
                
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
