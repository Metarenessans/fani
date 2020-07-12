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
    return (
      <div className="custom-slider">
        <Slider
          className="custom-slider__input"
          {...this.props}
          tooltipVisible={false}
          defaultValue={this.props.value}
          onChange={e => this.onChange(e)}
        />
        <span className="custom-slider__value">
          { this.filter( this.props.value ) }
        </span>
      </div>
    )
  }
}