import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import "./style.scss";

const propTypes = {
  /** @type {string} */
  className: PropTypes.string,

  /** @type {string} */
  contentClassName: PropTypes.string,

  /** 
   * Текст заголовка
   * 
   * @type {string}
   */
  title: PropTypes.string
};

/** @param {propTypes} */
function Panel({
  className,
  contentClassName,
  title,
  children
}) {
  return (
    <div className={clsx("stats-panel", className)}>
      {title && <h2 className="stats-panel-title card">{title}</h2>}
      <div className={clsx("stats-panel-content", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

Panel.propTypes = propTypes;

export default Panel;