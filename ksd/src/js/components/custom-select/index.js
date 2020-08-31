import React from 'react'
import ReactDOM from 'react-dom'

import { Select } from 'antd/es'
const { Option } = Select;

import "./style.sass"

export default class CustomSelect extends React.Component {

  constructor(props) {
    super(props);

    this.format = this.props.format || (value => value);

    this.typing = "";

    this.state = {
      options: this.props.options || [],
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

    let index = -1;
    options.forEach((option, i) => {
      if (value > option) {
        index = i;
      }
    });

    return index;
  }

  addOption(value, cb) {
    const { options } = this.state;

    let index = this.nextIndexOf(value) + 1;
    options.splice(index, 0, value);

    this.setState({ options, index }, () => cb());
  }

  onSelect(value, index) {
    const { options } = this.state;

    this.typing = "";

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
    
    // Get rid of fractional numbers
    value = Math.floor(value);
    value = Math.max(+min, value);
    value = Math.min(+max, value);
    return value;
  }

  render() {
    const { options, index } = this.state;

    return (
      <Select
        { ...this.props }
        value={index}
        showSearch
        filterOption={false}
        style={{ width: "100%" }}
        onSearch={e => {
          this.typing = e;
        }}
        onBlur={e => {}}
        onChange={(index, element) => {
          if (this.typing) {
            return;
          }
          
          var value = +(element.props.children + "").match(/\d+/)[0];

          value = this.limitValue(value);
          this.onSelect(value, index);
        }}
        onInputKeyDown={e => {
          if (e.keyCode == 13 || e.keyCode == 27) {
            e.preventDefault();
            e.stopPropagation();

            if (e.target.value) {
  
              var value = +e.target.value;
              
              if (!isNaN(value)) {
                value = this.limitValue(value);
                this.onSelect(value);
              }
            }

          }
        }}>
        {
          options
            .map(option => this.format( option ))
            .map((value, index) => (
              <Option value={index} key={index}>{value}</Option>
            ))
        }
      </Select>
    )
  }
}