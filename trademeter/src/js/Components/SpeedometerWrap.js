import React from 'react'
import ReactDOM from 'react-dom'
import format from '../format';
import Speedometer from './Speedometer'

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
    function round(value, decimals) {
      let dec = Math.pow(10, decimals);
      return Math.round(value * dec) / dec;
    }
    
    const { hovered, hoveredContent } = this.state;
    const { value, tool, directUnloading, numberOfIterations } = this.props;

    return (
      <td 
        className={"table-td table-td-speedometer"/*.concat(value > tool.averageProgress ? " danger" : "")*/}
        onMouseOver={e => {
          this.setState({ hovered: true });
        }}
        onMouseOut={e => {
        }}
      >
        <div
          className="table-td-parent"
        >
          {
            round(value.toFixed(2), 1)
          }

          {
            (hovered || hoveredContent) ?
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
              :
              null
          }
        </div>
      </td>
    )
  }
}