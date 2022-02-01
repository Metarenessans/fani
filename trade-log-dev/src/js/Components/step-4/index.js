import React from "react";
import { StateContext } from "../../App";
import { cloneDeep } from "lodash";
import { Button, Checkbox, Input } from "antd/es";

import parseTasks from "../stats/tasks/parse-tasks";

import "./style.scss";

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
            readyWorkTasks,
            customPracticeWorkTasks
          } = data[currentRowIndex];

          return (
            <div className="fourth-step">
              <div className="title">
                Внутренняя проработка
              </div>

              <div className="pactice-container">
                <a className="trade-log-button" target="_blank" href="https://www.youtube.com/c/zmeevtv" rel="noreferrer">
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
                                key={currentRowIndex}
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
                        );
                      })}

                      {customTechnology.map((task, index) => {
                        const { name, value } = task;
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <Input
                              key={currentRowIndex}
                              defaultValue={typeof name === "object"
                                ? `Новая задача ${index + 1}`
                                : name
                              }
                              onBlur={e => {
                                const { value } = e.target;
                                let i = data[currentRowIndex].customTechnology.findIndex(task => task.name == name);
                                if (i === -1) {
                                  console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customTechnology);
                                  i = index;
                                }
                                const oldName = data[currentRowIndex].customTechnology[i].name;
                                data[currentRowIndex].customTechnology[i].name = value;

                                // Меняем ключ в массиве готовых задачу
                                for (let day of data) {
                                  const customTask = day.customTechnology.find(task => task.name == oldName);
                                  if (customTask) {
                                    customTask.name = value;
                                  }
                                }

                                context.setState({ data });
                              }}
                            />
                            {/* <Input
                              key={currentRowIndex}
                              // В старых сейвах в name может лежать объект
                              defaultValue={typeof name === "object" 
                                ? `Новая технология ${index + 1}`
                                : name
                              }
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
                            /> */}
                            <div className="fourth-step-table-check-box">
                              <Checkbox
                                key={currentRowIndex}
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
                        );
                      })}

                    </div>
                  </div>
                  <div className="fourth-step-add-button-container">
                    <Button
                      className="trade-log-button"
                      onClick={() => {
                        const data = cloneDeep(state.data).map((item, index) => {
                          item.customTechnology.push({
                            name: "Новая технология " + (customTechnology.length + 1),
                            value: false
                          });
                          return item;
                        });
                        context.setState({ data });
                      }}
                    >
                      Добавить технологию
                    </Button>


                    <Button
                      className="trade-log-button"
                      disabled={customTechnology.length === 0}
                      onClick={() => {
                        const data = cloneDeep(state.data);
                        const certaincustomTechnology = cloneDeep(data[currentRowIndex].customTechnology);
                        const name = cloneDeep(data[currentRowIndex].customTechnology[certaincustomTechnology.length - 1].name);


                        let newData = data.map(day => {
                          day.customTechnology = day.customTechnology.filter(item => item.name !== name);
                          return day;
                        });

                        context.setState({ data: newData });
                      }}
                    >
                      Удалить задачу
                    </Button>
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="fourth-step-column">
                  <div className="fourth-step-table">
                    {/* TODO: should be h1-h6 */}
                    <div className="fourth-step-table-title fourth-step-table-title--practice">
                      <p className="fourth-step-table-title--practice-title">
                        Практические задачи на отработку  
                      </p>
                      <div className="fourth-step-table-title--ready">
                        <p>
                          Готово
                        </p>
                      </div>
                    </div>
                    
                    <div className="fourth-step-table-row-container">
                      {Object.keys(practiceWorkTasks).map((taskName, index) => {
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <p>{taskName}</p>
                            <div className="fourth-step-table-check-box fourth-step-table-check-box--practice">
                              <div className="fourth-step-table-check-box fourth-step-table-check-box--practice-container">
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

                              <div className="fourth-step-table-check-box fourth-step-table-check-box--practice-container">
                                <Checkbox
                                  className="green"
                                  // Дизейблит чекбокс, если задача не была выбрана на отработку
                                  disabled={!practiceWorkTasks[taskName]}
                                  checked={readyWorkTasks[taskName]}
                                  onChange={e => {
                                    const readyWorkTasksCheckTime = cloneDeep(state.readyWorkTasksCheckTime);

                                    const { checked } = e.target;
                                    const data = cloneDeep(state.data);
                                    data[currentRowIndex].readyWorkTasks[taskName] = checked;

                                    const tasks = parseTasks(data);
                                    if (tasks[taskName]?.done === tasks[taskName]?.checked) {
                                      readyWorkTasksCheckTime[taskName] = Number(new Date());
                                    }

                                    context.setState({ data, readyWorkTasksCheckTime });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {customPracticeWorkTasks.map((task, index) => {
                        const { name, value } = task;
                        return (
                          <div className="fourth-step-table-row-container-row" key={index}>
                            <Input
                              key={currentRowIndex}
                              defaultValue={typeof name === "object"
                                ? `Новая задача ${index + 1}`
                                : name
                              }
                              onBlur={e => {
                                const { value } = e.target;
                                let i = data[currentRowIndex].customPracticeWorkTasks.findIndex(task => task.name == name);
                                if (i === -1) {
                                  console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customPracticeWorkTasks);
                                  i = index;
                                }
                                const oldName = data[currentRowIndex].customPracticeWorkTasks[i].name;
                                data[currentRowIndex].customPracticeWorkTasks[i].name = value;

                                // Меняем ключ в массиве готовых задачу
                                for (let day of data) {
                                  const customTask = day.customPracticeWorkTasks.find(task => task.name == oldName);
                                  if (customTask) {
                                    customTask.name = value;
                                  }

                                  const checked = day.readyCustomPracticeWorkTasks[oldName];
                                  delete day.readyCustomPracticeWorkTasks[oldName];
                                  day.readyCustomPracticeWorkTasks[value] = checked;
                                }

                                context.setState({ data });
                              }}
                            />
                            <div className="fourth-step-table-check-box fourth-step-table-check-box--practice">
                              <div className="fourth-step-table-check-box fourth-step-table-check-box--practice-container">
                                <Checkbox
                                  key={currentRowIndex}
                                  className="green"
                                  checked={value}
                                  onChange={e => {
                                    const { checked } = e.target;
                                    let i = data[currentRowIndex].customPracticeWorkTasks.findIndex(task => task.name == name);
                                    if (i === -1) {
                                      console.warn(`Не удлось найти '${name}' среди`, data[currentRowIndex].customPracticeWorkTasks);
                                      i = index;
                                    }
                                    data[currentRowIndex].customPracticeWorkTasks[i].value = checked;
                                    context.setState({ data });
                                  }}
                                />
                              </div>

                              <div className="fourth-step-table-check-box fourth-step-table-check-box--practice-container">
                                <Checkbox
                                  key={currentRowIndex}
                                  className="green"
                                  checked={data[currentRowIndex].readyCustomPracticeWorkTasks[name]}
                                  onChange={e => {
                                    const { checked } = e.target;
                                    data[currentRowIndex].readyCustomPracticeWorkTasks[name] = checked;
                                    context.setState({ data });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="fourth-step-add-button-container">
                    <Button
                      className="trade-log-button"
                      onClick={() => {
                        const cloneData = cloneDeep(data);

                        cloneData.map((item, index) => {
                          cloneData[index].customPracticeWorkTasks.push({
                            name: "Новая задача " + (customPracticeWorkTasks.length + 1),
                            value: false
                          });
                        });
                        context.setState({ data: cloneData });
                      }}
                    >
                      Добавить задачу
                    </Button>

                    <Button
                      className="trade-log-button"
                      disabled={customPracticeWorkTasks.length === 0}
                      onClick={() => {
                        const data = cloneDeep(state.data);
                        const certainCustomPracticeWorkTasks = cloneDeep(data[currentRowIndex].customPracticeWorkTasks);
                        const name = cloneDeep(data[currentRowIndex].customPracticeWorkTasks[certainCustomPracticeWorkTasks.length - 1].name);
                        

                        let newData = data.map(day => {
                          day.customPracticeWorkTasks = day.customPracticeWorkTasks.filter(item => item.name !== name);
                          return day;
                        });

                        context.setState({ data: newData });
                      }}
                    >
                      Удалить задачу
                    </Button>
                  </div>
                </div>
                {/* col */}
              </div>
            </div>
          );
        }}
      </StateContext.Consumer>
    );
  }
}


