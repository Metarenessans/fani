import React, { useContext, useState, useEffect, useRef } from "react";
import { GlobalContext } from "../context/GlobalState";
import { Col, Row } from "antd";
import { InputNumber } from "antd4";

export const DataInputs = () => {
  const {
    iterationQty,
    setIterationQty,
    stopValue,
    setStopValue,
    minYield,
    setMinYield,
    yieldStep,
    setYieldStep,
  } = useContext(GlobalContext);

  const iterationQtyRef = useRef(null);
  const stopValueRef = useRef(null);
  const minYieldRef = useRef(null);
  const yieldStepRef = useRef(null);

  const [iterationQtyLocal, setIterationQtyLocal] = useState(iterationQty);
  const [stopValueLocal, setStopValueLocal] = useState(stopValue);
  const [minYieldLocal, setMinYieldLocal] = useState(minYield);
  const [yieldStepLocal, setYieldStepLocal] = useState(yieldStep);

  useEffect(() => {
    setIterationQtyLocal(iterationQty);
  }, [iterationQty]);

  useEffect(() => {
    setStopValueLocal(stopValue);
  }, [stopValue]);

  useEffect(() => {
    setMinYieldLocal(minYield);
  }, [minYield]);

  useEffect(() => {
    setYieldStepLocal(yieldStep);
  }, [yieldStep]);

  const parser = (value) => {
    if (typeof value === "string" && !value.length) {
      value = "0.00";
    }
    return value.replace(/[^\d.]|\.(?=.*\.)/g, "");
  };

  const handleKeyboard = (key, inputRef) => {
    const codes = ["Enter", "NumpadEnter", "Escape"];
    if (codes.includes(key.code)) {
      inputRef.current.blur();
    }
  };

  return (
    <section className="data-inputs">
      <div className="container">
        <Row gutter={[20]}>
          <Col xs={24} md={12} lg={6}>
            <p>Итераций</p>
            <InputNumber
              ref={iterationQtyRef}
              size="large"
              min={1}
              step={1}
              precision={0}
              value={iterationQtyLocal}
              onChange={setIterationQtyLocal}
              onKeyDown={(key) => handleKeyboard(key, iterationQtyRef)}
              onStep={async (value) => {
                await setIterationQtyLocal(value);
                await iterationQtyRef.current.blur();
              }}
              onBlur={() => setIterationQty(iterationQtyLocal)}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <p>Стоп</p>
            <InputNumber
              ref={stopValueRef}
              size="large"
              min={0.01}
              step={0.01}
              precision={2}
              formatter={(value) => `${value}%`}
              parser={parser}
              value={stopValueLocal}
              onChange={setStopValueLocal}
              onKeyDown={(key) => handleKeyboard(key, stopValueRef)}
              onStep={async (value) => {
                await setStopValueLocal(value);
                await stopValueRef.current.blur();
              }}
              onBlur={() => setStopValue(stopValueLocal)}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <p>Мин. доходность</p>
            <InputNumber
              ref={minYieldRef}
              size="large"
              min={0.01}
              step={0.01}
              precision={2}
              formatter={(value) => `${value}%`}
              parser={parser}
              value={minYieldLocal}
              onChange={setMinYieldLocal}
              onKeyDown={(key) => handleKeyboard(key, minYieldRef)}
              onStep={async (value) => {
                await setMinYieldLocal(value);
                await minYieldRef.current.blur();
              }}
              onBlur={() => setMinYield(minYieldLocal)}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <p>Шаг доходности</p>
            <InputNumber
              ref={yieldStepRef}
              size="large"
              min={0.01}
              step={0.01}
              precision={2}
              formatter={(value) => `${value}%`}
              parser={parser}
              value={yieldStepLocal}
              onChange={setYieldStepLocal}
              onKeyDown={(key) => handleKeyboard(key, yieldStepRef)}
              onStep={async (value) => {
                await setYieldStepLocal(value);
                await yieldStepRef.current.blur();
              }}
              onBlur={() => setYieldStep(yieldStepLocal)}
            />
          </Col>
        </Row>
      </div>
    </section>
  );
};
