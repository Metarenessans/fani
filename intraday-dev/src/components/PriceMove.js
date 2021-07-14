import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";

import axios from "axios";

import Config from "./config";
import NumericInput from "./numeric-input";
import { Dialog, dialogAPI } from "./dialog";
import { template } from "../common/tools";
import formatNumber from "../common/utils/format-number";
import CrossButton from "./cross-button";

import { Row, Col, Radio, Select, Tooltip, Button, Input } from "antd";

import { SettingFilled, LoadingOutlined } from "@ant-design/icons";

export const PriceMove = () => {
  const {
    setInitialState,
    loading,
    currentSaveIdx,
    setCurrentSaveIdx,
    getSaves,
    snapshotIsChanged,
    snapshotIsSaved,
    addSave,
    updateSave,
    deleteSave,
    saves,
    loadTables,
    adrMode,
    setAdrMode,
    tools,
    customTools,
    investorInfo,
    updateDeposit,
  } = useContext(GlobalContext);

  useEffect(() => {
    getSaves();
  }, []);

  useEffect(() => {
    console.log("currentSaveIdx:", currentSaveIdx);
  }, [currentSaveIdx]);

  useEffect(() => {
    console.log("loading:", loading);
  }, [loading]);

  useEffect(() => {
    console.log("snapshotIsSaved:", snapshotIsSaved);
  }, [snapshotIsSaved]);

  useEffect(() => {
    console.log("snapshotIsChanged:", snapshotIsChanged);
  }, [snapshotIsChanged]);

  const [snapshotData, setSnapshotData] = useState({ adrMode, loadTables });
  const [errorMessage, setErrorMessage] = useState(null);

  const pageTitle = () => {
    let title = "ИП Аналитика";

    if (!loading && saves[currentSaveIdx - 1]) {
      title = saves[currentSaveIdx - 1].name;
    }

    return title;
  };

  const getSave = async (id) => {
    try {
      const res = await axios.get(
        `https://fani144.ru/local/php_interface/s1/ajax/?method=getIntradaySnapshot&id=${id}`
      );
      return res.data.data;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="price-move">
      <div className="main-top">
        <div className="container">
          <div className="main-top-wrap">
            {(() => {
              return (
                <label className="labeled-select main-top__select stack-exception">
                  <span className="labeled-select__label labeled-select__label--hidden">
                    Сохраненный калькулятор
                  </span>

                  <Select
                    disabled={loading}
                    loading={loading}
                    value={currentSaveIdx}
                    onSelect={(val) => {
                      setCurrentSaveIdx(val);
                    }}
                  >
                    <Select.Option key={0} value={0}>
                      {loading ? "Загрузка..." : "Не выбрано"}
                    </Select.Option>
                    {saves.map((save, index) => (
                      <Select.Option key={index + 1} value={index + 1}>
                        {save.name}
                      </Select.Option>
                    ))}
                  </Select>
                </label>
              );
            })()}
            <div className="page__title-wrap">
              <h1 className="page__title">{pageTitle()}</h1>
              <div className="page__title-icon-wrap">
                {loading ? (
                  <LoadingOutlined />
                ) : currentSaveIdx !== 0 ? (
                  <CrossButton
                    className="main-top__remove"
                    onClick={(e) => dialogAPI.open("dialog4", e.target)}
                  />
                ) : null}
              </div>
            </div>
            <Row>
              <Col md={24} xs={0}>
                <Radio.Group
                  className="tabs"
                  value={adrMode}
                  name="radiogroup"
                  onChange={(e) => setAdrMode(e.target.value)}
                >
                  <Radio className="selector" value="day">
                    Дневной
                    <span className="prefix">ход цены</span>
                  </Radio>
                  <Radio className="selector middle" value="week">
                    Недельный
                    <span className="prefix">ход цены</span>
                  </Radio>
                  <Radio className="selector" value="month">
                    Месячный
                    <span className="prefix">ход цены</span>
                  </Radio>
                </Radio.Group>
              </Col>

              <Col xs={24} md={0}>
                <Select
                  style={{ width: "100%" }}
                  value={adrMode}
                  onChange={(mode) => setAdrMode(mode)}
                >
                  <Select.Option value="day">Дневной</Select.Option>
                  <Select.Option value="week">Недельный</Select.Option>
                  <Select.Option value="month">Месячный</Select.Option>
                </Select>
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <div className="main-top__footer">
                  <Button
                    className="custom-btn custom-btn--secondary main-top__save"
                    onClick={(e) => {
                      if (
                        saves.length &&
                        snapshotIsSaved &&
                        snapshotIsChanged
                      ) {
                        let save = saves[currentSaveIdx - 1];
                        updateSave({
                          id: save.id,
                          name: save.name,
                          static: JSON.stringify(snapshotData),
                        });
                      } else {
                        dialogAPI.open("dialog1", e.target);
                      }
                    }}
                  >
                    {saves.length !== 0 && snapshotIsSaved && !snapshotIsChanged
                      ? "Изменить"
                      : "Сохранить"}
                  </Button>

                  {saves.length > 0 ? (
                    <a
                      className="custom-btn custom-btn--secondary main-top__save"
                      href="#pure=true"
                      target="_blank"
                    >
                      Добавить новый
                    </a>
                  ) : null}
                </div>

                <Tooltip
                  title="Настройки"
                  overlayStyle={{ fontSize: "1.25em" }}
                >
                  <button
                    className="settings-button js-open-modal main-top__settings"
                    onClick={(e) => dialogAPI.open("config", e.target)}
                  >
                    <span className="visually-hidden">Открыть конфиг</span>
                    <SettingFilled className="settings-button__icon" />
                  </button>
                </Tooltip>
              </Col>
            </Row>

            {(() => {
              let namesTaken = saves.map((save) => save.name);
              let currentName = currentSaveIdx
                ? pageTitle()
                : "Новое сохранение";

              function validate(str = "") {
                str = str.trim();

                let errors = [];

                let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(
                  str
                );
                if (str.length < 3) {
                  errors.push("Имя должно содержать не меньше трех символов!");
                } else if (test) {
                  errors.push(`Нельзя использовать символ "${test[0]}"!`);
                }
                if (namesTaken.indexOf(str) > -1) {
                  errors.push(`Сохранение с таким именем уже существует!`);
                }

                return errors;
              }

              class ValidatedInput extends React.Component {
                constructor(props) {
                  super(props);

                  let { defaultValue } = props;

                  this.state = {
                    error: "",
                    value: defaultValue || "",
                  };
                }

                vibeCheck() {
                  const { validate } = this.props;
                  let { value } = this.state;

                  let errors = validate(value);
                  this.setState({ error: errors.length > 0 ? errors[0] : "" });
                  return errors;
                }

                render() {
                  const { validate, label } = this.props;
                  const { value, error } = this.state;

                  return (
                    <label className="save-modal__input-wrap">
                      {label ? (
                        <span className="save-modal__input-label">{label}</span>
                      ) : null}
                      <Input
                        className={["save-modal__input"]
                          .concat(error ? "error" : "")
                          .join(" ")
                          .trim()}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        value={value}
                        maxLength={20}
                        onChange={(e) => {
                          let { value } = e.target;
                          let { onChange } = this.props;

                          this.setState({ value });

                          if (onChange) {
                            onChange(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Enter
                          if (e.keyCode === 13) {
                            let { value } = e.target;
                            let { onBlur } = this.props;

                            let errors = validate(value);
                            if (errors.length === 0) {
                              if (onBlur) {
                                onBlur(value);
                              }
                            }

                            this.setState({
                              error: errors.length > 0 ? errors[0] : "",
                            });
                          }
                        }}
                        onBlur={() => {
                          this.vibeCheck();
                        }}
                      />

                      <span
                        className={["save-modal__error"]
                          .concat(error ? "visible" : "")
                          .join(" ")
                          .trim()}
                      >
                        {error}
                      </span>
                    </label>
                  );
                }
              }

              return (
                <Dialog
                  id="dialog1"
                  className="save-modal"
                  title={"Сохранение"}
                  onConfirm={() => {
                    if (validate(currentName).length) {
                      console.error(validate(currentName)[0]);
                    } else {
                      // Ход цены
                      // итераций
                      // стоп
                      // доходность
                      // шаг доходности
                      // направление (лонг/шорт)
                      // загрузка(и)
                      // инструмент(ы)
                      // депозит из настроек
                      // кастомные инструменты, если есть

                      if (!snapshotIsSaved && snapshotIsChanged) {
                        let save = saves[currentSaveIdx - 1];
                        updateSave({
                          id: save.id,
                          name: currentName,
                          static: JSON.stringify(snapshotData),
                        });
                      } else {
                        addSave({
                          name: currentName,
                          static: JSON.stringify(snapshotData),
                        });
                      }
                      return true;
                    }
                  }}
                >
                  <ValidatedInput
                    label="Название сохранения"
                    validate={validate}
                    defaultValue={currentName}
                    onChange={(val) => (currentName = val)}
                    onBlur={() => {
                      console.log("blur");
                    }}
                  />
                </Dialog>
              );
            })()}
            {/* Save Popup */}

            <Dialog
              id="dialog4"
              title="Удаление трейдометра"
              confirmText={"Удалить"}
              onConfirm={() => {
                deleteSave(saves[currentSaveIdx - 1].id);
                return true;
              }}
            >
              Вы уверены, что хотите удалить {pageTitle()}?
            </Dialog>
            {/* Delete Popup */}

            <Config
              id="config"
              title="Инструменты"
              template={template}
              tools={tools}
              toolsInfo={[
                { name: "Инструмент", prop: "name" },
                { name: "Код", prop: "code" },
                { name: "Цена шага", prop: "stepPrice" },
                { name: "Шаг цены", prop: "priceStep" },
                { name: "ГО", prop: "guarantee" },
                { name: "Текущая цена", prop: "currentPrice" },
                { name: "Размер лота", prop: "lotSize" },
                { name: "Курс доллара", prop: "dollarRate" },
                { name: "ADR", prop: "adrDay" },
                { name: "ADR неделя", prop: "adrWeek" },
                { name: "ADR месяц", prop: "adrMonth" },
              ]}
              customTools={customTools}
              onChange={(customTools) => {
                // this.setState({ customTools })
              }}
              insertBeforeDialog={
                <label className="input-group input-group--fluid ksd-config__depo">
                  <span className="input-group__label">Размер депозита:</span>
                  <NumericInput
                    className="input-group__input"
                    defaultValue={investorInfo.deposit}
                    format={formatNumber}
                    min={10000}
                    max={Infinity}
                    onBlur={(val) => {
                      updateDeposit(val);
                    }}
                  />
                </label>
              }
            />

            {(() => {
              return (
                <Dialog
                  id="dialog-msg"
                  title="Сообщение"
                  hideConfirm={true}
                  cancelText="ОК"
                >
                  {errorMessage}
                </Dialog>
              );
            })()}
            {/* Error Popup */}
          </div>
        </div>
      </div>
    </section>
  );
};
