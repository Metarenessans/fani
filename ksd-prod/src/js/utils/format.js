import round from "./round"

export default function format(val) {

  let sup = 1;
  let suffix = "";
  if (val >= 1.0e+12) {
    sup = 1.0e+12;
    suffix = "трлн";
  }
  else if (val >= 1.0e+9) {
    val = 1.0e+9;
    suffix = "млрд";
  }
  else if (val >= 1.0e+6) {
    val = 1.0e+6;
    suffix = "млн";
  }
  else if (val >= 1.0e+3) {
    val = 1.0e+3;
    suffix = "тыс";
  }
  
  return val = round(Math.abs(val) / sup, 2).toExponential(2).slice(0, 4) + " " + suffix;
}