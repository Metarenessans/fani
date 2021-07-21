const optionsTemplate = {
  inPercent:     false,
  preferredStep: dev ? 55 : "", // Желаемый ход
  length:        dev ? 2  : 1,  // Кол-во закрытий 
  percent:       dev ? 5  : "", // % закрытия
  stepInPercent: dev ? 2  : "", // Шаг
};
export default optionsTemplate 