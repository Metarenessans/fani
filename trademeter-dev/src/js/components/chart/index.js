import React, { memo, useState, useEffect } from 'react'
import { Consumer } from "../../app"
import { Radio } from "antd/es"
import roundUp      from "../../../../../common/utils/round-up"
import formatNumber from "../../../../../common/utils/format-number"
import { flatten } from 'lodash'

import "./style.scss"
import getFraction    from '../../../../../common/utils/get-fraction'
import round          from '../../../../../common/utils/round'

let 
  chart,
  chartData,
  chartData2,
  chartData3,
  planEndData,
  scale,
  scaleStart = 0,
  scaleEnd   = 1,
  steps      = 1;

let factData = [];
let planData = [];
let recommendData = [];

function roundToClosest(value, n) {
  return Math.floor(value / n) * n;
}

const getLen = data => {
  if (!data) {
    return 0;
  }

  let len = data.length;
  for (let entry of data) {
    let iterationsNum = entry.iterations && entry.iterations.filter(v => v.percent != null).length;
    if (iterationsNum > 1) {
      len += iterationsNum - 1;
    }
  }
  
  return len;
};

function updateChartZoom(scaleStart, scaleEnd) {
  const { data, chartScaleMode } = this.state;
  updateChartScaleXY(scaleStart, scaleEnd, data, chartScaleMode);
}

function updateChartScaleXY(scaleStart, scaleEnd, data, scaleMode) {
  // X axis
  const step = 1 / data.length;
  
  let start = scaleStart;
  let end   = scaleEnd >= 1
    ? 1
    : scaleEnd <= step
      ? step
      : scaleMode == 1
        ? scaleEnd
        : scaleEnd - step;
  
  chart.xZoom().setTo(start, end);
  
  // Y axis
  updateChartScaleY(start, end);
}

function updateChartScaleY(start, end) {  
  // Y axis
  
  const startIndex = roundUp(planData.length * start);
  const endIndex   = roundUp(planData.length * end) + 1;

  const DEPO_START = planData[0].value;

  let recommendDataCopy = [...recommendData];
  recommendDataCopy.splice(0, 0, ...(new Array(factData.length).fill({ value: DEPO_START })));

  const dataCombined = [
    ...planData.slice(startIndex, endIndex),
    ...factData.slice(startIndex, endIndex),
    ...recommendDataCopy.slice(startIndex, endIndex),
  ].map(entry => entry.value);

  let minY = Math.round( Math.min(...dataCombined) - 50_000 );
  let maxY = Math.round( Math.max(...dataCombined) + 50_000 );

  chart.yScale().minimum( minY );
  chart.yScale().maximum( maxY );
  chart.yZoom().setToValues(minY, maxY);
}

function updateChartTicks(ss = scaleStart, se = scaleEnd, data) {
  const period = getLen(data);
  const step = 1 / period;

  // let min = Math.round(period * ss) + 1;
  // min = Math.max(min, 1);
  // let max = roundUp(period * se);
  // if (max == min) {
  //   max = min + 1;
  // }
  // max = Math.min(max, period);

  se += step;
  if (se > 1) {
    se = 1;
  }
  
  if (true) {
    let emptyCount = 1;
    const values = planData
      .slice((planData.length) * ss, (planData.length) * se)
      .map((entry, index) => {
        if (
          (index < (planData.length) - 1 && entry.customName.trim() == "") ||
          index == (planData.length) - 1
        ) {
          entry.customName = " ".repeat(emptyCount++);
        }
        return entry.customName;
      });
    
    scale.values(values);
  }
  
  if (false) {
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
}

function createChart() {
  anychart && anychart.onDocumentReady(() => {
    chart = anychart.line();

    updateChart.call(this, true);
    
    chart.animation(true, 3000);
    chart.listen("click", e => {
      return;
      if (e.pointIndex) {
        this.setCurrentDay(e.pointIndex + 1);
      }
    });
    chart.tooltip().titleFormat(e => {
      const { data } = this.state;
      
      let index;
      for (let point of e.points) {
        index = point.x || point.index;
        if (index) {
          break;
        }
      }
      index = Number(index);
      
      const fraction = getFraction(index);
      if (fraction > 0) {
        return `День ${Math.floor(index)}, итерация номер ${fraction}`
      }
      
      return index == 1 
        ? `Начало 1 дня` 
        : index - 1 == data.length
          ? `Конец ${index - 1} дня`
          : `Конец ${index - 1} дня, начало ${index} дня`
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

    let series4 = chart.line(planEndData);
    series4.xMode('scatter');
    series4.name("Планируемый рост депо");
    series4.tooltip().displayMode("separated");
    series4.tooltip().useHtml(true);
    series4.tooltip().format(e => {
      const {
        mode,
        passiveIncomeTools,
        currentPassiveIncomeToolIndex,
      } = this.state;
      let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];

      if (e.index > 0) {
        let svg = `
          <svg viewBox="0 0 10 10" width="1em" height="1em" fill="#40a9ff" style="position: relative; top: 0.1em">
            <rect x="0" y="0" width="10" height="10" />
          </svg>
        `;
        
        return `
          ${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}
          ${tool
          ? `<br/>Пассивный доход: ${formatNumber(Math.round(e.value * (tool.rate / 100) / 12))} /месяц`
            : ""
          }
        `.trim().replace(/\s+/, " ");
      }
      else return `<span class="empty-tooltip-row"></span>`;
    });
    series4.normal().stroke({
      color: "#40a9ff",
      dash: '3 5',
      thickness: "5%"
    });
    
    let series2 = chart.line(chartData2);
    series2.name("Планируемый рост депо");
    series2.tooltip().displayMode("separated");
    series2.tooltip().useHtml(true);
    series2.tooltip().format(e => {
      const {
        mode,
        passiveIncomeTools,
        currentPassiveIncomeToolIndex,
      } = this.state;
      let tool = passiveIncomeTools[currentPassiveIncomeToolIndex[mode]];

      let svg = `
      <svg viewBox="0 0 10 10" width="1em" height="1em" 
      fill="#40a9ff" style="position: relative; top: 0.1em">
      <rect x="0" y="0" width="10" height="10" />
      </svg>
      `;
      
      return `
        ${svg} ${e.seriesName}: ${formatNumber(Math.round(e.value))}
        ${tool 
          ? `<br/>Пассивный доход: ${formatNumber(Math.round(e.value * (tool.rate / 100) / 12))} /месяц` 
          : ""
        }
      `.trim().replace(/\s+/, " ")
    });
    series2.normal().stroke({
      color: "#40a9ff",
      thickness: "5%"
    });
    
    if (true) {
      // turn on X Scroller
      chart.xScroller(true);
      // chart.xScroller().thumbs(false);
      chart.xScroller().minHeight(40);
      chart.xScroller().fill("#40a9ff 0.1");
      chart.xScroller().selectedFill("#40a9ff 0.5");
      chart.xScroller().listen("scrollerchange", e => {
        const step = 1 / (planData.length - 1);
        scaleStart = roundToClosest(e.startRatio, step);
        // scaleEnd   = scaleStart + (step * steps);
        scaleEnd = roundToClosest(e.endRatio, step);

        const ceiling = 1 - step;
        if (scaleEnd >= ceiling) {
          scaleEnd = 1;
        }

        console.log(scaleStart, scaleEnd);
        chart.xZoom().setTo(scaleStart, scaleEnd);
        updateChartScaleY(scaleStart, scaleEnd);
        updateChartTicks.call(this, scaleStart, scaleEnd, this.state.data);
      });
    }
    
    // Genetal settings
    chart.xAxis().title("Номер дня");
    chart.yAxis().labels().format(e => formatNumber(e.value));
    
    // set container and draw chart
    chart.xScale().names('customName');
    chart.xScale().mode("continuous");
    chart.container("chart").draw();
  });
}

function updatePlanEndLine(start, length, value) {
  let planEnd = [];
  if (length > 0) {
    planEnd = new Array(length + 1)
      .fill(value)
      .map((value, index) => {
        const x = String(start + index + 1);
        return { x, value }
      });
  }

  if (!planEndData) {
    planEndData = anychart.data.set(planEnd);
  }
  else {
    console.log(planEnd);
    planEndData.data(planEnd);
  } 

}

function updateChart(isInit = false) {
  const { data, days, mode, currentDay } = this.state;
  const rate = this.getRate();

  // ----
  // Факт
  // ----
  let arr;
  
  const factDays = data.filter(di => di.changed);
  let factArray = [];
  factData = [];
  
  if (data.hasNoGaps) {
    if (factDays.length) {
      for (let i = 0; i < factDays.length; i++) {
        factArray[i] = data[i].depoEnd;
        
        const iterations = [...data[i].iterations].filter(it => it.rate != null);
        if (iterations && iterations.length > 1) {
          let endValue = factArray[i];
          factArray[i] = [];
          let start = data[i].depoStart;
          
          for (let j = 0; j < iterations.slice(0, -1).length; j++) {
            start += iterations[j].getIncome( data[currentDay - 1].depoStart );
            factArray[i].push(start);
          }
          factArray[i].push(endValue);
        }
      }
      
      arr = factArray.map((value, index) => {
        if (typeof value == "object") {
          return value.map((v, i) => {
            const isLast = i == value.length - 1;
            let suffix = `.${i + 1}`;
            let x = isLast ? `${index + 1}` : `${index}${suffix}`;
            
            return {
              x,
              value: v,
              weight: 1 / value.length
            }
          });
        }
        
        return {
          x:          String(index + 1),
          value:      value,
        }
      });
      
      factData = flatten( arr );
    }
  }
  else {
    factData = [];
    for (let i = 0; i < days[mode]; i++) {
      factData[i] = {
        x:     String(i + 1),
        value: data[i].depoEnd
      };
    }
  }
  
  factData.map(item => {
    item.x = String(item.x);
    item.customName = item.x;
    if (item.x.indexOf(".") > -1) {
      item.customName = "";
    }
    return item;
  });
  factData.map(item => {

    // Прибавляет 1 только если к числу до точки
    if (item.x.indexOf('.') > -1) {
      const halfs = item.x.split('.');
      item.x = (+(halfs[0]) + 1) + "." + halfs[1];
    }
    else {
      item.x = String(+(item.x) + 1);
    }

    if (item.customName.trim() != "" && !isNaN( +item.customName )) {
      item.customName = String(Number(item.customName) + 1);
    }
    return item;
  });
  if (factData.length) {
    // Добавляем первый дефолтный день
    factData.unshift({
      customName: "1",
      x:          "1",
      value:      data[0].depoStartTest,
    });
    
    // Убираем лейбл у последнего дня, чтобы не было 261 дня
    // (по факту 261 день - это просто конец 260)
    if (factData.length == data.length) {
      // factData[factData.length - 1].customName = "";
    }
  }
  
  // console.table("fact", factData);
  if (isInit) {
    chartData = anychart.data.set(factData);
  }
  else {
    chartData.data(factData);
  }
  
  // ----
  // План
  // ----
  
  planData = new Array(days[mode]).fill().map((v, i) => ({
    x:     String(i + 1),
    value: data[i].depoEndPlan
  }));

  if (data.length > days[mode]) {
    const lastPlanItem = planData[planData.length - 1];
    planData = planData.concat(
      new Array( data.length - days[mode] ).fill().map((v, i) => ({
        x:     String(Number(lastPlanItem.x) + i + 1),
        value: lastPlanItem.value
      }))
    );
  }

  // TODO: return after release
  planData.map(item => {
    item.x = String(Number(item.x) + 1);
    return item;
  });
  planData.unshift({
    customName: "1",
    x:          "1",
    value:      data[0].depoStartTest,
  });

  // console.log(planData);

  // Сопоставляет план 1 к 1 с фактом, если не достает значения
  // то подставляется интерполированное между двумя ближайшими
  for (let i = 0; i < planData.length;) {
    if (factData[i]) {
      
      if (planData[i].x == factData[i].x) {
        planData[i].customName = factData[i].customName;
        i++;
        continue;
      }

      const weight = factData[i].weight;
      const step = (planData[i].value - planData[i-1].value) * weight; 
      
      const length = (1 / weight) - 1;
      const items = new Array(length).fill(0).map((v, j) => ({
        x:          factData[i + j].x,
        value:      planData[i - 1].value + step * (j + 1),
        customName: factData[i].customName,
      }));
      planData.splice(i, 0, ...items);

      i += length;
    }
    else {
      planData[i].customName = planData[i].x;
      i++;
    }
  }
  
  // Убираем лейбл у последнего дня, чтобы не было 261 дня
  // (по факту 261 день - это просто конец 260)
  if (planData.length == data.length) {
    // planData[planData.length - 1].customName = "";
  }
  
  // console.table('plan', planData);
  if (isInit) {
    chartData2 = anychart.data.set(planData);
  }
  else {
    chartData2.data(planData);
  }

  // updatePlanEndLine(days[mode], data.length - days[mode], planData[planData.length - 1].value);
  
  // --------
  // Рекоменд
  // --------
  if (data.hasNoGaps) {
    recommendData = [];
    if (factDays.length) {
      const { withdrawal, withdrawalInterval, payload, payloadInterval } = this.state;
      
      const rateRecommended = this.getRateRecommended();
      
      const lastFilledDayNumber = (data.lastFilledDay?.day || 0) - 1;
      recommendData = new Array(data.length - lastFilledDayNumber).fill(0);
      recommendData[0] = factData[factData.length - 1].value;
      
      for (let i = 1; i < recommendData.length; i++) {
        recommendData[i] = recommendData[i - 1] + (recommendData[i - 1] * rateRecommended / 100);
        
        if ((lastFilledDayNumber + i + 1) % withdrawalInterval[mode] == 0) {
          recommendData[i] -= withdrawal[mode];
        }
        
        if ((lastFilledDayNumber + i + 1) % payloadInterval[mode] == 0) {
          recommendData[i] += payload[mode];
        }
      }
      
      recommendData = recommendData.map((value, index) => {
        return {
          x:     String(lastFilledDayNumber + index + 1),
          value: value
        }
      });
      
      // TODO: return after release
      recommendData.map(item => {
        item.x = String(Number(item.x) + 1);
        return item;
      });
      
      // recommendData[recommendData.length - 1].customName = "";
    }
    
    if (isInit) {
      chartData3 = anychart.data.set(recommendData);
    }
    else {
      if (!data.hasNoGaps) {
        recommendData = null;
      }
      chartData3.data(recommendData);
    }
  }
  
  if (isInit) {
    scale = anychart.scales.ordinal();
    scale.mode('continuous');
  }

  if (data.length > 0) {
    let actualScale = steps;
    const len = getLen(data) - 1;
    if (steps == data.length) {
      actualScale = planData.length;
    }

    let min = Math.floor(currentDay - (actualScale / 2));
    let max = Math.floor(currentDay + (actualScale / 2));
    if (min < 0) {
      max += -min;
      min += -min;
    }
    
    const step = 1 / len;

    scaleStart = roundToClosest(min / len, step);
    scaleEnd   = roundToClosest(max / len, step);
    
    chart.xZoom().setTo(scaleStart, scaleEnd);
    updateChartScaleY(scaleStart, scaleEnd);
    updateChartTicks.call(this, scaleStart, scaleEnd, data);
  }
  
  if (isInit) {
    chart.xAxis().scale(scale);
    chart.xAxis().ticks(true);
  }
}

let Chart = memo(props => {
  const { data, currentDay } = props;
  const [scaleMode, setScaleMode] = useState(props.defaultScaleMode);

  console.log('rendering Chart');
  
  useEffect(() => {
    steps = scaleMode;
    if (chart) {
      updateChartTicks(scaleStart, scaleEnd, data);
    }
  }, [scaleMode]);

  return (
    <div className="chart-wrapper">
    <div id="chart" className="chart"></div>
    {true && (
      <Radio.Group
        className="chart-mode"
        onChange={e => {
          let chartScaleMode = e.target.value;
          
          let actualScale = chartScaleMode;
          const len = getLen(data) - 1;
          if (chartScaleMode == data.length) {
            actualScale = planData.length;
          }

          let min = Math.floor(currentDay - (actualScale / 2));
          let max = Math.floor(currentDay + (actualScale / 2));
          if (min < 0) {
            max += -min;
            min += -min;
          }
          
          const step = 1 / len;

          scaleStart = roundToClosest(min / len, step);
          scaleEnd   = roundToClosest(max / len, step);

          chart.xZoom().setTo(scaleStart, scaleEnd);
          updateChartScaleY(scaleStart, scaleEnd);
          updateChartTicks(scaleStart, scaleEnd - step, data);

          setScaleMode(chartScaleMode);
        }}
      >
      <Radio.Button value={1}>день</Radio.Button>
      <Radio.Button value={5}>неделя</Radio.Button>
      <Radio.Button value={20}>месяц</Radio.Button>
      <Radio.Button value={260}>год</Radio.Button>
      {data.length > 260 ? (
        <Radio.Button value={data.length}>все время</Radio.Button>
      ) : null}
      </Radio.Group>
    )}
    </div>
  )
}, (prevProps, nextProps) => true);

export { Chart, createChart, updateChart, updateChartTicks, updateChartZoom }