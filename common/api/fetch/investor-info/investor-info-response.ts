import { InvestorInfo } from "./investor-info"

/** Шаблон ответа с сервера при получении профиля инвестора */
export type InvestorInfoResponse = {
  /** Флаг ошибки */
  error:    boolean,
  /** Текст ошибки */
  message?: string,
  /** Профиль инвестора */
  data:     InvestorInfo
}