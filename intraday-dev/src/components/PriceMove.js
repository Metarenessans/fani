import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";

import Config from "./config";
import NumericInput from "./numeric-input";
import { Dialog, dialogAPI } from "./dialog";
import { template } from "../common/tools";
import formatNumber from "../common/utils/format-number";

import { Row, Col, Radio, Select, Tooltip } from "antd";

import { SettingFilled } from "@ant-design/icons";

const { Option } = Select;

export const PriceMove = () => {
  const {
    adrMode,
    setAdrMode,
    tools,
    customTools,
    investorInfo,
    updateDeposit,
  } = useContext(GlobalContext);

  return (
    <section className="price-move">
      <div className="container">
        <h1 className="page-title">ИП Аналитика</h1>

        <Row>
          <Col md={24} xs={0}>
            <Radio.Group
              className="tabs"
              value={adrMode}
              name="radiogroup"
              onChange={(e) => setAdrMode(e.target.value)}
            >
              <Radio className="selector" value="day">
                Дневной
                <span className="prefix">ход цены</span>
              </Radio>
              <Radio className="selector middle" value="week">
                Недельный
                <span className="prefix">ход цены</span>
              </Radio>
              <Radio className="selector" value="month">
                Месячный
                <span className="prefix">ход цены</span>
              </Radio>
            </Radio.Group>
          </Col>

          <Col xs={24} md={0}>
            <Select
              style={{ width: "100%" }}
              value={adrMode}
              onChange={(mode) => setAdrMode(mode)}
            >
              <Option value="day">Дневной</Option>
              <Option value="week">Недельный</Option>
              <Option value="month">Месячный</Option>
            </Select>
          </Col>
        </Row>

        <Tooltip title="Настройки" overlayStyle={{ fontSize: "1.25em" }}>
          <button
            className="settings-button js-open-modal main-top__settings"
            onClick={(e) => dialogAPI.open("config", e.target)}
          >
            <span className="visually-hidden">Открыть конфиг</span>
            <SettingFilled className="settings-button__icon" />
          </button>
        </Tooltip>
      </div>

      <Config
        id="config"
        title="Инструменты"
        template={template}
        tools={tools}
        toolsInfo={[
          { name: "Инструмент", prop: "name" },
          { name: "Код", prop: "code" },
          { name: "Цена шага", prop: "stepPrice" },
          { name: "Шаг цены", prop: "priceStep" },
          { name: "ГО", prop: "guarantee" },
          { name: "Текущая цена", prop: "currentPrice" },
          { name: "Размер лота", prop: "lotSize" },
          { name: "Курс доллара", prop: "dollarRate" },
          { name: "ADR", prop: "adrDay" },
          { name: "ADR неделя", prop: "adrWeek" },
          { name: "ADR месяц", prop: "adrMonth" },
        ]}
        customTools={customTools}
        onChange={(customTools) => {
          // this.setState({ customTools })
        }}
        insertBeforeDialog={
          <label className="input-group input-group--fluid ksd-config__depo">
            <span className="input-group__label">Размер депозита:</span>
            <NumericInput
              className="input-group__input"
              defaultValue={investorInfo.deposit}
              format={formatNumber}
              min={10000}
              max={Infinity}
              onBlur={(val) => {
                updateDeposit(val);
              }}
            />
          </label>
        }
      />
    </section>
  );
};
