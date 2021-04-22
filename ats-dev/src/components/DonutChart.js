import React, { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";

import Chart from "react-apexcharts";

export const DonutChart = () => {
  const { activeView, setActiveView } = useContext(GlobalContext);

  // eslint-disable-next-line
  const [chartData, setChartData] = useState({
    series: [1, 1, 1, 1, 1, 1],
    chartOptions: {
      theme: {
        monochrome: {
          enabled: true,
          color: "#255aee",
          shadeTo: "light",
          shadeIntensity: 0.8,
        },
      },
      labels: [
        ["% свободных", "средств"],
        ["Дневной норматив", "Риск/Прибыль"],
        ["% скореллир.", "позиций"],
        "% РНС",
        ["% загрузки", "по фьючерсам"],
        ["% загрузки", "по акциям"],
      ],
      chart: {
        animations: {
          speed: 0,
        },
        events: {
          animationEnd: function (chartContext, config) {
            chartContext.toggleDataPointSelection(activeView);
          },
          dataPointSelection: (event, chartContext, config) => {
            setActiveView(config.dataPointIndex);
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: "400px",
              height: "400px",
            },
          },
        },
        {
          breakpoint: 450,
          options: {
            chart: {
              width: "375px",
              height: "375px",
            },
            dataLabels: {
              style: {
                fontSize: "11px",
                fontWeight: "normal",
              },
            },
          },
        },
        {
          breakpoint: 375,
          options: {
            chart: {
              width: "320px",
              height: "320px",
            },
            dataLabels: {
              style: {
                fontSize: "10px",
                fontWeight: "normal",
              },
            },
          },
        },
      ],
      dataLabels: {
        formatter: function (value, { seriesIndex, w }) {
          return w.config.labels[seriesIndex];
        },
      },
      plotOptions: {
        pie: {
          startAngle: 90,
          endAngle: 450,
          expandOnClick: false,
          donut: {
            size: "25%",
            labels: {
              show: true,
              name: {
                offsetY: 5,
              },
              value: {
                show: false,
              },
              total: {
                show: true,
                showAlways: true,
                label: "АТС",
                fontSize: "20px",
                fontWeight: "bold",
              },
            },
          },
        },
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      stroke: {
        show: false,
      },
    },
  });

  return (
    <section className="donut">
      <div className="container">
        <Chart
          options={chartData.chartOptions}
          series={chartData.series}
          type="donut"
          width="450px"
          height="450px"
        />
      </div>
    </section>
  );
};
