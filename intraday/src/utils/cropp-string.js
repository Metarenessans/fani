export default function croppString(str = "", len = 0, end = "...") {
  return str.substr(0, len) + (len < str.length ? end : "");
}