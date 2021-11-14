/**
 * Шаблон ответа с сервера при получении профиля инвестора 
 * 
 * @typedef InvestorInfoResponse 
 * @property {boolean} error
 * @property {InvestorInfo} data
 */

/**
 * Профиль инвестора
 * 
 * @typedef InvestorInfo
 * @property {string} email Email
 * @property {number} deposit Депозит
 * @property {"KSUR"|"KPUR"} status
 * @property {"UNSKILLED"|"SKILLED"} skill
 */

import { fetchInvestorInfo } from "./fetch-investor-info"
import { applyInvestorInfo } from "./apply-investor-info"
export { fetchInvestorInfo, applyInvestorInfo }