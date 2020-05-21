import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Switch,
  Typography,
  Tag
} from 'antd/es'
const { Option } = Select;
const { Group } = Radio;
const { Text } = Typography;

import $ from "jquery"
import "chart.js"

import Header       from "./Components/Header/Header"
import CustomSlider from "./Components/CustomSlider/CustomSlider"
import NumericInput from "./Components/NumericInput"
import Item         from "./Components/Item"

import num2str from "./num2str"
import params from "./params";
import formatNumber from "./formatNumber"

import "../sass/main.sass"

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // ==================
      // Заполняется руками
      // ==================

      // Депозит
      depo: 2000000,

      items: [{
        id: 1
      }],

      // ===================
      // Вычисляемые значения
      // ===================

      // Свободные деньги
      freeMoney: 0,
      // Прошло пунктов против
      pointsAgainst: 0,
      // 
      incomeExpected: 0,

      tools: this.loadConfig() || [
        this.parseTool(`Золото (GOLD-6.20)	7,72011	0,1000	70	12 723,89	1 637,4	1	1`),
        this.parseTool(`Палладий (PLD-6.20)	0,77201	0,0100	70	51 425,37	2 147,19	1	1`),
        this.parseTool(`Доллар/рубль (Si-6.20)	1,00000	1,0000	150	12 258,76	77 370	1 000	1`),
        this.parseTool(`Нефть (BR-5.20)	7,72011	0,0100	50	7 884,21	34,74	10	1`),
        this.parseTool(`Индекс РТС (RTS-6.20)	15,44022	10,0000	700	38 429,92	105 280	1	1`),
        this.parseTool(`Сбербанк (SBRF-6.20)	1,00000	1,0000	250	5 012,61	18 835	100	1`),
        this.parseTool(`Магнит (MGNT-6.20)	1,00000	1,0000	50	861,73	3 224	1	1`),
        this.parseTool(`APPLE	0,77000	0,0100	120	18 422,3	239,25	1	77`),
        this.parseTool(`PG&E	0,77000	0,0100	80	606,8	7,88	1	77`),
        this.parseTool(`NVIDIA	0,77000	0,0100	250	18 608,6	241,67	1	77`),
        this.parseTool(`MICRON	0,77000	0,0100	140	3 169,3	41,16	1	77`),
        this.parseTool(`Сбербанк	0,10000	0,0100	100	1 856,4	185,64	10	1`),
        this.parseTool(`Магнит	0,10000	0,5000	90	3 189,0	3 189,0	1	1`),
        this.parseTool(`МосБиржа	0,10000	0,0100	60	990,0	99,00	10	1`),
        this.parseTool(`СургутНефтеГаз	0,50000	0,0050	350	3 638,5	36,385	100	1`),
        this.parseTool(`Газпром	1,00000	0,0100	90	1 897,7	189,77	10	1`),
        this.parseTool(`Алроса		0,0100	100	615,9	61,59	10	1`),
      ],
      
    };

    this.state.tools.map((tool, i) => Object.assign(tool, { id: i }));
    this.state.toolsTemp = [...this.state.tools];
    
    if (this.state.currentToolIndex > this.state.tools.length - 1) {
      this.state.currentToolIndex = this.state.tools.length - 1;
    }
  }

  parseTool(str) {
    var arr = str
      .replace(/\,/g, ".")
      .split(/\t/g)
      .map(n => (n + "").replace(/\"/g, "").replace(/(\d+)\s(\d+)/, "$1$2"));
    
    var obj = {
      name:             arr[0],
      stepPrice:       +arr[1] || 0,
      priceStep:       +arr[2] || 0,
      averageProgress: +arr[3] || 0,
      guaranteeValue:  +arr[4] || 0,
      currentPrice:    +arr[5] || 0,
      lotSize:         +arr[6] || 0,
      dollarRate:      +arr[7] || 0,

      points: [
        [ 70,  70 ],
        [ 156, 55 ],
        [ 267, 41 ],
        [ 423, 27 ],
        [ 692, 13 ],
        [ 960,  7 ],
      ]
    };
    console.log(arr);
    return obj;
  }

  bindEvents() {
    var $modal = $(".modal");
    var $body = $("body");
    $(".js-open-modal").click(e => {
      this.setState({ toolsTemp: [...this.state.tools] }, () => {
        $modal.addClass("visible");
        $body.addClass("scroll-disabled");
      });
    });

    $(".js-close-modal").click(e => {
      $modal.removeClass("visible");
      $body.removeClass("scroll-disabled");
    });
  }

  loadConfig() {
    // Read localStorage
    var config = localStorage.getItem("tools-tor");
    if (config) {
      try {
        config = JSON.parse(config);
      }
      catch (e) {
        console.error(e);
      }
    }

    return config;
  }

  saveConfig() {
    var tools = [];
    $(".js-config-row").each((i, row) => {
      let tool = {};
      tools[i] = tool;
      $(row).find("input").each((i, input) => {
        let key = input.getAttribute("data-name");
        let val = input.value;

        let pair = {};
        pair[key] = val;
        Object.assign(tool, pair);
      });
    });

    localStorage.setItem("tools-tor", JSON.stringify(tools));
    this.setState({ tools }, this.recalc);
  }

  componentDidMount() {
    this.bindEvents();
  }

  render() {
    return (
      <div className="page">
        <Header />

        <main className="main">
          <div className="container">
            <h1 className="main__title">Калькулятор ТОР</h1>

            <div className="main-top">
              <label className="input-group">
                <span className="input-group__title">Депозит</span>
                <NumericInput
                  className="input-group__input"
                  defaultValue={this.state.depo}
                  round
                  onBlur={val => this.setState({ depo: val }, this.recalc)}
                  format={formatNumber}
                />
              </label>

              <Tooltip title="Настройка">
                <button className="main-settings js-open-modal" aria-label="Открыть меню">
                  <svg className="main-settings__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M496.66 312.1l-47.06-36.8c.6-5.67 1.1-12.3 1.1-19.32s-.48-13.65-1.1-19.33l47.1-36.82c8.75-6.91 11.14-19.18 5.57-29.4l-48.94-84.67c-5.23-9.56-16.68-14.46-28.3-10.18l-55.54 22.3a190.39 190.39 0 00-33.34-19.35l-8.45-58.9C326.3 8.45 316.58 0 305.09 0h-98.14c-11.5 0-21.2 8.45-22.57 19.46l-8.47 59.11a196.27 196.27 0 00-33.28 19.35L86.95 75.56c-10.43-4.03-22.91.5-28.1 10l-49 84.79a22.94 22.94 0 005.55 29.54l47.06 36.8c-.74 7.2-1.1 13.44-1.1 19.31s.36 12.12 1.1 19.33l-47.1 36.82c-8.75 6.93-11.12 19.2-5.55 29.4l48.94 84.67c5.23 9.53 16.58 14.48 28.3 10.17l55.54-22.29a192.07 192.07 0 0033.32 19.35l8.45 58.88c1.39 11.22 11.1 19.67 22.61 19.67h98.14c11.5 0 21.22-8.45 22.59-19.46l8.47-59.09a197.19 197.19 0 0033.28-19.37l55.68 22.36a22.92 22.92 0 008.36 1.58c8.28 0 15.9-4.53 19.73-11.57l49.16-85.12a23.03 23.03 0 00-5.72-29.22zm-240.64 29.23c-47.06 0-85.33-38.27-85.33-85.33s38.27-85.33 85.33-85.33 85.33 38.27 85.33 85.33-38.27 85.33-85.33 85.33z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
            {/* /.main-top */}

            <ul className="items-list">
              {
                this.state.items.map((obj, index) =>
                  <li className="items-list-item" key={obj.id}>
                    <Item
                      index={index}
                      tools={this.state.tools}
                      depo={this.state.depo}
                      drawdown={this.state.drawdown}
                      additionalLoading={this.state.additionalLoading}
                      stepExpected={this.state.stepExpected}
                      onCopy={(e, i) => {
                        let { items } = this.state;

                        var copy = Object.assign({}, items[index]); 
                        copy.id = Math.random();
                        items.push(copy);

                        console.log(items);

                        this.setState({ items });
                      }}
                      onDelete={(e, i) => {
                        let { items } = this.state;

                        items.splice(index, 1);

                        this.setState({ items });
                      }}
                      onRef={ ref => {
                        // let { items } = this.state;
                        // items[0] = ref;
                        // this.setState({ items });
                      } }
                    />
                  </li>
                )
              }
            </ul>
          </div>
          {/* /.container */}
        </main>
        {/* /.main */}

        <div className={"modal".concat(`${this.state.configLoaded ? "" : " loading"}`)}>
          <div className="modal-content">
            <div className="config card">
              <h2 className="config__title">Настройка инструментов</h2>

              <div className="config-table-wrap">
                <table className="table">
                  <thead className="table-header">
                    <tr className="table-tr">
                      <th className="table-th"></th>
                      <th className="table-th">Инструмент</th>
                      <th className="table-th">Цена шага</th>
                      <th className="table-th">Шаг цены</th>
                      <th className="table-th">Средний ход</th>
                      <th className="table-th">ГО</th>
                      <th className="table-th">Текущая цена</th>
                      <th className="table-th">Размер лота</th>
                      <th className="table-th">Курс доллара</th>
                    </tr>
                  </thead>
                  {
                    this.state.toolsTemp.map((tool, i) =>
                      <tr className="config-tr js-config-row" key={tool.id}>
                        <td className="table-td">
                          <button className="config-tr-settings" aria-label="Настроить инструмент"
                            onClick={e => {
                              this.setState({ toolToConfigIndex: i });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                              width="1.5em" height="1.5em" fill="#1890ff"
                            >
                              <path d="M496.66 312.1l-47.06-36.8c.6-5.67 1.1-12.3 1.1-19.32s-.48-13.65-1.1-19.33l47.1-36.82c8.75-6.91 11.14-19.18 5.57-29.4l-48.94-84.67c-5.23-9.56-16.68-14.46-28.3-10.18l-55.54 22.3a190.39 190.39 0 00-33.34-19.35l-8.45-58.9C326.3 8.45 316.58 0 305.09 0h-98.14c-11.5 0-21.2 8.45-22.57 19.46l-8.47 59.11a196.27 196.27 0 00-33.28 19.35L86.95 75.56c-10.43-4.03-22.91.5-28.1 10l-49 84.79a22.94 22.94 0 005.55 29.54l47.06 36.8c-.74 7.2-1.1 13.44-1.1 19.31s.36 12.12 1.1 19.33l-47.1 36.82c-8.75 6.93-11.12 19.2-5.55 29.4l48.94 84.67c5.23 9.53 16.58 14.48 28.3 10.17l55.54-22.29a192.07 192.07 0 0033.32 19.35l8.45 58.88c1.39 11.22 11.1 19.67 22.61 19.67h98.14c11.5 0 21.22-8.45 22.59-19.46l8.47-59.09a197.19 197.19 0 0033.28-19.37l55.68 22.36a22.92 22.92 0 008.36 1.58c8.28 0 15.9-4.53 19.73-11.57l49.16-85.12a23.03 23.03 0 00-5.72-29.22zm-240.64 29.23c-47.06 0-85.33-38.27-85.33-85.33s38.27-85.33 85.33-85.33 85.33 38.27 85.33 85.33-38.27 85.33-85.33 85.33z" />
                            </svg>
                          </button>
                        </td>
                        {
                          Object.keys(tool).map((key, i) =>
                            key == "id" || key == "points" ? (
                              null
                            )
                              :
                              <td className="table-td">
                                {
                                  key == "name" ? (
                                    <Input
                                      className="config__input"
                                      defaultValue={tool[key]}
                                      placeholder={tool[key]}
                                      data-name={key}
                                    />
                                  )
                                    : (
                                      <NumericInput
                                        style={{ width: "6em" }}
                                        className="config__input"
                                        defaultValue={tool[key]}
                                        data-name={key}
                                      />
                                    )
                                }
                              </td>
                          )
                        }
                        <td className="table-td">
                          {
                            this.state.toolsTemp.length > 1 ? (
                              <button className="config-tr-delete" aria-label="Удалить инструмент"
                                onClick={e => {
                                  let tools = [...this.state.toolsTemp];
                                  const { currentToolIndex } = this.state;

                                  var i = $(e.target).parents("tr").index() - 1;

                                  tools.splice(i, 1);

                                  this.setState({
                                    toolsTemp: tools,
                                    currentToolIndex: (currentToolIndex > tools.length - 1) ? tools.length - 1 : currentToolIndex
                                  }, this.recalc);
                                }}
                              >
                                <Tag color="magenta">Удалить</Tag>
                              </button>
                            )
                              :
                              null
                          }
                        </td>
                      </tr>
                    )
                  }
                </table>
              </div>
              {/* /.config-talbe-wrap */}

              <Button
                className="config__add-btn"
                type="link"
                onClick={() => {
                  let tools = [...this.state.toolsTemp];

                  tools.push({
                    name:            "Инструмент",
                    stepPrice:       0,
                    priceStep:       0,
                    averageProgress: 0,
                    guaranteeValue:  0,
                    currentPrice:    0,
                    lotSize:         0,
                    dollarRate:      0,

                    points: [
                      [ 70,  70 ],
                      [ 156, 55 ],
                      [ 267, 41 ],
                      [ 423, 27 ],
                      [ 692, 13 ],
                      [ 960,  7 ],
                    ],

                    id: Math.random()
                  });

                  this.setState({ toolsTemp: tools }, () => $(".config-table-wrap").scrollTop(999999));
                }}
              >
                Добавить инструмент
              </Button>

              <footer className="config-footer">
                <Button className="config__cancel-btn js-close-modal">Отмена</Button>
                <Button
                  className="js-close-modal"
                  type="primary"
                  onClick={() => this.saveConfig()}
                >
                  Сохранить
                </Button>
              </footer>
            </div>
            {/* /.config */}

          </div>
          {/* /.modal-content */}
        </div>
        {/* /.modal */}
      </div>
    );
  }
}

export default App;