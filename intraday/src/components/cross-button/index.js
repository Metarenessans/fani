import React from "react";
import { Tooltip } from "antd/es";

import "./style.scss";

export default function CrossButton(props) {
  const label = props.label;
  const onClick = props.onClick || (() => {});

  return (
    <Tooltip title={label}>
      <button
        {...props}
        className={["cross-button"].concat(props.className).join(" ")}
        aria-label={label}
        onClick={(e) => onClick(e)}
      >
        <span role="img" aria-label="plus" className="anticon anticon-plus">
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="plus"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <defs>
              <style></style>
            </defs>
            <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
            <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
          </svg>
        </span>
      </button>
    </Tooltip>
  );
}
