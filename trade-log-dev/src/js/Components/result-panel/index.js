import React, { useContext } from "react"
import { Button } from "antd"
import clsx from "clsx"

import Stack from "../../../../../common/components/stack"

import parseEmotionalState from "../../utils/parse-emotional-state"

import Panel      from "../panel"
import Riskometer from "../riskometer"

import { StateContext } from "../../App"

import "./style.scss"

export default function ResultPanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const currentDay = data[currentRowIndex];
  const { deals } = currentDay;

  // 2 убыточные сделки подряд = нужно сделать перерыв
  const shouldTakeBreak = deals.some((deal, index, arr) => deal.result < 0 && arr[index + 1]?.result < 0);
  
  // Убыточные сделки
  const unprofitableDeals = deals.filter(deal => deal.result < 0);
  // Если включен лимит убыточных сделок и мы превышаем допустимый лимит - запрещаем торговлю
  let tradingNotAllowed = state.limitUnprofitableDeals && unprofitableDeals.length >= state.allowedNumberOfUnprofitableDeals;

  const { total, positive } = parseEmotionalState(deals);
  let percent = ~~(positive / total * 100);
  if (total === 0) {
    percent = 50;
  }

  // Запрещает торговю, если эмоциональный фон вышел в негатив 
  if (percent < 50) {
    tradingNotAllowed = true;
  }

  return (
    <Panel 
      className="result-panel third-step__result-panel"
      contentClassName="result-panel-content"
    >
      <Stack space="1em">
        <Riskometer value={percent} />
        {/* TODO: Добавить aria-label */}
        {false && 
          <Button className="custom-btn result-panel-btn" disabled>
            НИМБА
          </Button>
        }
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