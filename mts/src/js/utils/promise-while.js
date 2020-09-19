export default function promiseWhile(data, condition, action) {
  let whilst = data => {
    return condition(data)
      ? action(data).then(whilst)
      : Promise.resolve(data);
  }
  return whilst(data);
};