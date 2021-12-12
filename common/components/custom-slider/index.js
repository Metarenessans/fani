import React from "react"
import PropTypes from "prop-types"
import { Slider, Tooltip } from "antd"
import clsx from "clsx"
import croppNumber from "../../utils/cropp-number"

import "./style.scss"

const propTypes = {
  /**
   * Значение ползунка
   * 
   * @type {number}
   */
  value: PropTypes.number,

  /**
   * Шаг
   * 
   * @type {number}
   */
  step: PropTypes.number,

  /**
   * Если включен, то ползунок будет задавать диапазон
   * 
   * @type {boolean}
   */
  range: PropTypes.bool,

  /**
   * Минимальное значение
   * 
   * @type {number}
   */
  min: PropTypes.number,

  /**
   * Максимальное значение
   * 
   * @type {number}
   */
  max: PropTypes.number,

  /**
   * @type {boolean}
   * @deprecated Use `withValue` instead
   */
  showValue: PropTypes.bool,

  /**
   * Если включен, то рядом со слайдером будет рендериться `value`
   * 
   * По дефолту включен
   * 
   * @type {boolean}
   */
  withValue: PropTypes.bool,

  /** 
   * @type {boolean}
   * @deprecated Use `withTooltip` instead
   */
  tooltipVisible: PropTypes.bool,

  /**
   * Если включен, то при ручном изменении значения над ручкой ползунка будет рендериться {@link Tooltip}
   * 
   * По дефолту выключен
   * 
   * @type {boolean}
   */
  withTooltip: PropTypes.bool,

  /**
   * Коллбэк, который вызывается каждый раз при изменении значения
   * 
   * @type {(value: number) => any}}
   */
  onChange: PropTypes.func,

  /**
   * Коллбэк, который вызывается после того, как пользователь отпустил ручку ползунка
   * 
   * @type {(value: number) => any}}
   */
  onAfterChange: PropTypes.func,

  /**
   * Функция для форматирования выводимого значения
   * 
   * @type {(value: number) => any}}
   */
  filter: PropTypes.func,
};

/** @augments React.Component<propTypes> */
export default class CustomSlider extends React.Component {

  static propTypes = propTypes;

  /** @param {propTypes} props */
  constructor(props) {
    super(props);

    const { value, filter, range } = props;

    if (range) {
      this.range = true;
    }
    
    this.state = {
      value: value ?? 0,
    };

    this.filter = filter || (value => value);
  }

  onChange(value) {
    const { onChange } = this.props;
    this.setState({ value }, () => {
      if (onChange) {
        onChange(value);
      }
    });
  }

  render() {
    let {
      value,
      step,
      precision,
      className,
      withValue,
      withTooltip,
      tooltipVisible,
      onAfterChange
    } = this.props;
    step = Number.isFinite(step) ? step : 1;
    precision = precision ?? 0;
    withValue = withValue ?? true;
    withTooltip = withTooltip ?? tooltipVisible ?? false;
    return (
      <div 
        className={clsx("custom-slider", withValue && "with-value", className)}
        onMouseEnter={() => this.setState({ changedManually: true })}
        onMouseLeave={() => this.setState({ changedManually: false })}
      >
        <Slider
          {...this.props}
          className="custom-slider__input"
          tooltipVisible={withTooltip}
          value={value}
          onChange={value => {
            if (this.state.changedManually) {
              this.onChange(value);
            }
          }}
          onAfterChange={value => onAfterChange && onAfterChange(value)}
        />
        {withValue &&
          <Tooltip title={this.filter( croppNumber(value, 7) )}>
            <span className="custom-slider__value">
              {/* TODO: value может быть массивом в случае range */}
              { this.filter( croppNumber(value, precision) ) }
            </span>
          </Tooltip>
        }
      </div>
    )
  }
}