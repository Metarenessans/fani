import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { LoadTable } from "./LoadTable";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const LoadTables = () => {
  const { loadTables, getTools, getInvestorInfo, loading } =
    useContext(GlobalContext);

  useEffect(() => {
    getInvestorInfo();
    getTools();
    setInterval(getTools, 120000);
  }, []);

  const tables = loadTables.map((table, tableIdx) => (
    <LoadTable key={tableIdx} tableIdx={tableIdx} />
  ));

  const antIcon = <LoadingOutlined spin />;

  const Loader = () => {
    return (
      <div className="container">
        <div className="load-tables_spin">
          <Spin indicator={antIcon} />
          Подождите, инструменты загружаются...
        </div>
      </div>
    );
  };

  return (
    <section className="load-tables">{loading ? <Loader /> : tables}</section>
  );
};
