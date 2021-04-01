import React, { Component } from 'react'
import "anychart"

import { LoadingOutlined } from '@ant-design/icons';

import "./style.scss"

let chart;
let mapping;
let series;
let dataParsed;
let dataTable;
let lineMin;
let lineMax;
let lineStop;
let yScale;

const padZero = (number, len) => {
  if (len - String(number).length < 0) {
    return number;
  }
  return "0".repeat(len - String(number).length) + number; 
};

const updateChartMinMax = (priceRange, isLong = true) => {
  if (lineMin) {
    lineMin.valueAnchor(priceRange[0]);
    lineMin.normal().stroke(!isLong ? "#660000" : "#006600", 1);
  }
  
  if (lineMax) {
    lineMax.valueAnchor(priceRange[1]);
    lineMax.normal().stroke(!isLong ? "#006600" : "#660000", 1);
  }

  if (lineStop) {
    lineStop.valueAnchor(Infinity ** 2);
  }
}

const updateChartScaleMinMax = (min, max) => {
  if (yScale) { 
    yScale.minimum(min);
    yScale.maximum(max);
  }
}

const updateChartZoom = days => {
  if (dataParsed) {
    const now = dataParsed[dataParsed.length - 1][0];
    chart.selectRange(now - (86_400_000 * days), now);
  }
}

class Chart extends Component {
  update() {
    const { min, max, priceRange } = this.props;

    dataParsed = this.props.data && this.props.data.map(item => {
      const HOUR_IN_MS = 3_600_000;
      return [
        (item.datetime * 1000) + (HOUR_IN_MS * 3),
        Number(item.last)
      ]
    });

    // create a data table
    dataTable = anychart.data.table();
    dataTable.addData(dataParsed);
    // dataTable.addData([
    //   ['2016-04-01', 18.23],
    //   ['2016-04-02', 19.50],
    //   ['2016-04-03', 19.13],
    //   ['2016-04-06', 18.54],
    //   ['2016-04-07', 18.76]
    // ]);

    // map the data
    mapping = dataTable.mapAs({ value: 1 });

    // create a stock chart
    chart = anychart.stock();

    // create a plot and a line series
    series = chart.plot(0).line(mapping);
    series.name("Price");
    // chart.plot(0).legend().titleFormat(
    //   "<span style='color:#455a64;font-weight:600'>" +
    //   "DATE: {%value}{dateTimeFormat: dd MMM yyyy}</span>"
    // );

    // get a plot scale
    yScale = chart.plot(0).yScale();

    // set minimum/maximum and inversion
    yScale.minimum(min);
    yScale.maximum(max);


    // access the annotations() object of the plot to work with annotations
    var controller = chart.plot(0).annotations();

    // create a Horizontal Line annotation
    lineMin = controller.horizontalLine({
        valueAnchor: priceRange[0]
    });
    lineMin.allowEdit(false);

    lineMax = controller.horizontalLine({
        valueAnchor: priceRange[1]
    });
    lineMax.allowEdit(false);

    lineStop = controller.horizontalLine({ valueAnchor: priceRange[0] });
    lineStop.stroke({ color: "#660000", thickness: 2, dash: '10 5', lineCap: 'round' });
    lineStop.allowEdit(false);

    updateChartZoom(this.props.days);

    const tool = this.props.tool;
    // set the chart position and title
    chart.title(tool.toString());

    // chart.xScale().mode("continuous");
    chart.container("chart");

    // initiate drawing the chart
    chart.draw();
  }
  
  componentDidMount() {
    if (this.props.loading) {
      return;
    }

    // console.log('did mount');

    anychart.onDocumentReady(() => {
      this.update();
    });
  }
  
  componentWillUnmount() {
    // console.log("unmounting");

    const chartHTML = document.getElementById("chart");
    if (chartHTML) {
      chartHTML.innerHTML = "";
    }
  }

  render() {
    return (
      <div className={
        ["chart-wrap"]
          .concat(this.props.className)
          .join(" ")
          .trim()
      }>
        {this.props.loading ? <LoadingOutlined /> : <div id="chart"></div>}
      </div>
    )
  }
}

export { Chart, updateChartMinMax, updateChartScaleMinMax, updateChartZoom }