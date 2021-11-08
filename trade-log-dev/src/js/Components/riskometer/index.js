//TODO: cleanup
import React, { useState, useEffect } from "react"
import { Gauge } from "@ant-design/charts"
import clsx from "clsx"

import "./style.sass"

export default function Riskometer(props) {
  const config = {
    percent: (props?.value ?? 0) / 100,
    range: {
      ticks: [0, 0.5, 0.5, 1],
      color: ["#F5222D", "#87d068"],
      width: 7
    },
    tickLine: null,
    subTickLine: null,
    startAngle:   Math.PI,
    endAngle: 2 * Math.PI,
    indicator: {
      pointer: { style: { stroke: '#D0D0D0' } },
      pin: { style: { stroke: '#D0D0D0' } },
    }
  };

  return (
    <figure className="gauge">
      <Gauge {...config} />
      <figcaption>
        Эмоциональный фон
        <b className="success">Положительный</b>
      </figcaption>
    </figure>
  )
}