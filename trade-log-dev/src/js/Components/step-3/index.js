import React, { useContext } from 'react'
import { Tooltip, Select, Checkbox} from 'antd/es'
import { cloneDeep } from "lodash"
import clsx from 'clsx'

import { Tools } from "../../../../../common/tools"

import ResultPanel from "../result-panel"

import { StateContext } from "../../App"

import "./style.scss"

export default function ThirdStep(props) {

  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const { reportMonitor, deals } = data[currentRowIndex];

  return (
    <div {...props} className="third-step">
      <ResultPanel/>
      <div className="title">
        Мониторинг раппорта
      </div>

      <div className="third-step-table">
        {/* row */}
        <div className="table-row">
          <div className="table-base-column">
            <div className="table-base-column-key">
              Параметры на отслеживание
            </div>

            <div className="table-base-column-value">
              Восприяте общего направления тренда
            </div>
          </div>
          <div className="table-extra-column-container scroll-hide">
            {deals.map((deal, index) => {
              const { baseTrendDirection } = reportMonitor[index];
              return (
                <div className="table-extra-column" key={index}>
                  <Tooltip
                    title={() => {
                      let hours   = new Date(deal.enterTime).getHours();
                      let minutes = new Date(deal.enterTime).getMinutes();
                      let formattedHours   = String(hours).padStart(2, "0");
                      let formattedMinutes = String(minutes).padStart(2, "0");
                      let time = formattedHours + ":" + formattedMinutes;
                      
                      let selectedToolIndex  = Tools.getToolIndexByCode(state.tools, deal.currentToolCode);
                      let selectedTool       = state.tools[selectedToolIndex];
                      let preferableToolName = selectedTool.shortName || selectedTool.fullName;

                      if (deal.enterTime != null) {
                        return time + " | " + preferableToolName;
                      }
                      else return preferableToolName;
                    }}
                  >
                    <div className="table-extra-column-key">
                      {(index + 1) + " " + "сделка"}
                    </div>
                  </Tooltip>

                  <div className="table-extra-column-value">
                    <div className="table-extra-column-value-row">
                      <p>Long</p>
                      <Checkbox
                        className="green"
                        checked={baseTrendDirection === true}
                        onChange={ e => {
                          const data = cloneDeep(state.data);
                          
                          if (baseTrendDirection === true) {
                            data[currentRowIndex].reportMonitor[index].baseTrendDirection = null;
                          }
                          else {
                            data[currentRowIndex].reportMonitor[index].baseTrendDirection = true;
                          }
                          context.setState({ data });
                        }}
                      />
                    </div>
                    <div className="table-extra-column-value-row">
                      <p>Short</p>
                      <Checkbox
                        className="red"
                        checked={baseTrendDirection === false}
                        onChange={e => {
                          const data = cloneDeep(state.data);

                          if (baseTrendDirection === false) {
                            data[currentRowIndex].reportMonitor[index].baseTrendDirection = null;
                          }
                          else {
                            data[currentRowIndex].reportMonitor[index].baseTrendDirection = false;
                          }
                          context.setState({ data });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* row */}

        {/* row */}
        <div className="table-row">
          <div className="table-base-column">
            <div className="table-base-column-value">
              Восприятие направления в моменте
            </div>
          </div>
          <div className="table-extra-column-container scroll-hide">
            {deals.map((item, index) => {
              const { momentDirection } = reportMonitor[index];
              return (
                <div className="table-extra-column" key={index}>
                  <div className="table-extra-column-value">
                    <div className="table-extra-column-value-row">
                      <p>Long</p>
                      <Checkbox
                        className="green"
                        checked={momentDirection === true}
                        onChange={ e => {
                          const data = cloneDeep(state.data);

                          if (momentDirection === true) {
                            data[currentRowIndex].reportMonitor[index].momentDirection = null;
                          }
                          else {
                            data[currentRowIndex].reportMonitor[index].momentDirection = true;
                          }
                          context.setState({ data });
                        }}
                      />
                    </div>
                    <div className="table-extra-column-value-row">
                      <p>Short</p>
                      <Checkbox
                        className="red"
                        checked={momentDirection === false}
                        onChange={ e => {
                          const data = cloneDeep(state.data);

                          if (momentDirection === false) {
                            data[currentRowIndex].reportMonitor[index].momentDirection = null;
                          }
                          else {
                            data[currentRowIndex].reportMonitor[index].momentDirection = false;
                          }
                          context.setState({ data });
                          
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* row */}

        {/* row */}
        <div className="table-row">
          <div className="table-base-column">
            <div className="table-base-column-value">
              Сомнения в принятом решении
            </div>
          </div>
          <div className="table-extra-column-container scroll-hide">
            {deals.map((item, index) => {
              const { doubts } = reportMonitor[index];
              return (
                <div className="table-extra-column" key={index}>
                  <div className="table-extra-column-value">
                    <div className="table-extra-column-value-row">
                      <p>Нет</p>
                      <Checkbox
                        className="green"
                        checked={doubts === true}
                        onChange={e => {
                          const data = cloneDeep(state.data);

                          if (doubts === true) {
                            data[currentRowIndex].reportMonitor[index].doubts = null;
                          }
                          else {
                            data[currentRowIndex].reportMonitor[index].doubts = true;
                          }
                          context.setState({ data });
                        }}
                      />
                    </div>
                    <div className="table-extra-column-value-row">
                      <p>Да</p>
                      <Checkbox
                        className="red"
                        checked={doubts === false}
                        onChange={e => {
                          const data = cloneDeep(state.data);

                          if (doubts === false) {
                            data[currentRowIndex].reportMonitor[index].doubts = null;
                          }
                          else {
                            data[currentRowIndex].reportMonitor[index].doubts = false;
                          }
                          context.setState({ data });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* row */}

        {/* row */}
        <div className="table-row">
          <div className="table-base-column table-base-column--result">
            <p>Результат сделки</p>
          </div>
          <div className="table-extra-column-container">
            {deals.map((item, index) => {
              const { result } = item
              return (
                <div className="table-extra-column" key={index}>
                  <div className="table-extra-column-value table-extra-column-value--result">
                    <span className={clsx("circle", result >= 0 ? (result == 0 ? "default" :"positive") : "negative")} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* row */}
      </div>

    </div>
  );
}


