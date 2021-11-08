import React from 'react'
import ReactDOM from 'react-dom'
import { Tooltip } from 'antd/es'

import { QuestionCircleFilled } from '@ant-design/icons'

import "./style.scss"

export default function Info(props) {
  var { tooltip } = props;

  return (
    <span className="info">
      {props.children}
      <Tooltip title={tooltip}>
        <QuestionCircleFilled className="info__icon" />
      </Tooltip>
    </span>
  )
}