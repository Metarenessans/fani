export default class Iteration {
  constructor(percent) {
    this.percent = percent;
  }

  // TODO: убрать, тк сейчас нужно только для обратной совместимости
  get rate() { return this.percent }
  set rate(val) { this.percent = val }

  getIncome(depo) {
    return Math.round(depo * this.percent / 100)
  }
}