import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";

import Config from "./config";
import NumericInput from "./numeric-input";
import { Dialog, dialogAPI } from "./dialog";
import { template } from "../common/tools";
import formatNumber from "../common/utils/format-number";
import CrossButton from "./cross-button";

import { Row, Col, Radio, Select, Tooltip, Button, Input } from "antd";

import { SettingFilled } from "@ant-design/icons";

const { Option } = Select;

export const PriceMove = () => {
  const {
    adrMode,
    setAdrMode,
    tools,
    customTools,
    investorInfo,
    updateDeposit,
    getIntradaySnapshots,
    getIntradaySnapshot,
    addIntradaySnapshot,
    updateIntradaySnapshot,
    deleteIntradaySnapshot,
  } = useContext(GlobalContext);

  const [saves, setSaves] = useState([]);
  const [currentID, setCurrentID] = useState(null);
  const [currentSaveIndex, setCurrentSaveIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const getTitle = () => {
    let title = "ИП Аналитика";

    if (currentID && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  };

  const loadSnapshot = async () => {
    await getIntradaySnapshots();

    // await getIntradaySnapshot(7);

    // await addIntradaySnapshot({
    //   name: "toolZ",
    //   static: JSON.stringify({ works: true, toolType: "shareUs" }),
    // });

    // await updateIntradaySnapshot({
    //   id: 24,
    //   name: "upd1",
    //   static: JSON.stringify({ works: "yesss", toolType: "shareUs" }),
    // });

    // await deleteIntradaySnapshot(id);

    // await getIntradaySnapshots();
  };

  useEffect(() => {
    getIntradaySnapshots();
  }, []);

  return (
    <section className="price-move">
      <div className="main-top">
        <div className="container">
          <div className="main-top-wrap">
            {(() => {
              // const { saves, currentSaveIndex } = this.state;
              const currentSaveIndex = 0;

              return (
                <label className="labeled-select main-top__select stack-exception">
                  <span className="labeled-select__label labeled-select__label--hidden">
                    Сохраненный калькулятор
                  </span>
                  <Select
                    value={currentSaveIndex}
                    onSelect={(val) => {
                      const { saves } = this.state;

                      this.setState({ currentSaveIndex: val });

                      if (val === 0) {
                        this.reset().catch((err) => console.warn(err));
                      } else {
                        const id = saves[val - 1].id;
                        this.fetchSaveById(id)
                          .then((save) =>
                            this.extractSave(Object.assign(save, { id }))
                          )
                          .catch((err) => this.showAlert(err));
                      }
                    }}
                  >
                    <Option key={0} value={0}>
                      Не выбрано
                    </Option>
                    {saves.map((save, index) => (
                      <Option key={index + 1} value={index + 1}>
                        {save.name}
                      </Option>
                    ))}
                  </Select>
                </label>
              );
            })()}
            <div className="page__title-wrap">
              <h1 className="page__title">ИП Аналитика</h1>
              {false && (
                <div className="page__title-icon-wrap">
                  <CrossButton
                    className="main-top__remove"
                    onClick={(e) => dialogAPI.open("dialog4", e.target)}
                  />
                </div>
              )}
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
                  <Option value="day">Дневной</Option>
                  <Option value="week">Недельный</Option>
                  <Option value="month">Месячный</Option>
                </Select>
              </Col>
            </Row>

            <Row>
              <Col xs={24}>
                <div className="main-top__footer">
                  <Button
                    className="custom-btn custom-btn--secondary main-top__save"
                    onClick={(e) => {
                      // const { saved, changed } = this.state;
                      // if (saved && changed) {
                      //   this.update(this.getTitle());
                      //   this.setState({ changed: false });
                      // } else {
                      dialogAPI.open("dialog1", e.target);
                      // }
                    }}
                  >
                    Сохранить
                    {/* {this.state.saved && !this.state.changed */}
                    {/* ? "Изменить" */}
                    {/* : "Сохранить"} */}
                  </Button>

                  {/* {this.state.saves.length > 0 ? ( */}
                  <a
                    className="custom-btn custom-btn--secondary main-top__save"
                    href="#pure=true"
                    target="_blank"
                  >
                    Добавить новый
                  </a>
                  {/* ) : null} */}
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
              let namesTaken = saves.slice().map((save) => save.name);
              let name = currentID ? getTitle() : "Новое сохранение";

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
                if (!currentID) {
                  if (namesTaken.indexOf(str) > -1) {
                    errors.push(`Сохранение с таким именем уже существует!`);
                  }
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

              let onConfirm = () => {
                let { id, data, currentDay, saves, currentSaveIndex } =
                  this.state;

                if (id) {
                  this.update(name)
                    .then(() => {
                      saves[currentSaveIndex - 1].name = name;
                      this.setState({
                        saves,
                        changed: false,
                      });
                    })
                    .catch((err) => this.showMessageDialog(err));
                } else {
                  const onResolve = (id) => {
                    let index = saves.push({ id, name });
                    console.log(saves);

                    this.setState({
                      data,
                      saves,
                      saved: true,
                      changed: false,
                      currentSaveIndex: index,
                    });
                  };

                  this.save(name)
                    .then(onResolve)
                    .catch((err) => this.showMessageDialog(err));
                }
              };

              let inputJSX = (
                <ValidatedInput
                  label="Название сохранения"
                  validate={validate}
                  defaultValue={name}
                  onChange={(val) => (name = val)}
                  onBlur={() => {}}
                />
              );
              let modalJSX = (
                <Dialog
                  id="dialog1"
                  className="save-modal"
                  title={"Сохранение"}
                  onConfirm={() => {
                    if (validate(name).length) {
                      console.error(validate(name)[0]);
                    } else {
                      onConfirm();
                      return true;
                    }
                  }}
                >
                  {inputJSX}
                </Dialog>
              );

              return modalJSX;
            })()}
            {/* Save Popup */}

            <Dialog
              id="dialog4"
              title="Удаление трейдометра"
              confirmText={"Удалить"}
              onConfirm={() => {
                // const { id } = this.state;
                // this.delete(id)
                //   .then(() => console.log("Deleted!"))
                //   .catch((err) => console.warn(err));
                return true;
              }}
            >
              Вы уверены, что хотите удалить {getTitle()}?
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
