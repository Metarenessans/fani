import React from 'react'
import { Button, Tooltip, Select, Progress } from 'antd/es'

import {
  PlusOutlined,
  MinusOutlined,
  SettingFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  QuestionCircleFilled,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'

import NumericInput from "../../../../../common/components/numeric-input"
import CrossButton  from "../../../../../common/components/cross-button"

import round        from "../../../../../common/utils/round"
import num2str      from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'

import "./style.scss"

export default class Stats extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let { data } = this.props;

    return (
      <div className="stats">Hey there</div>
    )
  }
}
