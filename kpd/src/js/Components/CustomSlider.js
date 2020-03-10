import React from 'react'
import ReactDOM from 'react-dom'
import { Slider } from 'antd/es'

export default class CustomSlider extends React.Component {
  constructor(props) {
    super(props);

    this.filterFn = this.props.filter || function(val) { return val };
  }

  onChange(val) {
    if (this.props.onChange) {
      this.props.onChange(val);
    }
  }

  filterValue(val) {
    return (val + "").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ")
  }

  render() {
    return (
      <div className="custom-slider">
        <Slider
          {...this.props}
          className="custom-slider__input"
          onChange={(e) => this.onChange(e)}
          tooltipVisible={false}
          value={this.props.value}
        />
        <span className="custom-slider__value">{this.filterFn(this.props.value)}</span>
      </div>
    )
  }
}