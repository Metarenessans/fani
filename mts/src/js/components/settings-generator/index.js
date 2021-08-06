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
import SaveModal        from '../save-modal'
import { Tool, Tools }  from '../../../../../common/tools'
import CrossButton      from '../../../../../common/components/cross-button'
import NumericInput     from '../../../../../common/components/numeric-input'
import CustomSlider     from '../../../../../common/components/custom-slider'
import sortInputFirst   from "../../../../../common/utils/sort-input-first"
import { Dialog, dialogAPI } from '../../../../../common/components/dialog'

import createData    from './data'

import round           from '../../../../../common/utils/round'
import formatNumber    from '../../../../../common/utils/format-number'
import fractionLength  from '../../../../../common/utils/fraction-length'
import magnetToClosest from '../../../../../common/utils/magnet-to-closest'
import { keys } from 'lodash'
import stepConverter from './step-converter'

const SettingsGenerator = props => {

  const { onClose, onUpdate, onSave, genaSave, toolsLoading, onToolSelectFocus, onToolSelectBlur } = props;

  const onDownload = props.onDownload || function(title, text) {
    const file = new Blob([text], { type: 'text/plain' });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.setAttribute('download', `${title}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const firstRender = useRef(true);
  const [shouldSave, setShouldSave] = useState(false);
  const [shouldRegisterUpdate, setShouldRegisterUpdate] = useState(false);

  const investorInfo = props.investorInfo || {};

  const initialCurrentTab = "Закрытие основного депозита";
  const [currentTab, setCurrentTab] = useState(initialCurrentTab);
  const prevCurrentTab = useRef();

  const defaultToolCode = dev ? "SiU1" : "SBER";
  const [presets, setPresets] = useState([
    {
      name: "Стандарт",
      type: "Стандарт",
      options: {
        currentToolCode: defaultToolCode,
        [initialCurrentTab]: {
          closeAll: false,
          ...optionsTemplate,
          mode: "custom",
          modes: ["custom"],
          customData: [{ ...optionsTemplate }]
        },
        "Прямые профитные докупки": {
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
        "Обратные профитные докупки": {
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
      }
    },
    {
      name: "СМС + ТОР",
      type: "СМС + ТОР",
      options: {
        currentToolCode: defaultToolCode,
        [initialCurrentTab]: {
          closeAll: false,
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
        "Закрытие плечевого депозита": {
          closeAll: false,
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
        "Обратные докупки (ТОР)": {
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
        "Прямые профитные докупки": {
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
        "Обратные профитные докупки": {
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
      }
    },
    { 
      name: "Лимитник",
      type: "Лимитник",
      options: {
        currentToolCode: defaultToolCode,
        [initialCurrentTab]: {
          closeAll: false,
          mode: "custom",
          customData: [{ ...optionsTemplate }]
        },
        "Обратные докупки (ТОР)": {
          mode: "custom",
          closeAll: false,
          customData: [{ ...optionsTemplate }]
        },
      }
    },
  ]);
  const [newPresetName, setNewPresetName] = useState("МТС");
  const [currentPresetName, setCurrentPresetName] = useState(dev ? "Лимитник" : "Стандарт");
  const currentPreset = presets.find(preset => preset.name == currentPresetName);
  const currentPresetIndex = presets.indexOf(currentPreset);

  const [tools, setTools] = useState(props.tools?.length ? props.tools : Tools.createArray());
  const currentToolCode = currentPreset.options.currentToolCode || defaultToolCode;
  const currentToolIndex = Tools.getToolIndexByCode(tools, currentToolCode);
  const currentTool = tools[currentToolIndex] || Tools.create();
  const prevTool = useRef(currentTool);
  const fraction = fractionLength(currentTool.priceStep);

  const filterStep = step => {
    return fraction > 0
      ? round(step, fraction)
      : magnetToClosest(step, currentTool.priceStep);
  };

  const [searchVal, setSearchVal] = useState("");
  const [isLong, setIsLong] = useState(true);
  const [risk, setRisk] = useState(100);
  const [isRiskStatic, setIsRiskStatic] = useState(true);
  const [comission, setComission] = useState(currentTool.dollarRate == 0 ? 1 : 45);
  const [load, setLoad] = useState(dev ? 50 : props.load || 0);

  const [investorDepo, setInvestorDepo] = useState(dev ? 20_000_000 : props.depo || 1_000_000);
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
  const depoSum = depo + secondaryDepo;
  const depoAvailable = (depo + secondaryDepo) * (load / 100);

  const [ranull, setRanull] = useState(10);
  const [ranullMode, setRanullMode] = useState(true);
  const [ranullPlus, setRanullPlus] = useState(3);
  const [ranullPlusMode, setRanullPlusMode] = useState(true);

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

  let root = React.createRef();
  let menu = React.createRef();

  const ItemOptions = props => {
    const locked = props.locked == true;
    const onDelete = props.onDelete;
    const preset = props.preset;

    return (
      <ul className="preset-options">
        <li>
          <Tooltip title="Скачать файл">
            <button 
              className="round-btn" 
              aria-label="Скачать"
              onClick={e => {
                const prevPresetName = currentPreset.name;

                setCurrentPresetName(preset.name);
                setTimeout(() => {
                  const title = preset.name;
                  const content = [...document.querySelector("#settings-generator-code").querySelectorAll(".code-panel-group")]
                    .map(node => [...node.querySelectorAll("[data-should-output]")]
                      .map(node => node.innerText)
                      .join("\n")
                    )
                    .join("\n");

                  onDownload(title, content);

                  setCurrentPresetName(prevPresetName);
                }, 0);
              }}
            >
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

  data['Зеркальные докупки'] = createData(initialCurrentTab, {
    ...options,
    isBying: true,
    on: isMirrorBying
  });

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
  
  const totalLoss = round((depo + secondaryDepo) * risk / 100, fraction);

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
    setShouldRegisterUpdate(true);
  }

  function updateCurrentPresetTool(code) {
    const presetsCopy = [...presets];

    const currentPresetCopy = {
      ...currentPreset,
      options: {
        ...currentPreset.options,
        currentToolCode: code,
      }
    };
    presetsCopy[currentPresetIndex] = currentPresetCopy;
    setPresets(presetsCopy);
  }

  const getPackedSave = () => {
    return {
      isLong,
      comission,
      risk,
      depo,
      secondaryDepo,
      load,
      currentTab,
      presets,
      currentPresetName,
      isProfitableBying,
      isReversedProfitableBying,
      isMirrorBying,
      isReversedBying,
      ranull,
      ranullMode,
      ranullPlus,
      ranullPlusMode,
      totalIncome,
      totalLoss,
    };
  };

  // componentDidMount
  useEffect(() => {

    firstRender.current = false;

    const handleCodeControlClick = e => {

      const prevTab = prevCurrentTab.current;
      console.log(prevTab, e.target.getAttribute("aria-selected"));

      if (e.target.getAttribute("aria-selected") == "true") {
        const tab = Array.prototype.find.call(
          document.querySelectorAll(`[role="tab"]`),
          it => it.textContent == prevTab
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
    if (genaSave) {
      const {
        isLong,
        comission,
        risk,
        depo,
        secondaryDepo,
        load,
        currentTab,
        presets,
        currentPresetName,
        isProfitableBying,
        isReversedProfitableBying,
        isMirrorBying,
        isReversedBying,
        ranull,
        ranullMode,
        ranullPlus,
        ranullPlusMode
      } = genaSave;

      setIsLong(isLong);
      setComission(comission);
      setRisk(risk);
      setDepo(depo);
      setSecondaryDepo(secondaryDepo);
      setLoad(load);
      setCurrentTab(currentTab);
      setPresets(presets);
      setCurrentPresetName(currentPresetName);
      setProfitableBying(isProfitableBying);
      setReversedProfitableBying(isReversedProfitableBying)
      setMirrorBying(isMirrorBying);
      setReversedBying(isReversedBying);
      setRanull(ranull);
      setRanullMode(ranullMode);
      setRanullPlus(ranullPlus);
      setRanullPlusMode(ranullPlusMode);
    }
  }, [genaSave]);

  useEffect(() => {
    prevCurrentTab.current = currentTab;
  }, [currentTab]);

  useEffect(() => {
    let base = investorDepo;
    if (depoSum != investorDepo) {
      base = depoSum;
    }

    // Плечевой депо есть только в режиме СМС + ТОР
    if (currentPreset.type == "СМС + ТОР") {
      setDepo(Math.floor(base * .25));
      setSecondaryDepo(Math.floor(base * .75));
    }
    else {
      setDepo(base);
      setSecondaryDepo(0);
    }

    setRisk(currentPreset.type == "СМС + ТОР" ? 300 : 100);

    setReversedBying(dev || currentPreset.type == "СМС + ТОР");

    setShouldRegisterUpdate(true);

  }, [currentPreset.type]);

  useEffect(() => {
    let base = investorDepo;
    if (depoSum != investorDepo) {
      base = depoSum;
    }

    // Плечевой депо есть только в режиме СМС + ТОР
    if (currentPreset.type == "СМС + ТОР") {
      setDepo(Math.floor(base * .25));
      setSecondaryDepo(Math.floor(base * .75));
    }
    else {
      setDepo(base);
      setSecondaryDepo(0);
    }

    setShouldRegisterUpdate(true);

  }, [investorDepo]);

  // При изменении инструмента меняем желаемый ход во всех инпутах
  useEffect(() => {

    const presetsCopy = [...presets];

    let currentPresetCopy = { ...currentPreset };

    // Обновляем ход только если новый инструмент отличается от предыдущего
    // а не является устаревшей/новой версией текущего
    if (!(currentTool.dollarRate == 0 && prevTool.current.code.slice(0, 2) == currentTool.code.slice(0, 2))) {
      keys(currentPreset.options).map(key => {

        // Выполняем проверку только на объектах
        if (typeof currentPreset.options[key] != "object") {
          return;
        }

        const { preferredStep, inPercent, customData } = currentPreset.options[key];

        let _prefStep = preferredStep;
        if (inPercent) {
          if (preferredStep != "") {
            _prefStep = stepConverter.fromStepToPercents(currentTool.adrDay, currentTool);
          }
        }
        else {
          if (preferredStep != "") {
            _prefStep = currentTool.adrDay;
          }
        }
        
        
        if (inPercent) {
          // Должно быть
          let oldDefaultStep = preferredStep;
          if (inPercent) {
            if (preferredStep != "") {
              oldDefaultStep = stepConverter.fromStepToPercents(prevTool.current.adrDay, prevTool.current);
            }
          }
          else {
            if (preferredStep != "") {
              oldDefaultStep = prevTool.current.adrDay;
            }
          }

          
          if (preferredStep != oldDefaultStep) {
            console.log("custom!", preferredStep, _prefStep, oldDefaultStep);
            _prefStep = oldDefaultStep;
          }
        }


        const obj = {
          preferredStep: _prefStep,
          customData: customData?.map(row => {
            let _prefStep = row.preferredStep;
            if (row.inPercent) {
              if (preferredStep != "") {
                _prefStep = stepConverter.fromStepToPercents(currentTool.adrDay, currentTool);
              }
            }
            else {
              if (preferredStep != "") {
                _prefStep = currentTool.adrDay;
              }
            }

            row.preferredStep = _prefStep
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
      setShouldRegisterUpdate(true);
    }

    // Если комиссия была в дефолтном значении, то ее можно адаптировать под дефолтное значение
    // для нового инструмента
    if (comission == 45 || comission == 1) {
      setComission(currentTool.dollarRate == 0 ? 1 : 45);
    }

    prevTool.current = currentTool;

    setShouldRegisterUpdate(true);

  }, [currentTool.code]);

  useEffect(() => {
    setTools(props.tools?.length ? props.tools : Tools.createArray());
  }, [props.tools]);

  useEffect(() => {
    if (shouldSave) {
      
      onSave && onSave(getPackedSave());
      setShouldSave(false);

    }
  }, [shouldSave]);

  useEffect(() => {
    if (shouldRegisterUpdate) {

      onUpdate && onUpdate(getPackedSave());
  
      setShouldRegisterUpdate(false);
    }
  }, [shouldRegisterUpdate]);

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
                    // Был удален выбранный сейв
                    if (preset.name == currentPresetName) {
                      setCurrentPresetName(presetsCopy[0].name);
                    }

                    setShouldSave(true);
                    setShouldRegisterUpdate(true);
                  }}
                  preset={preset}
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

            <h3 className="settings-generator__title">Генератор настроек МААНИ 144</h3>
            
            <Tooltip title="Закрыть генератор настроек">
              <CrossButton 
                className="settings-generator__close js-dialog-focus-first"
                onClick={e => {
                  if (onClose) {
                    onClose(getPackedSave(), e);
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
                  className="settings-generator-content-header__title"
                  contentEditable={currentPresetIndex > 2}
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
                    setShouldRegisterUpdate(true);
                  }}
                >
                  {currentPresetName}
                </h3>
                <Tooltip title='Скачать файл'>
                  <button 
                    className="round-btn settings-generator-content-header__download"
                    aria-label="Скачать"
                    onClick={e => {
                      const title = currentPreset.name;
                      const content = [...document.querySelector("#settings-generator-code").querySelectorAll(".code-panel-group")]
                        .map(node => [...node.querySelectorAll("[data-should-output]")]
                          .map(node => node.innerText)
                          .join("\n")
                        )
                        .join("\n");
                      
                      onDownload(title, content);
                    }}
                  >
                    <DownloadIcon />
                  </button>
                </Tooltip>
              </div>

              <ul className="settings-generator-content-header-options">
                <li>
                  <Tooltip title="Сохранить текущие настройки">
                    <Button 
                      className="custom-btn"
                      onClick={e => {
                        if (currentPresetIndex < 3) {
                          dialogAPI.open("settings-generator-save-preset-popup", e.target);
                        }
                        else {
                          setShouldSave(true);
                        }
                      }}
                    >
                      Сохранить
                    </Button>
                  </Tooltip>
                </li>
              </ul>

            </div>
            {/* settings-generator-content-header */}

            <div className="settings-generator-content__row settings-generator-content__row--1">

              <div className="settings-generator-content__row-col-half" style={{ alignContent: "space-around" }}>

                <label className="input-group">
                  <span className="input-group__label">Инструмент</span>
                  <Select
                    onFocus={() => onToolSelectFocus && onToolSelectFocus()}
                    onBlur={() => onToolSelectBlur && onToolSelectBlur()}
                    loading={toolsLoading}
                    disabled={toolsLoading}
                    value={toolsLoading && tools.length == 0 ? 0 : currentToolIndex}
                    onChange={index => updateCurrentPresetTool(tools[index].code)}
                    showSearch
                    onSearch={value => setSearchVal(value)}
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
                        sortInputFirst(
                          searchVal,
                          tools.map((tool, idx) => ({
                            idx:   idx,
                            label: String(tool),
                          }))
                        )
                          .map(option => (
                            <Select.Option key={option.idx} value={option.idx} title={option.label}>
                              {option.label}
                            </Select.Option>
                          ))
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
                    onBlur={value => setComission(value)}
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
                      setShouldRegisterUpdate(true);
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
                        min={0}
                        onBlur={secondaryDepo => setSecondaryDepo(secondaryDepo)}
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
                        name={<span>Комиссия</span>}
                        value={
                          Math.round(
                            mainData
                              .map(row => row.comission)
                              .reduce((prev, curr) => prev + curr, 0)
                          )
                        }
                      />
                      <PairJSX
                        name={
                          <Tooltip title="Величина убытка при закрытии позиции по стопу">
                            Убыток (риск)
                          </Tooltip>
                        }
                        value={totalLoss}
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

                {/* 
                  Лев, [24.07.21 21:34]
                  Короче по второму: убираем свитч лонш шорт и считаем по дефолтному го
                */}
                {false &&
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
                }

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

                <div>
                  
                  <label className="input-group">
                    <div className="risk-label-wrap">
                      <span className="input-group__label">Б/У</span>
                      <button className="risk-label__switch"
                              onClick={() => setRanullMode(!ranullMode)}>
                        {ranullMode 
                          ? currentPreset.type == "Лимитник"
                            ? "% от депо"
                            : "п" 
                          : currentPreset.type == "Лимитник"
                            ? "% от ср цены"
                            : "%"
                        }
                      </button>
                    </div>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={ranull}
                      format={formatNumber}
                      unsigned="true"
                      onBlur={ranull => setRanull(ranull)}
                      suffix={currentPreset.type == "Лимитник" ? "%" : ranullMode ? "п" : "%"}
                    />
                  </label>

                  <label className="input-group">
                    <div className="risk-label-wrap">
                      <span className="input-group__label">Смещение Б/У</span>
                      <button className="risk-label__switch"
                              onClick={() => setRanullPlusMode(!ranullPlusMode)}>
                        {ranullPlusMode
                          ? currentPreset.type == "Лимитник"
                            ? "% от депо"
                            : "п"
                          : currentPreset.type == "Лимитник"
                            ? "% от сред. цены"
                            : "%"
                        }
                      </button>
                    </div>
                    <NumericInput
                      className="input-group__input"
                      defaultValue={ranullPlus}
                      format={formatNumber}
                      unsigned="true"
                      onBlur={ranullPlus => setRanullPlus(ranullPlus)}
                      suffix={currentPreset.type == "Лимитник" ? "%" : ranullPlusMode ? "п" : "%"}
                    />
                  </label>

                </div>

                <div>
                  
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
                      disabled={isReversedBying}
                      defaultValue={risk}
                      format={val => formatNumber(round(val, 2))}
                      unsigned="true"
                      onBlur={value => {
                        if (value == round(risk, 2)) {
                          value = risk;
                        }
                        setRisk(value)
                      }}
                      suffix={<Tooltip title="Процент от депозита">%</Tooltip>}
                    />
                  </div>

                  <label className="input-group">
                    <span className="input-group__label visually-hidden">Риск (стоп)</span>
                    <NumericInput
                      className="input-group__input"
                      disabled={isReversedBying}
                      defaultValue={
                        (depoSum * risk / 100)
                        /
                        currentTool.stepPrice
                        *
                        currentTool.priceStep
                        /
                        (contracts || 1)
                      }
                      min={currentTool.priceStep}
                      format={value => formatNumber(filterStep(value))}
                      unsigned="true"
                      onBlur={riskInSteps => {
                        setRisk(
                          riskInSteps
                          *
                          currentTool.stepPrice
                          /
                          currentTool.priceStep
                          *
                          (contracts || 1)
                          /
                          depoSum
                          *
                          100
                        );
                      }}
                      suffix={<Tooltip title="Ход цены от точки входа">$/₽</Tooltip>}
                    />
                  </label>

                  <label className="input-group">
                    <span className="input-group__label visually-hidden">Риск (стоп)</span>
                    <NumericInput
                      className="input-group__input"
                      disabled={isReversedBying}
                      defaultValue={depoSum * risk / 100}
                      format={value => formatNumber(round(value, fraction))}
                      unsigned="true"
                      onBlur={riskInMoney => {
                        setRisk(riskInMoney / depoSum * 100);
                      }}
                      suffix="₽"
                      suffix={<Tooltip title="Сумма риска в рублях">₽</Tooltip>}
                    />
                  </label>

                </div>

                  
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

                <label className="switch-group">
                  <Switch
                    checked={currentPreset.options[initialCurrentTab].shouldResetByings}
                    onChange={shouldResetByings => updatePresetProperty(initialCurrentTab, { shouldResetByings })}
                  />
                  <span className="switch-group__label">Сброс массива закрытия</span>
                </label>                

                {/* В Стандарте нет зеркальных докупок */}
                {["Стандарт"].indexOf(currentPreset.type) == -1 &&
                  <label className="switch-group settings-generator-content__row-header-mirror-switch">
                    <Switch
                      checked={isMirrorBying}
                      onChange={val => setMirrorBying(val)}
                    />
                    <span className="switch-group__label">
                      {currentPreset.type == "Лимитник" 
                        ? "Перевыставление в точку входа"
                        : "Зеркальные докупки (СМС)"
                      }
                    </span>
                  </label>
                }
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

                {isProfitableBying &&
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
                }
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

                {isReversedProfitableBying &&
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
                }
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
                  <span className="switch-group__label">
                    {currentPreset.type == "Лимитник"
                      ? "Докупки"
                      : "Обратные докупки (ТОР)"
                    }
                  </span>
                </label>

                <div style={{ width: '100%' }} hidden={!isReversedBying}>
                  <SGRow
                    isBying={true}
                    currentPreset={currentPreset}
                    currentOption="Обратные докупки (ТОР)"
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
                          hidden={["СМС + ТОР", "Стандарт"].indexOf(currentPreset.type) > -1 || !isMirrorBying}
                          onClick={e => setCurrentTab(e.target.innerText)}>
                    {currentPreset.type == "Лимитник"
                      ? "Перевыставление в точку входа"
                      : "Зеркальные докупки (СМС)"
                    }
                  </Button>

                  <Button className="custom-btn"
                          tabIndex="-1"
                          role="tab"
                          aria-selected="false"
                          aria-controls="settings-generator-tab6"
                          id="settings-generator-tab6-control"
                          hidden={!isReversedBying}
                          onClick={e => setCurrentTab("Обратные докупки (ТОР)")}>
                    {currentPreset.type == "Лимитник"
                      ? "Докупки"
                      : "Обратные докупки (ТОР)"
                    }
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
                           isRiskStatic={isRiskStatic}
                           ranull={ranull}
                           ranullMode={ranullMode}
                           ranullPlus={ranullPlus}
                           ranullPlusMode={ranullPlusMode} />
                
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
          let presetTypeToFind = newPresetName;
          if (newPresetName == "МТС") {
            presetTypeToFind = props.algorithm || presets[0].type;
          }
          
          const presetsCopy = [...presets];
          const presetToCopy = presets.find(preset => preset.type == presetTypeToFind);
          const newPreset = { ...presetToCopy };
          newPreset.name = makeUnique(newPreset.name, presets.map(preset => preset.name));

          if (newPresetName == "МТС") {
            console.log('!!', props);
            
            newPreset.options.currentToolCode = props.currentToolCode;
            setRisk(props.risk);
            setLoad(Math.abs(props.load));
            setIsLong(props.load >= 0);
            setInvestorDepo(props.depo);
          }

          presetsCopy.push(newPreset);
          setPresets(presetsCopy);
          setCurrentPresetName(newPreset.name);

          setShouldSave(true);
          setShouldRegisterUpdate(true);

          return true;
        }}
        hideCancel={true}
      >
        <Select
          defaultValue={newPresetName}
          onChange={name => setNewPresetName(name)}
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

      <SaveModal
        id="settings-generator-save-preset-popup"
        title={`${currentPreset.type} (${currentTool.code})`}
        namesTaken={presets.map(preset => preset.name)}
        onConfirm={name => {

          const presetsCopy = [...presets];
          const presetToCopy = currentPreset;
          if (currentPresetIndex < 3) {
            const newPreset = { ...presetToCopy };
            newPreset.name = makeUnique(name, presets.map(preset => preset.name));
            presetsCopy.push(newPreset);
            setCurrentPresetName(newPreset.name);
            setPresets(presetsCopy);
          }

          setShouldSave(true);
          setShouldRegisterUpdate(true);

          return true;
        }}
      />
    </>
  );
}

export default SettingsGenerator;