import React, { useContext } from "react";
import { Switch, Tooltip } from "antd";
import { cloneDeep } from "lodash";

import { StateContext } from "../../../App";

import Stack        from "../../../../../../common/components/stack";
import NumericInput from "../../../../../../common/components/numeric-input";
import CustomSelect from "../../../../../../common/components/custom-select";

import num2str from "../../../../../../common/utils/num2str";

import Panel        from "../../panel";
import InputWrapper from "../../input-wrapper";

import "./style.scss";

export default function ControlPanel() {
  const context = useContext(StateContext);
  const { state } = context;
  const { lockTimeoutMinutes } = state;
  return (
    <Panel 
      className="control-panel"
      contentClassName="control-panel-content" 
      title="Панель управления"
    >
      <InputWrapper
        label="Дневной план"
        labelCentered
      >
        <NumericInput 
          defaultValue={state.dailyRate}
          onBlur={dailyRate => context.setState({ dailyRate })}
          unsigned="true"
          suffix="%"
        />
      </InputWrapper>

      <Stack space=".8em">

        <InputWrapper
          label={
            <span className="label-with-fixed-width">
              Ограничение на лимит<br className="sm-only" /> убыточных сделок
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
              Допустимое количество<br className="sm-only" /> убыточных сделок
            </span>
          }
          direction="row"
        >
          <NumericInput
            defaultValue={state.allowedNumberOfUnprofitableDeals}
            onBlur={allowedNumberOfUnprofitableDeals => context.setState({ allowedNumberOfUnprofitableDeals })}
            unsigned="true"
            round="true"
            min={0}
          />
        </InputWrapper>

      </Stack>

      <InputWrapper
        className="control-panel__lock"
        label={
          <Tooltip
            title={
              <span>
                Запрет на добавление сделок при убытке<br />
                или негативном эмоциональном фоне
              </span>
            }
          >
            Блокировка сделок
          </Tooltip>
        }
        labelCentered
      >
        <CustomSelect
          options={[10, 20, 30, 60, 9999]}
          format={value => {
            if (value === 9999) {
              return "до конца дня";
            }
            return `${value} ${num2str(value, ["минута", "минуты", "минут"])}`;
          }}
          value={lockTimeoutMinutes}
          min={10}
          max={9999}
          onChange={lockTimeoutMinutes => {
            const timeoutMinutes = cloneDeep(state.timeoutMinutes);
            for (let i = 0; i < timeoutMinutes.length; i++) {
              if (timeoutMinutes[i] > lockTimeoutMinutes) {
                timeoutMinutes[i] = lockTimeoutMinutes;
              }
            }
            context.setState({ lockTimeoutMinutes, timeoutMinutes });
          }}
        />
      </InputWrapper>
    </Panel>
  );
}