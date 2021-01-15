import React from 'react'
import { Select } from 'antd/es'
const { Option } = Select;

import round from '../../utils/round';

import "./style.sass";

export default React.memo(class CustomSelect extends React.Component {

  constructor(props) {
    super(props);

    this.format = this.props.format || (value => value);

    this.inputElement = null;

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

  onSelect(value) {
    const { options } = this.state;
    const { onChange } = this.props;

    // Option exists
    if (options.indexOf(value) != -1) {
      this.setState({ index: options.indexOf(value) });
      if (onChange) {
        onChange(value);
      }
    }
    // Option doesn't exists
    else {
      this.addOption(value, () => {
        if (onChange) {
          onChange(value);
        }
      });
    }
  }

  parseValue(value) {
    if (!value) {
      return;
    }

    let { min, max, allowFraction } = this.props;
    let { options } = this.state;

    min = min != null ? min : options[0];
    max = max != null ? max : Infinity;
    
    value = value
      .replace(/\s+/g, "")
      .replace(/\,/g, ".")
      .replace(/^0+/g, "0");

    if (
      allowFraction &&
      value.indexOf(".") < 0 &&
      value.length > 1 &&
      value[0] == "0"
    ) {
      var before = value.substring(0, 1);
      var after = value.substring(1, value.length);
      value = before + "." + after;
    }

    value = Number(value);

    // Get rid of fractional numbers
    if (allowFraction) {
      value = round(value, allowFraction);
    }
    else {
      value = Math.floor(value);
    }
    value = Math.max(min, value);
    value = Math.min(max, value);
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
        onBlur={e => {
          let value = this.parseValue(this.inputValue);
          if (value != null && !isNaN(value)) {
            this.onSelect(value);
          }

          this.inputElement = null;
        }}
        onChange={(index, element) => {
          // Предотвращаем вызов this.onSelect() дважды
          if (this.inputElement && this.inputElement.value) {
            return;
          }
          
          var value = +(element.props.children + "").match(/\d+/)[0];
          value = this.parseValue(value);
          this.onSelect(value, index);
        }}
        onInputKeyDown={e => {
          if (!this.inputElement) {
            this.inputElement = e.target;
            this.inputElement.addEventListener("input", e => {
              this.inputValue = e.target.value; 
            })
          }

          if (e.keyCode == 13 || e.keyCode == 27) {
            e.preventDefault();
            e.stopPropagation();

            if (e.target.value) {
              let value = this.parseValue(e.target.value);
              if (value != null && !isNaN(value)) {
                this.onSelect(value);
              }
            }

          }
        }}
      >
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
})