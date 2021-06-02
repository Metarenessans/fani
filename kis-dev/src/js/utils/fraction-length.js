export default function fractionLength(value) {
  const search = /\.\d+$/g.exec(String(value));
  return search ? search[0].slice(1).length : 0;
}