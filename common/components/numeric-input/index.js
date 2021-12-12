import React from "react";
import { Input, Tooltip } from "antd";
import PropTypes from "prop-types";
import clsx from "clsx";
import "./style.scss";

// TODO: Сделать так, чтобы условие было динамическим
const isMobile = innerWidth <= 768;

const propTypes = {
  /**
   * Дефолтное значение
   * 
   * @type {number|string}
   */
  defaultValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * Плейсхолдер инпута
   * 
   * @type {number|string}
   */
  placeholder: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * Коллбэк, который вызывается для форматирования выводимого значения
   *
   * @type {(value: string) => number}
   */
  format: PropTypes.func,

  /**
   * Коллбэк, который вызывается при ручном вводе нового значения
   * 
   * @type {(e: React.SyntheticEvent<HTMLInputElement>, value: number, jsx: NumericInput)}
   */
  onChange: PropTypes.func,

  /**
   * Коллбэк, который вызывается при расфокусе или нажатии на`Enter` / `Escape`
   * 
   * @type {(value: number, textValue: string, jsx: NumericInput)}
   */
  onBlur: PropTypes.func,

  /**
   * Флаг того, может ли значение инпута быть отрицательным.
   * Если пропс равен `true`, то допускается воод символа `-`.
   * По дефолту равен `true`
   * 
   * @type {boolean}
   */
  canBeNegative: PropTypes.bool,

  /**
   * Флаг того, может ли значение инпута быть отрицательным.
   * Если пропс равен `true`, то значение значение может быть только положительным.
   * По дефолту равен `false`
   * 
   * @type {boolean}
   * @deprecated Use {@link propTypes.canBeNegative canBeNegative} instead
   */
  unsigned: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),

  /**
   * Флаг того, может ли инпут оставаться пустым.
   * Если значение равно `false`, то вместо пустого инпута `0`. По дефолту стоит значение `true`.
   * 
   * @type {boolean}
   */
  allowEmpty: PropTypes.bool,

  /**
   * Флаг того, может ли инпут содержать дробные значения.
   * Если значение равно `true`, то недопускается ввод символов `.` и `,`.
   * По дефолту стоит значение `false`.
   * 
   * @type {boolean}
   */
  round: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),

  /**
   * Минимальное допустимное значение
   * 
   * @type {number}
   */
  min: PropTypes.number,

  /**
   * Максимально допустимное значение
   * 
   * @type {number}
   */
  max: PropTypes.number,

  /**
   * Текстовая подсказка справа
   *
   * @type {number}
   */
  suffix: PropTypes.string
};

/** @typedef {propTypes & React.InputHTMLAttributes} Props */

/** @augments React.Component<Props> */
export default class NumericInput extends React.Component {

  static propTypes = propTypes;

  /** @param {propTypes} Props */
  constructor(props) {
    super(props);

    const { defaultValue } = props;

    let value = defaultValue;
    if (defaultValue === "" || defaultValue == null || isNaN(defaultValue)) {
      value = this.canBeEmpty ? "" : 0;
    }

    this.state = {
      value: this.format(value),
      error: ""
    };
  }

  get format() {
    return this.props.format || (val => val);
  }

  get round() {
    const { round } = this.props;
    return round == true || round === "true";
  }

  get canBeNegative() {
    const { canBeNegative, unsigned } = this.props;
    if (canBeNegative == null && unsigned == null) {
      return true;
    }
    return (
      (canBeNegative === true  || canBeNegative === "true") ||
      (unsigned      === false || unsigned      === "false") // Обратная совместимость
    );
  }

  /** @deprecated Use `canBeEmpty` instead */
  get allowEmpty() {
    const { allowEmpty } = this.props;
    if (allowEmpty == null) {
      return true;
    }
    return allowEmpty == true || allowEmpty === "true";
  }

  get canBeEmpty() {
    return this.allowEmpty;
  }

  componentDidUpdate(prevProps, prevState) {
    const { defaultValue, test } = this.props;
    const { value } = this.state;

    if ((isNaN(defaultValue) || defaultValue == null) && (value != "")) {
      console.warn("defaultValue:", defaultValue, "state value:", value);
      this.setState({ value: this.canBeEmpty ? "" : 0 });
      return;
    }
    else if (prevProps.defaultValue != defaultValue) {
      const fallbackValue = this.canBeEmpty ? "" : 0;
      let value = defaultValue;
      if (defaultValue === "" || defaultValue == null || isNaN(defaultValue)) {
        value = fallbackValue;
      }

      if (this.state.value !== value) {
        this.setState({ value: this.format(value) });
      }
    }
  }

  /** @deprecated Use `setError` instead */
  setErrorMsg(errMsg) {
    this.setState({ errMsg });
  }

  /**
   * Показывает {@link Tooltip} над инпутом с сообщением `message`
   * 
   * @param {string} message Ошибка, которую необходимо вывести
   */
  setError(message) {
    this.setState({ errMsg: message });
  }

  getValidationRegExp() {
    const { min } = this.props;

    let pattern = "^";

    if (this.canBeNegative && (min == null || min < 0)) {
      pattern += "-?";
    }

    pattern = pattern + "[0-9]*";

    if (!this.round) {
      pattern = pattern + "((\\.|\\,)[0-9]*)?";
    }

    pattern = pattern + "$";

    return new RegExp(pattern);
  }

  /** @param {string} value */
  parse(value) {
    let { min, max } = this.props;

    value = value
      .replace(/\s+/g, "")
      .replace(/,/g, ".")
      .replace(/^0+/g, "0");

    if (value == "-") {
      value = 0;
    }

    if (
      !this.round &&
      value.indexOf(".") < 0 &&
      value.length > 1 &&
      value[0] == "0"
    ) {
      var before = value.substring(0, 1);
      var after = value.substring(1, value.length);
      value = before + "." + after;
    }

    value = Number(value) + "";

    if (min) {
      value = Math.max(+value, +min);
    }
    if (max) {
      value = Math.min(+value, +max);
    }

    if (value == 0) {
      value = "0";
    }

    value += "";

    var lastChar = value.charAt(value.length - 1);
    if (lastChar == "." || lastChar == ",") {
      value = value.slice(0, -1);
    }

    return value;
  }

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  onChange(e) {
    const { onChange } = this.props;
    let { value } = e.target;

    if (value == ".") {
      value = "0.";
    }
    else if (value == "-.") {
      value = "-0.";
    }
    else if (value == ",") {
      value = "0,";
    }
    else if (value == "-,") {
      value = "-0,";
    }

    // value = value.replace(/\s+/g, "");

    const regexp = this.getValidationRegExp();
    if (regexp.test(value.replace(/\s+/g, ""))) {
      this.setState({ value });
      if (onChange) {
        onChange(e, this.parse(value), this);
      }
    }
  }

  /** @param {React.FocusEvent<HTMLInputElement, Element>} e */
  onFocus(e) {
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus(e);
    }
  }

  onBlur(e) {
    var { value } = this.state;
    let val = value;

    if (val === "" && !this.canBeEmpty) {
      val = 0;
    }

    if (val) {
      val = this.parse(value);
      if (isNaN(val)) {
        val = 0;
      }

      val = Number(val);
    }

    this.setState({ value: this.format(val) });
    if (this.props.onBlur) {
      this.props.onBlur(val, value, this);
    }
  }

  /** @param {React.KeyboardEvent<HTMLInputElement>} e */
  onKeyDown(e) {
    if (["Enter", "Escape"].indexOf(e.key) > -1) {
      e.target.blur();
      e.stopPropagation();
    }
  }

  render() {
    const { className, onBlur } = this.props;
    const { value, error } = this.state;

    const positive = value >= 0;

    const safeProps = { ...this.props };
    delete safeProps.format;
    delete safeProps.unsigned;
    delete safeProps.canBeNegative;
    delete safeProps.allowEmpty;

    return (
      <Tooltip
        title={error}
        visible={error.length > 0}
      >
        <div className={clsx("numeric-input-wrap", className)}>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={0}
            maxLength={25}
            {...safeProps}
            className={clsx("numeric-input", error.length && "error", isMobile && "mobile")}
            onKeyDown={e => this.onKeyDown(e)}
            onChange={e => this.onChange(e)}
            onFocus={e => this.onFocus(e)}
            onBlur={e => this.onBlur(e)}
            value={value}
          />

          {this.canBeNegative && isMobile &&
            <button
              onClick={e => {
                const parsedValue = +(String(value).replace(/\s+/g, ""));
                if (parsedValue !== 0) {
                  this.setState({
                    value: this.format(-parsedValue),
                    positive: !positive
                  });

                  if (onBlur) {
                    onBlur(-parsedValue, this.format(-parsedValue), this);
                  }
                }
              }}
            >
              <svg
                className={!positive && "negative"}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 447.243 447.243">
                <path d="M420.361 192.229a31.967 31.967 0 00-5.535-.41H99.305l6.88-3.2a63.998 63.998 0 0018.08-12.8l88.48-88.48c11.653-11.124 13.611-29.019 4.64-42.4-10.441-14.259-30.464-17.355-44.724-6.914a32.018 32.018 0 00-3.276 2.754l-160 160c-12.504 12.49-12.515 32.751-.025 45.255l.025.025 160 160c12.514 12.479 32.775 12.451 45.255-.063a32.084 32.084 0 002.745-3.137c8.971-13.381 7.013-31.276-4.64-42.4l-88.32-88.64a64.002 64.002 0 00-16-11.68l-9.6-4.32h314.24c16.347.607 30.689-10.812 33.76-26.88 2.829-17.445-9.019-33.88-26.464-36.71z"
                />
              </svg>
            </button>
          }

        </div>
      </Tooltip>
    );
  }
}