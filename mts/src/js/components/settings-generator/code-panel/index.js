import React from 'react'
import { message } from 'antd';

import Stack from "../../../../../../common/components/stack"

import round          from "../../../../../../common/utils/round"
import fractionLength from "../../../../../../common/utils/fraction-length"

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
  const { currentPreset, data, tool, contracts, risk, isRiskStatic } = props;

  return (
    <Stack className="code-panel">

      {Object.keys(data).map((key, index) => {
        const arr = data[key];

        // "Зеркальные докупки" всегда должны быть видны в коде
        if (key != "Зеркальные докупки" && !arr.on) {
          return null;
        }

        let title = `Массив ${!arr.isBying ? "закрытия" : "докупок"}:`;

        let parsedData = (arr || [])
          .map(v => {
            let { percent, points } = v;
            let pointsInPercents = points;
            if (currentPreset.type == "Лимитник") {
              
              // Акции
              if (tool.dollarRate >= 1) {
                pointsInPercents =
                  (
                    // ход в пунктах
                    points *
                    // загрузка в контрактах
                    contracts *
                    // стоимость шага
                    tool.lotSize
                  )
                  /
                  (
                    // объем входа в деньгах
                    contracts * tool.guarantee
                  )
                  *
                  100;
              }
              // ФОРТС
              else {
                pointsInPercents =
                  (
                    // ход в пунктах
                    points *
                    // загрузка в контрактах
                    contracts *
                    // стоимость шага
                    tool.stepPrice
                  )
                  /
                  (
                    // объем входа в деньгах
                    (contracts * tool.guarantee)
                    *
                    tool.priceStep
                  )
                  *
                  100;
              }

              if (isNaN(pointsInPercents)) {
                pointsInPercents = 0;
              }

              pointsInPercents = round(pointsInPercents, 4);
            }
            return `{${percent},${pointsInPercents}}`;
          })
          .join(",");
        parsedData = `{${parsedData}}`;

        // В Лимитнике в массиве закрытия добавляем еще пару фигурных скобок
        if (currentPreset.type == "Лимитник" && !arr.isBying) {
          parsedData = `{${parsedData}}`;
        }

        let param = currentPreset.type == "Лимитник" ? "profit_arr" : "stop_arr";
        if (key == "Обратные докупки (ТОР)") {
          param = currentPreset.type == "Лимитник" ? "aapercent" : "aaperc";
        }
        else if (key == "Зеркальные докупки") {
          param = "flagmirroradd";
          parsedData = String(arr.on);
          title = "Массив зеркальных докупок";
        }

        const textContent = `GParam.${param} = ${parsedData}`;

        const codeElement = React.createRef();

        return (
          <div className="code-panel-group"
               key={index}>

            <div className="code-panel-group-header">
              <h3>{title}</h3>
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

      {(() => {
        const codeElement = React.createRef();
        const textContent = `GParam.depo_stop = {${!isRiskStatic ? risk : 0}, ${isRiskStatic ? risk : 0}}`;

        return (
          <div className="code-panel-group">

            <div className="code-panel-group-header">
              <h3>Риск</h3>
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
      })()}

    </Stack>
  );
}