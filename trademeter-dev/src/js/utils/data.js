import fallbackBoolean from "../../../../common/utils/fallback-boolean"
import roundUp         from "../../../../common/utils/round-up"
import round           from "../../../../common/utils/round"

export default class Data extends Array {

  build({
    $startFrom       = 0,
    $percent         = 100,
    $start           = 1_000_000,
    $length          = 0,
    $rate            = 0.424,
    $rateRequired    = null,
    $payment         = 0,         // Вывод
    $paymentInterval = 20,
    $payload         = 0,         // Пополнение
    $payloadInterval = 20,
    $tool            = { guarantee: 1, stepPrice: 1 }
  }) {
    if ($startFrom > this.length) {
      console.warn(`Невозможно начать страить массив с ${$startFrom}ого дня!`);
      $startFrom = 0;
    }

    this.rate = $rate;

    for (let i = $startFrom; i < $length; i++) {

      let rate         = this[i]?.rate;
      let rateRequired = this[i]?.rateRequired != null ? this[i]?.rateRequired : $rateRequired;

      if (this.extendedFrom != null && i >= this.extendedFrom) {
        $rate = rateRequired;
      }

      let day = i + 1;

      let expanded = fallbackBoolean(this[i]?.expanded, false);
      expanded = true;
      let saved    = fallbackBoolean(this[i]?.saved, false);
      let changed  = fallbackBoolean(this[i]?.changed, false);

      let depoStart     = $start;
      let depoStartPlan = $start;
      if (i > 0) {
        depoStart     = this[i - 1].depoEnd;
        depoStartPlan = this[i - 1].depoEndPlan;
      }

      let paymentPlan = (i + 1) % $paymentInterval == 0 ? $payment : 0;
      let payloadPlan = (i + 1) % $payloadInterval == 0 ? $payload : 0;

      let payment = this[i]?.payment;
      let payload = this[i]?.payload;

      let goal = Math.round(depoStart * $rate / 100);

      // TODO: решить, нужен он вообще или нет
      let incomePlan = Math.round(depoStartPlan * $rate / 100);
      incomePlan -= paymentPlan;
      incomePlan += payloadPlan;

      let iterations = this[i]?.iterations || [];

      let income = this[i]?.income;
      let _income = income != null 
        ? income 
        : Math.round(depoStart * (rate != null ? rate : $rate) / 100);
      
      if (iterations.filter(it => it.rate != null).length) {
        _income = iterations
          .filter(it => it.rate != null)
          .map(it => it.getIncome( depoStart ))
          .reduce((acc, curr) => acc + curr, 0);
      }

      _income -= payment || 0;
      _income += payload || 0;

      let depoEnd     = depoStart     + _income;
      let depoEndPlan = depoStartPlan +  incomePlan;

      /* Tool-related stuff */

      let contracts = round(depoStart * $percent / 100, 1) / $tool.guarantee;
      if (isNaN(contracts)) {
        // TODO: handle this error properly
        console.warn( `Количество контрактов равно NaN! depoStart (${depoStart}) / tool.guarantee (${$tool.guarantee})` );
        contracts = 1;
      }

      if (Math.ceil(contracts) - contracts < 0.00001) {
        contracts = Math.ceil(contracts);
      }
      else {
        contracts = Math.floor(contracts);
      }
      if (contracts < 1) {
        contracts = 1;
      }

      let pointsForIteration = goal / $tool.stepPrice / contracts;

      this[i] = {
        day,
        rate,
        rateRequired,
        depoStart,
        depoStartPlan,
        depoEnd,
        depoEndPlan,
        goal,
        income,
        incomePlan,
        payment,
        paymentPlan,
        payload,
        payloadPlan,
        iterations,

        contracts,
        pointsForIteration,

        expanded,
        changed,
        saved,

        /* Нужны исключительно для обратный совместимости */
        get depoStartTest() { return this.depoStart },
        get scale() { return this.rate },
        set scale(val) { this.rate = val },
        set customIncome(val) { this.income = val },
        get iterationsList() { return this.iterations },


        get realDepoEnd() {
          return this.depoStart + this.goal - this.paymentPlan + this.payloadPlan;
        },

        get realIncome() {
          return Math.round(this.depoStart * this.calculatedRate / 100);
        },

        get calculatedRate() {
          if (this.rate != null) {
            return this.rate;
          }
          else if (this.iterations.filter(it => it.rate != null).length) {
            return this.iterations
              .filter(it => it.rate != null)
              .map(it => it.rate)
              .reduce((acc, curr) => acc + curr, 0);
          }
          else if (this.income != null) {
            return this.income / this.depoStart * 100
          }
          return 0;
        },

        get pureIncome() {
          if (this.income != null) {
            return this.income;
          }
          else if (this.iterations.filter(it => it.rate != null).length) {
            return this.iterations
              .filter(it => it.rate != null)
              .map(it => it.getIncome( this.depoStart ))
              .reduce((acc, curr) => acc + curr, 0);
          }
          return Math.round(this.depoStart * (this.rate != null ? this.rate : 0) / 100)
        },

        get isChanged() {
          for (let prop of ["rate", "income", "payment", "payload"]) {
            if (this[prop] != null) {
              return true;
            }
          }
          return false;
        }

      };

    }

    return this;
  }

  extend(options) {
    if (this.extendedFrom == null) {
      this.extendedFrom = this.length;
    }

    this.build({
      ...options,
      $startFrom: this.length,
      $length:    this.length + options.$extraDays
    });

    return this;
  }

  get hasNoGaps() {
    const fd = this.filledDays;
    if (fd.length == 0) {
      return true;
    }

    const dayNumbers = fd.map(d => d.day);
    return dayNumbers.every((value, index) => value == index + 1);
  }

  get filledDays() { return this.filter(it => it.changed) }
  get lastFilledDay() { return this.filledDays.pop() }

}