import React from "react"
import StateRegistry from "../state-registry"

import "./style.scss"

export default function SecondStep() {
  return (
    <div id="second-step" className="second-step">
      <div className="second-step-table">
        <StateRegistry />
      </div>
    </div>
  )
}