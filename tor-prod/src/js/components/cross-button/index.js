import React from 'react';
import { Tooltip } from 'antd/es'
import { PlusOutlined } from "@ant-design/icons"

import './style.scss'

export default function CrossButton(props) {
  const label = props.label;
  const onClick = props.onClick || (() => {});

  return (
    <Tooltip title={label}>
      <button
        className={['cross-button'].concat(props.className).join(' ')}
        aria-label={label}
        onClick={e => onClick(e)}>
        <PlusOutlined />
      </button>
    </Tooltip>
  )
}