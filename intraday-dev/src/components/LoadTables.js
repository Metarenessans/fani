import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { LoadTable } from "./LoadTable";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const LoadTables = () => {
  const {
    loadTables,
    getTools,
    getInvestorInfo,
    getIntradaySnapshots,
    getIntradaySnapshot,
    addIntradaySnapshot,
    updateIntradaySnapshot,
    deleteIntradaySnapshot,
    loading,
  } = useContext(GlobalContext);

  const initSnap = async () => {
    await getIntradaySnapshots();

    // await getIntradaySnapshot(7);

    // await addIntradaySnapshot({
    //   name: "toolZ",
    //   static: JSON.stringify({ works: true, toolType: "shareUs" }),
    // });

    // await updateIntradaySnapshot({
    //   id: 24,
    //   name: "upd1",
    //   static: JSON.stringify({ works: "yesss", toolType: "shareUs" }),
    // });

    // await deleteIntradaySnapshot(id);

    // await getIntradaySnapshots();
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
