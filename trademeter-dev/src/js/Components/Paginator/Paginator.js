import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'antd/es'
import NumericInput from "../NumericInput"

import "./style.sass"

export default class Paginator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.defaultValue
    };

    this.formatNumberFn = this.props.formatNumberFn || function(val) { return val };
  }

  render() {
    return (
      <div className="paginator">
        <NumericInput
          className="paginator__input"
          defaultValue={this.state.value}
          max={this.props.max}
          placeholder={1}
          onBlur={val => {
            this.setState({ value: val == 0 ? 1 : val }, () => {
              this.props.onChange(this.state.value)
            });
          }}
          format={this.formatNumberFn}
        />
        <Button
          className="paginator__label"
          type="link"
          onClick={() => {
            if (this.props.onChange) {
              this.props.onChange(this.state.value);
            }
          }}
        >
          перейти ко дню
        </Button>
      </div>
    )
  }
}