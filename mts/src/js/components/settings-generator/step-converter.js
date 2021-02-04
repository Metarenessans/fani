import round from "../../../../../common/utils/round";

const stepConverter = {
  fromStepToPercents: function(step, toolPrice) {
    return round(step / toolPrice * 100, 2)
  },
  fromPercentsToStep: function(percent, toolPrice) {
    return round(percent / 100 * toolPrice, 2)
  },
}

export default stepConverter;