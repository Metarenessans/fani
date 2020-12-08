import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import "./style.sass"

const BurgerButton = props => {

  const { onClick } = props;
  const [isActive, setIsActive] = useState(props.active || false);

  return (
    <button
      {...props}
      className={
        ["burger-btn"]
          .concat(isActive ? "burger-btn--active" : "")
          .concat(props.className)
          .join(" ")
          .trim()
      }
      onClick={e => {
        setIsActive(!isActive);
        if (onClick) {
          onClick(e);
        }
      }}
      aria-label="Меню"
    >
      <span></span>
    </button>
  )
}

export default BurgerButton;