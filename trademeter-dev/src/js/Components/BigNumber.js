import React from 'react'
import ReactDOM from 'react-dom'
import { Tooltip } from 'antd/es'

import formatBigNumbers from "../format";

export default function BigNumber(props) {
  var { val, format } = props;
  format = format || (val => (val + "").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 "));

  let threshold = props.threshold || 1e12; // trillion
  let customSuffix = props.suffix || "";

  let originalValue = val;

  if (val >= threshold) {
    val = formatBigNumbers(val);

    return (
      <Tooltip title={format(originalValue) + customSuffix}>
        <span>{ format(val) + customSuffix }</span>
      </Tooltip>
    )
  }
  else return <span>{format(val) + customSuffix}</span>
}