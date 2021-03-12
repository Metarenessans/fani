import React from 'react'
import { message } from 'antd';

import Stack from "../../../../../../common/components/stack"
import stepConverter from "../step-converter"

import "./style.scss"

function selectElementContent(node) {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.warn("Could not select text in node: Unsupported browser.");
  }
}

export default function CodePanel(props) {

  const { data, tool } = props;

  return (
    <Stack className="code-panel">

      {Object.keys(data).map((key, index) => {
        const arr = data[key];

        if (!arr) {
          return null;
        }

        const codeElement = React.createRef();

        let parsedData = (arr || [])
          .map(v => {
            let { percent, points } = v;
            let pointsInPercents = stepConverter.fromStepToPercents(points, tool.currentPrice);
            return `{${percent},${pointsInPercents}}`;
          })
          .join(",");

        if (key == "Зеркальные докупки") {
          parsedData = "true";
        }

        const textContent = `GParam.${key == "Обратные докупки (ТОР)" ? "aaperc" : "stop_arr"} = {${parsedData}}`;

        return (
          <div className="code-panel-group"
               key={index}>

            <div className="code-panel-group-header">
              <h3>Массив {!arr.isBying ? "закрытия" : "докупок"}:</h3>
              <button
                className="code-panel-group__copy-btn"
                onClick={e => {
                  selectElementContent(codeElement.current);

                  navigator.clipboard.writeText(textContent)
                    .then(() => message.success("Скопировано!"))
                    .catch(error => console.log('Something went wrong', error));
                }}
              >
                копировать
              </button>
            </div>
            <div className="code-panel-group-content">
              <pre onClick={e => selectElementContent(e.target)}
                ref={codeElement}>
                {textContent}
              </pre>
            </div>

          </div>
        )
      })}

    </Stack>
  );
}