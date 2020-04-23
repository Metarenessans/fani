import React from 'react'
import ReactDOM from 'react-dom'
import {
  LogoutOutlined
} from '@ant-design/icons'

import './style.sass'

export default function Header(props) {
  
  return (
    <header className="header">
      <div className="container">
        <div className="header__wrap">
          <a className="logo header__logo" aria-label="Логотип FANI">
            <img className="logo__img" src="dist/img/logo.png" alt="FANI" />
          </a>

          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item"><a href="#">Главная</a></li>
              <li className="nav-item"><a href="#">Америка</a></li>
              <li className="nav-item"><a href="#">Россия</a></li>
              <li className="nav-item"><a href="#">Фьючерсы</a></li>
              <li className="nav-item"><a href="#">Дивиденды</a></li>
              <li className="nav-item"><a href="#">ОФЗ</a></li>
              <li className="nav-item"><a href="#">Новости</a></li>
            </ul>
          </nav>

          <div className="header__separator"></div>

          <figure className="user header__user submenu-parent">
            <div className="user-avatar user__avatar">
              <img className="user-avatar__img" src="dist/img/avatar.png" />
            </div>
            <figcaption className="user__name">Иван Иванов</figcaption>

            <ul className="submenu">
              <li className="submenu-item">
                <a href="/trademeter/" target="_blank">Трейдометр</a>
              </li>
              <li className="submenu-item">
                <a href="/tor/" target="_blank">Калькулятор ТОР</a>
              </li>
              <li className="submenu-item" target="_blank">
                <a href="#">Профиль инвестора</a>
              </li>
              <li className="submenu-item">
                <a href="#">Настройки</a>
              </li>
              <li className="submenu-item">
                <button className="logout-btn">
                  Выход
                  <LogoutOutlined style={{ marginLeft: "0.5em" }} />
                </button>
              </li>
            </ul>
          </figure>
        </div>
        {/* /.header__wrap */}
      </div>
      {/* /.container */}
    </header>
  )
}