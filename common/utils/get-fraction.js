/**
 * @param {number} number
 */
export default function getFraction(number) {
  const match = /\.\d+$/g.exec(String(number));
  return match ? match[0].slice(1) : 0;
}