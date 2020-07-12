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
    let { className, title, visible, hideFooter } = this.props;
    className = className || "";

    if (visible) {
      $body.addClass("scroll-disabled")
    }

    return (
      <div 
        className={
          []
            .concat("m")
            .concat(visible ? " visible" : "")
            .join(" ")
        }
        onClick={e => {
          if( $(e.target).hasClass("m") ) {
            this.onClose();
          }
        }}>
        <div className="m-content">

          {
            visible && (

              <div className={"config card".concat(" " + className)}>
                <h2 className="config__title">{ title }</h2>

                { this.props.children }

                {
                  !hideFooter && (

                    <div className="config-footer-wrap">
                      <footer className="config-footer">
                        <Button 
                          className="custom-btn" 
                          onClick={() => this.onCancel()}>
                          Отмена
                        </Button>
                        <Button 
                          className="custom-btn custom-btn--filled" 
                          type="primary" 
                          onClick={() => this.onOk()}>
                          Сохранить
                        </Button>
                      </footer>
                    </div>

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
