import React from 'react'
const { Provider, Consumer } = React.createContext();

import $ from "jquery"
import { Input, message } from 'antd'
import { cloneDeep, isEqual } from "lodash"

import { Dialog, dialogAPI } from "../../../common/components/dialog"
import Config                from "../../../common/components/config"

import fetch from "../../../common/api/fetch"
import { fetchInvestorInfo } from "../../../common/api/fetch/investor-info/fetch-investor-info"
import { applyInvestorInfo } from "../../../common/api/fetch/investor-info/apply-investor-info"
import fetchSaveById from "../../../common/api/fetch/fetch-save-by-id"
import fetchBonds from "../../../common/api/fetch-bonds"
import fetchSnapshotsFor from "../../../common/api/fetch-snapshots"
import fetchLastModifiedSnapshot from "../../../common/api/fetch-last-modified-snapshot"
import params       from "../../../common/utils/params"
import formatNumber from "../../../common/utils/format-number"
import { Tools, Tool } from "../../../common/tools"

import "../sass/style.sass"

import NumericInput           from "../../../common/components/numeric-input"
import Stack                  from "../../../common/components/stack"
import Header                 from "../../../common/components/header"
import SaveDialog             from "../../../common/components/save-dialog"
import DeleteDialog           from "../../../common/components/delete-dialog"
import Dashboard              from "./components/Dashboard"
import Credit                 from "./Components/Credit"
import Stats                  from "./Components/Stats"
import Footer                 from "./components/footer"
import ActiveIncomeCalculator from "./components/ActiveIncomeCalculator"

import BaseComponent, { Context } from "../../../common/components/BaseComponent";
/** @type {React.Context<App>} */
export const StateContext = Context;

let scrollInitiator;

export default class App extends BaseComponent {

  constructor(props) {
    super(props);

    this.deafultTitle = "Финансовый планировщик";

    this.initialState = {
      // Копирует `initialState` из BaseComponent
      ...this.initialState,

      incomeTools: ["Работа", "Бизнес", "Пассивный доход"],
      paymentTools: [
        "Жилье",
        "Машина",
        "Питание",
        "Одежда",
        "Отдых",
        "Обучение",
        "Страховка",
        "Хобби",
        "Налоги",
        "Прочее"
      ],

      incomeArr: [
        {
          currentTool: "Работа",
          now: 100_000,
          1: 120_000,
          3: 200_000,
          5: 0,
          10: 0,
        },
        {
          currentTool: "Бизнес",
          now: 80_000,
          1: 100_000,
          3: 0,
          5: 200_000,
          10: 400_000,
        },
        {
          currentTool: "Пассивный доход",
          now: 20_000,
          1: 20_000,
          3: 50_000,
          5: 70_000,
          10: 150_000,
        },
      ],

      paymentArr: [
        {
          currentTool: "Жилье",
          now: 50_000,
          1: 40_000,
          3: 120_000,
          5: 150_000,
          10: 250_000,
        },
        {
          currentTool: "Машина",
          now: 10_000,
          1: 10_000,
          3: 15_000,
          5: 30_000,
          10: 50_000,
        },
        {
          currentTool: "Питание",
          now: 30_000,
          1: 30_000,
          3: 50_000,
          5: 50_000,
          10: 50_000,
        },
        {
          currentTool: "Одежда",
          now: 2_000,
          1: 5_000,
          3: 30_000,
          5: 40_000,
          10: 50_000,
        },
        {
          currentTool: "Отдых",
          now: 5_000,
          1: 20_000,
          3: 20_000,
          5: 20_000,
          10: 20_000,
        },
        {
          currentTool: "Обучение",
          now: 10_000,
          1: 10_000,
          3: 20_000,
          5: 40_000,
          10: 30_000,
        },
        {
          currentTool: "Страховка",
          now: 3_000,
          1: 3_000,
          3: 10_000,
          5: 10_000,
          10: 20_000,
        },
        {
          currentTool: "Хобби",
          now: 5_000,
          1: 10_000,
          3: 20_000,
          5: 20_000,
          10: 30_000,
        },
        {
          currentTool: "Налоги",
          now: 1_200,
          1: 2_000,
          3: 5_000,
          5: 10_000,
          10: 20_000,
        },
        {
          currentTool: "Прочее",
          now: 10_000,
          1: 10_000,
          3: 10_000,
          5: 10_000,
          10: 10_000,
        },
      ],

      desirableArr: [
        {
          1: 100_000,
          3: 120_000,
          5: 180_000,
          10: 250_000,
        },
        {
          1: 80_000,
          3: 120_000,
          5: 150_000,
          10: 200_000,
        },
        {
          1: 50_000,
          3: 80_000,
          5: 100_000,
          10: 120_000,
        },
        {
          1: 30_000,
          3: 40_000,
          5: 50_000,
          10: 90_000,
        },
        {
          1: 40_000,
          3: 50_000,
          5: 100_000,
          10: 150_000,
        },
        {
          1: 20_000,
          3: 40_000,
          5: 60_000,
          10: 30_000,
        },
        {
          1: 20_000,
          3: 30_000,
          5: 40_000,
          10: 40_000,
        },
        {
          1: 20_000,
          3: 30_000,
          5: 40_000,
          10: 60_000,
        },
        {
          1: 3_000,
          3: 5_000,
          5: 10_000,
          10: 30_000,
        },
        {
          1: 30_000,
          3: 40_000,
          5: 50_000,
          10: 50_000,
        },
      ],

      loanArr: [
        {
          now: 2_000_000,
          payment: 50_000
        }
      ],

      savingsArr: [
        {
          now: 300_000,
          1: 350_000,
          3: 350_000,
          5: 350_000,
          10: 350_000,
        },
        {
          now: 500_000,
          1: 500_000,
          3: 500_000,
          5: 500_000,
          10: 500_000,
        },
      ],

      //Размер депозита
      depo: 1_000_000,

      targetPassiveIncome: 1,

      passiveIncomeTools: [
        { "name": "ОФЗ 26214", "rate": 4.99 },
        { "name": "ОФЗ 26205", "rate": 5.60 },
        { "name": "ОФЗ 26217", "rate": 5.99 },
        { "name": "ОФЗ 26209", "rate": 6.26 },
        { "name": "ОФЗ 26220", "rate": 6.41 },
        { "name": "ОФЗ 26215", "rate": 7.39 }
      ],
      currentPassiveIncomeToolName: "ОФЗ 26215",
    };

    this.state = {
      // Копирует `state` из BaseComponent
      ...this.state,

      ...cloneDeep(this.initialState)
    }

    // Bindings
    this.applyInvestorInfo = applyInvestorInfo.bind(this);
    this.fetchSaveById = fetchSaveById.bind(this, "Finplan");
  }

  bindEvents() {
    super.bindEvents();

    // При наведении мыши на .dashboard-extra-container, элемент записывается в `scrollInitiator`
    $(document).on("mouseenter", ".dashboard-extra-container", function (e) {
      scrollInitiator = e.target.closest(".dashboard-extra-container");
    })

    document.addEventListener("scroll", function (e) {
      if (e?.target?.classList?.contains("dashboard-extra-container")) {
        if (e.target !== scrollInitiator) return;
        document.querySelectorAll(".dashboard-extra-container").forEach(element => {
          if (element === scrollInitiator) return;
          element.scrollLeft = scrollInitiator.scrollLeft;
        });
      }
    }, true /* Capture event */);
  }

  componentDidUpdate(prevProps, prevState) {
    const { id, saves } = this.state;
    if (prevState.id != id || !isEqual(prevState.saves, saves)) {
      if (id != null) {
        const currentSaveIndex = saves.indexOf(saves.find(snapshot => snapshot.id === id)) + 1;
        this.setStateAsync({ currentSaveIndex });
      }
    }
  }

  componentDidMount() {
    this.bindEvents();
    this.fetchInitialData();
  }

  /* API */
  async fetchInitialData() {
    this.updateLoanArr();
    this.fetchBonds();

    await this.fetchSnapshots();
    await this.fetchLastModifiedSnapshot({ fallback: this.getTestSpapshot() });
  }

  getTestSpapshot() {
    return require("./snapshot.json");
  }
  
  async fetchBonds() {
    const passiveIncomeTools = await fetchBonds();
    return this.setStateAsync({ passiveIncomeTools });
  }

  packSave() {
    const {
      incomeTools,
      paymentTools,
      incomeArr,
      paymentArr,
      desirableArr,
      loanArr,
      savingsArr,
      depo,
      targetPassiveIncome,
    } = this.state;

    const json = {
      static: {
        incomeTools,
        paymentTools,
        incomeArr,
        paymentArr,
        desirableArr,
        loanArr,
        savingsArr,
        depo,
        targetPassiveIncome,
      },
    };

    console.log("Packed save:", json);
    return json;
  }

  parseSnapshot = snapshot => {
    const parsedStatic = JSON.parse(snapshot);
    console.log("Parsed static", parsedStatic);

    const initialState = cloneDeep(this.initialState);

    const state = {};
    // TODO:
    state.depo                = parsedStatic.depo                ?? initialState.depo;
    state.incomeTools         = parsedStatic.incomeTools         ?? initialState.incomeTools;
    state.paymentTools        = parsedStatic.paymentTools        ?? initialState.paymentTools;
    state.incomeArr           = parsedStatic.incomeArr           ?? initialState.incomeArr;
    state.paymentArr          = parsedStatic.paymentArr          ?? initialState.paymentArr;
    state.desirableArr        = parsedStatic.desirableArr        ?? initialState.desirableArr;
    state.loanArr             = parsedStatic.loanArr             ?? initialState.loanArr;
    state.savingsArr          = parsedStatic.savingsArr          ?? initialState.savingsArr;
    state.targetPassiveIncome = parsedStatic.targetPassiveIncome ?? initialState.targetPassiveIncome;

    return state;
  }

  // TODO: убедиться, что все extractSnapshot переименованы в extractSnapshot

  updateLoanArr() {
    const { incomeArr } = this.state;

    const numericKeys = Object.keys(incomeArr[0])
      .map(key => !isNaN(+key) && key)
      .filter(value => !!value)
      .slice(1);

    const loanArr = [...this.state.loanArr].map((row, index) => {
      const arr = [];
      let credit = row.now;
      let payment = row.payment;
      let month = 0;
      if (payment > 0) {
        while (credit > 0 && month <= numericKeys[numericKeys.length - 1] * 12) {
          month++;
          const i = month % 12 == 0 ? Math.floor((month - 1) / 12) : Math.floor(month / 12);

          const creditProp = "now_" + i;
          if (row[creditProp] != null && (month % 12) == 1) {
            credit = row[creditProp];
          }

          const paymentProp = "payment_" + i;
          if ([1, ...numericKeys].indexOf(i) != -1) {
            if (row[paymentProp] != null) {
              payment = row[paymentProp];
            }
            else {
              payment = row.payment
            }
          }

          arr.push({ credit, month, payment });
          credit -= payment;
        }
      }

      for (let key of [1, ...numericKeys]) {
        const creditProp = "now_" + key;
        if (arr.length >= key * 12) {
          row[creditProp] = arr[key * 12]?.credit || 0;
        }
        else {
          delete row[creditProp];
          delete row[key];
        }
      }

      return row;
    })

    this.setState({ loanArr })
  }

  getLoanPaymentFor(period = "now") {
    const { loanArr } = this.state;
    return loanArr
      .map(row => {
        const len = Math.floor(row.now / row.payment);
        if (period == "now") {
          return row.payment;
        }
        else if (len >= period * 12) {
          return row["payment_" + period] ?? row.payment;
        }
        return 0;
      })
      .reduce((acc, curr) => acc + curr, 0)
  }

  render() {
    const {
      incomeArr,
      incomeTools,
      paymentArr,
      paymentTools,
      desirableArr,
      loanArr,
      savingsArr,
      targetPassiveIncome,
      depo,
      passiveIncomeTools,
      currentPassiveIncomeToolName,
      passiveIncome,
    } = this.state;

    const tax = 15;

    const numericKeys = Object.keys(incomeArr[0])
      .map(key => !isNaN(+key) && key)
      .filter(value => !!value)
      .map(value => Number(value))
      .slice(1);

    const template = {
      currentTool: incomeTools[0],
      now: 0,
    };
    for (let key of [1, ...numericKeys]) {
      template[key] = 0;
    }

    const paymentTemplate = { ...cloneDeep(template), currentTool: paymentTools[0] };

    const primaryStatsArr = ["now", 1, ...numericKeys].map(prop =>
      incomeArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
      - paymentArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
      - this.getLoanPaymentFor(prop)
    );
    const secondaryStatsArr = [1, ...numericKeys].map(prop =>
      incomeArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
      - desirableArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
    );

    const statsArr = [...primaryStatsArr, ...secondaryStatsArr];

    const userPassiveIncome = incomeArr.filter(row => row.currentTool == "Пассивный доход")
      .map(row => row.now)
      .reduce((acc, curr) => acc + curr, 0);

    return (
      <Context.Provider value={this}>
        <div className="page">

          <main className="main">
            <Header/>
            <div className="hdOptimize" >
              <div className="main-content">

                <div className="container">

                  <Stack>
                    {/* Доходы */}
                    <Dashboard
                      data={incomeArr}
                      options={incomeTools}
                      firstTitle="Доходы в месяц"
                      firstSubtitle="Источник дохода"
                      secondTitle="Перспектива доходов в месяц"
                      sumTitle="Сумма доходов в месяц"
                      rowButton="Источник дохода"
                      thirdTitleVerticalLine={false}
                      extraPeriodColumns={false}
                      extendable={true}
                      minRows={1}
                      onChange={(prop, value, index) => {
                        const incomeArr = [...this.state.incomeArr];
                        incomeArr[index][prop] = value;
                        if (prop == "now") {
                          for (let p of [1, ...numericKeys]) {
                            incomeArr[index][p] = value;
                          }
                        }
                        this.setState({ incomeArr });
                      }}
                      onAddRow={() => {
                        const incomeArr = [...this.state.incomeArr];
                        incomeArr.push(cloneDeep(template));
                        this.setState({ incomeArr });
                      }}
                      onRemoveRow={() => {
                        const incomeArr = [...this.state.incomeArr];
                        incomeArr.pop();
                        this.setState({ incomeArr });
                      }}
                      onAddColumn={() => {
                        // TODO: добавлять по 5 после 5 лет
                        let prop = numericKeys.length ? +[...numericKeys].pop() + 1 : 1;

                        const incomeArr = [...this.state.incomeArr].map(row => {
                          row[prop] = 0;
                          return row;
                        });
                        const paymentArr = [...this.state.paymentArr].map(row => {
                          row[prop] = 0;
                          return row;
                        });
                        const desirableArr = [...this.state.desirableArr].map(row => {
                          row[prop] = 0;
                          return row;
                        });
                        const savingsArr = [...this.state.savingsArr].map(row => {
                          row[prop] = 0;
                          return row;
                        });
                        this.setState({ incomeArr, paymentArr, desirableArr, savingsArr });
                      }}
                      onPeriodChange={(prop, prevProp) => {
                        const incomeArr = [...this.state.incomeArr].map(row => {
                          const tempValue = row[prevProp];
                          delete row[prevProp];
                          row[prop] = tempValue;
                          return row;
                        });
                        const paymentArr = [...this.state.paymentArr].map(row => {
                          const tempValue = row[prevProp];
                          delete row[prevProp];
                          row[prop] = tempValue;
                          return row;
                        });
                        const desirableArr = [...this.state.desirableArr].map(row => {
                          const tempValue = row[prevProp];
                          delete row[prevProp];
                          row[prop] = tempValue;
                          return row;
                        });
                        const savingsArr = [...this.state.savingsArr].map(row => {
                          const tempValue = row[prevProp];
                          delete row[prevProp];
                          row[prop] = tempValue;
                          return row;
                        });
                        const loanArr = [...this.state.loanArr].map(row => {
                          const tempCredit = row["now_" + prevProp];
                          const tempPayment = row["payment_" + prevProp];
                          delete row["now_" + prevProp];
                          delete row["payment_" + prevProp];
                          row["now_" + prop] = tempCredit;
                          row["payment_" + prop] = tempPayment;
                          return row;
                        });

                        this.setStateAsync({ incomeArr, paymentArr, desirableArr, savingsArr, loanArr })
                          .then(() => this.updateLoanArr());
                      }}
                      onRemoveColumn={numericIndex => {
                        const incomeArr = [...this.state.incomeArr].map(row => {
                          delete row[numericIndex];
                          return row;
                        });
                        const paymentArr = [...this.state.paymentArr].map(row => {
                          delete row[numericIndex];
                          return row;
                        });
                        const desirableArr = [...this.state.desirableArr].map(row => {
                          delete row[numericIndex];
                          return row;
                        });
                        this.setState({ incomeArr, paymentArr, desirableArr });
                      }}
                      onUpdateOptions={incomeTools => this.setState({ incomeTools })}
                    />

                    {/* Расходы */}
                    <Dashboard
                      data={paymentArr}
                      options={paymentTools}
                      firstTitle="Расходы в месяц"
                      firstSubtitle="Статья расходов"
                      secondTitle="Перспектива расходов в месяц"
                      thirdTitle="Желаемый уровень жизни"
                      sumTitle="Сумма расходов в месяц"
                      rowButton="Статья расходов"
                      thirdTitleVerticalLine={true}
                      rowModifyButtons={true}
                      extraPeriodColumns={desirableArr}
                      goal={targetPassiveIncome}
                      minRows={1}
                      progressGoalPrimary={["now", 1, ...numericKeys].map(prop =>
                        incomeArr
                          .filter(row => row.currentTool == "Пассивный доход")
                          .map(row => row[prop])
                          .reduce((curr, next) => curr + next, 0)
                        +
                        passiveIncome
                      )}
                      fixedWidth={true}
                      onChange={(prop, value, index) => {
                        const paymentArr = [...this.state.paymentArr];
                        paymentArr[index][prop] = value;
                        if (prop == "now") {
                          for (let p of [1, ...numericKeys]) {
                            paymentArr[index][p] = value;
                          }
                        }
                        this.setState({ paymentArr });
                      }}
                      onExtraChange={(prop, value, index) => {
                        const desirableArr = [...this.state.desirableArr];
                        desirableArr[index][prop] = value;
                        if (prop == "1") {
                          for (let p of [1, ...numericKeys]) {
                            desirableArr[index][p] = value;
                          }
                        }
                        this.setState({ desirableArr });
                      }}
                      onAddRow={() => {
                        const paymentArr = [...this.state.paymentArr];
                        paymentArr.push(cloneDeep(paymentTemplate));

                        const desirableArr = [...this.state.desirableArr];
                        desirableArr.push(cloneDeep(paymentTemplate));

                        this.setState({ paymentArr, desirableArr });
                      }}
                      onRemoveRow={() => {
                        const paymentArr = [...this.state.paymentArr];
                        paymentArr.pop();

                        const desirableArr = [...this.state.desirableArr];
                        desirableArr.pop();

                        this.setState({ paymentArr, desirableArr });
                      }}
                      onUpdateOptions={paymentTools => this.setState({ paymentTools })}
                    />

                    {/* Кредит */}
                    <Credit
                      data={loanArr}
                      numericKeys={numericKeys}
                      firstTitle="Кредит"
                      rowButton="кредит"
                      extendable={false}
                      showSum={false}
                      fixedWidth={true}
                      onChange={(prop, value, index) => {
                        console.log(prop, value, index);
                        const loanArr = [...this.state.loanArr];
                        loanArr[index][prop] = value;

                        let key = -1;
                        if (prop.indexOf("_") != -1) {
                          key = +prop.slice(prop.indexOf("_") + 1);
                        }

                        let keys = [1, ...numericKeys];
                        const propsToDelete = [...(keys.slice(keys.indexOf(key) + 1))];
                        for (let p of propsToDelete) {
                          delete loanArr[index]["now_" + p];
                          delete loanArr[index]["payment_" + p];
                        }

                        const arr = [];
                        let credit = loanArr[index].now;
                        let payment = loanArr[index].payment;
                        let month = 0;
                        if (payment > 0) {
                          while (credit > 0 && month <= numericKeys[numericKeys.length - 1] * 12) {
                            month++;
                            const i = month % 12 == 0 ? Math.floor((month - 1) / 12) : Math.floor(month / 12);

                            const creditProp = "now_" + i;
                            if (loanArr[index][creditProp] != null && (month % 12) == 1) {
                              credit = loanArr[index][creditProp];
                            }

                            const paymentProp = "payment_" + i;
                            if ([1, ...numericKeys].indexOf(i) != -1) {
                              if (loanArr[index][paymentProp] != null) {
                                payment = loanArr[index][paymentProp];
                              }
                              else {
                                payment = loanArr[index].payment
                              }
                            }

                            arr.push({ credit, month, payment });
                            credit -= payment;
                          }
                        }

                        // console.log(arr);

                        for (let key of [1, ...numericKeys]) {
                          const creditProp = "now_" + key;
                          if (arr.length >= key * 12) {
                            loanArr[index][creditProp] = arr[key * 12]?.credit || 0;
                          }
                          else {
                            delete loanArr[index][creditProp];
                            delete loanArr[index][key];
                          }
                        }

                        // console.log(loanArr);

                        this.setState({ loanArr });
                      }}
                      onAddRow={() => {
                        const loanArr = [...this.state.loanArr];
                        // TODO: сделать другой template
                        loanArr.push(cloneDeep({ now: 0, payment: 0 }));
                        this.setState({ loanArr });
                      }}
                      onRemoveRow={() => {
                        const loanArr = [...this.state.loanArr];
                        loanArr.pop();
                        this.setState({ loanArr });
                      }}
                    />

                    {/* Накопления */}
                    <Dashboard
                      data={savingsArr}
                      firstTitle="Накопления"
                      rowButton="накопление"
                      firstColumnContent={index => `Вклад ${index + 1}`}
                      fixedWidth={true}
                      showSum={false}
                      canRemoveLastRow={true}
                      onChange={(prop, value, index) => {
                        const savingsArr = [...this.state.savingsArr];
                        savingsArr[index][prop] = value;
                        if (prop == "now") {
                          for (let p of [1, ...numericKeys]) {
                            savingsArr[index][p] = value;
                          }
                        }
                        this.setState({ savingsArr });
                      }}
                      onAddRow={() => {
                        const savingsArr = [...this.state.savingsArr];
                        savingsArr.push(cloneDeep(template));
                        this.setState({ savingsArr });
                      }}
                      onRemoveRow={() => {
                        const savingsArr = [...this.state.savingsArr];
                        savingsArr.pop();
                        this.setState({ savingsArr });
                      }}
                    />

                    <Stats
                      data={statsArr}
                      title="Баланс на конец месяца:"
                      numericKeys={numericKeys}
                    />

                    <Stats
                      data={statsArr}
                      title="Баланс на конец года:"
                      multiplier={12}
                      numericKeys={numericKeys}
                    />

                    <Footer
                      depo={(statsArr[0] * 12) + savingsArr.map(row => row.now).reduce((curr, next) => curr + next, 0)}
                      onDepoChange={depo => this.setState({ depo })}
                      userPassiveIncome={userPassiveIncome}
                      numericKeys={[1, ...numericKeys]}
                      paymentStatsArr={[1, ...numericKeys].map(prop =>
                        paymentArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
                      )}
                      desirableStatsArr={[1, ...numericKeys].map(prop =>
                        desirableArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
                      )}
                      tax={tax}
                      onTargetPassiveIncomeChange={targetPassiveIncome => this.setState({ targetPassiveIncome })}
                      onPassiveIncomeChange={passiveIncome => this.setState({ passiveIncome })}
                      passiveIncomeTools={passiveIncomeTools}
                      currentPassiveIncomeToolName={currentPassiveIncomeToolName}
                      onCurrentPassiveIncomeToolNameChange={currentPassiveIncomeToolName => this.setState({ currentPassiveIncomeToolName })}
                    />

                    <ActiveIncomeCalculator
                      depo={depo}
                      numericKeys={[1, ...numericKeys]}
                      statsArr={secondaryStatsArr}
                      desirableStatsArr={[1, ...numericKeys].map(prop =>
                        desirableArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
                      )}
                      incomeStatsArr={[1, ...numericKeys].map(prop =>
                        incomeArr.map(row => row[prop]).reduce((curr, next) => curr + next, 0)
                      )}
                      tax={tax}
                    />
                  </Stack>

                </div>
                {/* /.container */}
              </div>
            </div>

          </main>
          {/* /.main */}

          <SaveDialog />

          <DeleteDialog />

          <Config
            id="config"
            title="Инструменты"
            template={template}
            templateContructor={Tool}
            tools={this.state.tools}
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
            customTools={this.state.customTools}
            onChange={customTools => this.setState({ customTools })}
            insertBeforeDialog={
              <label className="input-group input-group--fluid Finplan-config__depo">
                <span className="input-group__label">Размер депозита:</span>
                <NumericInput
                  className="input-group__input"
                  defaultValue={this.state.depo}
                  format={formatNumber}
                  min={10_000}
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
            }
          />
          {/* Инструменты */}

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
      </Context.Provider>
    );
  }
}

export { App }