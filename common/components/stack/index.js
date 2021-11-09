import React from "react"
import clsx from "clsx"
import "./style.scss"

/**
 * TODO: дописать описание
 * @param {object} props
 * @param {string} props.space CSS значение для `margin`
 */
export default function Stack(props) {
  return (
    <div
      {...props}
      className={clsx("stack", props.className)}
      style={{ "--space": props.space || "1.5rem" }}
    >
      {props.children}
    </div>
  )
}