import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip } from 'antd/es'

export default class NumericInput extends React.Component {
  constructor(props) {
    super(props);

    this.format = this.props.format || function(val) { return val };
    this.onInvalid = this.props.onInvalid || function() { return "" };

    this.className = this.props.className || "";

    this.state = {
      value:  this.format(this.props.defaultValue || 0),
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
    
    if (value == ".") {
      value = "0.";
    }
    else if (value == ",") {
      value = "0,";
    }

    var regexp = /^[0-9]*((\.|\,)[0-9]*)?$/;
    if (this.props.round) {
      regexp = /^[0-9]*?$/
    }
    if (regexp.test(value)) {
      this.setState({ value: value });
      if (this.props.onChange) {
        this.props.onChange(e, value);
      }
    }
  }

  onFocus(e) {
    var { value } = e.target;
    value = (value + "").replace(/\s+/g, "");
    this.setState({ value: value });
  }

  parse(val) {
    var { min, max } = this.props;

    var value = val
      .replace(/\s+/g, "")
      .replace(/\,/g, ".")
      .replace(/^0+/g, "0");
    if (
      !this.props.round      &&
      value.indexOf(".") < 0 &&
      value.length > 1       &&
      value[0] == "0"
    ) {
      var before = value.substring(0, 1);
      var after = value.substring(1, value.length);
      value = before + "." + after;
    }
    value = Number(value) + "";

    if (min && (+value < +min)) {
      console.log('min', +value, +min);
      value = +min;
    }
    if (max && (+value > +max)) {
      console.log('max', +value, +max);
      value = +max;
    }

    if (value == 0) {
      value = this.props.placeholder || "";
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

    var val = this.parse(value);

    this.setState({ value: this.format(val) });
    if (this.props.onBlur) {
      this.props.onBlur(Number(val));
    }
  }

  onKeyDown(e) {
    if (e.keyCode == 13 || e.keyCode == 27) {
      var { value } = this.state;

      var val = this.parse(value);
      console.log(val);

      this.setState({ value: val });
      if (this.props.onBlur) {
        this.props.onBlur(Number(val));
      }

      e.target.blur();
    }
  }

  render() {
    const { value, errMsg } = this.state;

    return (
      <Tooltip
        title={errMsg}
        visible={errMsg}
      >
        <Input
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