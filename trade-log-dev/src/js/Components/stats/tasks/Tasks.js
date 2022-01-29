import React, { useContext, useState, useEffect, useRef } from "react";
import { Progress, Checkbox, Button } from "antd";
import _, { isEqual, cloneDeep } from "lodash";
import Panel from "../../panel";
import { StateContext } from "../../../App";

import parseTasks from "./parse-tasks";

import "./Tasks.scss";

export default function Tasks() {

  const context = useContext(StateContext);
  const { state } = context;
  const { data, readyWorkTasksCheckTime } = state;

  const tasks = parseTasks(data);
  // Количество зачеканных задач на отработку во всех днях
  let tasksCount = tasks.count;
  
  const taskMap = tasks;
  delete taskMap.count;

  const undone = Object.keys(taskMap)
    .filter(taskName => !readyWorkTasksCheckTime[taskName])
    .sort((l, r) => taskMap[r].checked - taskMap[l].checked)
    .sort((l, r) => taskMap[l].done - taskMap[r].done);

  const done = Object.keys(readyWorkTasksCheckTime).sort((l, r) => readyWorkTasksCheckTime[r] - readyWorkTasksCheckTime[l]);

  // Рендерим секцию только если есть задачи на отработку
  if (tasksCount > 0) {
    return (
      <Panel className="tasks" title="Активная проработка">
        <table>
          <tbody>
            <tr>
              <th>Задача</th>
              <th>Приоритет</th>
              <th>Выполнение</th>
            </tr>
            {[...undone, ...done]
              .map((taskName, index) => {
                if (!taskMap[taskName]) {
                  console.warn(taskName, taskMap, [...undone, ...done]);
                  return null;
                }

                let allChecked = taskMap[taskName].checked;
                let allDone    = taskMap[taskName].done;
                const percent = (allDone / allChecked) * 100;
                return (
                  <tr key={index}>
                    <td>{taskName}</td>
                    <td>
                      <Progress className={percent >= 100 && "done"} percent={percent} />
                      <span>
                        {`${allDone} / ${allChecked}`}
                      </span>
                    </td>
                    <td>
                      <Button 
                        className="trade-log-button trade-log-button--do"
                        disabled={allDone >= allChecked}
                        onClick={() => {
                          const callback = (data) => {
                            let tasks = parseTasks(data);
                            if (tasks[taskName].done == tasks[taskName].checked) {
                              const readyWorkTasksCheckTime = cloneDeep(state.readyWorkTasksCheckTime);
                              readyWorkTasksCheckTime[taskName] = Number(new Date());
                              context.setState({ readyWorkTasksCheckTime });
                            }
                          };

                          // debugger;
                          const data = cloneDeep(state.data);
                          for (let day of data) {
                            const practiceWorkTasks = day?.practiceWorkTasks;
                            const readyWorkTasks    = day?.readyWorkTasks;
                            if (practiceWorkTasks[taskName] && readyWorkTasks[taskName] === false) {
                              readyWorkTasks[taskName] = true;
                              context.setStateAsync({ data }).then(() => callback(data));
                              return;
                            }

                            const readyCustomPracticeWorkTasks = day?.readyCustomPracticeWorkTasks;
                            const customPracticeWorkTasks      = day?.customPracticeWorkTasks;
                            if (customPracticeWorkTasks.find(task => task.name == taskName) && !readyCustomPracticeWorkTasks[taskName]) {
                              readyCustomPracticeWorkTasks[taskName] = true;
                              context.setStateAsync({ data }).then(() => callback(data));
                              return;
                            }
                          }
                        }}
                      >
                        Выполнить
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Panel>
    );
  }
  return null;
}