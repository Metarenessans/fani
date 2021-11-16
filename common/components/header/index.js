import React, { useContext } from "react"
import PropTypes from "prop-types"
import { Button, Select } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import clsx from "clsx"

import Stack         from "../stack"
import CrossButton   from "../cross-button"
import { dialogAPI } from "../dialog"

import { Context } from "../BaseComponent"

import "./style.scss"

const propTypes = {
  /**
   * Коллбэк, который вызывается после сохранения
   * 
   * @type {(e: React.MouseEvent)}
   */
  onSave: PropTypes.func,

  /**
   * Коллбэк, который вызывается выборе нового сохранения
   * 
   * @type {(index: number)}
   */
  onChange: PropTypes.func
};

/** @param {propTypes} props */
const Header = ({
  children,
  onSave,
  onChange,
}) => {
  const context = useContext(Context);
  const { state } = context;
  const {
    changed,
    currentSaveIndex,
    loading,
    saved,
    saves,
  } = state;
  const title = context.getTitle();
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
              onSelect={
                /** @param {number} currentSaveIndex */
                async currentSaveIndex => {
                  context.setState({ currentSaveIndex });

                  if (currentSaveIndex === 0) {
                    await context.reset();
                  }
                  else {
                    await context.setStateAsync({ loading: true });
                    try {
                      const { id } = saves[currentSaveIndex - 1];
                      const response = await context.fetchSaveById(id);
                      await context.extractSnapshot(response.data);
                    }
                    catch (error) {
                      message.error(error);
                    }
                  }

                  if (onChange) {
                    onChange(currentSaveIndex);
                  }
                }
              }
            >
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
                  : saves[currentSaveIndex - 1] &&
                    <CrossButton
                      className="page-header__remove"
                      onClick={e => dialogAPI.open("dialog4", e.target)}
                      aria-label="Удалить сохранение"
                    />
                }
              </div>

            </div>

            {children}

            <div className="page-header__footer">

              <Button
                className={clsx(
                  "custom-btn",
                  "custom-btn--secondary",
                  "page-header__save",
                  changed && "page-header__new"
                )}
                onClick={e => {
                  if (saved && changed) {
                    context.update(title);
                  }
                  else {
                    dialogAPI.open("dialog1", e.target);
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
      </div>
    </div>
  )
}

Header.propTypes = propTypes;

export default Header