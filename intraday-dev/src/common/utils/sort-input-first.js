/**
 * @param {number} number
 */
export default function sortInputFirst(searchVal, options) {
  return options.sort((a, b) => {
    a = a.label.substr(0, searchVal.length).toLowerCase();
    b = b.label.substr(0, searchVal.length).toLowerCase();
    searchVal = searchVal.toLowerCase();

    if (a == searchVal) {
      if (b != searchVal) return -1;
    } else if (b == searchVal) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}
