import React from "react"
import { Gauge } from "@ant-design/charts"

import "./style.sass"

/**
 * @param {object} props
 * @param {number} props.value Значение рискометра в % (от 0 до 100)
 */
export default function Riskometer(props) {
  const { value } = props;
  /** @type {import("@ant-design/charts").GaugeConfig} */
  const config = {
    renderer: "svg",
    percent: Math.max((value ?? 0) / 100, 0.001),
    range: {
      ticks: [0, 0.5, 0.5, 1],
      color: ["#F5222D", "#87d068"],
      width: 7
    },
    axis: {
      tickLine: null,
      label: null,
    },
    startAngle:   Math.PI,
    endAngle: 2 * Math.PI,
    indicator: {
      pointer: { style: { stroke: '#D0D0D0' } },
      pin: { style: { stroke: '#D0D0D0' } }
    }
  };

  let labelClassName;
  let labelText;
  if (value == 50) {
    labelClassName = "neutral";
    labelText = "Нейтральный";
  }
  else if (value > 50) {
    labelClassName = "success";
    labelText = "Положительный";
  }
  else {
    labelClassName = "danger";
    labelText = "Негативный";
  }

  return (
    <figure className="gauge">
      <Gauge {...config} />
      <figcaption>
        Эмоциональный фон
        <b className={labelClassName}>
          {labelText}
        </b>
      </figcaption>
    </figure>
  )
}