import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Tooltip } from 'antd/es'

import croppString  from "../../utils/cropp-string"

import { Tools } from "../../tools"
import Stack        from "../stack"
import NumericInput from "../numeric-input"
import { Dialog, dialogAPI } from "../dialog"

import "./style.scss"

export default class Config extends React.Component {

  constructor(props) {
    super(props);

    const { customTools } = this.props;

    this.state = {
      customTools,
      changed:   false,
      alertText: "",
      filter:    ""
    };
  }

  componentDidMount() {

  }

  render() {
    let { alertText, changed, customTools, filter } = this.state;
    let { id, title, template, tools, currentToolIndex, toolsInfo, onChange } = this.props;

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
            let tool = Tools.create({});
            toolsInfo
              .map(info => info.prop)
              .map((prop, index) => {
                tool[prop] = template[prop];
                if (index === 0) {
                  const suffix = customTools.length + 1;
                  tool[prop] = `Инструмент ${suffix > 1 ? suffix : ""}`.trim();
                }
              });

            while (nameExists(tool[uniqueProp], getAllTools())) {
              const end = tool[uniqueProp].match(/\d+$/g)[0];
              tool[uniqueProp] = tool[uniqueProp].replace(end, Number(end) + 1);
            }

            customTools.push(tool);
            this.setState({ customTools, changed: true }, () => {
              const currentDialog = dialogAPI.getCurrentDialog();
              const tableWrap = currentDialog.querySelector(".config-table-wrap");
              tableWrap.scrollTop = 99999;
            });
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
              this.setState({ alertText: "Вы уверены, что хотите выйти? Все несохраненные изменения будут потеряны" });
              dialogAPI.open(alertId);
            }
            else {
              return true;
            }
          }}
        >
          <Stack className="config">
            <Input
              className="config__search"
              placeholder="Фильтр по названию"
              onChange={e => {
                const filter = e.target.value;
                this.setState({ filter });
              }} />

            <div className={
              ["config-table-wrap"]
                // .concat(customTools.length ? "extended" : "")
                .join(" ")
                .trim()
            }>
              {(() => {
                return (
                  <table className="table">
                    <thead className="table-header">
                      <tr className="table-tr">
                        {
                          toolsInfo
                            .map(info => info.name)
                            .map((name, index) => 
                              <th className="config-th table-th" style={{ width: index == 0 ? "5%" : "1%" }}>{name}</th>
                              )
                            }
                        {customTools && customTools.length ? (
                          <th style={{ width: "1%" }}></th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {
                        tools && tools
                          .filter(tool => tool.toString().toLowerCase().indexOf(filter.toLowerCase()) > -1)
                          .map((tool, index) =>
                            <tr className="config-tr" key={index}>
                              {
                                toolsInfo
                                  .map(info => info.prop)
                                  .map((prop, i) =>
                                    <td
                                      key={i}
                                      className="table-td"
                                    >
                                      {prop == uniqueProp 
                                        ? croppString(tool.toString(), 30) 
                                        : tool[prop]
                                      }
                                    </td>
                                  )
                              }
                            </tr>
                          )
                      }
                      {(() => {
                        let onBlur = (val, index, prop) => {
                          // Do nothing if input stays unchanged
                          if (customTools[index][prop] === val) {
                            return;
                          }

                          customTools[index][prop] = val;
                          if (prop === uniqueProp) {
                            while (nameExists(customTools[index][prop], getAllTools())) {
                              const found = customTools[index][prop].match(/\d+$/g);
                              if (found) {
                                const end = customTools[index][prop].match(/\d+$/g)[0];
                                customTools[index][prop] = customTools[index][prop].replace(end, Number(end) + 1);
                              }
                              else {
                                customTools[index][prop] += " 2";
                              }
                            }
                          }

                          this.setState({ customTools, changed: true });
                        };

                        return customTools && customTools.map((tool, index) =>
                          <tr className="config-tr" key={index}>
                            {
                              toolsInfo
                                .map(info => info.prop)
                                .map((prop, i) =>
                                  <td
                                    key={i}
                                    className="table-td"
                                  >
                                    {(() => {
                                      const value = tool[prop] != null ? tool[prop] : tool.getSortProperty();
                                      return (
                                        i == 0 ? (
                                          <Input
                                            key={value + Math.random()}
                                            defaultValue={value}
                                            onKeyDown={e => {
                                              if (
                                                [
                                                  13, // Enter
                                                  27  // Escape
                                                ].indexOf(e.keyCode) > -1
                                              ) {
                                                e.target.blur();
                                              }
                                            }}
                                            onBlur={e => onBlur(e.target.value, index, prop)}
                                          />
                                        )
                                        : (
                                          <NumericInput
                                            key={value + Math.random()}
                                            defaultValue={value}
                                            onBlur={val => onBlur(val, index, prop)}
                                          />
                                        )
                                      )
                                    })()}
                                  </td>
                                )
                            }

                            <Tooltip title="Удалить">
                              <button
                                className="config__delete cross-button"
                                aria-label="Удалить"
                                onClick={() => {
                                  // if (index == currentToolIndex) {
                                  //   this.setState({ alertText: "Вы уверены, что хотите удалить выбранный инструмент?" });
                                  //   dialogAPI.open(alertId);
                                  // }
                                  customTools.splice(index, 1);
                                  this.setState({ customTools, changed: true });
                                }}>
                                <span>&times;</span>
                              </button>
                            </Tooltip>
                          </tr>
                        )
                      })()}
                    </tbody>
                  </table>
                )
              })()}
            </div>
          </Stack>
        </Dialog>

        <Dialog
          id={alertId}
          title="Сообщение"
          confirmText="ОК"
          onConfirm={e => {
            dialogAPI.close(id);
            return true;
          }}
          cancelText="Отмена"
        >
          {alertText}
        </Dialog>
      </div>
    )
  }
}
