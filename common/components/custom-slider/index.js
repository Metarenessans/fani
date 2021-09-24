import React from 'react'
import { Slider, Tooltip } from 'antd/es'
import clsx from 'clsx'

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
      value: value ?? 0,
    };

    this.filter = filter || (value => value);
  }

  onChange(value) {
    const { onChange } = this.props;
    this.setState({ value }, () => {
      if (onChange) {
        onChange(value);
      }
    });
  }

  render() {
    var { value, precision, className, showValue, tooltipVisible, onAfterChange } = this.props;
    tooltipVisible = tooltipVisible;
    precision      = precision || 0; 
    showValue      = showValue || false;

    return (
      <div className={clsx("custom-slider", className)}>
        <Slider
          { ...this.props }
          className="custom-slider__input"
          tooltipVisible={tooltipVisible}
          value={value}
          onChange={e => this.onChange(e)}
          onAfterChange={e => onAfterChange && onAfterChange(e)}
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