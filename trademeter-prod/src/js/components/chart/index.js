import React, { Component } from 'react'
import { Consumer } from "../../app"
import { Radio } from "antd/es"
import roundUp      from "../../../../../common/utils/round-up"
import formatNumber from "../../../../../common/utils/format-number"
import { flatten } from 'lodash'

import "./style.scss"

let chart, chartData, chartData2, chartData3, scale, scaleStart = 0, scaleEnd = 1;

function updateChartZoom(scaleStart, scaleEnd) {
  const { data, chartScaleMode } = this.state;
  const step = 1 / data.length;
  chart.xZoom().setTo(
    scaleStart,
    scaleEnd == 1
      ? 1
      : scaleEnd <= step
        ? round(step, 6)
        : chartScaleMode == 1
          ? scaleEnd
          : round(scaleEnd - step, 6)
  );
}

function updateChartTicks(_scaleStart = scaleStart, _scaleEnd = scaleEnd) {
  const { data } = this.state;

  let min = Math.round(data.length * _scaleStart) + 1;
  min = Math.max(min, 1);
  let max = roundUp(data.length * _scaleEnd);
  if (max == min) {
    max = min + 1;
  }
  max = Math.min(max, data.length);

  scale.minimum(min);
  scale.maximum(max);
  scale.ticks().interval((() => {
    const range = Math.abs(max - min) + 1;
    if (range >= 260) {
      return range / 13;
    }
    else if (range >= 100) {
      return 10;
    }
    else if (range >= 50) {
      return 5;
    }
    return 1;
  })());
}

function createChart() {
  anychart && anychart.onDocumentReady(() => {

    chart = anychart.line();

    updateChart.call(this, true);

    chart.animation(true, 3000);
    chart.listen("click", e => {
      if (e.pointIndex) {
        this.setCurrentDay(e.pointIndex + 1);
      }
    });
    chart.tooltip().titleFormat(e => {

      let index;
      for (let point of e.points) {
        index = point.x || point.index;
        if (index) {
          break;
        }
      }
      index = Number(index);
      return `День ${index}`;
    });

    // set data
    let series = chart.line(chartData);
    series.name("Фактический рост депо");
    series.tooltip().displayMode("separated");
    series.tooltip().useHtml(true);
    series.tooltip().format(e => {
      let svg = `
        <svg viewBox="0 0 10 10" width="1em" height="1em" 
              fill="#87d068" style="position: relative; top: 0.1em">
          <rect x="0" y="0" width="10" height="10" />
        </svg>
      `;
      return `${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}`
    });
    // Line color
    series.normal().stroke({
      color: "#87d068",
      thickness: "5%"
    });

    let series3 = chart.line(chartData3);
    series3.xMode('scatter');
    series3.name("Рекомендуемый рост депо");
    series3.tooltip().displayMode("separated");
    series3.tooltip().useHtml(true);
    series3.tooltip().format(e => {
      // console.log(e.index);
      // const lastFilledDay = this.getLastFilledDayNumber() - 1;

      if (e.index > 0) {
        let svg = `
          <svg viewBox="0 0 10 10" width="1em" height="1em" 
                fill="#c46d1a" style="position: relative; top: 0.1em">
            <rect x="0" y="0" width="10" height="10" />
          </svg>
        `;

        return `${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}`
      }
      else return `<span class="empty-tooltip-row"></span>`;
    });
    series3.normal().stroke({
      color: "#c46d1a",
      dash: '3 5',
      thickness: "5%"
    });

    let series2 = chart.line(chartData2);
    series2.name("Планируемый рост депо");
    series2.tooltip().displayMode("separated");
    series2.tooltip().useHtml(true);
    series2.tooltip().format(e => {
      let svg = `
        <svg viewBox="0 0 10 10" width="1em" height="1em" 
              fill="#40a9ff" style="position: relative; top: 0.1em">
          <rect x="0" y="0" width="10" height="10" />
        </svg>
      `;

      return `${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}`
    });
    series2.normal().stroke({
      color: "#40a9ff",
      thickness: "5%"
    });

    // TODO: return after release
    if (false) {
      // turn on X Scroller
      chart.xScroller(true);
      // chart.xScroller().thumbs(false);
      chart.xScroller().minHeight(40);
      chart.xScroller().fill("#40a9ff 0.1");
      chart.xScroller().selectedFill("#40a9ff 0.5");
      chart.xScroller().listen("scrollerchange", e => {
        scaleStart = e.startRatio;
        scaleEnd   = e.endRatio;
        this.updateChartTicks(scaleStart, scaleEnd);
      });
    }

    // Genetal settings
    chart.xAxis().title("Номер дня");
    chart.yAxis().labels().format(e => formatNumber(e.value));

    // set container and draw chart
    chart.xScale().mode("continuous");
    chart.container("chart").draw();
  });
}

function updateChart(isInit = false) {
  const { days, daysInOrder, mode } = this.state;
  const data = [...this.state.data];
  if (data.length !== days[mode]) {
    return;
  }

  // ----
  // План
  // ----
  const planData = new Array(days[mode]).fill().map((v, i) => ({
    x:     String(i + 1),
    value: data[i].depoEndPlan
  }));
  // TODO: return after release
  // planData.map(item => {
  //   item.x = String(Number(item.x) + 1);
  //   return item;
  // });
  // planData.unshift({ x: "1", value: data[0].depoStartTest });

  if (isInit) {
    chartData2 = anychart.data.set(planData);
  }
  else {
    chartData2.data(planData);
  }

  // ----
  // Факт
  // ----
  const factDays = this.getFilledDays();
  const factArray = [];
  let factData = [];

  if (daysInOrder) {
    if (factDays.length) {
      for (let i = 0; i < factDays.length; i++) {
        if (i == 0) {
          factArray[i] = data[i].depoStartTest + this.getRealIncome(i + 1);
        }
        else {
          factArray[i] = factArray[i - 1] + this.getRealIncome(i + 1, data, factArray[i - 1]);
        }

        if (false && data[i].iterationsList.length > 1) {
          let endValue = factArray[i]
          factArray[i] = [];
          for (let j = 0; j < data[i].iterationsList.slice(0, -1).length; j++) {
            factArray[i].push(data[i].depoStartTest + data[i].iterationsList[j].income);
          }
          factArray[i].push(endValue);
        }
      }

      if (true) {
        factData = flatten(
          factArray.map((value, index) => {
            if (typeof value == "object") {
              return value.map((v, i) => {
                return {
                  x:     index + (i + 1) / 10,
                  value: v
                }
              });
            }

            return {
              x:     index + 1,
              value: value
            }
          })
        );
      }
      else {
        factData = factArray.map((value, index) => {
          return {
            x:     String(index + 1),
            value: value
          }
        });
      }
    }
  }
  else {
    factData = new Array(days[mode]).fill().map((v, i) => ({
      x:     String(i + 1),
      value: data[i].depoStartTest + this.getRealIncome(i + 1)
    }));
  }
  
  factData.map(item => {
    item.x = String(item.x);
    return item;
  });
  // TODO: return after release
  // factData.map(item => {
  //   item.x = String(Number(item.x) + 1);
  //   return item;
  // });
  // if (factData.length) {
  //   factData.unshift({ x: "1", value: data[0].depoStartTest });
  // }

  if (isInit) {
    chartData = anychart.data.set(factData);
  }
  else {
    chartData.data(factData);
  }

  // --------
  // Рекоменд
  // --------
  if (true) {
    let recommendData = [];
    if (factDays.length) {
      const { withdrawal, withdrawalInterval, payload, payloadInterval } = this.state;

      const rateRecommended = this.getRateRecommended();

      const factLastDay = this.getLastFilledDayNumber() - 1;
      recommendData = new Array(days[mode] - factLastDay).fill(0);
      recommendData[0] = factArray[factArray.length - 1];

      for (let i = 1; i < recommendData.length; i++) {
        recommendData[i] = recommendData[i - 1] + (recommendData[i - 1] * rateRecommended / 100);

        if ((factLastDay + i + 1) % withdrawalInterval[mode] == 0) {
          recommendData[i] -= withdrawal[mode];
        }
        
        if ((factLastDay + i + 1) % payloadInterval[mode] == 0) {
          recommendData[i] += payload[mode];
        }
      }

      recommendData = recommendData.map((value, index) => {
        return {
          x:     String(factLastDay + index + 1),
          value: value
        }
      });
      
      // TODO: return after release
      // recommendData.map(item => {
      //   item.x = String(Number(item.x) + 1);
      //   return item;
      // });
    }

    if (isInit) {
      chartData3 = anychart.data.set(recommendData);
    }
    else {
      if (!daysInOrder) {
        recommendData = null;
      }
      chartData3.data(recommendData);
    }
  }

  if (isInit) {
    scale = anychart.scales.linear();
  }

  updateChartTicks.call(this, scaleStart, scaleEnd);
  updateChartZoom.call(this, scaleStart, scaleEnd);

  if (isInit) {
    chart.xAxis().scale(scale);
    chart.xAxis().ticks(true);
  }
}

function Chart(props) {
  return (
    <div className="chart-wrapper">
      <div id="chart" className="chart"></div>
      {false && (
        <Radio.Group
          className="chart-mode"
          onChange={e => {
            const chartScaleMode = e.target.value;

            let actualScale = chartScaleMode;
            actualScale = Math.min(actualScale, data.length);
            let min = Math.floor(currentDay - (actualScale / 2));
            let max = Math.floor(currentDay + (actualScale / 2));
            if (min < 0) {
              max += -min;
              min += -min;
            }

            scaleStart = min / data.length
            scaleEnd   = max / data.length;

            this.setStateAsync({ chartScaleMode }).then(() => updateChart());
          }}
          value={this.state.chartScaleMode}>
          <Radio.Button value={1}>день</Radio.Button>
          <Radio.Button value={5}>неделя</Radio.Button>
          <Radio.Button value={20}>месяц</Radio.Button>
          <Radio.Button value={260}>год</Radio.Button>
        </Radio.Group>
      )}
    </div>
  )
}

export { Chart, createChart, updateChart, updateChartTicks, updateChartZoom }