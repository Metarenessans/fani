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

import NumericInput from "../NumericInput"

import "./style.sass"

export default class Chances extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data || []
    };
  }

  render() {
    return (
      <div className="config-small js-config-small">
        <h2 className="config__title">Настройка хода инструмента</h2>

        {/* Header */}
        <Row type="flex" justify="space-between" style={{ marginBottom: "1em" }}>
          <Col span={11} style={{ textAlign: "center" }}>
            <Title level={4}>Пункты</Title>
          </Col>
          <Col span={11} style={{ textAlign: "center" }}>
            <Title level={4}>Шансы</Title>
          </Col>
        </Row>

        {/* Main */}
        {
          this.state.data.map((n, i) =>
            <Row key={i} type="flex" justify="space-between" style={{ marginBottom: "1em" }}>
              <Col span={11}>
                <NumericInput
                  defaultValue={n[0]}
                  onBlur={value => {
                    let { data } = this.state;
                    data[i][0] = value;

                    this.setState({ data });
                  }}
                />
              </Col>
              <Col span={11}>
                <NumericInput
                  defaultValue={n[1]}
                  onBlur={value => {
                    let { data } = this.state;
                    data[i][1] = value;

                    this.setState({ data });
                  }}
                />
              </Col>
            </Row>
          )
        }

        <Button
          className="config__add-btn"
          type="link"
          onClick={() => {
            let { data } = this.state;
            data.push([0, 0]);

            this.setState({ data });
          }}
        >
          Добавить
        </Button>

        <footer className="config-footer">
          <Button 
            className="config__cancel-btn js-close-modal-small"
            onClick={() => this.props.onCancel()}
          >
            Отмена
          </Button>
          <Button
            className="js-close-modal-small"
            type="primary"
            onClick={() => this.props.onSave( this.props.data )}
          >
            Сохранить
          </Button>
        </footer>
      </div>
    )
  }
}
