import React from "react"
import PropTypes from 'prop-types'

class Switcher extends React.Component {
  constructor(props) {

  }

  render() {
    return (
      <button
        className="settings-generator-content__step-mode-switcher"
        onClick={e => {
          let { inPercent, preferredStep } = options.customData[i];

          if (preferredStep) {
            // Были в процентах, теперь переводим в валюту
            if (inPercent) {
              preferredStep = percentToStepsConverter(preferredStep, currentTool, contracts);
              preferredStep = updateStep(preferredStep);
            }
            // переводим в проценты
            else {
              preferredStep = stepsToPercentConverter(preferredStep, currentTool, contracts);
            }
          }

          const customDataCopy = [...options.customData];
          customDataCopy[i] = {
            ...customDataCopy[i],
            preferredStep,
            inPercent: !inPercent,
          };

          onPropertyChange({
            customData: customDataCopy
          })
        }}
      >
        {!customDataRow.inPercent ? "$/₽" : "%"}
      </button>
    )
  }
}

Switcher.propTypes = {
  value: PropTypes.any.isRequired

};

{/* <Switcher modes={["$/₽", "%"] currentMode={}} /> */}

export default Switcher