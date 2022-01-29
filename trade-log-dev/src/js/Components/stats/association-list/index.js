import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import typeOf from "../../../../../../common/utils/type-of";

/*
  Идея:

  <AssociationList className="stats-list">
    {{
      "Торговых дней": 50,
      "Сделок": 0,
      "Общий результат": "0%",
      "Позиций Long":  0,
      "Позиций Short": 0,
      "Положительных сделок": 0,
      "Отрицательных сделок": 0,
      "Средняя положительная сделка": 0,
      "Средняя отрицательная сделка": 0,
    }}
  </AssociationList>
*/

const propTypes = {
  /** @type {string} */
  className: PropTypes.string,

  /** @type {object} */
  children: PropTypes.object.isRequired
};

/** @param {propTypes} props */
function AssociationList(props) {
  if (typeOf(props.children) !== "object") {
    return "Пропс `children` должен быть объектом";
  }

  return (
    <dl className={clsx("association-list", props.className)}>
      {Object.keys(props.children).map((key, index) => {
        const name  = key;
        const value = props.children[key];
        return (
          <div key={index}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

AssociationList.propTypes = propTypes;

export default AssociationList;