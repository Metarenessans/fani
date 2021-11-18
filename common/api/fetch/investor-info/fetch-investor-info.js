import fetch from "../../fetch";
import { InvestorInfoResponse } from "./investor-info-response.ts";

/**
 * Делает GET-запрос с помощью кастомной функции-обертки {@link fetch}
 * 
 * Запрос уходит на https://fani144.ru/local/php_interface/s1/ajax/?method=getInvestorInfo
 *
 * @returns {Promise<InvestorInfoResponse>}
 */
export function fetchInvestorInfo() {
  return fetch("getInvestorInfo");
}