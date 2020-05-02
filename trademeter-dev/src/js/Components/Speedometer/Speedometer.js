import React from 'react'
import ReactDOM from 'react-dom'
import * as antv from '@antv/g2';

import round from "../../round"

import "./style.sass"

export default class Speedometer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      p_out: [],
      value: 0,
      id:    Math.random(),
    };
  }

  createShape() {
    let { value } = this.state;

    function creatData() {
      const data = [];
      data.push({ value: round(value, 2) });
      return data;
    }

    antv.registerShape('point', 'pointer', {
      draw(cfg, container) {
        const group = container.addGroup({});
        
        return group;
      },
    });

    const color = ['#F5222D', '#FFBF00', '#87d068'];
    const chart = new antv.Chart({
      container: 'container',
      autoFit: true,
      padding: [0, 0, 30, 0],
    });
    chart.data(creatData());
    chart.animate(true);

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

    draw(creatData());

    function draw(data) {
      const val = data[0].value;
      chart.annotation().clear(true);
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

      chart.annotation().arc({
        start: [0, 1],
        end: [val, 1],
        style: {
          stroke: val < (100 / 3)
            ? color[0]
            : val < (100 / 3 * 2)
              ? color[1]
              : color[2],
          lineWidth: 10,
          lineDash: null,
        },
      });

      chart.changeData(data);
    }

  }

  componentDidMount() {
    const { id } = this.state;
    let { chances } = this.props;

    let p_quotes  = chances[0];
    let p_chances = chances[1];
    let p_level   = this.props.value;
    let p_out     = computator(p_quotes, p_chances, p_level);

    this.setState({ value: p_out[4] * 100 }, this.createShape);

    function computator(n_iters, n_chances, level) {
      /*    На вход:
            n_iters        числовой ряд [целые значения]: количество итераций
            n_chances      числовой ряд [целые значения]: количество шансов
            level          число [целое значение]: число итераций, для которого оцениваем вероятность
    */

      var accuracy = 10000; //точность. Больше - точнее, меньше - быстрее.
      function arrshuffle(arr) {
        var j, temp;
        for (var i = arr.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          temp = arr[j];
          arr[j] = arr[i];
          arr[i] = temp;
        }
        return arr;
      }
      ////////////////////////
      function mean(arr) {
        let sum = arr.reduce((a, b) => a + b, 0);
        let result = sum / arr.length;
        return result;
      }
      //////////////////////
      function dispers(arr) {
        let m = mean(arr);
        let count = arr.length;
        sum = 0;
        for (let i = 0; i < count; i++) {
          sum += Math.pow(arr[i] - m, 2);
        }
        let dispersia = sum / (count - 1);
        let S = Math.sqrt(dispersia);
        return dispersia;
      }
      function normpdf(x, loc = 0, scale = 1) {
        let y = (x - loc) / scale;
        let res = Math.exp(-(Math.pow(y, 2) / 2)) / Math.sqrt(2 * Math.PI);
        return res;
      }
      function linspace(start, stop, num = 50, endpoint = true) {
        let nums = num;
        if (endpoint) --nums;
        let d = Math.abs((stop - start) / nums);
        let res = [];
        let sum = start;
        for (let i = 0; i < num; ++i) {
          res.push(sum);
          sum += d;
        }
        return res;
      }
      function normcdf(mean, sigma, to) {
        var z = (to - mean) / Math.sqrt(2 * sigma * sigma);
        var t = 1 / (1 + 0.3275911 * Math.abs(z));
        var a1 = 0.254829592;
        var a2 = -0.284496736;
        var a3 = 1.421413741;
        var a4 = -1.453152027;
        var a5 = 1.061405429;
        var erf =
          1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
        var sign = 1;
        if (z < 0) {
          sign = -1;
        }
        return (1 / 2) * (1 + sign * erf);
      }
      /////////////////////////////////
      let how = "straight";


      // STEP 1. create a sample
      var sample = [];
      var sample2 = [];
      var min, max = 0;
      max = min = n_iters[0];
      var count = n_iters.length;
      var count2 = n_chances.length;
      if (count > count2) count = count2;
      for (var j = 0; j < count - 1; ++j) {
        // А почему последнее не считаем? // sample = [[n_iters[j]] * n_chances[j] for j in range(n_iters.shape[0] - 1)]
        for (var jj = 0; jj < n_chances[j]; ++jj) {
          sample.push(n_iters[j]);
          sample.push(-n_iters[j]); //проверить так ли это а то mean всегда 0 !!! // sample = numpy.concatenate((sample, -sample), axis=0)
        }
        if (n_iters[j] > max) {
          max = n_iters[j];
          min = -n_iters[j];
        }
      }

      sample = arrshuffle(sample);
      var y = sample;

      // STEP 2. estimate the distribution function
      var lb = min * 0.9;
      var tb = max * 1.1;

      var jstaty = jStat(y);
      if (how == "straight") {
        var mu_mle = mean(y); //ведь всегда 0 будет??!!!
        var sigm_mle = (y.length / (y.length - 1)) * jstaty.variance();
      } else {
        /*    else if (how == 'mle') {
            mu_mle = sigm_mle = norm.fit(data=y)
        } */
        return "Invalid estimator name";
      }
      var xx = linspace(lb, tb, accuracy, true);

      var jstatxx = jStat(xx);

      var zz = [];
      for (let i = 0; i < xx.length; ++i)
        zz.push(jstatxx.normal(mu_mle, Math.pow(sigm_mle, 0.5)).pdf(xx[i]));

      // step 3. compute the points & probability estimation
      var h = level;
      var target = mu_mle;
      var bot_mle = jStat.normal(mu_mle, Math.pow(sigm_mle, 0.5)).cdf(target - h); //normcdf(target - h, mu_mle, Math.pow(sigm_mle, 0.5));
      var top_mle = jStat.normal(mu_mle, Math.pow(sigm_mle, 0.5)).cdf(target + h); //top_mle = normcdf(target + h, mu_mle, Math.pow(sigm_mle, 0.5));
      var bot_pdf_mle = jStat.normal(mu_mle, Math.pow(sigm_mle, 0.5)).pdf(target - h); //normpdf(target - h, mu_mle, Math.pow(sigm_mle, 0.5));
      var top_pdf_mle = jStat.normal(mu_mle, Math.pow(sigm_mle, 0.5)).pdf(target - h); //normpdf(target + h, mu_mle, Math.pow(sigm_mle, 0.5));
      var p_mle = top_mle - bot_mle;
      var pts_x = [target - h, target + h];
      var pts_z = [bot_pdf_mle, top_pdf_mle];
      var pb = 1 - p_mle;
      var ymax = jstaty.max();
      /*
      На выход:
      
          xx       значения по горизонтали для графика функции плотности
          zz       значения по вертикали для графика функции плотности
          pts_x    значения по горизонтали для точек под выбранный level
          pts_z    значения по вертикали для точек под выбранный level
          pb       оценённая вероятность под выбранный level
          y        выборка, по которой производились оценки
          ymax     максимальное значение        
  */
      return [xx, zz, pts_x, pts_z, pb, y, ymax];
    }
  }

  render() {
    const { value } = this.state;

    return (
      <figure
        id="anychart-embed-jCekzhX3"
        class="speedometer anychart-embed anychart-embed-jCekzhX3"
        { ...this.props }
      >
        <div id="container"></div>
        <figcaption className="speedometer__caption">
          Вероятность хода
          <span className="speedometer__value">{ round(value, 2) }%</span>
        </figcaption>
      </figure>
    )
  }
}