import React from 'react'

import Stack from "../../../../../../common/components/stack"

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

  const { data } = props;

  const codeElement = React.createRef();

  const parsedData = data
    .map(v => `{${v.percent},${v.points}}`)
    .join(",");

  const textContent = 
    `GParam.stop_arr = \n` + 
    `{${parsedData}}`.replace(/\s+/, "");

  return (
    <Stack className="code-panel">

      <div className="code-panel-group">
        <div className="code-panel-group-header">
          <h3>Массив закрытия основного депозита</h3>
          <button 
            className="code-panel-group__copy-btn"
            onClick={e => {
              selectElementContent(codeElement.current);

              navigator.clipboard.writeText(textContent)
                .then(() => console.log('Получилось!'))
                .catch(err => console.log('Something went wrong', err));
            }}
          >
            копировать
          </button>
        </div>
        <div className="code-panel-group-content">
          <pre 
            onClick={e => selectElementContent(e.target)}
            ref={codeElement}
          >
            {textContent}
          </pre>
        </div>
      </div>

    </Stack>
  );
}