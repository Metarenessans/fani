import React, { useContext, useEffect } from "react";
import { cloneDeep } from "lodash";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import DashboardRow from "./DashboardRow";
import { StateContext } from "../App";

export default function Dashboard(props) {
  const context = useContext(StateContext);
  const { state } = context;
  const { sortProp, sortDESC, tools } = state;

  let data = cloneDeep(state.data);
  if (sortProp != null && sortDESC != null) {
    data = data.sort((l, r) => sortDESC
      ? r[sortProp] - l[sortProp]
      : l[sortProp] - r[sortProp]
    );
  }

  return (
    <div className="dashboard">
      {
        tools.length > 0
          ?
          data.map((item, index) =>
            <DashboardRow
              tooltipPlacement={state.tooltipPlacement}
              key={index}
              item={item}
              index={index}
              sortProp={sortProp}
              sortDESC={sortDESC}
              mode={state.mode}
              depo={state.depo}
              toolsLoading={state.toolsLoading}
              toolsStorage={state.toolsStorage}
              percentage={item.percentage}
              selectedToolName={item.selectedToolName}
              planIncome={item.planIncome}
              tools={context.getTools()}
              options={context.getOptions()}
              onDropdownClose={() => context.imitateFetchcingTools()}
              onSort={(sortProp, sortDESC) => {
                if (sortProp !== state.sortProp) {
                  sortDESC = true;
                }
                context.setState({ sortProp, sortDESC });
              }}
              onUpdate={async state => {
                // const data = cloneDeep(state.data);
                data[index] = {
                  ...cloneDeep(data[index]),
                  ...cloneDeep(state),
                  updatedOnce: true
                };
                context.dataBuffer = data;
                // console.log("onUpdate", index);
                // return context.setStateAsync({ data });
              }}
              onChange={async (prop, val) => {
                if (prop == "isToolsDropdownOpen") {
                  context.setState({ isToolsDropdownOpen: val });
                  return;
                }

                const data = cloneDeep(state.data);
                data[index][prop] = val;
                if (prop == "selectedToolName") {
                  data[index].planIncome = null;
                }
                console.log("onChange", index, prop, val);
                return context.setStateAsync({ data, changed: true });
              }}
              onDelete={async index => {
                const data = cloneDeep(state.data);
                data.splice(index, 1);
                return context.setStateAsync({ data, changed: true });
              }}
            />
          )
          :
          <span className="dashboard__loading">
            <Spin
              className="dashboard__loading-icon"
              indicator={
                <LoadingOutlined style={{ fontSize: 24 }} spin />
              }
            />
            Подождите, инструменты загружаются...
          </span>
      }
    </div>
  );
}