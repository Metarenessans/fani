import React from 'react'
import { Input, Tooltip } from 'antd/es'
import './style.scss'


function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

let isIOS = iOS();
// console.log(iOS());

export default class NumericInput extends React.Component {
  constructor(props) {
    super(props);

    this.round = this.props.round == "true";
    this.unsigned = this.props.unsigned == "true";
    this.format = this.props.format || function (val) { return val };
    this.onInvalid = this.props.onInvalid || function () { return "" };
    this.className = this.props.className || "";

    this.state = {
      value: this.format(this.props.defaultValue === "" ? "" : this.props.defaultValue),
      errMsg: "",
      positive: true
    };

    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  setErrorMsg(errMsg) {
    this.setState({ errMsg });
  }

  onChange(e) {
    var { value } = e.target;
    var { onChange } = this.props;

    if (value == ".") {
      value = "0.";
    }
    else if (value == ",") {
      value = "0,";
    }

    // regexp start
    var regexpCode = "^";
    if (this.unsigned != true) {
      regexpCode += "-?";
    }

    regexpCode = regexpCode + "[0-9]*";

    regexpCode = regexpCode + `((\\.|\\,)[0-9]*)?`;
    if (!this.round) {
    }

    regexpCode = regexpCode + "$";
    var regexp = new RegExp(regexpCode);
    // regexp end

    if (regexp.test(value)) {
      this.setState({ value });
      if (onChange) {
        onChange(e, String(value).replace(/\,/g, "."), this);
      }
    }
  }

  onFocus(e) {
    var { value } = e.target;
    value = (value + "").replace(/\s+/g, "");
    this.setState({ value: value });
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  parse(val) {
    let { min, max, placeholder } = this.props;

    let value = val
      .replace(/\s+/g, "")
      .replace(/\,/g, ".")
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
    if (lastChar == '.' || lastChar == ',') {
      value = value.slice(0, -1);
    }

    return value;
  }

  onBlur(e) {
    var { value } = this.state;
    var { placeholder } = this.props;

    if (placeholder && value === "") {
      // return;
    }

    let val = value;
    if (val) {
      val = this.parse(value);
      if (isNaN(val)) {
        val = 0;
      }

      val = Number(val);
    }

    this.setState({ value: this.format(val) });
    if (this.props.onBlur) {
      this.props.onBlur(val, value);
    }
  }

  onKeyDown(e) {
    if ([
      13, // Enter
      27  // Escape
    ].indexOf(e.keyCode) > -1) {
      e.target.blur();
      e.stopPropagation();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.defaultValue != prevProps.defaultValue) {
      this.setState({ value: this.format(this.props.defaultValue) })
    }
  }

  render() {
    const { positive, value, errMsg } = this.state;
    const { unsigned } = this.props;

    return (
      <div class="numeric-input-wrap">
        <Tooltip
          title={errMsg}
          visible={errMsg.length > 0}
        >
          <Input
            type="text"
            inputMode={iOS() ? 'text' : 'decimal'}
            placeholder={0}
            maxLength={25}
            {...this.props}
            className={
              []
                .concat(this.className)
                .concat(errMsg.length ? " error" : "")
                .concat(isIOS ? "ios" : "")
                .join(" ")
                .trim()
            }
            onKeyDown={e => this.onKeyDown(e)}
            onChange={e => this.onChange(e)}
            onFocus={e => this.onFocus(e)}
            onBlur={e => this.onBlur(e)}
            value={value}
          />

          {!unsigned && isIOS && (
            <button
              onClick={(e) => {
                const parsedValue = +(String(value).replace(/\s+/g, ""));
                if (parsedValue !== 0) {
                  this.setState({
                    value: this.format(-parsedValue),
                    positive: !positive
                  });

                  if (this.props.onBlur) {
                    this.props.onBlur(-parsedValue, this.format(-parsedValue));
                  }
                }
              }}
            > 
              <svg className={positive ? "" : "red"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447.243 447.243"><path d="M420.361 192.229a31.967 31.967 0 00-5.535-.41H99.305l6.88-3.2a63.998 63.998 0 0018.08-12.8l88.48-88.48c11.653-11.124 13.611-29.019 4.64-42.4-10.441-14.259-30.464-17.355-44.724-6.914a32.018 32.018 0 00-3.276 2.754l-160 160c-12.504 12.49-12.515 32.751-.025 45.255l.025.025 160 160c12.514 12.479 32.775 12.451 45.255-.063a32.084 32.084 0 002.745-3.137c8.971-13.381 7.013-31.276-4.64-42.4l-88.32-88.64a64.002 64.002 0 00-16-11.68l-9.6-4.32h314.24c16.347.607 30.689-10.812 33.76-26.88 2.829-17.445-9.019-33.88-26.464-36.71z"/></svg>
            </button>
          )}

        </Tooltip>
      </div>
    )
  }
}