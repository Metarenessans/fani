import React from 'react'

import { Dialog } from "../../../../../common/components/dialog"

import { Input } from 'antd/es'

export default function SaveModal({
  id,
  title,
  namesTaken,
  onConfirm,
}) {
  const currentTitle = title;
  // let name = id ? currentTitle : "Новое сохранение";
  let name = currentTitle;

  /**
   * Проверяет, может ли данная строка быть использована как название сейва
   * 
   * @param {String} nameToValidate
   * 
   * @returns {Array<String>} Массив ошибок (строк). Если текущее название валидно, массив будет пустым
   */
  const validate = (nameToValidate = "") => {
    nameToValidate = nameToValidate.trim();

    let errors = [];
    if (nameToValidate != currentTitle) {
      let test = /[\!\?\@\#\$\%\^\&\*\+\=\`\"\"\;\:\<\>\{\}\~]/g.exec(nameToValidate);
      if (nameToValidate.length < 3) {
        errors.push("Имя должно содержать не меньше трех символов!");
      }
      else if (test) {
        errors.push(`Нельзя использовать символ "${test[0]}"!`);
      }
      if (namesTaken.indexOf(nameToValidate) > -1) {
        console.log();
        errors.push(`Сохранение с таким именем уже существует!`);
      }
    }
    return errors;
  }

  class ValidatedInput extends React.Component {

    constructor(props) {
      super(props);

      let { defaultValue } = props;

      this.state = {
        error: "",
        value: defaultValue || ""
      }
    }
    vibeCheck() {
      const { validate } = this.props;
      let { value } = this.state;

      let errors = validate(value);
      this.setState({ error: (errors.length > 0) ? errors[0] : "" });
      return errors;
    }

    render() {
      const { validate, label } = this.props;
      const { value, error } = this.state;

      return (
        <label className="save-modal__input-wrap">
          {
            label
              ? <span className="save-modal__input-label">{label}</span>
              : null
          }
          <Input
            className={
              ["save-modal__input"]
                .concat(error ? "error" : "")
                .join(" ")
                .trim()
            }
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            value={value}
            maxLength={20}
            onChange={e => {
              let { value } = e.target;
              let { onChange } = this.props;

              this.setState({ value });

              if (onChange) {
                onChange(value);
              }
            }}
            onKeyDown={e => {
              // Enter
              if (e.keyCode === 13) {
                let { value } = e.target;
                let { onBlur } = this.props;

                let errors = validate(value);
                if (errors.length === 0) {
                  if (onBlur) {
                    onBlur(value);
                  }
                }

                this.setState({ error: (errors.length > 0) ? errors[0] : "" });
              }
            }}
            onBlur={() => {
              this.vibeCheck();
            }} />

          <span className={
            ["save-modal__error"]
              .concat(error ? "visible" : "")
              .join(" ")
              .trim()
          }>
            {error}
          </span>
        </label>
      )
    }
  }

  let inputJSX = (
    <ValidatedInput
      label="Название сохранения"
      validate={validate}
      defaultValue={name}
      onChange={val => name = val}
      onBlur={() => { }} />
  );
  let modalJSX = (
    <Dialog
      id={id}
      className="save-modal"
      title={"Сохранение"}
      onConfirm={() => {
        if (validate(name).length) {
          console.error(validate(name)[0]);
        }
        else {
          onConfirm(name);
          return true;
        }
      }}
    >
      {inputJSX}
    </Dialog>
  );

  return modalJSX;
}