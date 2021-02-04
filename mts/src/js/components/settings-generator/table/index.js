import React from "react"

import round          from '../../../../../../common/utils/round'
import formatNumber   from '../../../../../../common/utils/format-number'

import "./style.scss"

export default function Table ({ data, closeMode = true }) {
  if (data == null || data.length == 0) {
    return null;
  }

  return (
    <div className="settings-generator-table">
      <div className="settings-generator-table">
        {data.map((row, index) =>
          <table 
            key={index}
            className="settings-generator-table__row"
          >
            <thead>
              <tr className="settings-generator-table__row-header">
                <th>№</th>
                <th>% {closeMode ? 'закрытия' : 'докупки'}</th>
                <th>Ход $/₽</th>
                <th>Кол-во {closeMode ? 'закрытых' : 'докупленных'} контрактов</th>
                <th>
                  Контрактов<br />
                  в работе
                </th>
                <th>
                  Накопленная прибыль<br />
                  без комиссии
                </th>
                <th>
                  Величина<br />
                  комиссии
                </th>
                <th>
                  Накопленная прибыль<br />
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
                  data-label="% закрытия"
                  data-label-xs="% закр."
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
                  data-label="Закрытых контрактов"
                  data-label-xs="Закр. контр."
                >
                  {formatNumber(Math.floor(row.contracts))}
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
                  data-label="Накопленная прибыль с учетом комиссии"
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