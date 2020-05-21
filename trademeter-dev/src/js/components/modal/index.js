import React from 'react'
import ReactDOM from 'react-dom'
import {
  Row,
  Col,
  Select,
  Button,
  Tooltip,
  Radio,
  Input,
  Switch,
  Typography,
  Tag,
  InputNumber
} from 'antd/es'

const { Text, Title } = Typography;

import NumericInput from "../numeric-input"

import "./style.sass"

export default class Chances extends React.Component {

  constructor(props) {
    super(props);



    this.state = {
      
    };
  }

  onOk() {

  }

  onCancel() {

  }

  render() {
    const { title, visible, onOk, onCancel } = this.props;

    return (
      <div className={"m".concat(visible ? " visible" : "")}>
        <div className="m-content">

          <div className="config">
            <h2 className="config__title">{ title }</h2>

            { this.props.children }

            <footer className="config-footer">
              <Button onClick={() => onCancel}>Отмена</Button>
              <Button type="primary" onClick={() => onOk}>Сохранить</Button>
            </footer>
          </div>
        
        </div>
      </div>
    )
  }
}
