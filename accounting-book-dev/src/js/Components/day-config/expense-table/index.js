import React, { useContext } from "react";
import { Button, Select, Input  } from "antd";
import { cloneDeep, flatten } from "lodash";

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
    month,
    currentRowIndex
  } = state;
  const { expense } = data[month - 1][currentRowIndex];

  return (
    <Panel className="expense-table expense-table--payments-title" title="Расходы">
      <div className="expense-table-wrapper">
        {expense.map((item, index) => {
          const { 
            expenseTypeName,
            selectedPaymentToolName,
            value
          } = item;
          return (
            <>
              <div className="expense-table-row">
                {/* col */}
                <div className="expense-table-col">
                  <div className="expense-table-key">
                    Вид
                  </div>
                  <div className="expense-table-value">
                    <Select
                      value={expenseTypeName}
                      style={{ width: "100%" }}
                      onChange={value => {
                        const data = cloneDeep(state.data);
                        data[month - 1][currentRowIndex].expense[index].expenseTypeName = value;
                        context.setState({ data });
                      }}
                    >
                      {state.expenseTypeTools.map((tool, index) =>
                        <Select.Option key={index} value={tool}>
                          {tool}
                        </Select.Option>
                      )}
                    </Select>
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="expense-table-col">
                  <div className="expense-table-key">
                    Наименование
                  </div>
                  <div className="expense-table-value">
                    <CustomSelect
                      type="text"
                      options={state.paymentTools}
                      value={selectedPaymentToolName}
                      onChange={value => {
                        const data = cloneDeep(state.data);
                        data[month - 1][currentRowIndex].expense[index].selectedPaymentToolName = value;
                        context.setState({ data });
                      }}
                      onAddOption={(newOption, options) => {
                        context.setState({ paymentTools: options });
                      }}
                    />
                  </div>
                </div>
                {/* col */}

                {/* col */}
                <div className="expense-table-col">
                  <div className="expense-table-key">
                    Значение
                  </div>
                  <div className="expense-table-value">
                    <NumericInput
                      defaultValue={value}
                      unsigned="true"
                      format={formatNumber}
                      onBlur={val => {
                        const data = cloneDeep(state.data);
                        data[month - 1][currentRowIndex].expense[index].value = val;
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
            const expense = cloneDeep(data[month - 1][currentRowIndex].expense);

            expense.push({
              expenseTypeName:         "Важные",
              selectedPaymentToolName: "Жилье",
              value:                   0
            });
            data[month - 1][currentRowIndex].expense = expense;
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
            const expense = cloneDeep(data[month - 1][currentRowIndex].expense);
            expense.pop();
            data[month - 1][currentRowIndex].expense = expense;
            context.setState({ data });
          }}
        >
          Удалить
        </Button>
      </div>
    </Panel>
  );
}