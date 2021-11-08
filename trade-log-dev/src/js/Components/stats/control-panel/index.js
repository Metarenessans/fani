import React from "react"

import { Switch } from "antd"

import Stack        from "../../../../../../common/components/stack"
import NumericInput from "../../../../../../common/components/numeric-input"

import StatsPanel   from "../../panel"
import InputWrapper from "../../input-wrapper"

import "./style.scss"

/**
 * 
 * @param {object}  props
 * @param {number}  props.dailyRate Дневной план (в %)
 * @param {boolean} props.limitUnprofitableDeals Флаг того, включен ли лимит убыточных сделок
 * @param {(checked: boolean) => any} props.onLimitUnprofitableDealsChange Коллбэк, который вызывается при смене значения `limitUnprofitableDeals`
 * @param {number}  props.allowedNumberOfUnprofitableDeals Флаг того, включен ли лимит убыточных сделок
 * @param {(value: number) => any}  props.onAllowedNumberOfUnprofitableDealsChange Коллбэк, который вызывается при смене значения `allowedNumberOfUnprofitableDeals`
 */
export default function ControlPanel(props) {
  return (
    <StatsPanel className="control-panel" title="Панель управления">
      <InputWrapper
        label="Дневной план"
        labelCentered={true}
      >
        <NumericInput defaultValue={props.dailyRate} suffix="%" />
      </InputWrapper>

      <Stack space=".8em">

        <InputWrapper
          label={
            <span className="label-with-fixed-width">
              Ограничение на лимит убыточных сделок
            </span>
          }
          direction="row"
        >
          <Switch
            className="switch"
            key={props.limitUnprofitableDeals}
            defaultChecked={props.limitUnprofitableDeals}
            onChange={checked => props?.onLimitUnprofitableDealsChange(checked)}
          />
        </InputWrapper>

        <InputWrapper
          label={
            <span className="label-with-fixed-width">
              Допустимое количество убыточных сделок
            </span>
          }
          direction="row"
        >
          <NumericInput
            defaultValue={props.allowedNumberOfUnprofitableDeals}
            onBlur={value => props?.onAllowedNumberOfUnprofitableDealsChange(value)}
          />
        </InputWrapper>

      </Stack>
    </StatsPanel>
  )
}