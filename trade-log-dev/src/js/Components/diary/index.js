import React, { useContext } from "react";
import { Input } from "antd";
const { TextArea } = Input;
import Panel from "../panel";
import { StateContext } from "../../App";

import "./style.scss";

export default function Diary() {
  const context = useContext(StateContext);
  const { state } = context;
  const { notes } = state;

  return (
    <Panel className="diary" title="Подробный анализ и личностная проработка">
      <TextArea 
        value={notes}
        onChange={e => {
          const { value } = e.target;
          context.setState({ notes: value });
        }}
        rows={10}
      />
    </Panel>
  );
}