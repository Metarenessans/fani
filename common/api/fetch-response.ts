/** Ответ с сервера */
export type FetchResponse = {
  /** Флаг ошибки */
  error:    boolean,
  /** Текст ошибки */
  message?: string,
  /** Содержимое ответа */
  data:     object|[]
}