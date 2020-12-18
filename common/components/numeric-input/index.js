import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip } from 'antd/es'

export default class NumericInput extends React.Component {
  constructor(props) {
    super(props);

    this.round     = this.props.round    == "true"; 
    this.unsigned  = this.props.unsigned == "true";
    this.format    = this.props.format || function(val) { return val };
    this.onInvalid = this.props.onInvalid || function() { return "" };
    this.className = this.props.className || "";

    this.state = {
      value:  this.format(this.props.defaultValue === "" ? "" : this.props.defaultValue),
      errMsg: ""
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
    
    if (!this.round) {
      regexpCode = regexpCode + `((\\.|\\,)[0-9]*)?`;
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
      !this.round      &&
      value.indexOf(".") < 0 &&
      value.length > 1       &&
      value[0] == "0"
    ) {
      var before = value.substring(0, 1);
      var after  = value.substring(1, value.length);
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
      this.props.onBlur(val);
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

  render() {
    const { value, errMsg } = this.state;

    return (
      <Tooltip
        title={errMsg}
        visible={errMsg.length > 0}
      >
        <Input
          type="text"
          inputMode="decimal"
          placeholder={0}
          {...this.props}
          className={this.className.concat(errMsg.length ? " error" : "")}
          onKeyDown={e => this.onKeyDown(e)}
          onChange={e => this.onChange(e)}
          onFocus={e => this.onFocus(e)}
          onBlur={e => this.onBlur(e)}
          value={value}
          maxLength={25}
        />
      </Tooltip>
    )
  }
}