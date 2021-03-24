import React from 'react'
import { InputNumber } from 'antd/es'
import round from "../../utils/round"

export default class NumericInputWithArrows extends React.Component {
  constructor(props) {
    super(props);
  }
    
  render() {
    const removeMinus = number => String(number).replace(/-+/g, "");

    const { defaultValue, onBlur } = this.props;
    
    return (

      <InputNumber
        // className="mts-slider2-input"
        stringMode={true}
        step={.01}
        max={100}
        formatter={value => {
          return removeMinus(value)
        }}

        defaultValue={defaultValue}

        onChange={ value => {
          if (defaultValue >= 0) {
            this.setState({ value })
          }
          else {
            this.setState({ value })
          }
        }}

        onPressEnter={e => {
          const value = round(e.target.value, 2);
          if (isNaN(value)) {
            onBlur(0);
            return;
          }
          
          if (defaultValue >= 0) {
            onBlur(value);
          }
          else {
            onBlur(-Math.abs(value));
          }
        }}

        onBlur={e => {
          const value = round(e.target.value, 2);
          if (isNaN(value)) {
            onBlur(0);
            return;
          }

          if (defaultValue >= 0) {
            onBlur(value);
          }
          else {
            onBlur(-Math.abs(value));
          }
        }}

      />
    )
  }
}

