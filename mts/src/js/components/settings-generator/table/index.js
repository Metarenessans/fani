import React from "react"

import round          from '../../../../../../common/utils/round'
import formatNumber   from '../../../../../../common/utils/format-number'

import "./style.scss"

export default function Table ({ data, isBying = false, isReversed = false }) {
  if (!data || data == null || data.length == 0) {
    return null;
  }

  return (
    <div className="settings-generator-table">
      <div className="settings-generator-table">
        {data.map((row, index) =>
          <table 
            key={index}
            className={["settings-generator-table__row"].concat(row?.merged ? "merged" : "").join(" ")}
          >
            <thead>
              <tr className="settings-generator-table__row-header">
                <th>№</th>
                <th>% {!isBying ? 'закрытия' : 'докупки'}</th>
                <th>{!isBying ? 'Ход' : <>Обратный<br/> ход</>} $/₽</th>
                <th>Контрактов<br />{!isBying ? " закрыто" : " докуплено"}</th>
                <th>
                  {!isBying 
                    ? 
                      <span>
                        Контрактов<br/>
                        в работе
                      </span>
                    :
                      <span>
                        Доступно<br/>
                        контрактов<br/>
                        на докупку
                      </span>
                  }
                </th>
                <th>
                  {!isBying ? 'Прибыль' : 'Убыток'}<br/>
                  без комиссии
                </th>
                <th>
                  Величина<br/>
                  комиссии
                </th>
                <th>
                  {!isBying ? 'Прибыль' : 'Убыток'}<br/>
                  с учетом комиссии
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  data-label="№"
                  data-label-xs="№"
                >
                  {index + 1}
                </td>
                <td
                  data-label={"% " + (!isBying ? "закрытия" : "докупки")}
                  data-label-xs={"% " + (!isBying ? "закр." : "докуп.")}
                >
                  {formatNumber(row.percent)}
                </td>
                <td
                  data-label="Ход $/₽"
                  data-label-xs="Ход $/₽"
                >
                  {formatNumber(row.points)}
                </td>
                <td
                  data-label={(!isBying ? "Закрытых" : "Докупленных") + " контрактов"}
                  data-label-xs={(!isBying ? "Закр." : "Докуп.") + " контр."}
                >
                  {(row?.merged ? "+" : "") + formatNumber(Math.floor(row.contracts))}
                </td>
                <td
                  data-label="Контрактов в работе"
                  data-label-xs="Контр. в раб."
                >
                  {formatNumber(Math.floor(row.contractsLoaded))}
                </td>
                <td
                  data-label="Прибыль без комиссии"
                  data-label-xs="Приб. без комиссии"
                >
                  {formatNumber(round(row.incomeWithoutComission, 1))}
                </td>
                <td
                  data-label="Величина комиссии"
                  data-label-xs="Комиссия"
                >
                  {formatNumber(round(row.comission, 1))}
                </td>
                <td
                  data-label="Прибыль с учетом комиссии"
                  data-label-xs="Приб. с уч. комисии"
                >
                  {formatNumber(round(row.incomeWithComission, 1))}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
};