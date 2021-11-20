import React from "react";
import BalanceTable from "./balance-table";
import ExpenseTable from "./expense-table";
import IncomeTable  from "./income-table";

import "./style.scss";

export default function DayConfig() {
  return (
    <div className="day-config">
      <BalanceTable />
      <ExpenseTable />
      <IncomeTable />
    </div>
  );
}