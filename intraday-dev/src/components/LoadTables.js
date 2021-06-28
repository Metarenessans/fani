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
    addIntradaySnapshot,
    loading,
  } = useContext(GlobalContext);

  const initSnap = async () => {
    await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/?method=addIntradaySnapshot",
      method: "POST",
      data: {
        name: "loadTables",
        data: JSON.stringify({
          loadTables: [
            {
              selectedTools: [
                { code: "VLO", toolType: "shareUs" },
                { code: "TTM1", toolType: "futures" },
                { code: "AAPL", toolType: "shareUs" },
                { code: "ABRD", toolType: "shareRu" },
                { code: "MU", toolType: "shareUs" },
                { code: "SBER", toolType: "shareRu" },
              ],
              loadValue: 1,
              guaranteeMode: "LONG",
            },
          ],
        }),
      },
      success: function (response) {
        console.log(response);
      },
    });

    // await addIntradaySnapshot(
    //   "user@mail.ru",
    //   '{"code":"VLO"}'
    // JSON.stringify({
    //   adrMode: "day",
    //   iterationQty: 10,
    //   stopValue: 0.5,
    //   minYield: 0.5,
    //   yieldStep: 0.02,
    //   loadTables: [
    //     {
    //       selectedTools: [
    //         { code: "VLO", toolType: "shareUs" },
    //         { code: "TTM1", toolType: "futures" },
    //         { code: "AAPL", toolType: "shareUs" },
    //         { code: "ABRD", toolType: "shareRu" },
    //         { code: "MU", toolType: "shareUs" },
    //         { code: "SBER", toolType: "shareRu" },
    //       ],
    //       loadValue: 1,
    //       guaranteeMode: "LONG",
    //     },
    //   ],
    // })
    // );
    await getIntradaySnapshots();
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
