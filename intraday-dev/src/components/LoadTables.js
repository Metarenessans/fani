import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { LoadTable } from "./LoadTable";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import $ from "jquery";

export const LoadTables = () => {
  const {
    loadTables,
    getTools,
    getInvestorInfo,
    getIntradaySnapshots,
    getIntradaySnapshot,
    addIntradaySnapshot,
    loading,
  } = useContext(GlobalContext);

  const initSnap = async () => {
    await addIntradaySnapshot({
      name: "tool3",
      static: JSON.stringify({ works: true, toolType: "shareUs" }),
    });

    await getIntradaySnapshots();
    await getIntradaySnapshot();
  };

  useEffect(() => {
    getInvestorInfo();
    getTools();
    initSnap();
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
