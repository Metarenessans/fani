export default class Iteration {
  
  constructor(percent, startTime, endTime) {
    this.percent   = percent;
    this.startTime = startTime;
    this.endTime   = endTime;
  }

  copy() {
    const it = new Iteration(this.rate, this.startTime, this.endTime);
    it.income = this.income;
    return it;
  }

  // TODO: убрать, тк сейчас нужно только для обратной совместимости
  get rate() { return this.percent }
  set rate(val) { this.percent = val }

  get empty() {
    return this.rate == null && this.income == null;
  }

  get period() {
    if (!isNaN(this.startTime) && !isNaN(this.endTime)) {
      return this.endTime - this.startTime;
    }
  }

  getIncome(depo) {
    if (this.income != null) {
      return this.income;
    }
    return Math.round(depo * this.percent / 100)
  }

  getRate(depo) {
    if (this.rate == null && this.income != null) {
      return this.income / depo * 100;
    }
    return this.rate;
  }
}