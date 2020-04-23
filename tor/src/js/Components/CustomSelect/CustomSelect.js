import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Select } from 'antd/es'
import num2str from '../../num2str'

import "./style.sass"

const { Option } = Select;

export default class CustomSelect extends Component {
  constructor(props) {
    super(props);

    this.formatOption = this.props.formatOption || function(value) { return value };

    this.state = {
      options: this.props.optionsDefault || [],
      index:   0
    };

    if (this.props.value) {
      var found = this.state.options.indexOf(this.props.value);
      if (found == -1) {
        let index = this.nextIndexOf(this.props.value) + 1;
  
        this.state.options.splice(index, 0, this.props.value);
        this.state.index = index;
      }
      else {
        this.state.index = found;
      }
    }
  }

  nextIndexOf(value) {
    const { options } = this.state;

    let found = -1;
    options.forEach((n, i) => {
      if (value > n) {
        found = i;
      }
    });

    return found;
  }

  addOption(value, cb) {
    const { options } = this.state;

    let found = this.nextIndexOf(value);

    options.splice(found + 1, 0, value);
    this.setState({
      options: options,
      index:   found + 1,
    }, () => cb());
  }

  onSelect(value, index) {
    const { options } = this.state;

    // Option exists
    if (options.indexOf(value) != -1) {
      this.setState({ index: options.indexOf(value) });
      if (this.props.onChange) {
        this.props.onChange(value);
      }
    }
    // Option doesn't exists
    else {
      this.addOption(value, () => {
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      });
    }
  }

  limitValue(value) {
    let { min, max } = this.props;
    let { options } = this.state;
    min = min || options[0];
    max = max || Infinity;

    value = Math.max(+min, value);
    value = Math.min(+max, value);
    return value;
  }

  render() {
    return (
      <Select
        value={this.state.index}
        showSearch
        filterOption={false}
        style={{ width: "100%" }}
        onChange={(index, element) => {
          var value = +element.props.children.match(/\d+/)[0];
          const { options } = this.state;

          value = this.limitValue(value);
          this.onSelect(value, index);
        }}
        onInputKeyDown={e => {
          if (e.keyCode == 13) {
            var value = +e.target.value;
            if (!isNaN(value)) {
              value = this.limitValue(value);
              this.onSelect(value);
            }
          }
        }}
        // onBlur={(val, e, i) => {
        //   console.log(val, e, i);
        //   // var value = +e.target.value;
        //   // if (!isNaN(value)) {
        //   //   value = this.limitValue(value);
        //   //   this.onSelect(value);
        //   // }
        // }}
      >
        {
          this.state.options
            .map((n, i) => this.formatOption(n))
            .map((value, index) => (
              <Option key={index} value={index}>{value}</Option>
            ))
        }
      </Select>
    )
  }
}