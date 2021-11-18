import React, { useContext, useState } from "react";
import { Input, message } from "antd";
import { cloneDeep } from "lodash";
import clsx from "clsx";

import { Dialog } from "../dialog";

import { Context } from "../BaseComponent";

import "./style.scss";

export const SaveDialog = props => {
  const context = useContext(Context);
  const { state } = context;
  const { saves, id } = state;
  const currentTitle = context.getTitle();
  const namesTaken = saves.map(save => save.name);

  const [name, setName] = useState(id ? currentTitle : "Новое сохранение");

  /**
   * Проверяет, может ли данная строка быть использована как название сейва
   * 
   * @param {string} name
   * @returns {?string} Строка с ошибкой
   * Если текущее название валидно, строка будет пустой
   */
  const validate = name => {
    name = name.trim();
    if (name !== currentTitle) {
      if (name.length < 3) {
        return "Название должно быть длиннее трех символов!";
      }
      else {
        const test = /[!?@#$%^&*+=`"";:<>\\/{}~]/g.exec(name);
        if (test) {
          return `Название не может содержать символ '${test[0]}'!`;
        }
        if (namesTaken.indexOf(name) > -1) {
          return "Сохранение с таким названием уже существует!";
        }
      }
    }
    return "";
  };

  const error = validate(name);
  
  const onConfirm = async () => {
    const { id, currentSaveIndex } = context.state;

    if (id != null) {
      try {
        await context.update(name);
      }
      catch (error) {
        console.error(error);
        message.error(error);
      }

      const saves = cloneDeep(state.saves);
      saves[currentSaveIndex - 1].name = name;
      context.setState({ saves, changed: false });
    }
    else {
      try {
        await context.save(name);
      }
      catch (error) {
        console.error(error);
        message.error(error);
      }
      finally {
        const saves = cloneDeep(state.saves);
        const currentSaveIndex = saves.push({ id, name });
        context.setState({
          saves,
          currentSaveIndex,
          saved:   true,
          changed: false
        });
      }
    }
  };

  return (
    <Dialog
      id="save-dialog"
      className="save-dialog"
      contentClassName="save-dialog-content"
      title="Сохранение"
      onConfirm={() => {
        const error = validate(name);
        if (error) {
          console.error(error);
        }
        else {
          onConfirm();
          return true;
        }
      }}
    >
      <label className="save-dialog-input-wrap">
        <span className="save-dialog-input-label">Название сохранения</span>
        <Input
          className={clsx("save-dialog-input", error && "error")}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          value={name}
          maxLength={20}
          onChange={e => {
            const { value } = e.target;
            setName(value);
          }}
        />
        <span className={clsx("save-dialog-error", error && "visible")}>
          {error}
        </span>
      </label>
    </Dialog>
  );
};