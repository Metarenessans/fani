/**
 * @param {number} value
 * @returns {number}
 */
export default function roundUp(value) {
  return (value % 1 === 0) ? value : Math.floor(value) + 1;
}