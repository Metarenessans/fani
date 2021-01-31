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
              <svg className={positive ? "" : "red"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.49 31.49"><path d="M21.205 5.007a1.112 1.112 0 00-1.587 0 1.12 1.12 0 000 1.571l8.047 8.047H1.111A1.106 1.106 0 000 15.737c0 .619.492 1.127 1.111 1.127h26.554l-8.047 8.032c-.429.444-.429 1.159 0 1.587a1.112 1.112 0 001.587 0l9.952-9.952a1.093 1.093 0 000-1.571l-9.952-9.953z" /></svg>
            </button>
          )}

        </Tooltip>
      </div>
    )
  }
}