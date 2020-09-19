import React from 'react'
import PropTypes from "prop-types"
import { Button, Select } from "antd/es"

import Stack         from "../stack"
import CrossButton   from "../cross-button"
import { dialogAPI } from "../dialog"

// import "./style.scss"

// TODO: сейчас id нужен для того, чтобы понять, какое сохранение сейчас выбрано
// возможно получится обойтись одним currentSaveIndex?
const Header = ({
  changed,
  children,
  currentSaveIndex,
  id,
  saved,
  saves,
  title,
  onSave,
  onSaveChange,
}) => {
  return (
    <div className="main-top">
      <div className="container">
        <div className="main-top-wrap">

          {/* Select */}
          {(() => {
            return (dev || saves.length) ? (
              // TODO: extract into a separate component
              <label className="labeled-select main-top__select stack-exception">
                <span className="labeled-select__label labeled-select__label--hidden">
                  Сохраненный трейдометр
                </span>
                <Select
                  value={currentSaveIndex}
                  onSelect={val => onSaveChange(val)}>
                  <Select.Option key={0} value={0}>Не выбрано</Select.Option>
                  {saves.map((save, index) =>
                    <Select.Option key={index + 1} value={index + 1}>
                      {save.name}
                      {save.corrupt && (
                        <WarningOutlined style={{
                          marginLeft: ".25em",
                          color: "var(--danger-color)"
                        }} />
                      )}
                    </Select.Option>
                  )}
                </Select>
              </label>
            ) : null
          })()}

          <Stack>

            <div className="page__title-wrap">
              <h1 className="page__title">{title}</h1>

              {(dev || id) ? (
                <CrossButton
                  className="main-top__remove"
                  // TODO: onSaveDelete()
                  onClick={e => dialogAPI.open("dialog4", e.target)} />
              ) : null}
            </div>

            {children}

            <div className="main-top__footer">

              <Button
                className={
                  [
                    "custom-btn",
                    "custom-btn--secondary",
                    "main-top__save",
                  ]
                    .concat(changed ? "main-top__new" : "")
                    .join(" ")
                    .trim()
                }
                onClick={e => onSave(e)}>
                {(saved && !changed) ? "Изменить" : "Сохранить"}
              </Button>

              {saves.length ? (
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
};

Header.propTypes = {
  id: PropTypes.number.isRequired,
  saved: PropTypes.bool.isRequired,
  saves: PropTypes.array.isRequired,
  changed: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  currentSaveIndex: PropTypes.number.isRequired,
};

export default Header;