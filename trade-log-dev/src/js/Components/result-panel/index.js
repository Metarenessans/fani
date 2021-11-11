import React, { useContext } from "react"
import { Button } from "antd"
import clsx from "clsx"

import Stack from "../../../../../common/components/stack"

import Panel      from "../panel"
import Riskometer from "../riskometer"

import { StateContext } from "../../App"

import "./style.scss"

export default function ResultPanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const currentDay = data[currentRowIndex];

  // 2 убыточные сделки подряд = нужно сделать перерыв
  const shouldTakeBreak = currentDay.deals.some((deal, index, arr) => deal.result < 0 && arr[index + 1]?.result < 0);
  
  // Убыточные сделки
  const unprofitableDeals = currentDay.deals.filter(deal => deal.result < 0);
  // Если включен лимит убыточных сделок и мы превышаем допустимый лимит - запрещаем торговлю
  let tradingNotAllowed = state.limitUnprofitableDeals && unprofitableDeals.length > state.allowedNumberOfUnprofitableDeals;

  return (
    <Panel 
      // title="Мониторинг раппорта" 
      className="result-panel"
      contentClassName="result-panel-content"
    >
      <Stack space="1em">
        <Riskometer value={50} />
        {/* TODO: Добавить aria-label */}
        {/* <Button className="custom-btn result-panel-btn" disabled>
          НИМБА
        </Button> */}
      </Stack>
      <strong className={clsx(
        "result-panel__action",
        tradingNotAllowed ? "danger" : shouldTakeBreak ? "" : "success"
      )}>
        {
          tradingNotAllowed ? 
            "Торговля запрещена"
            : shouldTakeBreak
              ? "Сделать перерыв"
              : "Торговля разрешена"
        }
      </strong>
    </Panel>
  )
}