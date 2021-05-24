import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";

import NanniLogo from "../../image/nanni.svg";
import { CloseOutlined } from "@ant-design/icons";
import "./style.scss";
import axios from "axios";

export const NanniBot = () => {
  const messages = [
    {
      id: 0,
      text: "Работа со страхом. Чем вызвана тревожность?",
      choices: ["Просадка по депозиту", "Другое"],
      correct: 0,
    },
    {
      id: 1,
      text: "Какой размер просадки?",
      choices: ["Меньше 10%", "Больше 10%"],
      correct: 1,
    },
    {
      id: 2,
      text: "Какая загрузка депозита?",
      choices: ["Меньше 50%", "Больше 50%"],
      correct: 1,
    },
    {
      id: 3,
      text: "Какое количество инструментов в работе?",
      choices: ["Один", "Несколько"],
      correct: 1,
    },
    {
      id: 4,
      text: "Советуем закрыть плюсовые позиции. На оставшийся объем запустить прямую разгрузку роботом МАНИ Лимитник для снижения суммарной загрузки по депозиту до 30%. Как только загрузка по депозиту придёт в норму, смоделируйте ситуацию по каждому из инструментов в МТС сервиса ФАНИ и запустите алгоритм робота МАНИ 144 СМС+ТОР с зеркальными докупками, с необходимыми для выхода в профит настройками. Подробнее: https://fani144.ru/mts/",
      choices: [],
    },
  ];
  const [chatOpen, setChatOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [haveUnread, setHaveUnread] = useState(false);
  const [messageLog, setMessageLog] = useState([]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const printMessage = () => {
    setTimeout(() => {
      setBotTyping(true);
    }, 500);

    setTimeout(() => {
      console.log(messages[messageLog.length]);
      setMessageLog([...messageLog, messages[messageLog.length]]);
      setBotTyping(false);
      setHaveUnread(true);
      scrollToBottom();
    }, 1500);
  };

  const setMessageChosen = (choiceIdx, messageIdx) => {
    const log = [...messageLog];
    log[messageIdx].chosen = choiceIdx;

    setMessageLog(log);
  };

  const whatChosen = (choiceIdx, messageIdx) => {
    if ("chosen" in messageLog[messageIdx]) {
      if (choiceIdx === messageLog[messageIdx].chosen) {
        if (messageIdx === 0) return "chosen first";
        else return "chosen nth";
      } else {
        if (messageIdx === 0) return "hidden fade-to-top";
        else return "hidden fade-out-right";
      }
    } else return "";
  };

  useEffect(async () => {
    // await axios
    //   .get("http://nimba.ru:82/nanni/has_session?user_id=user@mail.ru", {
    //     headers: { "Content-Type": "application/json" },
    //   })
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((err) => console.log(err));
    fetch("http://nimba.ru:82/nanni/has_session", {
      body: "{'user_id':'user@mail.ru'}",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  }, []);

  return (
    <div className={`nanni ${chatOpen ? "active" : ""}`}>
      <Button
        type="primary"
        shape="round"
        onClick={() => {
          setChatOpen(true);
          if (!messageLog.length) printMessage();
        }}
        className="nanni-btn"
      >
        <img src={NanniLogo} />
        Talk to NANNI Bot
      </Button>
      <div className="nanni-chat">
        <div className="chat-header">
          <div className={`new-messages ${haveUnread ? "unread" : ""}`}>
            <img src={NanniLogo} />
          </div>
          <div className="info">
            <div className="name">NANNI Bot</div>
            {botTyping ? (
              <div className="botTyping">
                Печатает<span className="dot dot1">.</span>
                <span className="dot dot2">.</span>
                <span className="dot">.</span>
              </div>
            ) : (
              <div className="status">Онлайн</div>
            )}
          </div>
          <Button
            shape="circle"
            onClick={async () => {
              await setChatOpen(false);
              await setHaveUnread(false);
              await setMessageLog([]);
            }}
          >
            <CloseOutlined />
          </Button>
        </div>
        <div className="chat-body">
          {messageLog.map((message, messageIdx) => {
            return (
              <div className="message" key={message.id}>
                <div className="question">
                  <div className="icon">
                    <img src={NanniLogo} />
                  </div>
                  <div className="content">
                    <div className="question-header">
                      <div className="name">NANNI Bot</div>
                      <div className="time">16:15</div>
                    </div>
                    <div className="question-body">{message.text}</div>
                  </div>
                </div>

                <div className="choices">
                  {message.choices.map((choice, choiceIdx) => {
                    return (
                      <div
                        className={`choice ${whatChosen(
                          choiceIdx,
                          messageIdx
                        )}`}
                      >
                        <button
                          key={choiceIdx}
                          disabled={message.hasOwnProperty("chosen")}
                          onClick={() => {
                            if (choiceIdx === message.correct) {
                              setMessageChosen(choiceIdx, messageIdx);
                              setHaveUnread(false);
                              printMessage();
                            }
                          }}
                        >
                          {choice}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div
            style={{ float: "left", clear: "both" }}
            ref={messagesEndRef}
          ></div>
        </div>
      </div>
    </div>
  );
};
