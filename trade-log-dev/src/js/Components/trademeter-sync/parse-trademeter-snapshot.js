import typeOf       from "../../../../../common/utils/type-of";
import fallbackProp from "../../../../../common/utils/fallback-prop";
import round        from "../../../../../common/utils/round";
import Iteration    from "../../../../../trademeter-dev/src/js/utils/iteration";

let depoStart;

/**
 * @returns {{ iterations: number[] }[]}
 */
function parseDynamic(parsedDynamic = []) {
  let data = [];
  for (let i = 0; i < parsedDynamic.length; i++) {
    let item = parsedDynamic[i];

    let d = fallbackProp(item, ["day", "d"], i + 1);
    if (!data[d - 1]) {
      data[d - 1] = {};
    }

    let income = fallbackProp(item, ["income", "customIncome", "ci"]);
    if (income == null || typeof income != "number") {
      // data[d - 1].income = Math.round(data[d - 1].depoStart * scale / 100);
      // data[d - 1].scale = null;
    }
    else {
      data[d - 1].income = income;
      data[d - 1].scale = null;
    }

    data[d - 1].iterations = fallbackProp(item, ["iterations", "iterationsList", "il"]);
    if (typeof data[d - 1].iterations == "object") {
      const { iterations } = data[d - 1];

      if (iterations.length > 1) {
        data[d - 1].iterations = data[d - 1].iterations.map(it => 
          new Iteration(it.percent, it.startTime, it.endTime)
        );
      }
      else {
        let its = [new Iteration()];

        if (data[d - 1].scale != null) {
          its = [new Iteration(data[d - 1].scale)];
        }
        else {
          const it = new Iteration(iterations[0]?.percent);
          if (income != null) {
            it.rate = null;
            it.income = income;
          }
          its = [it];
        }
        data[d - 1].iterations = its;
      }
    }
    else {
      data[d - 1].iterations = [];
    }

    // Оставляем внутри каждой итерации только rate
    data[d - 1].iterations = data[d - 1].iterations
      .filter(it => !it.empty)
      .map(it => it.getRate(depoStart));
  }
  return data;
}

/**
 * Распаковывает сохранение Трейдометра
 */
export default function parseTrademeterSnapshot(save) {

  let staticParsed;
  let dynamicParsed;

  let state = {};

  try {
    staticParsed = JSON.parse(save.static);
    dynamicParsed = JSON.parse(save.dynamic);

    let m = staticParsed.mode;
    if (typeOf(m) === "array") {
      m = Number(m[0]);
    }

    state.mode = m;

    depoStart = Number(staticParsed.depoStart);
    if (typeOf(staticParsed.depoStart) === "array") {
      depoStart = Number(staticParsed.depoStart[m]);
    }

    state.currentToolCode = staticParsed.currentToolCode ?? "SBER";

    const rate = staticParsed.minDailyIncome[m];
    state.rate = rate;

    state.data = parseDynamic(dynamicParsed);
  }
  catch (error) {
    console.error(error);
  }

  return state;
}