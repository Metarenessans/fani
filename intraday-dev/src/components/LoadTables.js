import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { LoadTable } from "./LoadTable";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const LoadTables = () => {
  const { loadTables, loading } = useContext(GlobalContext);

  const scrollTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0
  }

  useEffect(() => {
    scrollTop();
  }, [loading])

  let tables = loadTables.map((table, tableIdx) => (
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
