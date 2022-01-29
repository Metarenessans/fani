import { dayTemplate } from "../../../App";

/** @param {dayTemplate[]} data */
export default function parseTasks(data) {
  /** @type {Object.<string, { checked: number, done: number, checkTime: number }>} */
  const tasks = {};
  // Количество зачеканных задач на отработку во всех днях
  let tasksCount = 0;

  for (let day of data) {
    const practiceWorkTasks       = day?.practiceWorkTasks;
    const readyWorkTasks          = day?.readyWorkTasks;
    const customPracticeWorkTasks      = day?.customPracticeWorkTasks;
    const readyCustomPracticeWorkTasks = day?.readyCustomPracticeWorkTasks;

    Object.keys(practiceWorkTasks)
      // Оставляем только зачеканные задачи
      .filter(key => practiceWorkTasks[key])
      .forEach(taskName => {
        if (!tasks[taskName]) {
          tasks[taskName] = { checked: 0, done: 0 };
        }
        tasks[taskName].checked++;
        if (readyWorkTasks[taskName]) {
          tasks[taskName].done++;
        }
        tasksCount++;
      });

    for (let customTask of customPracticeWorkTasks.filter(task => task.value == true)) {
      const taskName = customTask.name;
      if (!tasks[taskName]) {
        tasks[taskName] = { checked: 0, done: 0 };
      }
      tasks[taskName].checked++;
      if (readyCustomPracticeWorkTasks[taskName]) {
        tasks[taskName].done++;
      }
      tasksCount++;
    }
  }

  tasks.count = tasksCount;

  return tasks;
}