import React from 'react'
import { Button, Select } from "antd/es"
import { LoadingOutlined } from "@ant-design/icons"

import Stack         from "../../../../../common/components/stack"
import CrossButton   from "../../../../../common/components/cross-button"
import { dialogAPI } from "../../../../../common/components/dialog"

import clsx from 'clsx'

import "./style.scss"

const Header = ({
  title,
  loading,
  saves,
  currentSaveIndex,
  saved,
  changed,
  children,
  onSave,
  onSaveChange,
}) => {

  saves = saves || [];

  return (
    <div className="page-header">
      <div className="container">
        <div className="page-header-wrap">

          {/* Селект с выбором сохранения */}
          <label className="labeled-select stack-exception page-header__select">
            <span className="labeled-select__label labeled-select__label--hidden">
              {title}
            </span>
            <Select
              disabled={loading}
              loading={loading}
              value={currentSaveIndex}
              onSelect={index => {
                if (onSaveChange) {
                  onSaveChange(index)
                }
              }}>
              <Select.Option key={0} value={0}>
                {loading ? "Загрузка..." : "Не выбрано"}
              </Select.Option>
              {saves.map((save, index) =>
                <Select.Option key={index + 1} value={index + 1}>
                  {save.name}
                </Select.Option>
              )}
            </Select>
          </label>
          
          <Stack>

            {/* Заголовок */}
            <div className="page-title-wrap">

              <h1 className="page-title">{title}</h1>

              <div className="page-title-icon-wrap">
                {loading
                  ? <LoadingOutlined />
                  : saves[currentSaveIndex - 1] && (
                    <CrossButton
                      className="page-header__remove"
                      onClick={e => dialogAPI.open("dialog4", e.target)}
                      aria-label="Удалить сохранение"
                    />
                  )
                }
              </div>

            </div>

            {children}

            {/* Футер */}
            <div className="page-header__footer">

              <Button
                className={clsx(
                  "custom-btn",
                  "custom-btn--secondary",
                  "page-header__save",
                  changed && "page-header__new"
                )}
                onClick={e => {
                  if (onSave) {
                    onSave(e);
                  }
                }}
              >
                {(saved && !changed) ? "Изменить" : "Сохранить"}
              </Button>

              <a
                className={clsx(
                  "custom-btn",
                  "custom-btn--secondary",
                  "page-header__save"
                )}
                href="#pure=true"
                target="_blank"
                aria-label="Создать новое сохранение"
              >
                Добавить новый
              </a>
            </div>

          </Stack>

        </div>
        {/* /.page-header-wrap */}
      </div>
      {/* /.container */}
    </div>
  )
};

export default Header;