import React, { useContext } from "react";
import clsx from "clsx";
import { StateContext } from "../App";

import "./DashboardKey.scss";

const SortButton = function ({ prop, onSort }) {
  const context = useContext(StateContext);
  const { state } = context;
  const { sortProp, sortDESC } = state;

  let ariaLabel = "Отключить сортировку";
  if (sortProp == null) {
    ariaLabel = "Отсортировать по убыванию";
  }
  else if (sortDESC) {
    ariaLabel = "Отсортировать по возрастанию";
  }

  return (
    <button
      className={clsx(
        "dashboard-key__sort-toggle",
        prop === sortProp && sortDESC != null ? "active" : "",
        prop === sortProp && (sortDESC != null && !sortDESC)
          ? "reversed"
          : ""
      )}
      type="button"
      onClick={e => {
        let value;
        if (sortDESC == null) {
          value = true;
        }
        else {
          value = sortDESC ? !sortDESC : undefined;
        }

        onSort(prop, value);
      }}
      // TODO: доработать
      // title={ariaLabel}
    >
      <span className="visually-hidden">{ariaLabel}</span>
    </button>
  );
};

export default function DashboardKey({ children, sortProp, onSort }) {
  return (
    <span className="dashboard-key">
      <span className="dashboard-key-inner">
        {children}
        {sortProp && <SortButton prop={sortProp} onSort={onSort} />}
      </span>
    </span>
  );
}