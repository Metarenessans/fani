import React from 'react'
import ReactDOM from 'react-dom'

import "./style.scss"

export default function Value(props) {

  var format = props.format || (val => val);
  var classList = ["value"].concat(props.className);
  var neutral = props.neutral || false;
  
  var val = props.children;
  if (neutral) {
    classList.push("value--neutral");
  }
  else {
    if (val === 0) {
      classList.push("value--neutral");
    }
    else if (val < 0) {
      classList.push("value--negative");
    }
  }

  return <span className={ classList.join(" ").trim() }>{ format( val ) }</span>;
}