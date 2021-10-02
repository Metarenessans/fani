export default function typeOf(o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
}