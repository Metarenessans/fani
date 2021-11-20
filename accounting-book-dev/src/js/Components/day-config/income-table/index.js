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
    <Panel className="income-table" title="Доходы">
      <div className="income-table-table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Вид</th>
              <th>Наименование</th>
              <th>Значение</th>
            </tr>
            {income.map((item, index) => {
              const {
                incomeTools,
                selectedIncomeToolName,
                incomeTypeName,
                value
              } = item;
              return (
                <tr key={index}>
                  <td>
                    <Select
                      value={incomeTypeName}
                      key={incomeTypeName}
                      style={{ width: "100%" }}
                      onChange={val => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].income[index]["incomeTypeName"] = val;
                        context.setState({ data });
                      }}
                    >
                      {state.incomeTypeTools.map((tool, index) =>
                        <Select.Option key={index} value={tool}>
                          {tool}
                        </Select.Option>
                      )}
                    </Select>
                  </td>
                  <td>
                    <CustomSelect
                      type="text"
                      options={data[currentRowIndex].incomeTools}
                      value={selectedIncomeToolName}
                      onChange={ value => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].income[index]["selectedIncomeToolName"] = value;
                        context.setState({ data });
                      }}
                      onAddOption={(newOption, options) => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].incomeTools = options;
                        context.setState({ data });
                      }}
                    />
                  </td>
                  <td>
                    <NumericInput
                      defaultValue={value}
                      format={formatNumber}
                      onBlur={val => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].income[index].value = val;
                        context.setState({ data });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
    </Panel>
  );
}