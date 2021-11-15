import React, { useContext, useState, useEffect } from "react"
import { Progress, Checkbox } from "antd"
import { cloneDeep } from "lodash";
import Panel from "../../panel"
import { StateContext } from "../../../App"

import "./Tasks.scss"

export default function Tasks() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data } = state;

  /** @type {Object.<string, number>} */
  const tasks = {};
  // Количество зачеканных задач на отработку во всех днях
  let tasksCount = 0;

  for (let day of data) {
    const practiceWorkTasks = day?.practiceWorkTasks;
    if (practiceWorkTasks) {
      Object.keys(practiceWorkTasks)
        // Оставляем только зачеканные задачи
        .filter(key => practiceWorkTasks[key])
        .forEach(taskName => {
          if (!tasks[taskName]) {
            tasks[taskName] = 0;
          }
          tasks[taskName]++;
          tasksCount++;
        });
    }
  }

  const [taskMap, setTaskMap] = useState(tasks);

  useEffect(() => {
    setTaskMap(tasks);
  }, [tasksCount]);

  // Рендерим секцию только если есть задачи на отработку
  if (tasksCount > 0) {
    return (
      <Panel className="tasks" title="Активная проработка">
        <table>
          <tbody>
            <tr>
              <th>Задача</th>
              <th>Приоритет</th>
              <th>Выполнено</th>
            </tr>
            {Object.keys(taskMap)
              // Сортировка по убыванию частотности
              .sort((l, r) => taskMap[r] - taskMap[l])
              .map((taskName, index) => {
                const percent = taskMap[taskName] / tasksCount * 100;
                return (
                  <tr key={index}>
                    <td>{taskName}</td>
                    <td>
                      <Progress className={percent > 66 && "urgent"} percent={percent} />
                    </td>
                    <td>
                      <Checkbox
                        checked={percent === 0}
                        onChange={e => setTaskMap({ ...cloneDeep(taskMap), [taskName]: 0 })}
                      />
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </Panel>
    )
  }
  return null;
}