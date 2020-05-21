import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Switch,
  Typography,
  Progress,
  Statistic,
} from 'antd/es'

import {
  PlusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons'

import $ from "jquery"
import round   from "./round";
import formatNumber from "./formatNumber"

import Info         from "./Components/Info/Info"
import NumericInput from "./Components/NumericInput"
import CustomSlider from "./Components/CustomSlider/CustomSlider"
import DashboardRow from "./Components/DashboardRow"

const { Option } = Select;
const { Title } = Typography;

import "../sass/main.sass"

var chart2, chartData, chartData2, scale, scaleStart, scaleEnd;

function Value(props) {
  var format = props.format || ( (val) => val );
  var val = props.children;
  var classList = ["value"].concat(props.className);

  if (val === 0) {
    classList.push("value--neutral");
  }
  else if (val < 0) {
    classList.push("value--negative");
  }

  return (
    <span className={classList.join(" ").trim()}>{ format(val) }</span>
  )
}

function extRate(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment = 0, dayoffirstpayload = 0) {

  ///////////////////////////////////////////

  // ( Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1) )
  // Возвращает: Минимальная доходность в день

  // точность в процентах от итоговой суммы
  var delataMaxPercent = 0.1;

  // максимальное количество итераций
  var iterMax = 250;

  var showday = [];

  ///////////////////////////////////////////
  function ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1) {
    var res = present;
    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    rate += 1;

    for (var x = 0; x < periods; x++) {
      res = res * rate;
      p1--; p2--;
      if (!p2) { p2 = payloadper; res += payload; }
      if (!p1) { p1 = paymentper; res -= payment; }
    }
    return res;
  }
  function ff2(rate, periods, present, payment) {
    var k1 = (1 + rate) ** periods;
    return present * k1 + payment * (k1 - 1) / rate;
  }

  var deltaMax = future * delataMaxPercent / 100;
  var guess = (((future + periods * (payment)) / present) ** (1 / periods)) - 1;
  var guess2 = (periods * payment) ** (1 / (periods * 2)) - 1;

  var delta = guess;

  var rate = guess;
  var minrate = 0;
  var maxrate = 0;

  var current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);

  while (((current > (future + deltaMax)) || (current < future)) && (iterMax > 0)) {
    current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload);
    if (current > (future + deltaMax)) {

      maxrate = rate;
      rate = minrate + (maxrate - minrate) / 2;
    }
    if (current < future) {

      minrate = rate;
      if (maxrate === 0) rate = rate * 2;
      else rate = minrate + (maxrate - minrate) * 2;
    }
    iterMax--;
  }
  return rate;
}

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
      adr:        [_number(s[len - 2]), _number(s[len - 3])],
      planIncome:  _number(s[len - 1]),
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

  componentDidMount() {
    $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures",
      success: (res) => {
        let data = JSON.parse(res).data;
        // console.log(data);

        var t = [];
        for (let tool of data) {
          if (tool.price == 0 || !tool.volume) {
            continue;
          }

          console.log(tool);

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
            adr:                [3956, 2701],
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

            Object.assign(obj, {
              planIncome: round(obj.price / 6, 2),
            });

          }

          t.push(obj);
        }

        if (t.length > 0) {
          let { tools } = this.state;
          tools = tools.concat(t.sort((a, b) => a.code > b.code));

          this.setState({ tools });
        }
      },
      error: (err) => console.error(err)
    });

    this.bindEvents();
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
                      <a href="#" target="_blank">Календарь событий</a>
                    </li>
                    <li className="breadcrumbs-item">
                      <a href="#" target="_blank">Отчетность</a>
                    </li>
                    <li className="breadcrumbs-item">
                      <a href="#" target="_blank">Калькулятор дивидендов</a>
                    </li>
                  </ul>
                </nav>

                <Title className="main__h1" level={1}>
                  Калькулятор сравнительной доходности
                </Title>

                <Select className="main-top__strategy" value={0}>
                  <Option key={0} value={0}>SavedStrategy_1</Option>
                  <Option key={1} value={1}>SavedStrategy_2</Option>
                </Select>
                
                <Radio.Group
                  // key={this.state.mode}
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

                <Button 
                  className="custom-btn custom-btn--secondary main-top__save" 
                  onClick={() => alert("It works!")}
                >
                  Сохранить в профиль
                </Button>

                <Tooltip title="Настройки">
                  <button className="settings-button js-open-modal main-top__icon">
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
                          tools={this.state.tools} 
                        />
      
                      )
                    )
                    : null
                }


              </div>

              <Button className="custom-btn main__save"
                onClick={() => this.setState({ rowsNumber: this.state.rowsNumber + 1 })}>
                <PlusOutlined aria-label="Добавить" />
                инструмент
              </Button>
              
            </div>
            {/* /.container */}

          </div>

        </main>
        {/* /.main */}

        <div className="m">
          <div className="m-content">
            <div className="config config-ksd card">

              <label className="input-group input-group--fluid config-ksd__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput 
                  className="input-group__input"
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


              <Title className="config__title" level={2} style={{ textAlign: "center" }}>
                Инструменты
              </Title>
              {/* <h2 className="config__title">Настройка инструментов</h2> */}

              <div className="config-table-wrap js-nice-scroll">
                {
                  this.state.tools.length > 0
                    ? (
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
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {
                            this.state.tools.sort((a, b) => a.code > b.code).map((tool, i) =>
                              <tr className="config-tr js-config-row" key={i}>
                                <td
                                  className="table-td"
                                  style={{ width: "15em" }}
                                  key={0}
                                >
                                  {tool.code}
                                </td>
                                
                                <td
                                  className="table-td"
                                  style={{ width: "9em" }}
                                  key={1}
                                >
                                  {tool.stepPrice}
                                </td>
                                
                                <td
                                  className="table-td"
                                  style={{ width: "9em" }}
                                  key={2}
                                >
                                  {tool.priceStep}
                                </td>
                                
                                <td
                                  className="table-td"
                                  style={{ width: "9em" }}
                                  key={3}
                                >
                                  {tool.guaranteeValue}
                                </td>
                                
                                <td
                                  className="table-td"
                                  style={{ width: "9em" }}
                                  key={4}
                                >
                                  {tool.price}
                                </td>
                                
                                <td
                                  className="table-td"
                                  style={{ width: "9em" }}
                                  key={5}
                                >
                                  <NumericInput 
                                    defaultValue={tool.adr[0]}
                                    min={0}
                                    max={Infinity}
                                    format={formatNumber}
                                    onBlur={val => {
                                      var { tools } = this.state;
                                      var tool = tools[i];
                                      tool.adr[0] = val;
                                      this.setState({ tools });
                                    }}
                                  />
                                </td>
                                
                                <td
                                  className="table-td"
                                  style={{ width: "9em" }}
                                  key={6}
                                >
                                  <NumericInput
                                    defaultValue={tool.adr[1]}
                                    min={0}
                                    max={Infinity}
                                    format={formatNumber}
                                    onBlur={val => {
                                      var { tools } = this.state;
                                      var tool = tools[i];
                                      tool.adr[1] = val;
                                      this.setState({ tools });
                                    }}
                                  />
                                </td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                    )
                    : null
                }
              </div>
              {/* /.config-talbe-wrap */}
            </div>
            {/* /.config */}
          </div>
        </div>

      </div>
    );
  }
}

export default App;