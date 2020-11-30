/**
 * @param {number} number
 */
export default function fractionLength(number) {
  const match = /\.\d+$/g.exec(String(number));
  return match ? match[0].slice(1).length : 0;
}