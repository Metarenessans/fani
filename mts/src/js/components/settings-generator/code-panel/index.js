import React, { useState, useEffect } from 'react'
import { message } from 'antd';

import Stack        from "../../../../../../common/components/stack"
import NumericInput from "../../../../../../common/components/numeric-input"

import round          from "../../../../../../common/utils/round"
import formatNumber   from "../../../../../../common/utils/format-number"

import "./style.scss"

const roundToClosest = (number, base) => {
  let result = Math.round(number / base) * base;
  if (result < base) {
    return base;
  }
  return result;
};

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

  const [rollback, setRollback] = useState(tool.priceStep);

  useEffect(() => {
    setRollback(tool.priceStep);
  }, [tool.code]);

  return (
    <Stack className="code-panel">

      {Object.keys(data).map((key, index) => {
        const arr = data[key];

        // Не выводим закрытие плечевого депозита
        if (key == "Закрытие плечевого депозита") {
          return null
        }

        // "Зеркальные докупки" всегда должны быть видны в коде
        const alwaysVisible = ["Зеркальные докупки", "Прямые профитные докупки", "Обратные профитные докупки"];
        if ((alwaysVisible.indexOf(key) == -1) && !arr.on) {
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
            return `{${percent},${pointsInPercents}${key == "Закрытие основного депозита" ? "," + rollback : ""}}`;
          })
          .join(",");
        parsedData = `{${parsedData}}`;

        if (key == "Закрытие основного депозита") {
          let suffix = (data["Закрытие плечевого депозита"] || [])
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
              return `{${percent},${pointsInPercents}${","+rollback}}`;
            })
            .join(",");

          if (suffix) {
            parsedData = `{${parsedData},{${suffix}}}`;
          }
        }

        // В Лимитнике в массиве закрытия добавляем еще пару фигурных скобок
        if (currentPreset.type == "Лимитник" && !arr.isBying) {
          parsedData = `{${parsedData}}`;
        }

        let param = currentPreset.type == "Лимитник" ? "profit_arr" : "stop_arr";
        if (key == "Обратные докупки (ТОР)") {
          param = currentPreset.type == "Лимитник" ? "aapercent" : "aaperc";
        }
        else if (key == "Зеркальные докупки") {
          title = "Массив зеркальных докупок";
          param = "flagmirroradd";
          parsedData = String(arr.on);
        }
        else if (key == "Прямые профитные докупки") {
          title = "Массив прямых докупок";
          param = "aaperc";
          parsedData = (arr || [])
            .map(v => {
              let { percent, points } = v;
              return `{${percent},${points},true}`;
            })
            .join(",");
          parsedData = `{${parsedData}}`;
        }
        else if (key == "Обратные профитные докупки") {
          title = "Массив обратных профитных докупок";
          param = "aapercsh";
          parsedData = (arr || [])
            .map(v => {
              let { percent, points } = v;
              return `{${percent},${points}}`;
            })
            .join(",");
          parsedData = `{${parsedData}}`;
        }

        const textContent = `GParam.${param} = ${parsedData}`;

        const codeElement = React.createRef();

        let hideTitle = false;

        return (
          <>
            {(key == "Прямые профитные докупки" || key == "Обратные профитные докупки") && (() => {
              hideTitle = true;

              const codeElement = React.createRef();
              let title = "";
              let param = "";
              let parsedData = "";

              if (key == "Прямые профитные докупки") {
                title = "Массив прямых докупок";
                param = "flagautoadd";
              }
              else if (key == "Обратные профитные докупки") {
                title = "Массив обратных профитных докупок";
                param = "flautoaddsh";
              }
              parsedData = String(arr.on);
              const textContent = `GParam.${param} = ${parsedData}`;
              return (
                <div className="code-panel-group"
                     key={Math.random()}
                     style={{ marginBottom: "-2em" }}>

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
            })()}
            <div className="code-panel-group"
                 key={Math.random()}>

              {!hideTitle &&
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
                  {key == "Закрытие основного депозита" &&
                    <label className="input-group input-group--fluid">
                      <span className="input-group__label">обратный откат</span>
                      <NumericInput
                        className="input-group__input"
                        key={Math.random()}
                        defaultValue={rollback}
                        unsigned="true"
                        min={0}
                        format={formatNumber}
                        onBlur={(value, textValue, jsx) => {
                          const newRollback = roundToClosest(Number(value), tool.priceStep);
                          setRollback(newRollback)
                          jsx.setState({ value: newRollback });
                        }}
                      />
                    </label>
                  }
                </div>
              }
              <div className="code-panel-group-content">
                <pre onClick={e => selectElementContent(e.target)} ref={codeElement}>
                  {textContent}
                </pre>
              </div>

            </div>
          </>
        )
      })}

      {(() => {
        const codeElement = React.createRef();
        const textContent = `GParam.depo_stop = {${!isRiskStatic ? round(risk, 3) : 0},${isRiskStatic ? round(risk, 3) : 0}}`;

        return (
          <div className="code-panel-group" key={Math.random()}>

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