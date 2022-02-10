/**
 * проверяет все кастомные таски и подставляет недостающие
 */
export default function customTasksParse(data, props) {
  data.forEach((day, currentDayIndex) => {
    if (props == "customPracticeWorkTasks") {
      let { customPracticeWorkTasks } = day;

      customPracticeWorkTasks.forEach((task, index) => {
        // Проходимся по каждому дню
        // и проверяем, есть ли там задача с таким же названием
        data.forEach(_day => {
          const index = _day.customPracticeWorkTasks.findIndex(_task => _task.name === task.name);
          if (index !== -1) {
            return;
          }
          _day.customPracticeWorkTasks.push(
            {name: task.name, value: false}
          );
        });
      });
    }
    
    if (props == "customTechnology") {
      let { customTechnology } = day;

      customTechnology.forEach((task, index) => {
        // Проходимся по каждому дню
        // и проверяем, есть ли там задача с таким же названием
        data.forEach(_day => {
          const index = _day.customTechnology.findIndex(_task => _task.name === task.name);
          if (index !== -1) {
            return;
          }
          _day.customTechnology.push(
            {name: task.name, value: false}
          );
        });
      });
    }
  });
}