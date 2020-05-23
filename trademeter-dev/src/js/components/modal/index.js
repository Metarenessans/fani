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

import $ from "jquery"

import NumericInput from "../numeric-input"

import "./style.sass"

var $body, $modal;

export default class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
    
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  componentDidMount() {
    this.bindEvents();
  }

  bindEvents() {
    $body = $(document.body);
    $body.on("keydown", e => {
      // Esc
      if (e.keyCode == 27) {
        this.onClose();
      }
    });

    // $modal = $(".m");
    // $modal.click(e => {
    //   if ( $(e.target).is($modal) ) {
    //     this.onClose();
    //   }
    // });
  }

  close() {
    $body.removeClass("scroll-disabled");
  }

  onOk() {
    const { onOk } = this.props
    if (onOk) {
      if (onOk()) {
        this.close();
      }
    }
  }

  onCancel() {
    const { onCancel } = this.props
    this.close();
    if (onCancel) {
      onCancel();
    }
  }

  onClose() {
    const { onClose } = this.props
    this.close();
    if (onClose) {
      onClose();
    }
  }

  render() {
    const { title, visible, hideFooter } = this.props;

    if (visible) {
      $body.addClass("scroll-disabled")
    }

    return (
      <div 
        className={"m".concat(visible ? " visible" : "")}
        onClick={e => {
          if( $(e.target).hasClass("m") ) {
            this.onClose();
          }
        }}>
        <div className="m-content">

          {
            visible && (

              <div className="config card">
                <h2 className="config__title">{ title }</h2>

                { this.props.children }

                {
                  !hideFooter && (

                    <footer className="config-footer">
                      <Button onClick={() => this.onCancel()}>Отмена</Button>
                      <Button type="primary" onClick={() => this.onOk()}>Сохранить</Button>
                    </footer>

                  )
                }

              </div>

            )
          }

        </div>
      </div>
    )
  }
}
