import React, { useContext, useState, useEffect } from "react";
import { Input, message } from "antd";
import { cloneDeep } from "lodash";
import clsx from "clsx";

import { Dialog } from "../dialog";

import { Context } from "../BaseComponent";

import "./style.scss";

/** ID диалогового окна сохранения */
export const dialogID = "save-dialog";

export default function SaveDialog(props) {
  const context = useContext(Context);
  const { state } = context;
  const { saves, id } = state;
  const currentTitle = context.getTitle();
  const namesTaken = saves.map(save => save.name);

  const [name, setName] = useState(id ? currentTitle : "Новое сохранение");

  useEffect(() => setName(id ? currentTitle : "Новое сохранение"), [id]);

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
        const saves = cloneDeep(state.saves);
        saves[currentSaveIndex - 1].name = name;
        await context.setStateAsync({ saves });
      }
      catch (error) {
        console.error(error);
        message.error(error);
      }
    }
    else {
      try {
        const id = await context.save(name);
        const saves = cloneDeep(state.saves);
        const currentSaveIndex = saves.push({ id, name });
        await context.setStateAsync({ saves, currentSaveIndex });
      }
      catch (error) {
        console.error(error);
        message.error(error);
      }
    }

    context.setState({ saved: true, changed: false });
  };

  return (
    <Dialog
      id={dialogID}
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