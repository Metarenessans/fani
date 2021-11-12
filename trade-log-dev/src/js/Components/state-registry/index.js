import React, { useContext } from "react"

import { Checkbox } from "antd"

import Panel from "../panel"

import { StateContext } from "../../App"

import "./style.scss"
import { cloneDeep } from "lodash"

export default function StateRegistry() {
  const context = useContext(StateContext);
  const { state } = context;
  const { data, currentRowIndex } = state;
  const currentDay = data[currentRowIndex];
  return (
    <Panel 
      title="Регистр состояний" 
      className="state-registry"
      contentClassName="state-registry-content"
    >
      <div className="table-wrapper">
        <table>
          <tbody>
            <tr>
              <th>Состояния</th>
              {currentDay.deals.map((deal, index) =>
                <th key={index}>{index + 1} сделка</th>
              )}
            </tr>
            <tr>
              <td className="category-title category-title--positive">Нормальные</td>
            </tr>
            {[
              "Спокойствие",
              "Собранность",
              "Смелость",
              "Уверенность"
            ].map((label, i) =>
              <tr key={i}>
                <td>{label}</td>
                {currentDay.deals.map((deal, index) =>
                  <td key={index}>
                    <Checkbox
                      className="positive" 
                      checked={deal.emotionalStates.positive[i]}
                      onChange={checked => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].deals[index].emotionalStates.positive[i] = checked;
                        context.setState({ data });
                      }}
                    />
                  </td>
                )}
              </tr>
            )}
            <tr>
              <td className="category-title category-title--negative">Искаженные</td>
            </tr>
            {[
              "Жалость",
              "Жадность",
              "Эго (я прав)",
              "Эйфория",
              "Вина",
              "Обида",
              "Гнев",
              "Апатия",
              "Стагнация"
            ].map((label, i) =>
              <tr key={i}>
                <td>{label}</td>
                {currentDay.deals.map((deal, index) =>
                  <td key={index}>
                    <Checkbox
                      className="negative"
                      checked={deal.emotionalStates.negative[i + 4]}
                      onChange={checked => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].deals[index].emotionalStates.negative[i + 4] = checked;
                        context.setState({ data });
                      }}
                    />
                  </td>
                )}
              </tr>
            )}
            <tr>
              <th>Мотивационные драйверы</th>
            </tr>
            <tr>
              <td className="category-title category-title--positive">Нормальные</td>
            </tr>
            {[
              "Видение рынка",
              "Отработка навыка входа",
              "Отработка навыка выхода",
              "Отработка пребывания в сделке",
              "Отработка среднесрочного анализа",
              "Создание торгового алгоритма"
            ].map((label, i) =>
              <tr key={i}>
                <td>{label}</td>
                {currentDay.deals.map((deal, index) =>
                  <td key={index}>
                    <Checkbox
                      className="positive"
                      checked={deal.motives.positive[i]}
                      onChange={checked => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].deals[index].motives.positive[i] = checked;
                        context.setState({ data });
                      }}
                    />
                  </td>
                )}
              </tr>
            )}
            <tr>
              <td className="category-title category-title--negative">Искаженные</td>
            </tr>
            {[
              "Скука",
              "Азарт",
              "Желание торговать"
            ].map((label, i) =>
              <tr key={i}>
                <td>{label}</td>
                {currentDay.deals.map((deal, index) =>
                  <td key={index}>
                    <Checkbox
                      className="negative"
                      checked={deal.motives.negative[i + 6]}
                      onChange={checked => {
                        const data = cloneDeep(state.data);
                        data[currentRowIndex].deals[index].motives.negative[i + 6] = checked;
                        context.setState({ data });
                      }}
                    />
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}