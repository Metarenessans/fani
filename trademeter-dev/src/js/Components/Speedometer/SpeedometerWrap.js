import React from 'react'
import ReactDOM from 'react-dom'
import format from '../../format';
import Speedometer from './Speedometer'

import "./style.sass"

export default class SpeedometerWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered:        false,
      hoveredContent: false
    };
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <Speedometer
        {...this.props}
        onMouseOver={e => {
          this.setState({ hoveredContent: true });
        }}
        onMouseOut={e => {
          this.setState({ hoveredContent: false });
        }}
        chances={this.props.chances}
      />
    )
  }
}