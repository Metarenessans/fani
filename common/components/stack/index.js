import React from 'react'

import clsx from 'clsx'

import './style.scss'

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