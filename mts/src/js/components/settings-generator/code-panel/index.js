import React, { useState, useEffect } from 'react'
import { message } from 'antd';

import stepConverter from "../step-converter"

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
  }
  else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  else {
    console.warn("Could not select text in node: Unsupported browser.");
  }
}

export default function CodePanel(props) {
  const {
    currentPreset,
    data,
    tool,
    contracts,
    risk,
    isRiskStatic,
    ranull,
    ranullMode,
    ranullPlus,
    ranullPlusMode,
    flagMirror,
    flagPR
  } = props;

  const [rollback, setRollback] = useState(tool.priceStep);
  const [rapradd, setRapradd] = useState(0.98);
  const [sizepradd, setSizepradd] = useState(100);

  useEffect(() => {
    setRollback(tool.priceStep);
  }, [tool.code]);

  const renderLine = (title, param, value) => {
    const codeElement = React.createRef();
    const textContent = `GParam.${param} = ${value}`;

    return (
      <div 
        className="code-panel-group"
        style={{ marginTop: title == null ? " -0.25em" : "" }}
      >
        {title != null &&
          <div className="code-panel-group-header">
            {title && <h3 data-should-output="true">{ title }</h3>}
            <button
              className="code-panel-group__copy-btn"
              onClick={e => {
                selectElementContent(codeElement.current);

                navigator.clipboard?.writeText(textContent)
                  .then(() => message.success("Скопировано!"))
                  .catch(error => message.error('Не удалось скопировать: ' + error));
              }}
            >
              копировать
            </button>
          </div>
        }
        <div className="code-panel-group-content">
          <pre ref={codeElement} onClick={e => selectElementContent(e.target)} data-should-output="true">
            {textContent}
          </pre>
        </div>

      </div>
    )
  };

  const Group = props => {
    const { title, mappedParams } = props;
    const beforeContent = props?.beforeContent;

    const codeElement = React.createRef();

    return (
      <div className="code-panel-group">
        <div className="code-panel-group-header">
          {title && <h3 data-should-output="true">{title}</h3>}
          <button
            className="code-panel-group__copy-btn"
            onClick={e => {
              selectElementContent(codeElement.current);

              navigator.clipboard?.writeText(codeElement.current.innerText)
                .then(() => message.success("Скопировано!"))
                .catch(error => message.error('Не удалось скопировать: ' + error));
            }}
          >
            копировать
          </button>
        </div>
        {beforeContent}
        <div ref={codeElement} className="code-panel-group-content">
          {Object.keys(mappedParams).map((param, index) =>
            <pre
              key={index}
              onClick={e => selectElementContent(e.target)}
              data-should-output="true"
            >
              GParam.{param} = {mappedParams[param]}
            </pre>
          )}
        </div>
      </div>
    )
  }

  return (
    <Stack className="code-panel">

      {Object.keys(data).map((key, index) => {
        const arr = data[key];

        // Не выводим закрытие плечевого депозита
        if (key == "Закрытие плечевого депозита") {
          return null
        }

        // Не выводим зеркальные докупки
        if (key == "Зеркальные докупки") {
          return null
        }

        const alwaysVisible = ["Прямые профитные докупки", "Обратные профитные докупки"];
        if ((alwaysVisible.indexOf(key) == -1) && !arr.on) {
          return null;
        }

        let title = `Массив ${!arr.isBying ? "закрытия" : "докупок"}:`;

        const showRollback = 
          (["СМС + ТОР", "Стандарт"].indexOf(currentPreset.type) > -1) && 
          (key == "Закрытие основного депозита" || key == "Обратные профитные докупки");

        let lastGroup = 0;
        let lastGroupObject = null;

        let parsedData = (arr || [])
          .map((v, index, arr) => {
            let { percent, points } = v;
            let formattedPoints = points;
            // Переводим ход в проценты только в лимитнике
            if (currentPreset.type == "Лимитник") {

              // Используем сложную формулу перевода в закрытии основного депозита
              if (key == "Закрытие основного депозита") {
                formattedPoints = stepConverter.complexFromStepsToPercent(points, tool, contracts);
              }
              else {
                formattedPoints = stepConverter.fromStepToPercents(points, tool, contracts);
              }

              formattedPoints = round(formattedPoints, 2);
            }

            // Корректируем процент для диапазонов
            if (v.group > lastGroup) {
              lastGroupObject = arr.find(row => row.group == lastGroup);
              lastGroup = v.group;
            }
            if (v.percentMode == "total" && lastGroupObject) {
              const percentsLeft = (100 - (v.percent * v.groupLength));
              if (percentsLeft < 0.01005) {
                percent = round((100 - (lastGroupObject.percent * lastGroupObject.groupLength)) / v.groupLength, 2);
              }
            }

            return `{${percent},${formattedPoints}${showRollback ? "," + rollback : ""}}`;
          })
          .join(",");
        parsedData = `{${parsedData}}`;

        if (key == "Закрытие основного депозита") {
          let suffix = (data["Закрытие плечевого депозита"] || [])
            .map((v, index, arr) => {
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

              // Корректируем процент для диапазонов
              if (v.group > lastGroup) {
                lastGroupObject = arr.find(row => row.group == lastGroup);
                lastGroup = v.group;
              }
              if (v.percentMode == "total" && lastGroupObject) {
                const percentsLeft = (100 - (v.percent * v.groupLength));
                if (percentsLeft < 0.01005) {
                  percent = round((100 - (lastGroupObject.percent * lastGroupObject.groupLength)) / v.groupLength, 2);
                }
              }

              return `{${percent},${pointsInPercents}${showRollback ? "," + rollback : ""}}`;
            })
            .join(",");

          if (suffix) {
            parsedData = `{${parsedData},{${suffix}}}`;
          }
          else if (currentPreset.type == "СМС + ТОР") {
            parsedData = "{" + parsedData + "}";
          }
        }

        // В Лимитнике и СМС + ТОР в массиве закрытия добавляем еще пару фигурных скобок
        if ((currentPreset.type == "Лимитник") && !arr.isBying) {
          parsedData = `{${parsedData}}`;
        }

        let param = currentPreset.type == "Лимитник" ? "profit_arr" : "stop_arr";
        if (key == "Обратные докупки (ТОР)") {
          param = currentPreset.type == "Лимитник" || currentPreset.type == "СМС + ТОР" ? "aapercent" : "aaperc";
        }
        else if (key == "Прямые профитные докупки") {
          title = "Массив прямых докупок";
          param = "aaperc";
          parsedData = (arr || [])
            .map((v, index, arr) => {
              let { percent, points } = v;
              // Корректируем процент для диапазонов
              if (v.group > lastGroup) {
                lastGroupObject = arr.find(row => row.group == lastGroup);
                lastGroup = v.group;
              }
              if (v.percentMode == "total" && lastGroupObject) {
                const percentsLeft = (100 - (v.percent * v.groupLength));
                if (percentsLeft < 0.01005) {
                  percent = round((100 - (lastGroupObject.percent * lastGroupObject.groupLength)) / v.groupLength, 2);
                }
              }
              return `{${percent},${points},true}`;
            })
            .join(",");
          parsedData = `{${parsedData}}`;

          return (
            <Group
              title={title}
              mappedParams={{ flagautoadd: String(data[key].on), [param]: parsedData }}
            />
          )
        }
        else if (key == "Обратные профитные докупки") {
          title = "Массив обратных профитных докупок";
          param = "aapercsh";
          parsedData = (arr || [])
            .map((v, index, arr) => {
              let { percent, points } = v;
              // Корректируем процент для диапазонов
              if (v.group > lastGroup) {
                lastGroupObject = arr.find(row => row.group == lastGroup);
                lastGroup = v.group;
              }
              if (v.percentMode == "total" && lastGroupObject) {
                const percentsLeft = (100 - (v.percent * v.groupLength));
                if (percentsLeft < 0.01005) {
                  percent = round((100 - (lastGroupObject.percent * lastGroupObject.groupLength)) / v.groupLength, 2);
                }
              }
              return `{${percent},${points}}`;
            })
            .join(",");
          parsedData = `{${parsedData}}`;

          return (
            <Group
              title={title}
              mappedParams={{ flautoaddsh: String(data[key].on), [param]: parsedData }}
            />
          )
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
                <Group
                  title={title}
                  mappedParams={{ [param]: parsedData }}
                />
              )
              return (
                <div className="code-panel-group"
                     style={{ marginBottom: "-1.5em" }}>

                  <div className="code-panel-group-header">
                    <h3 data-should-output="true">{title}</h3>
                    <button
                      className="code-panel-group__copy-btn"
                      onClick={e => {
                        selectElementContent(codeElement.current);

                        navigator.clipboard?.writeText(textContent)
                          .then(() => message.success("Скопировано!"))
                          .catch(error => message.error('Не удалось скопировать: ' + error));
                      }}
                    >
                      копировать
                  </button>
                  </div>
                  <div className="code-panel-group-content">
                    <pre onClick={e => selectElementContent(e.target)} ref={codeElement} data-should-output="true">
                      {textContent}
                    </pre>
                  </div>

                </div>
              )
            })()}
            <div className="code-panel-group">

              {!hideTitle &&
                <div className="code-panel-group-header">
                  <h3 data-should-output="true">{title}</h3>
                  <button
                    className="code-panel-group__copy-btn"
                    onClick={e => {
                      selectElementContent(codeElement.current);

                      navigator.clipboard?.writeText(textContent)
                        .then(() => message.success("Скопировано!"))
                        .catch(error => message.error('Не удалось скопировать: ' + error));
                    }}
                  >
                    копировать
                  </button>
                  {showRollback &&
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
                <pre onClick={e => selectElementContent(e.target)} ref={codeElement} data-should-output="true">
                  {textContent}
                </pre>
              </div>

            </div>
          </>
        )
      })}

      {(currentPreset.type == "Лимитник" || currentPreset.type == "СМС + ТОР") && 
        renderLine("Массив зеркальных докупок", "flagmirroradd", flagMirror)
      }

      {(currentPreset.type == "Лимитник" || currentPreset.type == "СМС + ТОР") &&
        <Group
          title="Перевыставление в точку входа"
          beforeContent={
            <>
              <label>
                Размер отступа от цены закрытия
                <NumericInput
                  className="code-panel-group__input"
                  defaultValue={rapradd}
                  format={value => round(value, 2)}
                  onBlur={rapradd => setRapradd(rapradd)}
                  suffix={currentPreset.type == "Лимитник" ? "%" : "п"}
                />
              </label>
              <label>
                Доля автоматической докупки
                <NumericInput
                  className="code-panel-group__input"
                  defaultValue={sizepradd}
                  format={value => round(value, 2)}
                  onBlur={sizepradd => setSizepradd(sizepradd)}
                  suffix="%"
                />
              </label>
            </>
          }
          mappedParams={{ flagpradd: String(flagPR), rapradd, sizepradd }}
        />
      }

      {(() => {
        let condition = isRiskStatic;
        if (data["Обратные докупки (ТОР)"]?.on) {
          condition = false;
        }

        if (currentPreset.type == "Лимитник") {
          return (
            <Group
              title="Риск"
              mappedParams={{ depo_stop: `{${!condition ? risk : 0},${condition ? risk : 0}}` }}
            />
          )
          return renderLine("Риск", "depo_stop", `{${!condition ? risk : 0},${condition ? risk : 0}}`)
        }

        return (
          <Group
            title="Риск"
            mappedParams={{ rastop: condition ? risk : 0, depo_stop: condition ? 0 : risk }}
          />
        )
        return (
          <>
            {renderLine("Риск",  "rastop", condition ? risk : 0)}
            {renderLine(null, "depo_stop", condition ? 0 : risk)}
          </>
        )
      })()}

      {(() => {
        let ranullValue = round(ranullMode ? ranull * tool.priceStep : ranull / 100, 2);
        if (currentPreset.type == "Лимитник") {
          ranullValue = round(ranull / 100, 2);
        }
        ranullValue = ranullMode ? `${ranullValue},0` : `0,${ranullValue}`;
        ranullValue = "{" + ranullValue + "}";

        let ranullPlusValue = round(ranullPlusMode ? ranullPlus * tool.priceStep : ranullPlus / 100, 2);
        if (currentPreset.type == "Лимитник") {
          ranullPlusValue = round(ranullPlus / 100, 2);
          ranullPlusValue = ranullPlusMode ? `${ranullPlusValue},0` : `0,${ranullPlusValue}`;
          ranullPlusValue = "{" + ranullPlusValue + "}";
        }

        return (
          <Group
            title="Безубыток"
            mappedParams={{ ranull: ranullValue, ranullplus: ranullPlusValue }}
          />
        )
        return renderLine("Безубыток", "ranull", "{" + content + "}");
      })()}

      {(() => {
        return;
        let value = round(ranullPlusMode ? ranullPlus * tool.priceStep : ranullPlus / 100, 2);
        let content = value;
        if (currentPreset.type == "Лимитник") {
          value = round(ranullPlus / 100, 2);
          content = ranullPlusMode ? `${value},0` : `0,${value}`;
          content = "{" + content + "}";
        }
        return (
          <Group
            mappedParams={{ ranullplus: content }}
          />
        )
        return renderLine(null, "ranullplus", content);
      })()}

    </Stack>
  );
}