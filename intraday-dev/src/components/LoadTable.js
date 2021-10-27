import React, { useContext, useEffect, useRef, useState } from "react";
import { ToolRow } from "./ToolRow";
import { StepRow } from "./StepRow";
import { GlobalContext } from "../context/GlobalState";
import { numWithSpaces } from "../utils/format";
import { ExtraStepInput } from "./ExtraStepInput";

import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

import { Row, Col, Button } from "antd";
import { InputNumber } from "antd4";

export const LoadTable = ({ tableIdx }) => {
  const {
    tools,
    investorInfo,
    loadTables,
    addLoadTable,
    deleteLoadTable,
    addTool,
    stopValue,
    setLoadValue,
    minYield,
    yieldStep,
    adrMode,
    updateSteps,
    addStepColumn,
    loading
  } = useContext(GlobalContext);

  const table = loadTables[tableIdx];

  const scrollBottom = () => {
    document.body.scrollTop = 99999;
    document.documentElement.scrollTop = 99999;
  }

  useEffect(() => {
    updateSteps(tableIdx, updatedSteps(table.steps.length));
  }, [minYield, yieldStep]);

  const scrollTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  useEffect(() => {
    scrollTop();
  }, [loading])

  const tableRef = useRef(null);
  const inputRef = useRef(null);

  const updatedSteps = (stepsQty) => {
    const steps = [];
    for (let i = 0; i < stepsQty; i++) {
      steps.push(+(minYield + yieldStep * i).toFixed(2));
    }

    return steps;
  }; 

  const load = (investorInfo.deposit * table.loadValue) / 100;

  const options = tools.map((tool, idx) => {
    const toolName =
      tool.ref.toolType === "futures" ? tool.shortName : tool.fullName;

    return {
      idx: idx,
      label: `${toolName}(${tool.code})`,
    };
  });

  const matchedTools = [];
  table.selectedTools.map((selectedTool) => {
    tools.map((tool, idx) => {
      if (
        tool.code === selectedTool.code &&
        tool.ref.toolType === selectedTool.toolType
      ) {
        const guarantee = +tool.guarantee;

        const contracts = Math.floor(
          (investorInfo.deposit * table.loadValue) / 100 / guarantee
        );

        const stop =
          contracts > 0
            ? ((investorInfo.deposit * stopValue * 0.01) /
                (contracts * tool.stepPrice)) *
              tool.priceStep
            : 0;

        let adrValue;
        switch (adrMode) {
          case "day": {
            adrValue = tool.adrDay;
            break;
          }
          case "week":
            adrValue = tool.adrWeek;
            break;
          case "month":
            adrValue = tool.adrMonth;
            break;
          default:
            adrValue = 0;
        }

        matchedTools.push({
          ...tool,
          idx,
          price: tool.currentPrice,
          guarantee,
          contracts,
          priceStep: tool.priceStep,
          stepPrice: tool.stepPrice,
          stop,
          adrValue,
        });
      }
    });
  });

  const [toolsVisible, setToolsVisible] = useState(true);
  const [loadsVisible, setLoadsVisible] = useState(false);
  const [loadValueLocal, setLoadValueLocal] = useState(table.loadValue);

  useEffect(() => {
    setLoadValueLocal(table.loadValue);
  }, [table]);

  return (
    <div className="container load-table">
      <Row gutter={[20]}>
        <Col
          xs={24}
          lg={12}
          className={`tools ${toolsVisible ? "xsVisible" : ""}`}
        >
          <Row gutter={[20]} align="top" className="load-header">
            <Col center="xs" xs={8}>
              <p className="load-header_title">Загрузка</p>
            </Col>
            <Col xs={8}>
              <InputNumber
                ref={inputRef}
                size="large"
                min={0.01}
                max={100.0}
                step={0.01}
                precision={2}
                formatter={(value) => `${value}%`}
                parser={(value) => {
                  if (typeof value === "string" && !value.length) {
                    value = "0.00";
                  }
                  return value.replace(/[^\d.]|\.(?=.*\.)/g, "");
                }}
                value={loadValueLocal}
                onChange={setLoadValueLocal}
                // onKeyDown={(key) => {
                //   const codes = ["Enter", "NumpadEnter", "Escape"];
                //   if (codes.includes(key.code)) {
                //     inputRef.current.blur();
                //   }
                // }}
                onKeyDown={e => {
                  if (e.keyCode == 13) {
                    inputRef.current.blur()
                  }

                  if (e.keyCode == 27) {
                    inputRef.current.blur()
                  }
                }}
                onStep={async (value) => {
                  await setLoadValueLocal(value);
                  await inputRef.current.blur();
                }}
                onBlur={() => setLoadValue(tableIdx, loadValueLocal)}
              />
            </Col>
            <Col xs={8}>
              <p className="load-value">{numWithSpaces(load.toFixed())}</p>
            </Col>
          </Row>
          <Row gutter={[8, 0]} className="load-tableRow">
            <Col xs={22} md={23} lg={24}>
              <div className="table">
                <div className="thead">
                  <div className="col tool">Инструмент</div>
                  <div className="col">Цена/ГО</div>
                  <div className="col">Контракты</div>
                  <div className="col">ADR</div>
                  <div className="col">Стоп ₽/$</div>
                </div>
                <div className="tbody">
                  {matchedTools.map((tool, rowIdx) => (
                    <ToolRow
                      key={rowIdx}
                      tableIdx={tableIdx}
                      rowIdx={rowIdx}
                      tool={tool}
                      options={options}
                    />
                  ))}
                </div>
              </div>
            </Col>
            <Col xs={2} md={1} lg={0}>
              <Button
                className="table-details-btn table-toggle"
                onClick={() => {
                  setToolsVisible(false);
                  setLoadsVisible(true);
                }}
              >
                Подробнее
              </Button>
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          lg={12}
          className={`loads ${loadsVisible ? "xsVisible" : ""}`}
        >
          <Row gutter={[8, 0]}>
            <Col xs={2} md={1} lg={0}>
              <Button
                className="all-tools-btn table-toggle"
                onClick={() => {
                  setToolsVisible(true);
                  setLoadsVisible(false);
                }}
              >
                Все инструменты
              </Button>
            </Col>

            <Col xs={22} md={23} lg={24}>
              <div className="table" ref={tableRef}>
                <div className="thead">
                  <div className="stepsRow">
                    {table.steps.map((step, i) => {
                      return <p className="step" key={i}>{`${step}%`}</p>;
                    })}
                    {table.extraSteps.map((step, columnIdx) => (
                      <ExtraStepInput
                        key={columnIdx}
                        tableIdx={tableIdx}
                        columnIdx={columnIdx}
                        step={step}
                      />
                    ))}
                    {
                      <Button
                        className="add-step-column-btn"
                        onClick={async () => {
                          await addStepColumn(tableIdx);
                          tableRef.current.scrollLeft += 10000;
                        }}
                      >
                        +
                      </Button>
                    }
                  </div>
                  <div className="add-step-column-wrap">
                    <Button
                      className="add-step-column-mobile-btn"
                      onClick={async () => {
                        await addStepColumn(tableIdx);
                        tableRef.current.scrollLeft += 10000;
                      }}
                    >
                      <span className="sign">+</span>
                      <span>Добавить</span>
                    </Button>
                  </div>
                </div>
                <div className="tbody">
                  <div className="move-header-wrap">
                    <div className="move-header">Ход</div>
                  </div>
                  {matchedTools.map((tool, rowIdx) => (
                    <StepRow
                      key={rowIdx}
                      tableIdx={tableIdx}
                      rowIdx={rowIdx}
                      tool={tool}
                    />
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={[8, 0]} className="func-buttons-row">
        <Col xs={24} md={8}>
          <Button
            className="func-button add-tool-btn"
            onClick={(e) => addTool(tableIdx)}
          >
            <PlusOutlined aria-label="Добавить инструмент" />
            Инструмент
          </Button>
        </Col>

        <Col xs={24} md={8}>
          {tableIdx == loadTables.length - 1 ? (
            <Button
              className="func-button add-load-table-btn"
              onClick={() => {
                addLoadTable()
                  .then(() => scrollBottom())
              }}
            >
              <PlusOutlined aria-label="Добавить загрузку" />
              Добавить загрузку
            </Button>
          ) : (
            <div style={{ width: 255 }}></div>
            )}
        </Col>

        <Col xs={24} md={8}>
          {tableIdx > 0 ? (
            <Button
              className="func-button delete-load-table-btn"
              onClick={(e) => deleteLoadTable(tableIdx)}
            >
              <MinusOutlined aria-label="Удалить загрузку" />
              Удалить загрузку
            </Button>
          ) : (
            <div style={{ width: 255 }}></div>
          )}
        </Col>
      </Row>
    </div>
  );
};
