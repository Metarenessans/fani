import round from "./round"

export default function format(labelValue) {
  return Math.abs(Number(labelValue)) >= 1.0e+12

    ? round(Math.abs(Number(labelValue)) / 1.0e+12, 2) + " трлн"

    : Math.abs(Number(labelValue)) >= 1.0e+9

      ? round(Math.abs(Number(labelValue)) / 1.0e+9, 2) + " млрд"
      // Six Zeroes for Millions 
      : Math.abs(Number(labelValue)) >= 1.0e+6

        ? round(Math.abs(Number(labelValue)) / 1.0e+6, 2) + " млн"
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

          ? round(Math.abs(Number(labelValue)) / 1.0e+3, 2) + " тыс"

          : Math.abs(Number(labelValue));
}