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
const { Text, Title } = Typography;

import $ from "jquery"
import "chart.js"

import CustomSlider from "./components/custom-slider"
import NumericInput from "./components/numeric-input"
import Tool         from "./components/Tool"
import { Dialog, dialogAPI } from "./components/dialog"

import num2str from "./utils/num2str"
import params from "./utils/params";
import formatNumber from "./utils/formatNumber"

import "../sass/style.sass"

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      configVisible: false,

      // ==================
      // Заполняется руками
      // ==================

      // Депозит
      depo: 2000000,
      drawdown: 1,

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

      toolTemplate: {
        code:            "",
        shortName:       "",
        name:            "",
        stepPrice:       1,
        priceStep:       1,
        averageProgress: 1,
        guaranteeValue:  1,
        currentPrice:    1,
        lotSize:         1,
        dollarRate:      1,
      },
      tools: [],
      customTools: [],
      propsToShowArray: [
        "shortName",
        "stepPrice",
        "priceStep",
        "averageProgress",
        "guaranteeValue",
        "currentPrice",
        "lotSize",
        "dollarRate"
      ],
    };
    
    if (this.state.currentToolIndex > this.state.tools.length - 1) {
      this.state.currentToolIndex = this.state.tools.length - 1;
    }
  }

  bindEvents() {
    
  }

  fetchTools() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures",
        success: res => {
          var data = JSON.parse(res).data;
          resolve(data);
        },
        error: (err) => reject(err),
      });
    })
  }

  componentDidMount() {
    this.bindEvents();

    this.fetchTools()
      .then(tools => {
        console.log(tools);
        if (!tools || tools.length == 0) {
          console.error("Weird but what i got is not an array or it's simply empty!");
          return;
        }

        var t = [];
        for (let tool of tools) {
          if (tool.price == 0 || !tool.volume) {
            continue;
          }

          var obj = {
            code:             tool.code            || "code",
            shortName:        tool.shortName       || "shortName",
            name:             tool.fullName        || "fullName",
            stepPrice:       +tool.stepPrice       || 0,
            priceStep:       +tool.priceStep       || 0,
            averageProgress: +tool.averageProgress || 0,
            guaranteeValue:  +tool.guarantee       || 0,
            currentPrice:    +tool.price           || 0,
            lotSize:         +tool.lotVolume       || 0,
            dollarRate:      +tool.dollarRate      || 0,
          };
          t.push(obj);
        }

        if (t.length > 0) {
          let { tools } = this.state;
          tools = tools.concat(t);
          this.setState({ tools });
        }
      })
      .catch(err => console.log(err))

    this.fetchDepoStart()
      .then(depo => {
        var { drawdown } = this.state;
        if (!depo) {
          console.log('depo is empty!');
          depo = this.state.depo;
        }
        else {
          drawdown = depo * .1;
          console.log('depo:', depo);
          console.log('drawdown:', drawdown);
        }

        this.setState({ depo, drawdown });
      })
      .catch(err => {
        console.log(err);
      });
  }

  fetchDepoStart() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/local/php_interface/s1/ajax/?method=getInvestorInfo",
        success: res => {
          var parsed = JSON.parse(res);
          var depo = Number(parsed.data.deposit);
          resolve(depo);
        },
        error: err => reject(err)
      });
    });
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  render() {
    return (
      <div className="page">
        <main className="main">
          
          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">

                <nav className="breadcrumbs main-top__breadcrumbs">
                  <ul className="breadcrumbs-list">
                    <li className="breadcrumbs-item">
                      <a href="#" target="_blank">Главная</a>
                    </li>
                    <li className="breadcrumbs-item">
                      <a href="#" target="_blank">Калькулятор ТОР</a>
                    </li>
                  </ul>
                </nav>

                <Title className="main__h1" level={1}>Калькулятор ТОР</Title>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
          {/* /.main-top */}

          <div className="main-content">
            <div className="container">

              {
                this.state.items.map((obj, index) =>
                  <Tool
                    key={obj.id}
                    index={index}
                    tools={this.getTools()}
                    depo={this.state.depo}
                    drawdown={this.state.drawdown}
                    additionalLoading={this.state.additionalLoading}
                    stepExpected={this.state.stepExpected}
                    onDrawdownChange={(val, cb) => {
                      this.setState({ drawdown: val }, cb);
                    }}
                    onOpenConfig={e => {
                      dialogAPI.open("dialog1", e.target);
                    }}
                    onCopy={(e, i) => {
                      let { items } = this.state;

                      var copy = Object.assign({}, items[index]);
                      copy.id = Math.random();
                      items.push(copy);

                      this.setState({ items });
                    }}
                    onDelete={(e, i) => {
                      let { items } = this.state;

                      if (items.length > 1) {
                        items.splice(index, 1);
                        this.setState({ items });
                      }

                    }}
                    onRef={ref => {
                      // let { items } = this.state;
                      // items[0] = ref;
                      // this.setState({ items });
                    }}
                  />
                )
              }
            
            </div>
            {/* /.container */}
          </div>

        </main>
        {/* /.main */}

        <Dialog
          id="dialog1"
          title="Настройка инструментов"
          okContent="Добавить"
          onOk={e => {
            var { toolTemplate, customTools, propsToShowArray } = this.state;

            var template = Object.assign({}, toolTemplate);
            var tool = template;
            propsToShowArray.map((prop, index) => {
              tool[prop] = (index === 0) ? "Инструмент" : toolTemplate[prop];
            });

            customTools.push(tool);
            this.setState({ customTools }, () => {
              $(".config-table-wrap").scrollTop(9999);
            });
          }}
          cancelContent="Закрыть"
        >
          <label className="input-group input-group--fluid tor-config__depo">
            <span className="input-group__label">Депозит</span>
            <NumericInput
              className="input-group__input"
              defaultValue={this.state.depo}
              round
              onBlur={val => this.setState({ depo: val }, this.recalc)}
              format={formatNumber}
            />
          </label>
          <div className="config-table-wrap">
            <table className="table">
              <thead className="table-header">
                <tr className="table-tr">
                  <th className="config-th table-th">Инструмент</th>
                  <th className="config-th table-th">Цена шага</th>
                  <th className="config-th table-th">Шаг цены</th>
                  <th className="config-th table-th">Средний ход</th>
                  <th className="config-th table-th">ГО</th>
                  <th className="config-th table-th">Текущая цена</th>
                  <th className="config-th table-th">Размер лота</th>
                  <th className="config-th table-th">Курс доллара</th>
                  <th className="config-th table-th"></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {
                  this.state.tools.map((tool, i) =>
                    <tr className="config-tr" key={i}>
                      {
                        this.state.propsToShowArray.map((prop, i) =>
                          <td
                            className="table-td"
                            style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                            key={i}>
                            {tool[prop]}
                          </td>
                        )
                      }
                    </tr>
                  )
                }
                {(() => {
                  const { customTools, propsToShowArray } = this.state;

                  var onBlur = (val, index, prop) => {
                    customTools[index][prop] = val;
                    this.setState({ customTools });
                  };

                  return customTools.map((tool, index) =>
                    <tr className="config-tr" key={index}>
                      {
                        propsToShowArray.map((prop, i) =>
                          <td
                            className="table-td"
                            style={{ width: (prop == "shortName") ? "15em" : "9em" }}
                            key={i}>
                            {
                              i === 0 ? (
                                <Input
                                  defaultValue={tool[prop]}
                                  onBlur={e => onBlur(e.target.value, index, prop)}
                                  onKeyDown={e => {
                                    if (
                                      [
                                        13, // Enter
                                        27  // Escape
                                      ].indexOf(e.keyCode) > -1
                                    ) {
                                      e.target.blur();
                                      onBlur(e.target.value, index, prop);
                                    }
                                  }}
                                />
                              )
                                : (
                                  <NumericInput
                                    defaultValue={tool[prop]}
                                    onBlur={val => onBlur(val, index, prop)}
                                  />
                                )
                            }
                          </td>
                        )
                      }
                      <td className="table-td" key={index}>
                        <Tooltip title="Удалить">
                          <button
                            className="config__delete x-button"
                            aria-label="Удалить"
                            onClick={e => {
                              var { customTools } = this.state;
                              customTools.splice(index, 1);
                              this.setState({ customTools });
                            }}>
                            <span>&times;</span>
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
        </Dialog>

      </div>
    );
  }
}

export default App;