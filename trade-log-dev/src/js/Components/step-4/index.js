import React from 'react'
import { StateContext } from "../../App"
import { cloneDeep } from 'lodash'
import { Button, Checkbox, Input } from 'antd/es';

import "./style.scss"

export default class FourthStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StateContext.Consumer>
        {context => {
          const { state } = context;
          const { data, currentRowIndex } = state;

          const {
            technology,
            customTechnology,
            practiceWorkTasks,
            customPracticeWorkTasks,
          } = data[currentRowIndex];

          return (
            <div className="fourth-step">
              <div className="title">
                Внутренняя проработка
              </div>

              <div className="pactice-container">
                <a className="trade-log-button" target="_blank" href="https://www.youtube.com/c/zmeevtv">
                  Техники внутренней проработки
                </a>
              </div>
              <div className="column-container">
                {/* col */}
                <div className="fourth-step-column">
                  <div className="fourth-step-table">

                    {/* TODO: should be h1-h6 */}
                    <div className="fourth-step-table-title">
                      Технология
                    </div>

                    <div className="fourth-step-table-row-container">

                      {Object.keys(technology).map((taskName, index) => {
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <p>{taskName}</p>
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                checked={technology[taskName]}
                                onChange={e => {
                                  const { checked } = e.target;
                                  const data = cloneDeep(state.data);
                                  data[currentRowIndex].technology[taskName] = checked;
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}

                      {customTechnology.map((task, index) => {
                        const { name, value } = task;
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <Input
                              defaultValue={name}
                              onBlur={e => {
                                const { value } = e.target;
                                const data = cloneDeep(state.data);
                                let i = data[currentRowIndex].customTechnology.findIndex(task => task.name == name);
                                if (i === -1) {
                                  console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customTechnology);
                                  i = index;
                                }
                                data[currentRowIndex].customTechnology[i].name = value;
                                context.setState({ data });
                              }}
                            />
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                checked={value}
                                onChange={e => {
                                  const { checked } = e.target;
                                  const data = cloneDeep(state.data);
                                  let i = data[currentRowIndex].customTechnology.findIndex(task => task.name == name);
                                  if (i === -1) {
                                    console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customTechnology);
                                    i = index;
                                  }
                                  data[currentRowIndex].customTechnology[i].value = checked;
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}

                    </div>
                  </div>
                  <div className="fourth-step-add-button-container">
                    <Button
                      className="trade-log-button"
                      onClick={() => {
                        const data = cloneDeep(state.data);
                        const customTechnology = cloneDeep(data[currentRowIndex].customTechnology);
                        customTechnology.push({
                          name: "Новая технология " + (customTechnology.length + 1),
                          value: false
                        });
                        data[currentRowIndex].customTechnology = customTechnology;
                        context.setState({ data });
                      }}
                    >
                      Добавить техноголию
                    </Button>

                    <Button
                      className="trade-log-button"
                      disabled={customTechnology.length === 0}
                      onClick={() => {
                        const data = cloneDeep(state.data);
                        const customTechnology = cloneDeep(data[currentRowIndex].customTechnology);
                        customTechnology.splice(customTechnology.length - 1, 1)
                        data[currentRowIndex].customTechnology = customTechnology;
                        context.setState({ data });
                      }}
                    >
                      Удалить техноголию
                    </Button>
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="fourth-step-column">
                  <div className="fourth-step-table">
                    {/* TODO: should be h1-h6 */}
                    <div className="fourth-step-table-title">
                      Практические задачи на отработку
                    </div>
                    
                    <div className="fourth-step-table-row-container">
                      {Object.keys(practiceWorkTasks).map((taskName, index) => {
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <p>{taskName}</p>
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                checked={practiceWorkTasks[taskName]}
                                onChange={e => {
                                  const { checked } = e.target;
                                  const data = cloneDeep(state.data);
                                  data[currentRowIndex].practiceWorkTasks[taskName] = checked;
                                  context.setState({ data });
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}

                      {customPracticeWorkTasks.map((task, index) => {
                        const { name, value } = task;
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <Input
                              defaultValue={name}
                              onBlur={e => {
                                const { value } = e.target;
                                const data = cloneDeep(state.data);
                                const i = data[currentRowIndex].customPracticeWorkTasks.findIndex(task => task.name == name);
                                if (i !== -1) {
                                  data[currentRowIndex].customPracticeWorkTasks[i].value = value;
                                  context.setState({ data });
                                }
                                else {
                                  console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customPracticeWorkTasks);
                                }
                              }}
                            />
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                className="green"
                                checked={value}
                                onChange={e => {
                                  const { checked } = e.target;
                                  const data = cloneDeep(state.data);
                                  const i = data[currentRowIndex].customPracticeWorkTasks.findIndex(task => task.name == name);
                                  if (i !== -1) {
                                    data[currentRowIndex].customPracticeWorkTasks[i].value = checked;
                                    context.setState({ data });
                                  }
                                  else {
                                    console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customPracticeWorkTasks);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="fourth-step-add-button-container">
                    <Button
                      className="trade-log-button"
                      onClick={() => {
                        const data = cloneDeep(state.data);
                        const customPracticeWorkTasks = cloneDeep(data[currentRowIndex].customPracticeWorkTasks);
                        customPracticeWorkTasks.push({
                          name:  "Новая задача " +  (customPracticeWorkTasks.length + 1),
                          value: false
                        });
                        data[currentRowIndex].customPracticeWorkTasks = customPracticeWorkTasks;
                        context.setState({ data });
                      }}
                    >
                      Добавить задачу
                    </Button>

                    <Button
                      className="trade-log-button"
                      disabled={customPracticeWorkTasks.length === 0}
                      onClick={() => {
                        const data = cloneDeep(state.data);
                        const customPracticeWorkTasks = cloneDeep(data[currentRowIndex].customPracticeWorkTasks);
                        customPracticeWorkTasks.splice(customPracticeWorkTasks.length - 1 ,1)
                        data[currentRowIndex].customPracticeWorkTasks = customPracticeWorkTasks;
                        context.setState({ data });
                      }}
                    >
                      Удалить задачу
                    </Button>
                  </div>
                </div>
                {/* col */}
              </div>
            </div>
          )
        }}
      </StateContext.Consumer>
    )
  }
}


