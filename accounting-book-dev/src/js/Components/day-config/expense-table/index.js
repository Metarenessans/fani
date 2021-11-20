import React, { useContext } from "react";
import { Button, Select, Input  } from "antd";
import { cloneDeep } from "lodash";

import CustomSelect from "../../../../../../common/components/custom-select";
import NumericInput from "../../../../../../common/components/numeric-input";
import formatNumber from "../../../../../../common/utils/format-number";

import Panel from "../../panel";

import { StateContext } from "../../../App";

import "./style.scss";

export default function ExpenseTable() {
  const context = useContext(StateContext);
  const { state } = context;
  const {
    data,
    currentRowIndex
  } = state;
  const { expense } = data[currentRowIndex];

  return (
    <Panel className="expense-table expense-table--payments-title" title="Расходы">
      <div className="expense-table-table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Вид</th>
              <th>Наименование</th>
              <th>Значение</th>
            </tr>
            {expense.map((item, index) => {
              const { 
                expenseTypeName,
                selectedPaymentToolName,
                value
              } = item;
              return (
                <tr key={index}>
                  <td>
                    <Select
                      value={expenseTypeName}
                      style={{ width: "100%" }}
                      onChange={value => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].expense[index].expenseTypeName = value;
                        context.setState({ data });
                      }}
                    >
                      {state.expenseTypeTools.map((tool, index) =>
                        <Select.Option key={index} value={tool}>
                          {tool}
                        </Select.Option>
                      )}
                    </Select>
                  </td>
                  <td>
                    <CustomSelect
                      type="text"
                      options={state.paymentTools}
                      value={selectedPaymentToolName}
                      onChange={value => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].expense[index].selectedPaymentToolName = value;
                        context.setState({ data });
                      }}
                      onAddOption={(newOption, options) => {
                        context.setState({ paymentTools: options });
                      }}
                    />
                  </td>
                  <td>
                    <NumericInput
                      defaultValue={value}
                      format={formatNumber}
                      onBlur={val => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].expense[index].value = val;
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
      <div className="buttons-container">
        <Button
          className="table-panel__add-button custom-btn"
          onClick={() => {
            const data = cloneDeep(state.data);
            const expense = cloneDeep(data[currentRowIndex].expense);

            expense.push({
              expenseTypeName:         "Важные",
              selectedPaymentToolName: "Жилье",
              value:                   0
            });
            data[currentRowIndex].expense = expense;
            context.setState({ data });
          }}
        >
          Добавить
        </Button>

        <Button
          className="table-panel__add-button custom-btn"
          disabled={expense.length === 1}
          onClick={() => {
            const data = cloneDeep(state.data);
            const expense = cloneDeep(data[currentRowIndex].expense);
            expense.pop();
            data[currentRowIndex].expense = expense;
            context.setState({ data });
          }}
        >
          Удалить
        </Button>
      </div>
    </Panel>
  );
}