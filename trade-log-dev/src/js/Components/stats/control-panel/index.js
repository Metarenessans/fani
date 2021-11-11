import React, { useContext } from "react"

import { Switch } from "antd"

import { StateContext } from "../../../App"

import Stack        from "../../../../../../common/components/stack"
import NumericInput from "../../../../../../common/components/numeric-input"

import Panel        from "../../panel"
import InputWrapper from "../../input-wrapper"

import "./style.scss"

export default function ControlPanel() {
  const context = useContext(StateContext);
  const { state } = context;
  return (
    <Panel className="control-panel" title="Панель управления">
      <InputWrapper
        label="Дневной план"
        labelCentered={true}
      >
        <NumericInput 
          defaultValue={state.dailyRate}
          onBlur={dailyRate => context.setState({ dailyRate })}
          suffix="%"
        />
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
            checked={state.limitUnprofitableDeals}
            onChange={limitUnprofitableDeals => context.setState({ limitUnprofitableDeals })}
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
            defaultValue={state.allowedNumberOfUnprofitableDeals}
            onBlur={allowedNumberOfUnprofitableDeals => context.setState({ allowedNumberOfUnprofitableDeals })}
          />
        </InputWrapper>

      </Stack>
    </Panel>
  )
}