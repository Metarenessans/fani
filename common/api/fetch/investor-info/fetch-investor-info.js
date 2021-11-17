import fetch from "../../fetch";

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * Запрос уходит на https://fani144.ru/local/php_interface/s1/ajax/?method=getInvestorInfo
 *
 * @returns {Promise<import(".").InvestorInfoResponse>}>}
 */
export function fetchInvestorInfo() {
  return fetch("getInvestorInfo");
}