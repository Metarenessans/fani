import React from "react"
import clsx from "clsx"

import "./style.scss"

/**
 * //TODO: закончить
 *
 * @param {Object} props
 * @param {string|JSX.Element} props.label Тестовое описание инпута
 * @param {boolean} props.labelCentered Флаг того, выравне label по центру или нет.
 * По дефолту равен `false`
 * @param {"row"|"column"} props.direction Направление потока.
 * 
 * Если `"column"` - то элементы будут идти сверху вниз в 2 строки
 * 
 * Если `"row"` - то элементы будут распологаться слева-направа в одну строку
 * 
 * По дефолту равен `"column"`
 */
export default function InputWrapper({
  className,
  label,
  labelCentered,
  direction,
  children
}) {
  const block = "input-wrapper";
  return (
    <label className={clsx(className, block, direction === "row" && `${block}--fluid`)}>
      <span className={clsx(`${block}__label`, labelCentered && `${block}__label--centered`)}>
        {label}
      </span>
      <div className={`${block}__input`}>
        {children}
      </div>
    </label>
  )
}