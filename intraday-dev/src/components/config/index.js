import React, { memo } from "react";

import { Input } from "antd/es";

import isEqual from "../../utils/is-equal";

import croppString from "../../utils/cropp-string";

import Stack from "../stack";
import CrossButton from "../cross-button";
import NumericInput from "../numeric-input";
import { Dialog, dialogAPI } from "../dialog";

import "./style.scss";

class Config extends React.Component {
  constructor(props) {
    super(props);

    const { customTools } = this.props;

    this.ref = React.createRef();

    this.state = {
      showMax: 30,
      customTools,
      changed: false,
      alertText: "",
      filter: "",
    };
  }

  componentDidMount() {
    document.getElementById(this.ref.current.id);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.customTools, this.props.customTools)) {
      this.setState({ customTools: this.props.customTools });
    }

    if (!isEqual(prevProps.tools, this.props.tools)) {
      this.setState({ tools: this.props.tools });
    }
  }

  render() {
    let { alertText, changed, customTools, filter, showMax } = this.state;
    let {
      id,
      title,
      template,
      tools,
      templateContructor,
      toolsInfo,
      onChange,
      insertBeforeDialog,
    } = this.props;
    insertBeforeDialog = insertBeforeDialog || null;

    const alertId = String(id).concat("-alert");
    const uniqueProp = toolsInfo[0].prop;

    const getAllTools = () => [].concat(tools).concat(customTools);

    const nameExists = (name, tools) => {
      let found = 0;
      for (const tool of tools) {
        if (name === tool[uniqueProp]) {
          found++;
        }
      }

      return found > 1;
    };

    return (
      <div>
        <Dialog
          id={id}
          title={title}
          confirmText="Добавить"
          onConfirm={() => {
            let tool = { ...template };
            if (templateContructor) {
              tool = new templateContructor();
            }

            toolsInfo
              .map((info) => info.prop)
              .map((prop, index) => {
                if (prop === uniqueProp) {
                  const suffix = customTools.length + 1;
                  tool[prop] = `Инструмент ${suffix > 1 ? suffix : ""}`.trim();
                } else {
                  tool[prop] = template[prop];
                }
              });

            while (nameExists(tool[uniqueProp], getAllTools())) {
              const found = tool[uniqueProp].match(/\d+$/g);
              if (found) {
                const end = tool[uniqueProp].match(/\d+$/g)[0];
                tool[uniqueProp] = tool[uniqueProp].replace(
                  end,
                  Number(end) + 1
                );
              } else {
                tool[uniqueProp] += " 2";
              }
            }

            customTools.push(tool);
            this.setState(
              {
                customTools,
                changed: true,
                showMax: Infinity,
              },
              () => {
                const currentDialog = dialogAPI.getCurrentDialog();
                const tableWrap =
                  currentDialog.querySelector(".config-table-wrap");
                tableWrap.scrollTop = 99999;
              }
            );
          }}
          cancelClass={changed ? "custom-btn--filled" : ""}
          cancelText="Сохранить"
          onCancel={() => {
            onChange(customTools);
            this.setState({ changed: false });
            return true;
          }}
          onClose={() => {
            if (changed) {
              this.setState({
                alertText:
                  "Вы уверены, что хотите выйти? Все несохраненные изменения будут потеряны",
              });
              dialogAPI.open(alertId);
            } else {
              return true;
            }
          }}
          ref={this.ref}
        >
          <Stack className="config">
            {/* Самый идиотский костыль, который я когда-либо придумывал */}
            {insertBeforeDialog}

            <Input
              className="config__search"
              placeholder="Фильтр по названию"
              
              onChange={(e) => {
                const filter = e.target.value;
                this.setState({ filter });
              }}

              onKeyDown={e => {
                if (e.keyCode == 13) {
                  document.querySelector(".config__search").blur()
                }

                if (e.keyCode == 27) {
                  document.querySelector(".config__search").blur()
                }
              }}
            />

            <div
              className="config-table-wrap"
              onScroll={(e) => {
                const scrollTopMax =
                  e.target.querySelector("table").offsetHeight -
                  e.target.offsetHeight * 1.5;
                if (
                  e.target.scrollTop > scrollTopMax &&
                  showMax < getAllTools().length
                ) {
                  this.setState({ showMax: showMax + 40 });
                }
              }}
            >
              <table className="table">
                <thead className="table-header">
                  <tr className="table-tr">
                    {toolsInfo
                      .map((info) => info.name)
                      .map((name, index) => (
                        <th
                          key={index}
                          style={{ minWidth: index == 0 ? "14em" : "" }}
                          className="config-th table-th"
                        >
                          {name}
                        </th>
                      ))}
                    {customTools && customTools.length ? (
                      <th className="config-th"></th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="table-body">
                  {tools &&
                    tools
                      .filter(
                        (tool) =>
                          tool
                            .toString()
                            .toLowerCase()
                            .indexOf(filter.toLowerCase()) > -1
                      )
                      .slice(0, showMax)
                      .map((tool, index) => (
                        <tr className="config-tr" key={index}>
                          {toolsInfo
                            .map((info) => info.prop)
                            .map((prop, i) => (
                              <td key={i} className="table-td">
                                {prop == uniqueProp ? (
                                  <span title={tool.toString()}>
                                    {croppString(tool[prop], 27)}
                                  </span>
                                ) : (
                                  tool[prop]
                                )}
                              </td>
                            ))}
                        </tr>
                      ))}
                  {(() => {
                    let onBlur = (val, index, prop) => {
                      // Do nothing if input stays unchanged
                      if (customTools[index][prop] === val) {
                        return;
                      }

                      customTools[index][prop] = val;
                      if (prop === uniqueProp) {
                        while (
                          nameExists(customTools[index][prop], getAllTools())
                        ) {
                          const found = customTools[index][prop].match(/\d+$/g);
                          if (found) {
                            const end =
                              customTools[index][prop].match(/\d+$/g)[0];
                            customTools[index][prop] = customTools[index][
                              prop
                            ].replace(end, Number(end) + 1);
                          } else {
                            customTools[index][prop] += " 2";
                          }
                        }
                      }

                      this.setState({ customTools, changed: true });
                    };

                    return (
                      customTools &&
                      customTools.slice(0, showMax).map((tool, index) => (
                        <tr className="config-tr" key={index}>
                          {toolsInfo
                            .map((info) => info.prop)
                            .map((prop, i) => (
                              <td key={i} className="table-td">
                                {(() => {
                                  const value = tool[prop];
                                  return typeof value == "string" ? (
                                    <Input
                                      key={value + Math.random()}
                                      defaultValue={value}
                                      onKeyDown={(e) => {
                                        if (
                                          [
                                            13, // Enter
                                            27, // Escape
                                          ].indexOf(e.keyCode) > -1
                                        ) {
                                          e.target.blur();
                                        }
                                      }}
                                      onBlur={(e) =>
                                        onBlur(e.target.value, index, prop)
                                      }
                                    />
                                  ) : (
                                    <NumericInput
                                      key={value + Math.random()}
                                      defaultValue={value}
                                      unsigned="true"
                                      min={1}
                                      onBlur={(val) => onBlur(val, index, prop)}
                                    />
                                  );
                                })()}
                              </td>
                            ))}

                          <CrossButton
                            className="config__delete"
                            onClick={(e) => {
                              customTools.splice(index, 1);
                              this.setState({ customTools, changed: true });
                            }}
                          />
                        </tr>
                      ))
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </Stack>
        </Dialog>

        <Dialog
          id={alertId}
          title="Сообщение"
          confirmText="ОК"
          onConfirm={(e) => {
            dialogAPI.close(id);
            return true;
          }}
          cancelText="Отмена"
        >
          {alertText}
        </Dialog>
      </div>
    );
  }
}

export default memo(Config, (prevProps, nextProps) => {
  return (
    isEqual(prevProps.tools, nextProps.tools) &&
    isEqual(prevProps.customTools, nextProps.customTools)
  );
});
