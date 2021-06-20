import React from 'react'

import { Slider, Tooltip } from 'antd/es'

import croppNumber from "../../utils/cropp-number"

import "./style.scss"

export default class CustomSlider extends React.Component {
  constructor(props) {
    super(props);

    const { value, filter, range } = this.props;

    if (range) {
      this.range = true;
    }
    
    this.state = {
      value: value || 0,
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
    var { value, precision, className, showValue, tooltipVisible, percentage } = this.props;
    tooltipVisible = tooltipVisible;
    precision      = precision || 0; 
    showValue      = showValue || false;

    return (
      <div className={[].concat("custom-slider").concat(className).join(" ").trim()}>
        <Slider
          { ...this.props }
          className="custom-slider__input"
          tooltipVisible={tooltipVisible}
          value={value}
          onChange={e => this.onChange(e)}
        />
        {showValue && (
          <Tooltip title={this.filter( croppNumber(value, 7) )}>
            <span className="custom-slider__value">
              { this.filter( croppNumber(value, precision) ) }
            </span>
          </Tooltip>
        )}
      </div>
    )
  }
}