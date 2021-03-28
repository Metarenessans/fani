import React, { useState } from 'react'

import "./style.sass"

const BurgerButton = props => {

  const { onClick } = props;
  const [isActive, setIsActive] = useState(props.active || false);

  const safeProps = {...props};
  delete safeProps.active;

  return (
    <button
      {...safeProps}
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