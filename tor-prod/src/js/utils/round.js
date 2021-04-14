export default function round(value, decimals) {
  let dec = Math.pow(10, decimals);
  return Math.round(value * dec) / dec;
}