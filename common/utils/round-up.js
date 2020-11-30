/**
 * @param {number} value
 * @returns {number}
 */
export default function roundUp(value) {
  if (typeof value !== "number") {
    throw new Error("value must be a number!");
  }
  return (value % 1 === 0) ? value : Math.floor(value) + (value >= 0);
}