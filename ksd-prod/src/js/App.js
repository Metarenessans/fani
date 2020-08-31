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
  WarningOutlined,
} from '@ant-design/icons'

import $            from "jquery"
import {ajax}       from "jquery"
import params       from "./utils/params"
import round        from "./utils/round";
import formatNumber from "./utils/format-number"
import typeOf       from "./utils/type-of"

import Info                from "./components/Info/Info"
import Stack               from "./components/stack"
import CrossButton         from "./components/cross-button"
import NumericInput        from "./components/numeric-input"
import CustomSlider        from "./components/custom-slider"
import DashboardRow        from "./components/DashboardRow"
import SelfValidateInput   from "./components/sefl-validate-input"
import {Dialog, dialogAPI} from "./components/dialog"

const { Option } = Select;
const { Title } = Typography;

import "../sass/style.sass"

const dev = false;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initial = {

      data: [{ percentage: 10 }],

      // Режим
      mode: 0,
      //Размер депозита
      depo: 1000000,
      
    };

    this.state = Object.assign({
      id:                 null,
      saved:              false,
      saves:              [],
      currentSaveIndex:   0,

      sortProp:  "guaranteeValue",
      sortDESC:  true,
      
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
        code: "",
        shortName: "",
        name: "",
        stepPrice: 0,
        priceStep: 1,
        price: 1,
        averageProgress: 0,
        guaranteeValue: 1,
        currentPrice: 1,
        lotSize: 0,
        dollarRate: 0,
        adr1: 1,
        adr2: 1,

        isFuters: false,

        points: [
          [70, 70],
          [156, 55],
          [267, 41],
          [423, 27],
          [692, 13],
          [960, 7],
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
    }, JSON.parse(JSON.stringify( this.initial )));
  }

  componentDidMount() {
    this.bindEvents();

    this.fetchTools()
      .then(tools => this.unpackTools(tools))
      .catch(err => console.log(err));

    this.fetchDepoStart()
      .then(depo => this.setState({ depo: depo || 10000 }))
      .catch(err => console.log(err));

    this.fetchSaves()
      .then(saves => {
        if (saves.length) {
          const pure = params.get("pure") === "true";
          if (!pure) {
            let found = false;
            console.log(saves);

            for (let index = 0, p = Promise.resolve(); index < saves.length; index++) {
              p = p.then(_ => new Promise(resolve => {
                const save = saves[index];
                const id   = save.id;
                this.fetchSaveById(id)
                  .then(save => {
                    const corrupt = !this.validateSave(save);
                    if (!corrupt && !found) {
                      found = true;
                      // Try to load it
                      this.extractSave(Object.assign(save, { id }));
                      this.setState({ currentSaveIndex: index + 1 });
                    }

                    saves[index].corrupt = corrupt;
                    this.setState({ saves });
                    resolve();
                  });
              }));
            }
          }
        }
        else {
          console.log("No saves found!");
        }

        this.setState({ saves });
      })
      .catch(err => this.showMessageDialog(`Не удалось получить сохранения! ${err}`));
  }

  showMessageDialog(msg = "") {
    console.log(`%c${msg}`, "background: #222; color: #bada55");
    if (!dev) {
      this.setState({ errorMessage: msg }, () => {
        dialogAPI.open("dialog-msg");
      });
    }
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

  bindEvents() {
    
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

        t.push(obj);
      }

      if (t.length > 0) {
        let { tools } = this.state;
        const sorted = t.sort((a, b) => a.code.localeCompare(b.code));
        tools = tools.concat(sorted);

        this.setState({ tools }, resolve);
      }
      
      resolve();
    });
  }

  packSave() {
    let { depo, sortProp, sortDESC, mode, data, customTools } = this.state;

    const json = {
      static: {
        depo,
        sortProp,
        sortDESC,
        mode,
        data,
        customTools,
        current_date: "#"
      },
    };

    console.log("Save packed!", json);
    return json;
  }

  validateSave(save) {
    return true;
  }

  extractSave(save) {
    const onError = e => {
      this.showMessageDialog(String(e));

      const { saves, currentSaveIndex } = this.state;
      if (saves[currentSaveIndex - 1]) {
        console.log(saves, currentSaveIndex - 1);
        saves[currentSaveIndex - 1].corrupt = true;
        this.setState({ saves });
      }
    };

    const {
      depoEnd,
      defaultPassiveIncomeTools,
    } = this.state;

    let staticParsed;

    let state = {};
    let failed = false;

    try {

      staticParsed = JSON.parse(save.data.static);
      staticParsed.data.map(item => {
        delete item.selectedToolCode;
        return item;
      });

      console.log("staticParsed", staticParsed);

      let m = staticParsed.mode;
      if (typeOf(m) === "array") {
        m = Number(m[0]);
      }

      state.mode = m;
      state.sortProp = staticParsed.sortProp || "guaranteeValue";
      state.sortDESC = staticParsed.sortDESC || true;
      state.depo = staticParsed.depo || this.state.depo;
      state.data = staticParsed.data;
      state.customTools = staticParsed.customTools || [];

      state.id = save.id;
      state.saved = true;
    }
    catch (e) {
      failed = true;
      state = {
        id: save.id,
        saved: true
      };

      onError(e);
    }

    this.setState(state, () => console.log(this.state));
  }

  reset() {
    return new Promise(resolve => this.setState(JSON.parse(JSON.stringify(this.initial)), () => resolve()))
  }

  save(name = "") {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject("Name is empty!");
      }

      const json = this.packSave();
      const data = {
        name,
        static: JSON.stringify(json.static),
      };

      this.sendRequest("addKsdSnapshot", "POST", data)
        .then(res => {
          console.log(res);

          let id = Number(res.id);
          if (id) {
            console.log("Saved with id = ", id);
            this.setState({ id }, () => resolve(id));
          }
          else {
            reject(`Произошла незвестная ошибка! Пожалуйста, повторите действие позже еще раз`);
          }
        })
        .catch(err => reject(err));
    });
  }

  update(name = "") {
    const { id } = this.state;
    return new Promise((resolve, reject) => {
      if (!id) {
        reject("id must be present!");
      }

      const json = this.packSave();
      const data = {
        id,
        name,
        static: JSON.stringify(json.static),
      };
      this.sendRequest("updateKsdSnapshot", "POST", data)
        .then(res => {
          console.log("Updated!", res);
          resolve();
        })
        .catch(err => console.log(err));
    })
  }

  delete(id = 0) {
    console.log(`Deleting id: ${id}`);

    return new Promise((resolve, reject) => {
      this.sendRequest("deleteKsdSnapshot", "POST", { id })
        .then(() => {
          let {
            id,
            saves,
            saved,
            changed,
            currentSaveIndex,
          } = this.state

          saves.splice(currentSaveIndex - 1, 1);

          currentSaveIndex = Math.min(Math.max(currentSaveIndex, 1), saves.length);

          if (saves.length > 0) {
            id = saves[currentSaveIndex - 1].id;
            this.fetchSaveById(id)
              .then(save => this.extractSave(Object.assign(save, { id })))
              .then(() => this.setState({ id }))
              .catch(err => this.showMessageDialog(err));
          }
          else {
            this.reset()
              .catch(err => this.showMessageDialog(err));

            saved = changed = false;
          }

          this.setState({
            saves,
            saved,
            changed,
            currentSaveIndex,
          }, resolve);
        })
        .catch(err => reject(err));
    });
  }

  sendRequest(url = "", method = "GET", data = {}) {
    return new Promise((resolve, reject) => {
      console.log(`Sending ${url} request...`);
      ajax({
        url: `https://fani144.ru/local/php_interface/s1/ajax/?method=${url}`,
        method,
        data,
        success: res => {
          const parsed = JSON.parse(res);
          if (parsed.error) {
            reject(parsed.message);
          }

          resolve(parsed);
        },
        error: err => reject(err)
      });
    });
  }

  fetchSaves() {
    return new Promise((resolve, reject) => {
      this.sendRequest("getKsdSnapshots")
        .then(res => {
          const savesSorted = res.data.sort((a, b) => a.dateCreate < b.dateCreate);
          const saves = savesSorted.map(save => ({
            name: save.name,
            id:   save.id,
          }));
          resolve(saves);
        })
        .catch(err => reject(err));
    });
  }

  fetchSaveById(id) {
    return new Promise((resolve, reject) => {
      if (typeof id === "number") {
        console.log("Trying to fetch id:" + id);
        this.sendRequest("getKsdSnapshot", "GET", { id })
          .then(res => resolve(res))
          .catch(err => reject(err));
      }
      else {
        reject("id must be a number!", id);
      }
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

  getTools() {
    const { tools, customTools } = this.state;
    return [].concat(tools).concat(customTools)
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "КСД";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    const { mode, sortProp, sortDESC } = this.state;

    return (
      <div className="page">

        <main className="main">

          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">

                {/* Select */}
                {(() => {
                  const { saves, currentSaveIndex } = this.state;

                  return (dev || saves.length > 0) && (
                    <label className="labeled-select main-top__select stack-exception">
                      <span className="labeled-select__label labeled-select__label--hidden">
                        Сохраненный калькулятор
                      </span>
                      <Select
                        value={currentSaveIndex}
                        onSelect={val => {
                          const { saves } = this.state;

                          this.setState({ currentSaveIndex: val });

                          if (val === 0) {
                            this.reset()
                              .catch(err => console.warn(err));
                          }
                          else {
                            const id = saves[val - 1].id;
                            this.fetchSaveById(id)
                              .then(save => this.extractSave(Object.assign(save, { id })))
                              .catch(err => this.showMessageDialog(err));
                          }

                        }}>
                        <Option key={0} value={0}>Не выбрано</Option>
                        {saves.map((save, index) =>
                          <Option key={index + 1} value={index + 1}>
                            {save.name}
                            {save.corrupt && (
                              <WarningOutlined style={{
                                marginLeft: ".25em",
                                color: "var(--danger-color)"
                              }}/>
                            )}
                          </Option>
                        )}
                      </Select>
                    </label>
                  )
                })()}

                <Stack>

                  <div className="page__title-wrap">
                    <h1 className="page__title">
                      { this.getTitle() }
                      { (dev || this.state.id) && (
                        <CrossButton
                          className="main-top__remove"
                          onClick={e => dialogAPI.open("dialog4", e.target)}/>
                      )}
                    </h1>
                  </div>

                  <label className="main-top__mode-select labeled-select">
                    <span className="labeled-select__label main-top__mode-select-label">
                      Ход цены
                    </span>
                    <Select
                      key={mode}
                      value={mode}
                      onSelect={val => this.setState({ mode: val, changed: true })}
                    >
                      <Option key={0} value={0}>Произвольный</Option>
                      <Option key={1} value={1}>Повышенный</Option>
                      <Option key={2} value={2}>Аномальный</Option>
                      <Option key={3} value={3}>Черный лебедь</Option>
                    </Select>
                  </label>

                  <Radio.Group
                    className="tabs"
                    key={mode}
                    defaultValue={mode}
                    name="radiogroup"
                    onChange={e => this.setState({ mode: e.target.value, changed: true })}
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

                  <div className="main-top__footer">

                    <Button 
                      className={
                        [
                          "custom-btn",
                          "custom-btn--secondary",
                          "main-top__save",
                        ]
                          .concat(this.state.changed ? "main-top__new" : "")
                          .join(" ")
                          .trim()
                      }
                      onClick={e => {
                        const { saved, changed } = this.state;

                        if (saved && changed) {
                          this.update(this.getTitle());
                          this.setState({ changed: false });
                        }
                        else {
                          dialogAPI.open("dialog1", e.target);
                        }

                      }}>
                      { (this.state.saved && !this.state.changed) ? "Изменить" : "Сохранить" }
                    </Button>
                    
                    {
                      this.state.saves.length > 0 ? (
                        <a
                          className="custom-btn custom-btn--secondary main-top__save"
                          href="#pure=true" 
                          target="_blank"
                        >
                          Добавить новый
                        </a>
                      )
                      : null
                    }

                  </div>

                  <Tooltip title="Настройки">
                    <button
                      className="settings-button js-open-modal main-top__settings"
                      onClick={e => dialogAPI.open("dialog3", e.target)}
                    >
                      <span className="visually-hidden">Открыть конфиг</span>
                      <SettingFilled className="settings-button__icon" />
                    </button>
                  </Tooltip>
                </Stack>

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
                      this.state.data
                        .sort((l, r) => sortDESC ? l[sortProp] - r[sortProp] : r[sortProp] - l[sortProp])
                        .map((item, index) => 
                          <DashboardRow 
                            key={index}
                            item={item}
                            index={index}
                            sortProp={sortProp}
                            sortDESC={sortDESC}
                            mode={this.state.mode}
                            depo={this.state.depo}
                            percentage={item.percentage}
                            selectedToolName={item.selectedToolName}
                            planIncome={item.planIncome}
                            tools={this.getTools()}
                            onSort={(sortProp, sortDESC) => {
                              this.setState({ sortProp, sortDESC })
                            }}
                            onUpdate={state => {
                              const { data } = this.state;
                              Object.assign(data[index], state);
                              this.setState({ data });
                            }}
                            onChange={(prop, val) => {
                              const { data } = this.state;
                              data[index][prop] = val;
                              this.setState({ data, changed: true });
                            }}
                            onDelete={index => {
                              const { data } = this.state;
                              data.splice(index, 1);
                              this.setState({ data })
                            }}
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
                  onClick={() => {
                    const { data } = this.state;
                    data.push({ percentage: 10 });
                    this.setState({ data })
                  }}>
                  <PlusOutlined aria-label="Добавить" />
                  инструмент
                </Button>

              </footer>
              
            </div>
            {/* /.container */}

          </div>

        </main>
        {/* /.main */}

        {(() => {
          let { saves, id } = this.state;
          let namesTaken = saves.slice().map(save => save.name);
          let name = (id) ? this.getTitle() : "Новое сохранение";

          function validate(str = "") {
            str = str.trim();

            let errors = [];

            let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(str);
            if (str.length < 3) {
              errors.push("Имя должно содержать не меньше трех символов!");
            }
            else if (test) {
              errors.push(`Нельзя использовать символ "${test[0]}"!`);
            }
            if (!id) {
              if (namesTaken.indexOf(str) > -1) {
                errors.push(`Сохранение с таким именем уже существует!`);
              }
            }

            return errors;
          }

          class ValidatedInput extends React.Component {

            constructor(props) {
              super(props);

              let { defaultValue } = props;

              this.state = {
                error: "",
                value: defaultValue || ""
              }
            }

            vibeCheck() {
              const { validate } = this.props;
              let { value } = this.state;

              let errors = validate(value);
              this.setState({ error: (errors.length > 0) ? errors[0] : "" });
              return errors;
            }

            render() {
              const { validate, label } = this.props;
              const { value, error } = this.state;

              return (
                <label className="save-modal__input-wrap">
                  {
                    label
                      ? <span className="save-modal__input-label">{label}</span>
                      : null
                  }
                  <Input
                    className={
                      ["save-modal__input"]
                        .concat(error ? "error" : "")
                        .join(" ")
                        .trim()
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    value={value}
                    maxLength={20}
                    onChange={e => {
                      let { value } = e.target;
                      let { onChange } = this.props;

                      this.setState({ value });

                      if (onChange) {
                        onChange(value);
                      }
                    }}
                    onKeyDown={e => {
                      // Enter
                      if (e.keyCode === 13) {
                        let { value } = e.target;
                        let { onBlur } = this.props;

                        let errors = validate(value);
                        if (errors.length === 0) {
                          if (onBlur) {
                            onBlur(value);
                          }
                        }

                        this.setState({ error: (errors.length > 0) ? errors[0] : "" });
                      }
                    }}
                    onBlur={() => {
                      this.vibeCheck();
                    }} />

                  <span className={
                    ["save-modal__error"]
                      .concat(error ? "visible" : "")
                      .join(" ")
                      .trim()
                  }>
                    {error}
                  </span>
                </label>
              )
            }
          }

          let onConfirm = () => {
            let { id, data, currentDay, saves, currentSaveIndex } = this.state;

            if (id) {
              this.update(name)
                .then(() => {
                  saves[currentSaveIndex - 1].name = name;
                  this.setState({
                    saves,
                    changed: false,
                  })
                })
                .catch(err => this.showMessageDialog(err));
            }
            else {
              const onResolve = (id) => {
                let index = saves.push({ id, name });
                console.log(saves);

                this.setState({
                  data,
                  saves,
                  saved: true,
                  changed: false,
                  currentSaveIndex: index,
                });
              };

              this.save(name)
                .then(onResolve)
                .catch(err => this.showMessageDialog(err));

              if (dev) {
                onResolve();
              }
            }
          }

          let inputJSX = (
            <ValidatedInput
              label="Название сохранения"
              validate={validate}
              defaultValue={name}
              onChange={val => name = val}
              onBlur={() => { }} />
          );
          let modalJSX = (
            <Dialog
              id="dialog1"
              className="save-modal"
              title={"Сохранение"}
              onConfirm={() => {
                if (validate(name).length) {
                  console.error(validate(name)[0]);
                }
                else {
                  onConfirm();
                  return true;
                }
              }}
            >
              {inputJSX}
            </Dialog>
          );

          return modalJSX;
        })()}
        {/* Save Popup */}

        <Dialog
          id="dialog4"
          title="Удаление трейдометра"
          confirmText={"Удалить"}
          onConfirm={() => {
            const { id } = this.state;
            this.delete(id)
              .then(() => console.log("Deleted!"))
              .catch(err => console.warn(err));
            return true;
          }}
        >
          Вы уверены, что хотите удалить {this.getTitle()}?
        </Dialog>
        {/* Delete Popup */}

        <Dialog
          id="dialog3"
          className=""
          confirmText="Добавить"
          onConfirm={e => {
            var { toolTemplate, customTools, propsToShowArray } = this.state;

            const nameExists = (value, tools) => {
              let found = 0;
              console.log(value, tools);
              for (const tool of tools) {
                if (value === tool.shortName) {
                  found++;
                }
              }

              return found > 1;
            };

            var template = Object.assign({}, toolTemplate);
            var tool = template;
            propsToShowArray.map((prop, index) => {
              tool[prop] = toolTemplate[prop];
              if (index === 0) {
                const suffix = customTools.length + 1;
                tool[prop] = `Инструмент ${suffix > 1 ? suffix : ""}`;
              }
            });

            tool.planIncome = round(tool.price / 10, 2);

            customTools.push(tool);

            while (nameExists(tool.shortName, this.getTools())) {
              const end = tool.shortName.match(/\d+$/g)[0];
              tool.shortName = tool.shortName.replace(end, Number(end) + 1);
            }

            this.setState({ customTools }, () => {
              $(".config-table-wrap").scrollTop(9999);
            });
          }}
          cancelText="Закрыть"
        >
          <label className="input-group input-group--fluid ksd-config__depo">
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

                this.setState({ depo: val, changed: true });
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
                  const nameExists = (value, tools) => {
                    let found = 0;
                    for (const tool of tools) {
                      if (value === tool.shortName) {
                        found++;
                      }
                    }

                    return found > 1;
                  };

                  var onBlur = (val, index, prop) => {
                    var { customTools, tools } = this.state;
                    customTools[index][prop] = val;
                    if (prop === "shortName") {
                      while (nameExists(customTools[index][prop], this.getTools())) {
                        const end = customTools[index][prop].match(/\d+$/g)[0];
                        customTools[index][prop] = customTools[index][prop].replace(end, Number(end) + 1);
                      }
                    }

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
                            {(() => {
                              const valid = true;

                              return i === 0 ? (
                                <div style={{ position: "relative" }}>
                                  <Input
                                    key={tool[prop] + Math.random()}
                                    className={tool["error"] != null ? "error" : ""}
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
                                  <span style={{
                                    position:  "absolute",
                                    left:      "0",
                                    top:       "100%",
                                    color:     "var(--danger-color)",
                                    fontSize:  ".7em",
                                    textAlign: "center"
                                  }}>{tool["error"]}</span>
                                </div>
                              )
                              : (
                                <NumericInput
                                  defaultValue={tool[prop]}
                                  onBlur={val => onBlur(val, index, prop)}
                                />
                              )
                            })()}
                          </td>
                        )
                      }
                      <td className="table-td" key={index}>
                        <Tooltip title="Удалить">
                          <button
                            className="cross-button config__delete"
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

        {(() => {
          const { errorMessage } = this.state;
          return (
            <Dialog
              id="dialog-msg"
              title="Сообщение"
              hideConfirm={true}
              cancelText="ОК"
            >
              {errorMessage}
            </Dialog>
          )
        })()}
        {/* Error Popup */}

      </div>
    );
  }
}

export default App;