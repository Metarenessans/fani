import React from 'react'
import ReactDOM from 'react-dom'

import { Slider, Tooltip } from 'antd/es'

import croppNumber from "../../utils/cropp-number"

import "./style.scss"

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
    var { value, precision } = this.props;
    precision = precision || 0;

    return (
      <div className="custom-slider">
        <Slider
          { ...this.props }
          className="custom-slider__input"
          tooltipVisible={false}
          defaultValue={value}
          onChange={e => this.onChange(e)}
        />
        <Tooltip title={this.filter( croppNumber(value, 7) )}>
          <span className="custom-slider__value">
            { this.filter( croppNumber(value, precision) ) }
          </span>
        </Tooltip>
      </div>
    )
  }
}