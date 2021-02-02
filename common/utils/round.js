export default function round(value, decimals = 0) {
  if (value == null) return value;

  let dec = Math.pow(10, decimals);
  return Math.round(value * dec) / dec;
}