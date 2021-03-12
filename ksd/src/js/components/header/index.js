import React from 'react'
import { Button, Select } from "antd/es"

import { Consumer }  from "../../app"
import Stack         from "../../../../../common/components/stack"
import CrossButton   from "../../../../../common/components/cross-button"
import { dialogAPI } from "../../../../../common/components/dialog"

import { LoadingOutlined } from "@ant-design/icons"

import "./style.scss"

// TODO: сейчас id нужен для того, чтобы понять, какое сохранение сейчас выбрано
// возможно получится обойтись одним currentSaveIndex?
const Header = ({
  children,
  // should belong to mode-toggle
  onSave,
  onSaveChange,
}) => {
  
  return (
    <Consumer>
      {app => {
        const state = app.state;
        return (
          <div className="main-top">
            <div className="container">
              <div className="main-top-wrap">

                {/* Select */}
                <label className="labeled-select main-top__select stack-exception">
                  <span className="labeled-select__label labeled-select__label--hidden">
                    Сохраненный трейдометр
                  </span>
                  <Select
                    disabled={state.loading}
                    loading={state.loading}
                    value={state.currentSaveIndex}
                    onSelect={val => onSaveChange(val)}>
                    <Select.Option key={0} value={0}>
                      {state.loading ? "Загрузка..." : "Не выбрано"}
                    </Select.Option>
                    {state.saves.map((save, index) =>
                      <Select.Option key={index + 1} value={index + 1}>
                        {save.name}
                      </Select.Option>
                    )}
                  </Select>
                </label>

                <Stack>

                  <div className="page__title-wrap">
                    <h1 className="page__title">{app.getTitle()}</h1>

                    <div className="page__title-icon-wrap">
                      {state.loading
                        ? <LoadingOutlined />
                        : state.id
                          ? <CrossButton className="main-top__remove"
                                        onClick={e => dialogAPI.open("dialog4", e.target)}
                            />
                          : null
                      }
                    </div>

                  </div>

                  {children}

                  <div className="main-top__footer">

                    <Button
                      key={Math.random()}
                      className={
                        [
                          "custom-btn",
                          "custom-btn--secondary",
                          "main-top__save",
                        ]
                          .concat(state.changed ? "main-top__new" : "")
                          .join(" ")
                          .trim()
                      }
                      onClick={e => onSave(e)}>
                      {(state.saved && !state.changed) ? "Изменить" : "Сохранить"}
                    </Button>

                    {state.saves.length ? (
                      <a
                        className="custom-btn custom-btn--secondary main-top__save"
                        href="#pure=true"
                        target="_blank"
                      >
                        Добавить новый
                      </a>
                    ) : null}
                  </div>

                </Stack>

              </div>
              {/* /.main-top-wrap */}
            </div>
            {/* /.container */}
          </div>
        )
      }}
    </Consumer>
  )
};

// Header.propTypes = {
//   id: PropTypes.number.isRequired,
//   saved: PropTypes.bool.isRequired,
//   saves: PropTypes.array.isRequired,
//   changed: PropTypes.bool.isRequired,
//   title: PropTypes.string.isRequired,
//   currentSaveIndex: PropTypes.number.isRequired,
// };

export default Header;