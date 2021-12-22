import React from "react"
import clsx from "clsx"
import formatNumber from "../../utils/format-number"

import "./style.scss"

/**
 * @param {object} props
 * @param {number} props.value
 * @param {"success"|"danger"|"default"} props.type Строка-идентификатор, указывающая, в какой цвет покрасить число
 * 
 * `success` - зеленый
 * 
 * `danger`  - красный
 * 
 * `default` - серый
 * 
 * Если не указан, то значение будет расчитано автоматически по следующему правилу:
 * 
 * `value === 0 -> "default"`
 * 
 * `value < 0   -> "danger"`
 * 
 * `value > 0   -> "success"`
 * 
 * @param {(value: any) => any} props.format Коллбэк, в который передается `value` для форматирования
 * @param {boolean} props.forcedPlus Добавляет к отформатированному положительному значению `+`,
 * если равен `true`
 * @param {string} props.className
 */
export default function Value({
  value,
  type,
  format,
  forcedPlus,
  className,
  children
}) {
  value = value ?? children;
  type = type ?? (value === 0 ? "default" : value < 0 ? "danger" : "success");
  format = format ?? function(value) {
    let formatted = value;
    if (typeof value === "number") {
      formatted = formatNumber(value);
    }

    if (forcedPlus && value > 0) {
      formatted = "+" + formatted;
    }

    return formatted;
  };
  return <span className={clsx("value", type, className)}>{format?.(value) ?? value}</span>
}