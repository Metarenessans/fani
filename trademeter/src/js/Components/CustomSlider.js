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
          className="custom-slider__input"
          value={this.props.value}
          {...this.props}
          onChange={(e) => this.onChange(e)}
          tooltipVisible={false}
        />
        <span className="custom-slider__value">{this.filterFn(this.props.value)}</span>
      </div>
    )
  }
}