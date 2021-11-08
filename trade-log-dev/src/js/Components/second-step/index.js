import React from 'react'
import { Button, Tooltip, Select, Progress, Checkbox } from 'antd/es'
import StateRegistry from "../state-registry"

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
import CrossButton from "../../../../../common/components/cross-button"

import round from "../../../../../common/utils/round"
import num2str from "../../../../../common/utils/num2str"
import formatNumber from "../../../../../common/utils/format-number"
import clsx from 'clsx'
import { data } from 'jquery'

import "./style.scss"

const { Option } = Select;

export default class SecondStep extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    // let { currentRowIndex, onChange, rowData } = this.props;

    // let {
    //   calmnessBefore,
    //   calmnessDuring,
    //   calmnessAfter,

    //   collectednessBefore,
    //   collectednessDuring,
    //   collectednessAfter,

    //   braveryBefore,
    //   braveryDuring,
    //   braveryAfter,
      
    //   confidenceBefore,
    //   confidenceDuring,
    //   confidenceAfter,
      
    //   compassionBefore,
    //   compassionDuring,
    //   compassionAfter,
      
    //   greedinessBefore,
    //   greedinessDuring,
    //   greedinessAfter,
      
    //   egoBefore,
    //   egoDuring,
    //   egoAfter,
      
    //   euphoriaBefore,
    //   euphoriaDuring,
    //   euphoriaAfter,
      
    //   faultBefore,
    //   faultDuring,
    //   faultAfter,
      
    //   resentmentBefore,
    //   resentmentDuring,
    //   resentmentAfter,
      
    //   angerBefore,
    //   angerDuring,
    //   angerAfter,
      
    //   apathyBefore,
    //   apathyDuring,
    //   apathyAfter,
      
    //   stagnationBefore,
    //   stagnationDuring,
    //   stagnationAfter,
      

    //   marketVision,
    //   entrySkill,
    //   exitSkill,
    //   dealStay,
    //   mediumTermStay,
    //   tradeAlgorithm,
    //   boredom,
    //   excitement,
    //   tradeDesire,
    // } = rowData[currentRowIndex]

    return (
      <>
        <div className="second-step" id="second-step">
          <div className="second-step-table">
            <StateRegistry
              deals={[1, 2, 3, 4]}
              onNextStep={() => {
                console.log("onNextStep");
              }}
              onPrevStep={() => {
                e
                console.log("onPrevStep");
              }}
            />
          </div>
        </div>
      </>
    )
  }
}
