import React from 'react'
import ReactDOM from 'react-dom'
import { Input, Tooltip, Select } from 'antd/es'

export default class SelfValidateInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = { valid: true };
  }

  render() {
    const { validateFn, onChange } = this.props;
    const { value } = this.state;
    const err = validateFn(value);

    return (
      <div style={{ position: "relative" }}>
        <Input
          {...this.props}
          onChange={e => {
            const value = e.target.value;
            this.setState({ value });

            if (onChange) {
              onChange(value);
            }
          }}
        />
        <span style={{
          position:  "absolute",
          left:      "0",
          top:       "100%",
          color:     "var(--danger-color)",
          fontSize:  ".7em",
          textAlign: "center"
        }}>{err}</span>
      </div>
    )
  }
}