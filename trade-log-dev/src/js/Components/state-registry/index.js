import React, { useContext } from "react";

import { Tooltip, Checkbox } from "antd/es";
import { Tools } from "../../../../../common/tools";

import Panel from "../panel";

import { StateContext } from "../../App";

import "./style.scss";
import { cloneDeep } from "lodash";

export default function StateRegistry() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const currentDay = data[currentRowIndex];
  
  return (
    <Panel 
      title="Регистр состояний" 
      className="state-registry"
      contentClassName="state-registry-content"
    >
      <div className="table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Состояния</th>
              {currentDay.deals.map((deal, index) =>
                <Tooltip
                  key={index}
                  title={() => {
                    let hours   = String(new Date(deal.enterTime).getHours());
                    let minutes = String(new Date(deal.enterTime).getMinutes());
                    let formattedHours   = hours.split("").length === 1 ? "0" + hours : hours;
                    let formattedMinutes = minutes.split("").length === 1 ? "0" + minutes : minutes;
                    let time = formattedHours + ":" + formattedMinutes;
                    
                    let selectedToolIndex  = Tools.getToolIndexByCode(state?.tools, deal.currentToolCode);
                    let selectedToolData   = state?.tools[selectedToolIndex];
                    let preferableToolName = (selectedToolData?.shortName || selectedToolData?.fullName);

                    if (deal.enterTime != null) {
                      return time + " | " + preferableToolName;
                    }
                    else return preferableToolName;
                  }}
                >
                  <th key={index}>{index + 1} сделка</th>
                </Tooltip>
              )}
            </tr>
            <tr>
              <td className="category-title category-title--positive">Нормальные</td>
            </tr>

            {Object.keys(currentDay.deals[0].emotionalStates.positive).map((taskName, i) => {
              return (
                <tr key={i}>
                  <td>{taskName}</td>
                  {currentDay.deals.map((item, index) =>
                    <td key={index}>
                      <Checkbox
                        className="positive"
                        key={index}
                        checked={currentDay.deals[index].emotionalStates.positive[taskName]}
                        onChange={e => {
                          const { checked } = e.target;
                          const data = cloneDeep(state.data);
                          data[currentRowIndex].deals[index].emotionalStates.positive[taskName] = checked;
                          context.setState({ data });
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })}

            <tr>
              <td className="category-title category-title--negative">Искаженные</td>
            </tr>

            {Object.keys(currentDay.deals[0].emotionalStates.negative).map((taskName, i) => {
              return (
                <tr key={i}>
                  <td>{taskName}</td>
                  {currentDay.deals.map((item, index) =>
                    <td key={index}>
                      <Checkbox
                        className="negative"
                        key={index}
                        checked={currentDay.deals[index].emotionalStates.negative[taskName]}
                        onChange={e => {
                          const { checked } = e.target;
                          const data = cloneDeep(state.data);
                          data[currentRowIndex].deals[index].emotionalStates.negative[taskName] = checked;
                          context.setState({ data });
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
            <tr>
              <th>Мотивационные драйверы</th>
            </tr>
            <tr>
              <td className="category-title category-title--positive">Нормальные</td>
            </tr>

            {Object.keys(currentDay.deals[0].motives.positive).map((taskName, i) => {
              return (
                <tr key={i}>
                  <td>{taskName}</td>
                  {currentDay.deals.map((item, index) =>
                    <td key={index}>
                      <Checkbox
                        className="positive"
                        key={index}
                        checked={currentDay.deals[index].motives.positive[taskName]}
                        onChange={e => {
                          const { checked } = e.target;
                          const data = cloneDeep(state.data);
                          data[currentRowIndex].deals[index].motives.positive[taskName] = checked;
                          context.setState({ data });
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
            <tr>
              <td className="category-title category-title--negative">Искаженные</td>
            </tr>

            {Object.keys(currentDay.deals[0].motives.negative).map((taskName, i) => {
              return (
                <tr key={i}>
                  <td>{taskName}</td>
                  {currentDay.deals.map((item, index) =>
                    <td key={index}>
                      <Checkbox
                        className="negative"
                        key={index}
                        checked={currentDay.deals[index].motives.negative[taskName]}
                        onChange={e => {
                          const { checked } = e.target;
                          const data = cloneDeep(state.data);
                          data[currentRowIndex].deals[index].motives.negative[taskName] = checked;
                          context.setState({ data });
                        }}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}