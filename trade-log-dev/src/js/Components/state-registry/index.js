import React from "react"
import PropTypes from "prop-types"

import { Button, Checkbox } from "antd"

import Panel from "../panel"

import "./style.scss"

const propTypes = {
  /**
   * Массив сделок
   * 
   * @type {{}[]}
   */
  deals: PropTypes.array.isRequired,

  /** 
   * Коллбэк, который вызовется при клике на кнопку "Назад"
   * 
   * @type {function() {}}
   */
  onPrevStep: PropTypes.func.isRequired,

  /**
   * Коллбэк, который вызовется при клике на кнопку "Далее"
   *
   * @type {function() {}}
   */
  onNextStep: PropTypes.func.isRequired,
}

/** @param {propTypes} props */
function StateRegistry({ deals, onPrevStep, onNextStep }) {
  return (
    <Panel 
      title="Регистр состояний" 
      className="state-registry"
      contentClassName="state-registry-content"
    >
      <div className="table-wrapper">
        <table>
          <tr>
            <th>Состояния</th>
            {deals.map((deal, index) => 
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
              {/* TODO: deal должен как-то задействоваться */}
              {deals.map((deal, index) =>
                <td key={index}>
                  <Checkbox className="positive" />
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
              {/* TODO: deal должен как-то задействоваться */}
              {deals.map((deal, index) =>
                <td key={index}>
                  <Checkbox className="negative" />
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
              {/* TODO: deal должен как-то задействоваться */}
              {deals.map((deal, index) =>
                <td key={index}>
                  <Checkbox className="positive" />
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
              {/* TODO: deal должен как-то задействоваться */}
              {deals.map((deal, index) =>
                <td key={index}>
                  <Checkbox className="negative" />
                </td>
              )}
            </tr>
          )}
        </table>
      </div>
      <div className="state-registry-footer">
        <Button className="custom-btn" onClick={e => onPrevStep()}>Назад</Button>
        <Button className="custom-btn" onClick={e => onNextStep()}>Далее</Button>
      </div>
    </Panel>
  )
}

StateRegistry.propTypes = propTypes;

export default StateRegistry