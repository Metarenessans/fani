import React, { useContext } from 'react'
import BalanceTable from "./balance-table"
import ExpenseTable from "./expense-table"
import IncomeTable from "./income-table"

import { StateContext } from "../../App"

import "./style.scss"
import { cloneDeep } from 'lodash'

export default class DayConfig extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {}
  }

  render() {

    return (
      <StateContext.Consumer>
        {context => {
          const { state } = context;
          const { 
            data, 
            currentRowIndex, 
          } = state;
          const { expense, deals } = data[currentRowIndex];

          return (
            <div className="day-config">
              <BalanceTable/>
              <ExpenseTable/>
              <IncomeTable/>
            </div>
          )
        }}
      </StateContext.Consumer>
    )
  }
}
