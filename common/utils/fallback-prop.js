export default function fallbackProp(obj, props = [], fallbackValue) {
  for (let prop of props) {
    if (obj[prop] != null) {
      return obj[prop];
    }
  }
  return fallbackValue;
}