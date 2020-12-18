import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import {
  Button, Input, Select, Slider, Switch, Tooltip, Tabs
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

import formatNumber from '../../../../../common/utils/format-number'

import "./style.scss"

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

  // componentDidMount
  useEffect(() => {
    createTabs();
  }, []);

  useEffect(() => {

    setDepo(Math.floor(investorDepo * .25));
    setSecondaryDepo(Math.floor(investorDepo * .75));

  }, [investorDepo])

  const [comission, setComission] = useState(0);
  const [load, setLoad] = useState(props.load || 0);

  const tools = props.tools || [ Tools.create() ];
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const currentTool = tools[currentToolIndex];

  // Add popup
  const [newPresetName, setNewPresetName] = useState("МТС");
  const [currentPresetName, setCurrentPresetName] = useState("Стандарт");

  // Flags
  const [mirrorOn, setMirrorOn] = useState(false);
  const [reversedOn, setReversedOn] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const depoAvailable = investorDepo * (load / 100);

  const [presets, setPresets] = useState([
    { name: "Стандарт" },
    { name: "СМС + ТОР" },
    { name: "Лимитник" }
  ]);

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
                  const PairJSX = (props) => {
                    return (
                      <div className="settings-generator-content__pair">
                        <span className="settings-generator-content__pair-key">{props.name}</span>
                        <span className="settings-generator-content__pair-val">
                          {formatNumber(props.value)}
                        </span>
                      </div>
                    )
                  };

                  let contractsTotal = 0;
                  if (currentTool) {
                    contractsTotal = Math.floor( investorDepo / currentTool.guarantee );
                  }

                  let contracts = 0;
                  if (currentTool) {
                    contracts = Math.floor( depoAvailable / currentTool.guarantee );
                    if (depo < depoAvailable) {
                      contracts = contracts + " " + `
                        (
                        ${Math.floor( depo / currentTool.guarantee )}
                        /
                        ${Math.floor( (depoAvailable - depo) / currentTool.guarantee )}
                        )
                      `.replace(/\s+/g, "");
                    }
                   }

                  return (
                    <>
                      <PairJSX 
                        name="Контрактов max."
                        value={contractsTotal}
                      />
                      <PairJSX 
                        name="Прибыль"
                        value={9999}
                      />
                      <PairJSX 
                        name={"Контракты" + (hasExtraDepo ? " (осн./плеч.)" : "")}
                        value={contracts}
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
                  <span className="input-group__label">Желаемый ход</span>
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

            <div hidden={false}>
              <h3 className="settings-generator-content__row-header">Закрытие основного депозита</h3>

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
              <span className="switch-group__label">Зеркальные докупки</span>
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
              <span className="switch-group__label">Обратные докупки</span>
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
                    Зеркальные докупки
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
                
                <div className="settings-generator-table">
                  {[1, 2, 3].map((value, index) =>
                    <table className="settings-generator-table__row">
                      <tr className="settings-generator-table__row-header">
                        <th>№</th>
                        <th>
                          % закрытия/<br />
                          докупки
                        </th>
                        <th>
                          Ход в<br />
                          пунктах
                        </th>
                        <th>
                          Кол-во закрытых/<br />
                          докупленных контрактов
                        </th>
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
                          data-label="% закрытия/докупки"
                          data-label-xs="% закр./докупки"
                        >
                          4.9
                        </td>
                        <td 
                          data-label="Ход в пунктах"
                          data-label-xs="Ход в пунктах"
                        >
                          15
                        </td>
                        <td 
                          data-label="Закрытых/докупленных контрактов"
                          data-label-xs="Закр./докупл. контр."
                        >
                          225
                        </td>
                        <td 
                          data-label="Контрактов в работе"
                          data-label-xs="Контр. в раб."
                        >
                          102
                        </td>
                        <td 
                          data-label="Прибыль без комиссии"
                          data-label-xs="Приб. без комиссии"
                        >
                          1 029 471
                        </td>
                        <td 
                          data-label="Величина комиссии"
                          data-label-xs="Комиссия"
                        >
                          6%
                        </td>
                        <td 
                          data-label="Накопленная прибыль с учетом комиссии"
                          data-label-xs="Приб. с уч. комисии"
                        >
                          967 702
                        </td>
                      </tr>
                      {/* table-row-header */}
                    </table>
                  )}

                </div>
                {/* table */}

              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab2"
                   aria-labelledby="settings-generator-tab2-control"
                   hidden>
                <p>
                  Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining classical and electronic music and for an unconventional approach to the piano in which he mixes a grand piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
                </p>
              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab3"
                   aria-labelledby="settings-generator-tab3-control"
                   hidden>
                <p>
                  Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining classical and electronic music and for an unconventional approach to the piano in which he mixes a grand piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
                </p>
              </div>
              {/* tabpanel */}

              <div tabIndex="0"
                   role="tabpanel"
                   id="settings-generator-tab4"
                   aria-labelledby="settings-generator-tab4-control"
                   hidden>
                <p>
                  Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining classical and electronic music and for an unconventional approach to the piano in which he mixes a grand piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
                </p>
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

          presetsCopy.push({ name });
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
