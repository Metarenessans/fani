import React from 'react'
import ReactDOM from 'react-dom'

import './style.scss'

export default function Stack(props) {
  return (
    <div {...props} className={['stack'].concat(props.className).join(' ')}>
      {props.children}
    </div>
  )
}