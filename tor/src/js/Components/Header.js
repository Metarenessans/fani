import React from 'react'
import ReactDOM from 'react-dom'

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className="header">
        <div className="container">
          <div className="header__wrap">
            <a className="logo header__logo">
              <img className="logo__img" src="dist/img/logo.png" alt="Логотип" />
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

            <figure className="user header__user">
              <div className="user-avatar user__avatar">
                <img className="user-avatar__img" src="dist/img/avatar.png" />
              </div>
              <figcaption className="user__name">Иван Иванов</figcaption>
            </figure>
          </div>
          {/* /.header__wrap */}
        </div>
        {/* /.container */}
      </header>
    )
  }
}