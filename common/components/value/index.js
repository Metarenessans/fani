import React from "react"
import clsx from "clsx"
import formatNumber from "../../utils/format-number"

import "./style.scss"

/**
 * @param {object} props
 * @param {number} props.value
 * @param {"success"|"danger"|"default"} props.type
 * @param {(value: any) => any} props.format
 * @param {string} props.className
 */
export default function Value({
  value,
  type,
  format,
  className,
  children
}) {
  value = value ?? children;
  type = type ?? (value === 0 ? "default" : value < 0 ? "danger" : "success");
  format = format ?? (typeof value === "number" ? formatNumber : null);
  return <span className={clsx("value", type, className)}>{format?.(value) ?? value}</span>
}