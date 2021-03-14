import React from 'react'
import * as antv from '@antv/g2';

import round from "../../utils/round"
import {
  Tooltip,
} from "antd/es"
import "./style.sass"

let chart;
const color = ['#F5222D', '#FFBF00', '#87d068'];

function draw(data) {
  const val = data[0].value;

  // chart.annotation().clear(true);

  chart.annotation().arc({
    top: false,
    start: [0, 1],
    end: [100, 1],
    style: {
      stroke: '#CBCBCB',
      lineWidth: 10,
      lineDash: null,
    },
  });

  const stroke = val < (100 / 3)
    ? color[0]
    : val < (100 / 3 * 2)
      ? color[1]
      : color[2];

  chart.annotation().arc({
    start: [0, 1],
    end: [val, 1],
    style: {
      stroke,
      lineWidth: 10,
      lineDash: null,
    },
  });

  chart.changeData(data);
}

export default class Riskometer extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      value: 0,
      id:    Math.random(),
    };
  }

  creatData() {
    let { value } = this.state;

    const data = [];
    data.push({ value: round(value, 2) });
    return data;
  }

  createShape() {

    antv.registerShape('point', 'pointer', {
      draw(cfg, container) {
        const group = container.addGroup({});
        return group;
      },
    });

    chart = new antv.Chart({
      container: 'container',
      autoFit: true,
      padding: [0, 0, 30, 0],
    });
    chart.data(this.creatData());
    // chart.animate(true);

    chart.coordinate('polar', {
      startAngle: (-9 / 8) * Math.PI,
      endAngle: (1 / 8) * Math.PI,
      radius: 0.9,
    });
    chart.scale('value', {
      min: 0,
      max: 100,
      tickInterval: 10,
    });

    chart.axis('1', false);
    chart.axis('value', {
      line: null,
      label: {
        offset: -25,
        style: {
          fontSize: 18,
          fill: '#CBCBCB',
          textAlign: 'center',
          textBaseline: 'middle',
        },
      },
      tickLine: {
        length: -10,
      },
      grid: null,
    });
    
    chart.legend(false);
    chart.tooltip(false);
    chart
      .point()
      .position('value*1')
      .shape('pointer')
      .color('value', (val) => {
        if (val < 100 / 3) {
          return color[0];
        } else if (val <= 100 / 3 * 2) {
          return color[1];
        } else if (val <= 100) {
          return color[2];
        }
      });

    this.updateShape();
  }

  updateShape() {
    draw(this.creatData());
  }

  componentDidMount() {
    const { value, tool } = this.props;

    let chance = 100 - ((value * tool.priceStep) / tool.adrDay * 100);
    if (chance < 0) {
      chance = 0
    }
 
    this.setState({ value: chance }, this.createShape);
  }

  render() {
    const { value } = this.state;

    return (
      <figure
        id="anychart-embed-jCekzhX3"
        className="riskometer anychart-embed anychart-embed-jCekzhX3"
        { ...this.props }
      >
        <div id="container"></div>
        <figcaption className="riskometer__caption">
          <Tooltip title={"Средний шанс движения цены инструмента на заданную величину в течение дня"}>
            Вероятность хода
          </Tooltip>
          <span className="riskometer__value">{ round(value, 2) }%</span>
        </figcaption>
      </figure>
    )
  }
}