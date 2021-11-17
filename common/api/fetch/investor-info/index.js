/**
 * Шаблон ответа с сервера при получении профиля инвестора 
 * 
 * @typedef InvestorInfoResponse 
 * @property {boolean} error Флаг ошибки
 * @property {?string} message Текст ошибки
 * @property {InvestorInfo} data
 */

/**
 * Профиль инвестора
 * 
 * @typedef InvestorInfo
 * @property {string} email Email
 * @property {number} deposit Депозит
 * @property {"KSUR"|"KPUR"} status Уровень риска
 * 
 * `KSUR` — это клиент со стандартным уровнем риска. Все клиенты (физические лица) по умолчанию относятся к этой категории.
 * 
 * `KPUR` — это клиент с повышенным уровнем риска. Статус КПУР позволяет клиенту пользоваться большим кредитным плечом, чтобы совершать сделки на более крупные суммы. Клиент (физическое лицо) относится к такой категории при выполнении определенных условий:
 * 
 * - сумма денег и стоимость ценных бумаг в портфеле должна быть от 3 млн рублей;
 * 
 * - клиент пользовался брокерскими услугами ВТБ или другого брокера не менее 6 месяцев, в течение которых 5 дней совершал сделки с ценными бумагами или срочные сделки, а также имеет сумму денег в портфеле от 600 тысяч рублей.
 * 
 * Источник: https://school.vtb.ru/faq/marzhinalnoe-kreditovanie/pokazateli-marzhinalnogo-kreditovaniya-/kakie-byvayut-urovni-riska-u-investorov-/
 * 
 * @property {"UNSKILLED"|"SKILLED"} skill
 */

import { fetchInvestorInfo } from "./fetch-investor-info";
import { applyInvestorInfo } from "./apply-investor-info";
export { fetchInvestorInfo, applyInvestorInfo };