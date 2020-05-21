import React from 'react'
import ReactDOM from 'react-dom'

import { Slider } from 'antd/es'

import "./style.sass"

export default class CustomSlider extends React.Component {
  constructor(props) {
    super(props);

    const { value, filter } = this.props;

    this.state = {
      value: value || 0
    };

    this.filter = filter || (value => value);
  }

  onChange(value) {
    this.setState({ value }, () => {
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    });
  }

  render() {
    const { value } = this.props;

    return (
      <div className="custom-slider">
        <Slider
          { ...this.props }
          className="custom-slider__input"
          tooltipVisible={false}
          defaultValue={value}
          onChange={e => this.onChange(e)}
        />
        <span className="custom-slider__value">
          { this.filter( value ) }
        </span>
      </div>
    )
  }
}