import React, { useContext } from "react";
import { Button, Select } from "antd";
import { cloneDeep } from "lodash";

import formatNumber from "../../../../../../common/utils/format-number";
import NumericInput from "../../../../../../common/components/numeric-input";
import CustomSelect from "../../../../../../common/components/custom-select";

import Panel from "../../panel";

import { StateContext } from "../../../App";

import "./style.scss";

export default function IncomeTable() {
  const context = useContext(StateContext);
  const { state } = context;
  const {
    data,
    currentRowIndex
  } = state;
  const { income } = data[currentRowIndex];

  return (
    <Panel className="income-table income-table--income-title" title="Доходы">
      <div className="income-table-wrapper">
        {income.map((item, index) => {
          const {
            incomeTools,
            selectedIncomeToolName,
            incomeTypeName,
            value
          } = item;
          return (
            <>
              <div className="income-table-row">
                {/* col */}
                <div className="income-table-col">
                  <div className="income-table-key">
                    Вид
                  </div>
                  <div className="income-table-value">
                    <Select
                      value={incomeTypeName}
                      key={incomeTypeName}
                      style={{ width: "100%" }}
                      onChange={val => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].income[index].incomeTypeName = val;
                        context.setState({ data });
                      }}
                    >
                      {state.incomeTypeTools.map((tool, index) =>
                        <Select.Option key={index} value={tool}>
                          {tool}
                        </Select.Option>
                      )}
                    </Select>
                  </div>
                </div>

                {/* col */}
                <div className="income-table-col">
                  <div className="income-table-key">
                    Наименование
                  </div>
                  <div className="income-table-value">
                    <CustomSelect
                      type="text"
                      options={state.incomeTools}
                      value={selectedIncomeToolName}
                      onChange={value => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].income[index].selectedIncomeToolName = value;
                        context.setState({ data });
                      }}
                      onAddOption={(newOption, options) => {
                        context.setState({ incomeTools: options });
                      }}
                    />
                  </div>
                </div>

                {/* col */}
                <div className="income-table-col">
                  <div className="income-table-key">
                    Значение
                  </div>
                  <div className="income-table-value">
                    <NumericInput
                      defaultValue={value}
                      format={formatNumber}
                      unsigned="true"
                      onBlur={val => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].income[index].value = val;
                        context.setState({ data });
                      }}
                    />
                  </div>
                </div>
                {/* col */}
              </div>
            </>
          );
        })}
      </div>
      <div className="buttons-container">
        <Button
          className="table-panel__add-button custom-btn"
          onClick={() => {
            const data = cloneDeep(state.data);
            const income = cloneDeep(data[currentRowIndex].income);

            income.push({
              selectedIncomeToolName: "Работа",
              incomeTypeName:         "Постоянные",
              value:                  0
            });
            data[currentRowIndex].income = income;
            context.setState({ data });
          }}
        >
          Добавить
        </Button>

        <Button
          className="table-panel__add-button custom-btn"
          disabled={income.length === 1}
          onClick={() => {
            const data = cloneDeep(state.data);
            const income = cloneDeep(data[currentRowIndex].income);
            income.pop();
            data[currentRowIndex].income = income;
            context.setState({ data });
          }}
        >
          Удалить
        </Button>
      </div>
    </Panel>
  );
}