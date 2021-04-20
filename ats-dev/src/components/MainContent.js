import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { FreeFundsSector } from "./FreeFundsSector";
import { RiskProfitSector } from "./RiskProfitSector";
import { CorellatedSector } from "./CorellatedSector";
import { RnsSector } from "./RnsSector";
import { FuturesLoadingSector } from "./FuturesLoadingSector";
import { SharesLoadingSector } from "./SharesLoadingSector";

export const MainContent = () => {
  const { activeView, loading } = useContext(GlobalContext);

  const antIcon = <LoadingOutlined spin />;

  const Loader = () => {
    return (
      <div className="container">
        <div className="load-tables_spin">
          <Spin indicator={antIcon} />
          Подождите, данные загружаются...
        </div>
      </div>
    );
  };

  const Content = () => {
    switch (activeView) {
      case 0:
        return <FreeFundsSector />;
      case 1:
        return <RiskProfitSector />;
      case 2:
        return <CorellatedSector />;
      case 3:
        return <RnsSector />;
      case 4:
        return <CorellatedSector />;
      case 5:
        return <FuturesLoadingSector />;
      default:
        return <SharesLoadingSector />;
    }
  };

  return (
    <section className="main-content">
      {loading ? <Loader /> : <Content />}
    </section>
  );
};
