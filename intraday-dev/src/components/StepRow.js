import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import CrossButton from "./cross-button";

export const StepRow = ({ tableIdx, rowIdx, tool }) => {
  const { investorInfo, iterationQty, loadTables, deleteTool } = useContext(
    GlobalContext
  );

  const precision = (x) =>
    x.toString().includes(".") ? x.toString().split(".").pop().length : 0;

  const priceStepPrecision = precision(tool.priceStep.toString());

  const calcStepValues = (steps) => {
    return steps.map((step) => {
      const stepNumber =
        tool.contracts > 0
          ? ((investorInfo.deposit * step * 0.01) /
              (iterationQty * tool.contracts * tool.stepPrice)) *
            tool.priceStep
          : 0;

      const stepPercent = (stepNumber / tool.adrValue) * 100;

      const stepLength = 100 - stepPercent;
      return { stepNumber, stepPercent, stepLength };
    });
  };
  const stepValues = calcStepValues(loadTables[tableIdx].steps);
  const extraStepValues = calcStepValues(loadTables[tableIdx].extraSteps);

  const setColor = (val) => {
    if (val === 0) return "c-0";
    else if (val > 0 && val < 10) return "c-10";
    else if (val >= 10 && val < 20) return "c-10-20";
    else if (val >= 20 && val < 30) return "c-20-30";
    else if (val >= 30 && val < 40) return "c-30-40";
    else if (val >= 40 && val < 50) return "c-40-50";
    else if (val >= 50) return "c-50-plus";
  };

  const toolName =
    tool.ref.toolType === "futures" ? tool.shortName : tool.fullName;

  return (
    <div className="step-row">
      <div className="tool-wrap">
        <div className="tool-code">{`${toolName} (${tool.code})`}</div>
        <div className="tools">
          {stepValues.map((value, idx) => (
            <div key={idx} className={`tool ${setColor(value.stepPercent)}`}>
              <p className="step-value">
                {value.stepNumber.toFixed(priceStepPrecision)}
              </p>
              <p className="step-value-percent">{`${value.stepPercent.toFixed()}%`}</p>
            </div>
          ))}

          {extraStepValues.map((value, idx) => (
            <div key={idx} className={`tool ${setColor(value.stepPercent)}`}>
              <p className="step-value">
                {value.stepNumber.toFixed(priceStepPrecision)}
              </p>
              <p className="step-value-percent">{`${value.stepPercent.toFixed()}%`}</p>
            </div>
          ))}
        </div>
      </div>

      <CrossButton
        aria-hidden={rowIdx == 0 ? "true" : "false"}
        className={["dashboard-row_delete"]
          .concat(rowIdx == 0 ? "invisible" : "")
          .join(" ")
          .trim()}
        onClick={(e) => deleteTool(tableIdx, rowIdx)}
      />
    </div>
  );
};
