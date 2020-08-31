export default function formatNumber(val) {
  var chunks = (val + "").split(".");
  chunks[0] = chunks[0].replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ")

  var result = chunks[0];
  if (chunks.length > 1) {
    result += "." + chunks[1];
  }
  return result;
};