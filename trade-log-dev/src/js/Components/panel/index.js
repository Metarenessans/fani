import React from "react"
import PropTypes from "prop-types"
import clsx from "clsx"
import "./style.scss"

const propTypes = {
  /** @type {string} */
  className: PropTypes.string,

  /** @type {string} */
  contentClassName: PropTypes.string,

  /** @type {string} */
  title: PropTypes.string.isRequired,

  children: PropTypes.element.isRequired
};

/** @param {propTypes} */
function Panel({
  className,
  contentClassName,
  title,
  children
}) {
  return (
    <div className={clsx(className, "stats-panel")}>
      <h2 className="stats-panel-title card">{title}</h2>
      <div className={clsx("stats-panel-content", contentClassName)}>
        {children}
      </div>
    </div>
  )
}

Panel.propTypes = propTypes;

export default Panel