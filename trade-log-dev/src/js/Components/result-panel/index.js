import { Button } from "antd"
import React from "react"
import Stack from "../../../../../common/components/stack"
import Panel from "../panel"
import Riskometer from "../riskometer"
import "./style.scss"

export default function ResultPanel(props) {
  return (
    <Panel 
      title="Мониторинг раппорта" 
      className="result-panel"
      contentClassName="result-panel-content"
    >
      <Stack space="1em">
        <Riskometer value={50} />
        <Button className="custom-btn result-panel-btn" disabled>
          НИМБА
        </Button>
      </Stack>
      <strong className="result-panel__action success">Торговля разрешена</strong>
    </Panel>
  )
}