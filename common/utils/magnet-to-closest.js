export default function magnetToClosest (number, base) {
  return Math.round(number / base) * base;
}