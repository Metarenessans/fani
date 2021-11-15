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
  let tradingNotAllowed = state.limitUnprofitableDeals && unprofitableDeals.length >= state.allowedNumberOfUnprofitableDeals;

  // TODO: Расчитать `percent` без использования `negativePoints`
  let positivePoints = 0;
  let negativePoints = 0;
  for (let deal of currentDay.deals) {
    positivePoints += deal.emotionalStates.positive.filter(value => value === true).length;
    negativePoints += deal.emotionalStates.negative.filter(value => value === true).length;
    positivePoints += deal.motives.positive.filter(value => value === true).length;
    negativePoints += deal.motives.negative.filter(value => value === true).length;
  }
  let total = positivePoints + negativePoints;

  let percent = ~~(positivePoints / total * 100);
  if (total === 0) {
    percent = 50;
  }

  return (
    <Panel 
      // title="Мониторинг раппорта" 
      className="result-panel"
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