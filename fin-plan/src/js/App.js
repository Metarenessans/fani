import React from 'react'
const { Provider, Consumer } = React.createContext();
import ReactDOM from 'react-dom'

import { Dialog, dialogAPI } from "../../../common/components/dialog"
import Config from "../../../common/components/config"
import CustomSelect from "../../../common/components/custom-select"
import afterDecimalNumbers from "./utils/after-decimal-numbers"

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
  Switch,
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

import "../../../common/api/fetch";

import params              from "../../../common/utils/params"
import num2str              from "../../../common/utils/num2str"
import round               from "../../../common/utils/round";
import formatNumber        from "../../../common/utils/format-number"
import typeOf              from "../../../common/utils/type-of"
import promiseWhile        from "../../../common/utils/promise-while"
import fractionLength      from "../../../common/utils/fraction-length"
import readyTools          from "../../../common/adr.json"
import { Tools, Tool, template } from "../../../common/tools"

import CrossButton           from "../../../common/components/cross-button"
import NumericInput          from "../../../common/components/numeric-input"
import Stack                 from "../../../common/components/stack"
import Dashboard             from "./components/Dashboard"
import Footer                from "./components/footer"
import Stats                 from "./Components/Stats"

import "../sass/style.sass"

const defaultToolData = {
  currentTool: "Работа",
  now: 1_000_000,
  1:   1_000_000,
  3:   1_000_000,
  5:   1_000_000,
  10:  1_000_000,
};

class App extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {

      loading: false,

      data: [
        { ...defaultToolData },
        { ...defaultToolData, currentTool: "Бизнес" },
        { ...defaultToolData, currentTool: "Пассивный доход", }
      ],

      lineConfigIndex: 1,
      // lineConfigIndex: 0,

      //Размер депозита
      depo: 1_000_000,
    };

    this.state = {
      ...this.initialState,
    };
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  getTitle() {
    const { saves, currentSaveIndex, id } = this.state;
    let title = "Финансовый планировщик";

    if (id && saves[currentSaveIndex - 1]) {
      title = saves[currentSaveIndex - 1].name;
    }

    return title;
  }

  render() {
    const { data, sortProp, sortDESC, lineConfigIndex } = this.state;

    console.log(data);
    
    return (
      <Provider value={this}>
        <div className="page">

          <main className="main">
            <div className="hdOptimize" >
              <div className="main-content">

                <div className="container">

                  <Stack>
                    <Dashboard
                      data={data}
                      onChange={(prop, value, index) => {
                        const dataClone = [...data];
                        data[index][prop] = value;
                        this.setState({ data: dataClone })
                      }}
                      onAddRow={() => {
                        const dataClone = [...data];
                        dataClone.push({ ...defaultToolData });
                        this.setState({ data: dataClone });
                      }}
                      onRemoveRow={() => {
                        const dataClone = [...data];
                        dataClone.pop();
                        this.setState({ data: dataClone });
                      }}
                      onAddColumn={() => {
                        let dataClone = [...data];
                        dataClone = dataClone.map(row => {
                          const numericKeys = Object.keys(row)
                            .map(key => !isNaN(+key) && key)
                            .filter(value => !!value);

                          let prop = numericKeys.length ? +numericKeys.pop() + 1 : 1;
                          // TODO: добавлять по 5 после 5 лет
                          row[prop] = 1_000_000;
                          return row;
                        })
                        this.setState({ data: dataClone });
                      }}
                      onRemoveColumn={numericIndex => {
                        let dataClone = [...data];
                        dataClone = dataClone.map(row => {
                          console.log(row, numericIndex);
                          delete row[numericIndex];
                          return row;
                        })
                        this.setState({ data: dataClone });
                      }}
                      firstTitle={"Доходы в месяц"}
                      thirdTitleVerticalLine={false}
                      secondTitle={"Перспектива, лет"}
                      rowButton={"источник дохода"}
                      extraPeriodColumns={false}
                    />

                    <Dashboard
                      data={data}
                      firstTitle={"Расходы в месяц"}
                      thirdTitle={"Желаемый уровень жизни"}
                      thirdTitleVerticalLine={true}
                      rowButton={"статья расходов"}
                      rowModifyButtons={true}
                      rowButtonColor={true}
                      extraPeriodColumns={true}
                      fixedWidth={true}
                    />

                    <Stats
                      data={data}
                      firstTitle={"Расходы в месяц"}
                      secondTitle={""}
                      rowButton={"статья расходов"}
                      rowModifyButtons={true}
                      extraPeriodColumns={true}
                    />

                    <Footer />
                  </Stack>

                </div>
                {/* /.container */}
              </div>
            </div>

          </main>
          {/* /.main */}

        </div>
      </Provider>
    );
  }
}

export { App, Consumer }