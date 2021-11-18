/** Профиль инвестора */
export type InvestorInfo = {
  /** Адрес электронной почты */
  email:    string,

  /** Депозит */
  deposit:  number,

  /**
   * Уровень риска
   * 
   * `KSUR` — это клиент со стандартным уровнем риска. Все клиенты (физические лица) по умолчанию относятся к этой категории.
   * 
   * `KPUR` — это клиент с повышенным уровнем риска. Статус КПУР позволяет клиенту пользоваться большим кредитным плечом, чтобы совершать сделки на более крупные суммы.
   */
  status:  "KSUR" | "KPUR",

  skill:   "UNSKILLED" | "SKILLED",
}