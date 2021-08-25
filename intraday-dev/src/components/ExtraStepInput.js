import React, { useContext, useState, useRef, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { InputNumber } from "antd";

export const ExtraStepInput = ({ tableIdx, columnIdx, step }) => {
  const { loadTables, setExtraStep, deleteExtraStep, loading } = useContext(GlobalContext);
  const [stepValue, setStepValue] = useState(step);

  const inputRef = useRef(null);

  const table = loadTables[tableIdx];

  useEffect(() => {
    setStepValue(step);
  }, [table.extraSteps]);

  const handleKeyboard = (key) => {
    const codes = ["Enter", "NumpadEnter", "Escape"];
    if (codes.includes(key.code)) {
      inputRef.current.blur();
    }
  };

  const handleBlur = () => {
    if (stepValue === 0 || !stepValue) {
      deleteExtraStep(tableIdx, columnIdx);
      inputRef.current.focus();
    } else {
      if (stepValue !== table.extraSteps[columnIdx])
        setExtraStep(tableIdx, columnIdx, stepValue);
    }
  };

  return (
    <div className="step">
      <InputNumber
        ref={inputRef}
        autoFocus={!loading}
        size="large"
        min={0}
        step={0.01}
        max={100}
        precision={2}
        formatter={(value) => `${value}%`}
        parser={(value) => {
          if (typeof value === "string" && !value.length) {
            value = "0.00";
          }
          return value.replace(/[^\d.]|\.(?=.*\.)/g, "");
        }}
        value={stepValue}
        onChange={setStepValue}
        onKeyDown={handleKeyboard}
        onStep={async (value) => {
          await setStepValue(value);
          await inputRef.current.blur();
        }}
        onBlur={handleBlur}
      />
    </div>
  );
};
