import React from 'react'
import ReactDOM from 'react-dom'
import format from '../../format';

export default class CustomSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      p_out: [],
      value: 0,
      id:    Math.random(),
    };
  }

  componentDidMount() {
    const { id } = this.state;
    let { chances, value } = this.props;
    console.log(chances, value);

    let p_quotes  = chances[0];
    let p_chances = chances[1];
    let p_level   = value;
    let p_out     = computator(p_quotes, p_chances, p_level);

    this.setState({ value: p_out[4] * 100 })

    anychart.onDocumentReady(() => {

      // create data set on our data
      var dataSet = anychart.data.set([p_out[4] * 100, p_level]);

      // set the gauge type
      var gauge = anychart.gauges.circular();
      gauge.tooltip(true);

      // set tooltip text template
      gauge.tooltip().format(function () {
        var fomratter = "";
        if (this.index == 0) {
          fomratter = `Вероятность: ${this.value.toFixed(2)}%`;
        }
        else {
          fomratter = `Пункты: ${this.value.toFixed(2)}`;
        }
        return fomratter;
      });

      gauge.background().fill("white");

      // gauge settings
      gauge.data(dataSet);
      gauge.padding("10%");
      gauge.startAngle(270);
      gauge.sweepAngle(180);
      gauge.fill(["lightgray"], .5, .5, null, 1, 0.5, 0.9);

      // axis settings
      var axis = gauge.axis()
        .radius(95)
        .width(0);

      // scale settings
      axis.scale()
        .minimum(0)
        .maximum(100)
        .ticks({ interval: 10 })
        .minorTicks({ interval: 1 });

      // ticks settings
      axis.ticks()
        .type("trapezium")
        .fill("white")
        .length(9);

      // minor ticks settings
      axis.minorTicks()
        .enabled(true)
        .fill("white")
        .length(1.5);

      // labels settings
      axis.labels()
        .fontSize("18px")
        .fontColor("black");

      // second axis settings
      var axis_1 = gauge.axis(1)
        .radius(55)
        .width(0);

      // second scale settings
      axis_1.scale()
        .minimum(0)
        .maximum(600)
        .ticks({ interval: 100 })
        .minorTicks({ interval: 20 });

      // second ticks settings
      axis_1.ticks()
        .type("trapezium")
        .length(15);

      // second minor ticks settings
      axis_1.minorTicks()
        .enabled(true)
        .length(5);

      // labels 2 settings
      // labels 2 settings
      axis_1.labels()
        .fontSize("12px")
        .fontColor("white");

      // needle
      gauge.needle(0)
        .enabled(true)
        .startRadius("-5%")
        .endRadius("80%")
        .middleRadius(0)
        .startWidth("0.1%")
        .endWidth("0.1%")
        .middleWidth("5%");

      // marker
      gauge.marker(0)
        .axisIndex(1)
        .fill("white")
        .stroke("white")
        .dataIndex(1)
        .size(7)
        .type("triangle-down")
        .position("outside")
        .radius(55);

      // bar
      gauge.bar(0)
        .axisIndex(1)
        .position("inside")
        .dataIndex(1)
        .width(3)
        .radius(60)
        .zIndex(10);

      // gap
      gauge.cap()
        .radius("3%");

      // range
      gauge.range({
        from: 0,
        to: 120,
        fill: { keys: ["green", "yellow", "orange", "red"].reverse() },
        position: "inside",
        radius: 100,
        endSize: "3%",
        startSize: "3%",
        zIndex: 10
      });

      // draw the chart
      gauge.container("container".concat(id)).draw(true);
    });

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
    const { id, value } = this.state;

    
    var currentColor = "red";
    if (value > 41) {
      currentColor = " orange";
    }
    if (value > 75) {
      currentColor = "green";
    }

    return (
      <figure
        id="anychart-embed-jCekzhX3"
        class="speedometer anychart-embed anychart-embed-jCekzhX3"
        { ...this.props }
      >
        <div id={"container".concat(id)}></div>
        <figcaption className="speedometer__label" style={{ color: currentColor }}>
          { `Вероятность хода ${ value.toFixed(1) }%` }
        </figcaption>
      </figure>
    )
  }
}