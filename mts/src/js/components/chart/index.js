import React, { Component } from "react"
import( /* webpackChunkName: "anychart", webpackPrefetch: true */ "anychart/dist/js/anychart-core.min.js");
import( /* webpackChunkName: "anychart", webpackPrefetch: true */ "anychart/dist/js/anychart-stock.min.js");
import( /* webpackChunkName: "anychart", webpackPrefetch: true */ "anychart/dist/js/anychart-annotations.min.js");

import { LoadingOutlined } from "@ant-design/icons";

import "./style.scss";

let chart;
let mapping;
let series;
let dataParsed;
let dataTable;
let lineMin;
let lineMax;
let lineStop;
let yScale;

let minChartValue;
let maxChartValue;

const updateChartMinMax = (priceRange, isLong = true, possibleRisk) => {
  if (lineMin) {
    lineMin.valueAnchor(priceRange[0]);
    lineMin.normal().stroke(!isLong ? "#660000" : "#006600", 1);
  }

  if (lineMax) {
    lineMax.valueAnchor(priceRange[1]);
    lineMax.normal().stroke(!isLong ? "#006600" : "#660000", 1);
  }

  if (lineStop) {
    lineStop.valueAnchor(possibleRisk);
  }
}

const updateChartScaleMinMax = (min, max) => {
  if (yScale) { 
    yScale.minimum(min);
    minChartValue = min;
    yScale.maximum(max);
    maxChartValue = max;
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
    const { min, max, priceRange, possibleRisk, tool } = this.props;

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

    // map the data
    mapping = dataTable.mapAs({ value: 1 });

    // create a stock chart
    chart = anychart.stock();

    // create a plot and a line series
    series = chart.plot(0).line(mapping);
    series.name("Price");

    // get a plot scale
    yScale = chart.plot(0).yScale();

    yScale.minimum(min);
    minChartValue = min;
    yScale.maximum(max);
    maxChartValue = max;

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

    lineStop = controller.horizontalLine({ valueAnchor: possibleRisk });
    lineStop.stroke({ color: "#e8323c", thickness: 1, dash: '10 5', lineCap: 'round' });
    lineStop.allowEdit(false);

    updateChartZoom(this.props.days);

    // set the chart position and title
    chart.title(tool.toString());

    // chart.xScale().mode("continuous");
    chart.container("chart");

    // initiate drawing the chart
    chart.draw();
    this.props?.onRendered();
  }
  
  componentDidMount() {
    if (this.props.loading) {
      return;
    }

    anychart?.onDocumentReady(() => {
      this.update();
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading != this.props.loading && !this.props.loading) {
      anychart?.onDocumentReady(() => {
        this.update();
      });
    }
  }
  
  componentWillUnmount() {
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
        {this.props.loading ?
          <div className="disclaimer">
            <LoadingOutlined /> 
            <p>Подготовка графика<br className="sm-only" /> может занимать до 1 минуты</p>
          </div>
          :
          <div id="chart"></div>
        }
      </div>
    )
  }
}

export {
  Chart,
  updateChartMinMax,
  updateChartScaleMinMax,
  updateChartZoom,
  minChartValue,
  maxChartValue
}