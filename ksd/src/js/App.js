import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Typography,
  Spin,
  Input,
} from 'antd/es'

import {
  PlusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons'

import $ from "jquery"
import round   from "./round";
import formatNumber from "./formatNumber"

import Info                from "./Components/Info/Info"
import NumericInput        from "./Components/NumericInput"
import CustomSlider        from "./Components/CustomSlider/CustomSlider"
import DashboardRow        from "./Components/DashboardRow"
import {Dialog, dialogAPI} from "./Components/dialog"

const { Option } = Select;
const { Title } = Typography;

import "../sass/main.sass"

// HTML Elemets
var $body;
var $modal;

class App extends React.Component {

  constructor(props) {
    super(props);

    // Данные из адресной строки
    // ...

    this.state = {
      // Режим
      mode: 0,
      //Размер депозита
      depo: 1000000,

      rowsNumber: 1,

      tools: [],
      customTools: [],
      propsToShowArray: [
        "shortName",
        "stepPrice",
        "priceStep",
        "guaranteeValue",
        "price",
        "adr1",
        "adr2"
      ],
      toolTemplate: {
        code:            "",
        shortName:       "",
        name:            "",
        stepPrice:       0,
        priceStep:       1,
        price:           1,
        averageProgress: 0,
        guaranteeValue:  1,
        currentPrice:    1,
        lotSize:         0,
        dollarRate:      0,
        adr1:            1,
        adr2:            1,

        isFuters: false,

        points: [
          [70,  70],
          [156, 55],
          [267, 41],
          [423, 27],
          [692, 13],
          [960, 7 ],
        ]
      },
      readyTools: [
        this._parseTool("  1 000 000   	РТС	RIM0	108 060 ₽	32 582,22 ₽	10 ₽	14,9175 ₽	10%	  3   	3956	2701	3000"),
        this._parseTool("  1 000 000   	Brent	BRK0	$21,84	8 267,74 ₽	$0,01	7,4587 ₽	10%	  12   	1,55	1,17	1"),
        this._parseTool("  1 000 000   	SI	SIM0	75 150 ₽	8 040,18 ₽	1 ₽	1,0000 ₽	10%	  12   	667	425	500"),
        this._parseTool("  1 000 000   	Золото	GDM0	$1 733,30	12 375,49 ₽	$0,10	7,4587 ₽	10%	  8   	22,33	15,45	20"),
        this._parseTool("  1 000 000   	СберБанк	SRM0	19 051 ₽	5 031,29 ₽	1 ₽	1,0000 ₽	10%	  19   	646	471	400"),
        this._parseTool("  1 000 000   	Платина	PTM0	$779,00	13 446,33 ₽	$0,1	7,4587 ₽	10%	  7   	24,60	18,57	15"),
        this._parseTool("  1 000 000   	Палладий	PDM0	$2 014,18	41 911,76 ₽	$0,01	0,7459 ₽	10%	  2   	98,28	73,60	20"),
        this._parseTool("  1 000 000   	Магнит	MNM0	3 149 ₽	856,91 ₽	1 ₽	1,0000 ₽	10%	  116   	136	115	100"),
        this._parseTool("  1 000 000   	Евро-Доллар	EDM0	$1,0834	3 572,81 ₽	$0,0001	7,4587 ₽	10%	  27   	0,0078	0,0058	0,003"),
        this._parseTool("  1 000 000   	Евро-Рубль	EuM0	81 445 ₽	8 682,44 ₽	1 ₽	1,0000 ₽	10%	  11   	973	556	500"),
        this._parseTool("  1 000 000   	 Light Sweet Crude Oil	CLM0	$17,20	12 000,00 ₽	$0,01	7,4587 ₽	10%	  8   	2,19	1,62	1"),
        this._parseTool("  1 000 000   	Сургутнефтегаз	SNM0	35 559 ₽	9 352,57 ₽	1 ₽	1,0000 ₽	10%	  10   	1893	1766	1000"),
        this._parseTool("  1 000 000   	Газпром	GZM0	18 888 ₽	4 938,90 ₽	1 ₽	1,0000 ₽	10%	  20   	609	492	400"),
        this._parseTool("  1 000 000   	Серебро	SVM0	$15,36	2 622,66 ₽	$0,01	7,4587 ₽	10%	  38   	0,38	0,29	0,1"),
        this._parseTool("  1 000 000   	Лукойл	LKM0	48 450 ₽	12 620,23 ₽	1 ₽	1,0000 ₽	10%	  7   	1904	1462	800"),
        this._parseTool("  1 000 000   	Природный газ	NGK0	$1,871	2 818,98 ₽	$0,001	7,4587 ₽	10%	  35   	0,113	0,101	0,02"),
        this._parseTool("  1 000 000   	ВТБ	VBM0	3 441 ₽	902,18 ₽	1 ₽	1,0000 ₽	10%	  110   	150	113	100"),
        this._parseTool("  1 000 000   	Норильский Никель	GMM0	201 400 ₽	53 545,63 ₽	1 ₽	1,0000 ₽	10%	  1   	9734	7251	5000"),
        this._parseTool("  1 000 000   	СберБанкП	SPM0	17 360 ₽	4 569,88 ₽	1 ₽	1,0000 ₽	10%	  21   	813	560	450"),
        this._parseTool("  1 000 000   	НЛМК	NMM0	12 369 ₽	3 311,61 ₽	1 ₽	1,0000 ₽	10%	  30   	505	432	300"),
      ]
    };
  }

  _parseTool(s) {
    function _number(n) {
      return Number((n + "").replace(/\,/g, "."));
    }

    s = s.split(/\t+/g);
    var len = s.length;
    return {
      code:       s[2],
      adr1:       _number(s[len - 3]),
      adr2:       _number(s[len - 2]),
      planIncome: _number(s[len - 1]),
    }; 
  }

  openModal() {
    $modal.addClass("visible");
     $body.addClass("scroll-disabled");
  }

  closeModal() {
    $modal.removeClass("visible");
     $body.removeClass("scroll-disabled");
  }

  bindEvents() {
    $body  = $(document.body);
    $modal = $(".m");

    $body.on("keydown", e => {
      // Esc
      if (e.keyCode == 27) {
        this.closeModal();
      }
    });

    $modal.click(e => {
      if ($(e.target).is($modal)) {
        this.closeModal();
      }
    });

    $(".js-open-modal").click(e => this.openModal());
    $(".js-close-modal").click(e => this.closeModal());
  }

  unpackTools(tools) {
    return new Promise((resolve, reject) => {

      if (!tools || tools.length == 0) {
        reject("\"tools\" is not an array or it's simply empty!", tools);
      }
  
      var t = [];
      for (let tool of tools) {
        if (tool.price == 0 || !tool.volume) {
          continue;
        }

        var obj = {
          code:             tool.code      || "code",
          name:             tool.fullName  || tool.shortName,
          shortName:        tool.shortName || tool.shortName,
          stepPrice:       +tool.stepPrice || 0,
          priceStep:       +tool.priceStep || 0,
          average:         +tool.average   || 0,
          guaranteeValue:  +tool.guarantee || 0,

          currentMarketPrice: 19051,
          price:             +tool.price || 0,
          adr1: 3956,
          adr2: 2701,
        };

        // Check if we already have pre-written tool
        var found = false;
        for (var _t of this.state.readyTools) {
          if (_t.code.slice(0, 2) === obj.code.slice(0, 2)) {
            
            Object.assign(obj, Object.assign(_t, { code: obj.code }));

            found = true;
            break;
          }
        }

        // We didn't find the tool in pre-written tools
        if (!found) {
          
          var substitute = {
            planIncome: round(obj.price / 10, 2),
            adr1: round(obj.price / 5,  4),
            adr2: round(obj.price / 10, 4),
          };
          Object.assign(obj, substitute);

        }

        console.log(obj);
        
        t.push(obj);
      }

      if (t.length > 0) {
        let { tools } = this.state;
        tools = tools.concat(t.sort((a, b) => a.code > b.code));

        this.setState({ tools }, resolve);
      }
      
      resolve();
    });
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

  fetchDepoStart() {
    return new Promise((resolve, reject) => {
      console.log("Fetching depoStart!");
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

  componentDidMount() {
    this.bindEvents();
    
    this.fetchTools()
      .then(tools => this.unpackTools(tools))
      .catch(err => console.log(err));

    this.fetchDepoStart()
      .then(depo => {
        depo = depo || 10000;
        this.setState({ depo });
      })
      .catch(err => console.log(err));
  }

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  render() {
    return (
      <div className="page">
        {/* <Header /> */}

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
                      <a href="#" target="_blank">Калькулятор сравнительной доходности</a>
                    </li>
                  </ul>
                </nav>

                <Title className="main__h1" level={1}>
                  Калькулятор сравнительной доходности
                </Title>

                <label className="main-top__mode-select labeled-select">
                  <span className="labeled-select__label main-top__mode-select-label">
                    Ход цены
                  </span>
                  <Select 
                    value={0}
                    onSelect={val => this.setState({ mode: val })}
                  >
                    <Option key={0} value={0}>Произвольный</Option>
                    <Option key={1} value={1}>Повышенный</Option>
                    <Option key={2} value={2}>Аномальный</Option>
                    <Option key={3} value={3}>Черный лебедь</Option>
                  </Select>
                </label>

                {
                  false && (
                    <label className="main-top__strategy labeled-select">
                      <span className="labeled-select__label main-top__strategy-label">
                        Сохраненная стратегия
                      </span>
                      <Select value={0}>
                        <Option key={0} value={0}>SavedStrategy_1</Option>
                        <Option key={1} value={1}>SavedStrategy_2</Option>
                      </Select>
                    </label>
                  )
                }
                
                <Radio.Group
                  className="tabs"
                  name="radiogroup"
                  defaultValue={0}
                  onChange={e => this.setState({ mode: e.target.value })}
                >
                  <Radio className="tabs__label tabs__label--1" value={0}>
                    Произвольный
                    <span className="prefix">ход цены</span>
                  </Radio>
                  <Radio className="tabs__label tabs__label--1" value={1}>
                    Повышенный
                    <span className="prefix">ход цены</span>
                  </Radio>
                  <Radio className="tabs__label tabs__label--1" value={2}>
                    Аномальный
                    <span className="prefix">ход цены</span>
                  </Radio>
                  <Radio className="tabs__label tabs__label--2" value={3}>
                    Черный лебедь
                    <span className="prefix">ход цены</span>
                  </Radio>
                </Radio.Group>

                {
                  false && (
                    <Button 
                      className="custom-btn custom-btn--secondary main-top__save" 
                      onClick={() => alert("It works!")}
                    >
                      Сохранить в профиль
                    </Button>
                  )
                }

                <Tooltip title="Настройки">
                  <button 
                    className="settings-button js-open-modal main-top__icon"
                    onClick={e => dialogAPI.open("dialog1", e.target)}
                  >
                    <span className="visually-hidden">Открыть конфиг</span>
                    <SettingFilled className="settings-button__icon" />
                  </button>
                </Tooltip>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
          {/* /.main-top */}

          <div className="main-content">

            <div className="container">

              <div className="dashboard">

                {
                  this.state.tools.length > 0
                    ? (
                      new Array(this.state.rowsNumber).fill(0).map((item, index) => 
      
                        <DashboardRow 
                          key={index}
                          mode={this.state.mode}
                          depo={this.state.depo}
                          percentage={this.state.percentage}
                          tools={this.getTools()} 
                        />
      
                      )
                    )
                    : (
                      <span className="dashboard__loading">
                        <Spin 
                          className="dashboard__loading-icon" 
                          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                        Подождите, инструменты загружаются...
                      </span>
                    )
                }


              </div>

              <footer className="main__footer">

                <Button className="custom-btn main__save"
                  onClick={() => this.setState({ rowsNumber: this.state.rowsNumber + 1 })}>
                  <PlusOutlined aria-label="Добавить" />
                  инструмент
                </Button>

              </footer>
              
            </div>
            {/* /.container */}

          </div>

        </main>
        {/* /.main */}

        <Dialog
          id="dialog1"
          className=""
          okContent="Добавить"
          onOk={e => {
            var { toolTemplate, customTools, propsToShowArray } = this.state;

            var template = Object.assign({}, toolTemplate);
            var tool = template;
            propsToShowArray.map((prop, index) => {
              tool[prop] = (index === 0) ? "Инструмент" : toolTemplate[prop];
            });
            tool.planIncome = round(tool.price / 10, 2);

            customTools.push(tool);
            this.setState({ customTools }, () => {
              $(".config-table-wrap").scrollTop(9999);
            });
          }}
          cancelContent="Закрыть"
        >
          <label className="input-group input-group--fluid config-ksd__depo">
            <span className="input-group__label">Размер депозита:</span>
            <NumericInput
              className="input-group__input"
              key={this.state.depo}
              defaultValue={this.state.depo}
              format={formatNumber}
              min={10000}
              max={Infinity}
              onBlur={val => {
                const { depo } = this.state;
                if (val == depo) {
                  return;
                }

                this.setState({ depo: val });
              }}
            />
          </label>

          <div className="config-table-wrap">
            <table className="table">
              <thead className="table-header">
                <tr className="table-tr">
                  <th className="config-th table-th">Инструмент</th>
                  <th className="config-th table-th">Цена шага</th>
                  <th className="config-th table-th">Шаг цены</th>
                  <th className="config-th table-th">ГО</th>
                  <th className="config-th table-th">Текущая цена</th>
                  <th className="config-th table-th">
                    <Info tooltip="Средний ход (пунктов) за год с учетом аномальных движений">
                      ADR1
                    </Info>
                  </th>
                  <th className="config-th table-th">
                    <Info tooltip="Средний ход (пунктов) за год без учета аномальных движений">
                      ADR2
                    </Info>
                  </th>
                  <th className="config-th table-th"></th>
                </tr>
              </thead>
              <tbody className="table-body">
                {
                  this.state.tools.map((tool, index) =>
                    <tr className="config-tr" key={index}>
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
                  var onBlur = (val, index, prop) => {
                    var { customTools } = this.state;
                    customTools[index][prop] = val;
                    this.setState({ customTools });
                  };

                  return this.state.customTools.map((tool, index) =>
                    <tr className="config-tr" key={index}>
                      {
                        this.state.propsToShowArray.map((prop, i) =>
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
                            className="x-button config__delete"
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
          {/* /.config-talbe-wrap */}
        </Dialog>

      </div>
    );
  }
}

export default App;