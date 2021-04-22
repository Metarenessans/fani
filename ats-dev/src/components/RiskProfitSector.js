import React from "react";
import { Table, Tabs } from "antd";

const { TabPane } = Tabs;

const dataSource = [
  {
    key: "1",
    loadPercent: 1,
    steps: 2,
    output: 3,
  },
  {
    key: "2",
    loadPercent: 4,
    steps: 5,
    output: 6,
  },
];

const columns = [
  {
    title: "% разгрузки",
    dataIndex: "loadPercent",
    key: "loadPercent",
  },
  {
    title: "% догрузки и этапы",
    dataIndex: "steps",
    key: "steps",
  },
  {
    title: "Выход: КОД + уровни",
    dataIndex: "output",
    key: "output",
  },
];

function callback(key) {
  // console.log(key);
}

export const RiskProfitSector = () => {
  return (
    <div className="container">
      <h2>Дневной норматив Риск / Прибыль: КРАБ</h2>
      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="Акции Америка" key="1">
          <Table dataSource={dataSource} columns={columns} />
        </TabPane>
        <TabPane tab="ОФЗ" key="2">
          ОФЗ
        </TabPane>
        <TabPane tab="Акции Россия лонг" key="3">
          Акции Россия лонг
        </TabPane>
      </Tabs>
    </div>
  );
};
