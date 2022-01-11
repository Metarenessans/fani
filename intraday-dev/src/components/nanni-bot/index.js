import React, { useState, useEffect, useRef, useContext } from "react";
import { Button } from "antd";
import { GlobalContext } from "../../context/GlobalState";


// import NanniLogo from "../../image/nanni.png";

import { CloseOutlined } from "@ant-design/icons";
import "./style.scss";

import $ from "jquery";

export const NanniBot = () => {
  const [userID, setUserID] = useState("user@mail.ru");
  const [chatOpen, setChatOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [haveUnread, setHaveUnread] = useState(false);
  const [messageLog, setMessageLog] = useState([]);

  useEffect(() => {
    getInvestorInfo();
  }, []);

  useEffect(() => {
    cancelSession();
  }, [userID]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView();
  };

  const messageRef = useRef(null);
  const scrollToMessage = () => {
    messageRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const getInvestorInfo = async () => {
    try {
      await $.ajax({
        url: "https://fani144.ru/local/php_interface/s1/ajax/?method=getInvestorInfo",
        success: function (response) {
          const error = JSON.parse(response).error;
          if (!error) setUserID(JSON.parse(response).data.email);
          else setUserID("user@mail.ru");
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const setMessageChosen = (choiceIdx, messageIdx) => {
    const log = [...messageLog];
    log[messageIdx].chosen = choiceIdx;

    setMessageLog(log);
  };

  const setMessagePrinted = async () => {
    const log = [...messageLog];
    log.map((message, idx) => {
      if (idx !== log.length - 1) message.printed = true;
      return message;
    });

    setMessageLog(log);
  };

  const whatChosen = (choiceIdx, messageIdx) => {
    let whatChosen = "";
    if ("chosen" in messageLog[messageIdx]) {
      if (choiceIdx === messageLog[messageIdx].chosen) {
        choiceIdx === 0
          ? (whatChosen = "chosen first")
          : (whatChosen = "chosen nth");
      } else {
        choiceIdx === 0
          ? (whatChosen = "fade-out-right")
          : (whatChosen = "fade-to-top");
      }
    }
    return whatChosen;
  };

  const conclusionChosen = (messageIdx) => {
    if ("chosen" in messageLog[messageIdx]) return "chosen";
    else return "";
  };

  const hasSession = async () => {
    const response = await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/has_session",
        method: "GET",
        data: JSON.stringify({ user_id: userID }),
      },
      success: function (response) {
        return response;
      },
    });

    return JSON.parse(response).has_session;
  };

  const startSession = async () => {
    await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/start_session",
        method: "PUT",
        data: JSON.stringify({ user_id: userID }),
      },
      success: function (response) {
        console.log("Session has started to", userID);
      },
    });
  };

  const cancelSession = async () => {
    await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/cancel_session",
        method: "DELETE",
        data: JSON.stringify({ user_id: userID }),
      },
      success: function (response) {
        console.log("Session canceled to", userID);
      },
    });
  };

  const askQuestion = async () => {
    const response = await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/ask",
        method: "GET",
        data: JSON.stringify({ user_id: userID }),
      },
      success: function (response) {
        return response;
      },
    });
    const message = JSON.parse(response);
    message.time = currentTime();

    setTimeout(() => {
      setBotTyping(true);
    }, 500);

    setTimeout(() => {
      setBotTyping(false);
      setHaveUnread(true);
      setMessageLog([...messageLog, message]);
      scrollToMessage();
    }, 1500);
  };

  const sendAnswer = async (choiceIdx, messageIdx) => {
    const response = await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/answer",
        method: "POST",
        data: JSON.stringify({
          user_id: userID,
          answer: { choice: choiceIdx },
        }),
      },
      success: function (response) {
        return response;
      },
    });

    setMessageChosen(choiceIdx, messageIdx);
    setHaveUnread(false);

    const coversationFinished = JSON.parse(response).conversation_finished;

    if (!coversationFinished) {
      await askQuestion();
    } else {
      await cancelSession();
    }
  };

  const answerConclusion = async (messageIdx) => {
    await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/answer",
        method: "POST",
        data: JSON.stringify({
          user_id: userID,
          answer: {},
        }),
      },
      success: function (response) {
        return response;
      },
    });

    setMessageChosen(0, messageIdx);
    setHaveUnread(false);

    await askQuestion();
  };

  const botInit = async () => {
    setChatOpen(true);

    if (window.matchMedia("(max-width: 767px)").matches) {
      document.body.style.overflowY = "hidden";
      document.body.style.position = "fixed";
    }

    const session = await hasSession();

    if (!session) {
      await startSession();
      await askQuestion();
    }
    await setMessagePrinted();
    scrollToBottom();
  };

  const currentTime = () => {
    const today = new Date();
    const min = today.getMinutes();
    return today.getHours() + ":" + (min < 10 ? "0" + min : min);
  };

  const closeChat = () => {
    setChatOpen(false);
    setHaveUnread(false);
    document.body.style.overflowY = "";
    document.body.style.position = "";
  };

  const replaceURLs = (message) => {
    if (!message) return;

    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.replace(urlRegex, (url) => {
      let hyperlink = url;
      if (!hyperlink.match('^https?:\/\/')) {
        hyperlink = 'http://' + hyperlink;
      }
      return '<a href="' + hyperlink + '" target="_blank">' + url + '</a>'
    });
  }

  const convertToHtml = text => {
    if (text) {
      return replaceURLs(text).replace(/\n/g, "<br>");
    }
  };

  const { loading } = useContext(GlobalContext);

  return (
    <div className={`nanni ${chatOpen ? "active" : ""}`}>
      <Button
        disabled={loading}
        type="primary"
        shape="round"
        onClick={() => botInit()}
        className="nanni-btn"
      >
        <img className="bot-icon" src={`img/nanni.png`}/>
        Talk to NANNI Bot
      </Button>
      <div className="nanni-chat">
        <div className="chat-header">
          <div className={`new-messages ${haveUnread ? "unread" : ""}`}>
            <img className="bot-icon" src={`img/nanni.png`}/>
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
            className="close-session"
            type="ghost"
            size="small"
            style={{
              height: "auto",
            }}
            onClick={async () => {
              await cancelSession();
              setMessageLog([]);
              closeChat();
            }}
          >
            Завершить
            <br />
            разговор
          </Button>
          <Button
            className="close-chat"
            shape="circle"
            onClick={() => {
              closeChat();
            }}
          >
            <CloseOutlined />
          </Button>
        </div>
        <div className="chat-body">
          {messageLog.map((message, messageIdx) => {
            return (
              <div className="message" key={messageIdx} ref={messageRef}>
                <div
                  className={`question fade-in-left ${
                    message.hasOwnProperty("chosen") ? "chosen" : ""
                  } ${message.hasOwnProperty("printed") ? "printed" : ""}`}
                >
                  <div className="icon">
                    <img className="bot-icon" src={`img/nanni.png`}/>
                  </div>
                  <div className="content">
                    <div className="question-header">
                      <div className="name">NANNI Bot</div>
                      <div className="time">{message.time}</div>
                    </div>
                    <div className="question-body">
                      {message.question_with_choice ? (
                        message.question_with_choice.question
                      ) : message.conclusion.description ? (
                        <div>
                          <p>
                            <b>{message.conclusion.title}</b>
                          </p>
                          <p dangerouslySetInnerHTML={{ __html: convertToHtml(message.conclusion.description) }}/>
                        </div>
                      ) : (
                        message.conclusion.title
                      )}
                    </div>
                  </div>
                </div>
                {message.question_with_choice ? (
                  <div className="choices">
                    {message.question_with_choice.possible_answers.map(
                      (choice, choiceIdx) => {
                        return (
                          <div
                            className={`choice fade-in-right ${whatChosen(
                              choiceIdx,
                              messageIdx
                            )} ${
                              message.hasOwnProperty("printed") ? "printed" : ""
                            }`}
                            key={choiceIdx}
                          >
                            <button
                              key={choiceIdx}
                              disabled={message.hasOwnProperty("chosen")}
                              onClick={() => sendAnswer(choiceIdx, messageIdx)}
                            >
                              {choice}
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : message.conclusion.is_final ? (
                  <div className="choices">
                    <div
                      className={`choice fade-in-right ${conclusionChosen(
                        messageIdx
                      )} ${message.hasOwnProperty("printed") ? "printed" : ""}`}
                    >
                      <button
                        disabled={message.hasOwnProperty("chosen")}
                        onClick={async () => {
                          await cancelSession();
                          closeChat();
                          setMessageLog([]);
                        }}
                      >
                        Ок, понятно
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="choices">
                    <div
                      className={`choice fade-in-right ${conclusionChosen(
                        messageIdx
                      )} ${message.hasOwnProperty("printed") ? "printed" : ""}`}
                    >
                      <button
                        disabled={message.hasOwnProperty("chosen")}
                        onClick={() => answerConclusion(messageIdx)}
                      >
                        Ок
                      </button>
                    </div>
                  </div>
                )}
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
