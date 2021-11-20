import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import "./style.scss";

const propTypes = {
  /** 
   * Текст заголовка
   * 
   * @type {string}
   */
  title: PropTypes.string,

  /**
   * Класс контейнера, в котором отрендерится содержимое компонента
   * 
   * @type {string}
   */
  contentClassName: PropTypes.string
};

/** @param {propTypes & React.HTMLAttributes} props */
function Panel(props) {
  const {
    contentClassName,
    title,
    children
  } = props;
  return (
    <div className={clsx("stats-panel", props.className)}>
      {title && <h2 className="stats-panel-title card">{title}</h2>}
      <div className={clsx("stats-panel-content", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

Panel.propTypes = propTypes;

export default Panel;