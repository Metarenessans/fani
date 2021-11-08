export default function croppNumber(number, precision) {
  return Math.trunc(number * Math.pow(10, precision)) / Math.pow(10, precision);
}