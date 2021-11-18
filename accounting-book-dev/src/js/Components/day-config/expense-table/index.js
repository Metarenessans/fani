import React, { useContext } from "react"
import { Button, DatePicker, Select, Input  } from "antd"
import locale from "antd/es/date-picker/locale/ru_RU"
import moment from "moment"
import { cloneDeep } from "lodash"
import Value from "../../../../../../common/components/value"
import round from "../../../../../../common/utils/round"
import formatNumber from "../../../../../../common/utils/format-number"
import StatsPanel from "../../panel"
import CustomSelect from "../../../../../../common/components/custom-select"

import { StateContext } from "../../../App"

import "./style.scss"
import NumericInput from "../../../../../../common/components/numeric-input"

export default function ExpenseTable() {
  const context = useContext(StateContext);
  const { state } = context;
  const {
    data,
    currentRowIndex, 
  } = state;
  const { expense, income } = data[currentRowIndex]

  return (
    <StatsPanel className="expense-table" title="Расходы">
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
                value,
              } = item
              return (
                <tr key={index}>
                  <td>
                    <Select
                      value={expenseTypeName}
                      style={{ width: "100%" }}
                      onChange={ val => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].expense[index]["expenseTypeName"] = val;
                        context.setState({ data })
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
                      options={data[currentRowIndex].paymentTools}
                      value={selectedPaymentToolName}
                      onChange={value => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].expense[index]["selectedPaymentToolName"] = value;
                        context.setState({ data })
                      }}
                      onAddOption={(newOption, options) => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].paymentTools = options;
                        context.setState({ data })
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
                        context.setState({ data })
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Button
        className="table-panel__add-button custom-btn"
        onClick={ () => {
          const data = cloneDeep(state.data);
          const expense = cloneDeep(data[currentRowIndex].expense);

          expense.push({
            expenseTypeName:        "Важные",
            selectedPaymentToolName: "Жилье",
            value:                         0,
          });
          data[currentRowIndex].expense = expense;
          context.setState({ data });
        }}
      >
        Добавить
      </Button>

      <Button
        className="table-panel__add-button custom-btn"
        disabled={expense.lenght === 1}
        onClick={ () => {
          const data = cloneDeep(state.data);
          const expense = cloneDeep(data[currentRowIndex].expense);

          expense.splice(expense.lenght - 1, 1);
          data[currentRowIndex].expense = expense;
          context.setState({ data });
        }}
      >
        Удалить
      </Button>
    </StatsPanel>
  )
}