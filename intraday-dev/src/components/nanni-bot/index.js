import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Tooltip } from "antd";
import { GlobalContext } from "../../context/GlobalState";


// import NanniLogo from "../../image/nanni.png";

import { CloseOutlined } from "@ant-design/icons";
import "./style.scss";

import $ from "jquery";

export const NanniBot = () => {
  const [userID,     setUserID]     = useState("user@mail.ru");
  const [chatOpen,   setChatOpen]   = useState(false);
  const [botTyping,  setBotTyping]  = useState(false);
  const [haveUnread, setHaveUnread] = useState(false);
  const [messageLog, setMessageLog] = useState([]);

  const { loading, setImageUrl, nodeId, setNodeId, askNumber, setAskNumber, setContinueNaniSession, continueNaniSession} = useContext(GlobalContext);

  useEffect(() => {
    getInvestorInfo();
  }, []);

  // useEffect(() => {
  //   cancelSession();
  // }, [userID]);

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
          ? (whatChosen = "fade-out-right margin-unset")
          : (whatChosen = "fade-out-right fade-to-top  margin-unset");
      }
    }
    return whatChosen;
  };

  const conclusionChosen = (messageIdx) => {
    if ("chosen" in messageLog[messageIdx]) return "chosen";
    else return "";
  };

  const hasSession = async () => {
    console.log("hasSession");
    const response = await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/has_session",
        method: "GET",
        data: JSON.stringify({ user_id: userID }),
      },
      success: function (response) {
        let res = JSON.parse(response);
        console.log(res, "has_session (response)");
        if (res.has_session == true) {
          setContinueNaniSession(true)
        }
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
    console.log("ask с (node_id, ask_number) | вопрос и варианты ответа ");
    const response = await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/ask",
        method: "GET",
        data: JSON.stringify({ user_id: userID }) 
      },
      success: function (response) {
        setNodeId(   JSON.parse(response).node_id);
        setAskNumber(JSON.parse(response).ask_number);
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
    }, 800);
  };

  const answerConclusion = async (messageIdx) => {
    console.log("answerConclusion");
    await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/answer",
        method: "POST",
        data: JSON.stringify({
          user_id: userID,
          answer: {
            node_id: nodeId,
            ask_number: askNumber
          },
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

  const sendAnswer = async (choiceIdx, messageIdx) => {
    console.log("answer в который передаём node_id ask_number | choiceId (выбранный вариант) и messageIdx");
    const response = await $.ajax({
      url: "https://fani144.ru/local/php_interface/s1/ajax/proxy/",
      method: "POST",
      data: {
        url: "http://nimba.ru:82/nanni/answer",
        method: "POST",
        data: JSON.stringify({
          user_id:      userID,
          ask_unique_id:    "",
          answer_unique_id: "",
          answer: {
            choice:     choiceIdx,
            node_id:       nodeId,
            ask_number: askNumber
          },
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

  const botInit = async () => {
    setChatOpen(true);

    let node_id
    let ask_number

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
    await setTimeout(scrollToBottom(), 700);
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
    document.body.style.position  = "";
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
      return (
        replaceURLs(text)
          .replace(/\n/g, "<br>")
          .replace(/\t/g, "&nbsp&nbsp&nbsp")
          .replace(//g, "&#8226")
      );
    }
  };

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

                          {(() => {
                              return (
                              message.attributes.attributes && (
                                message.attributes.attributes.map((item, index) => {
                                  let base = message.attributes.attributes[index];
                                  return (
                                    <>
                                      {base.type == "video" && (
                                        <div key={index}>
                                          {
                                            base.description && (
                                              <>
                                                <br/>
                                                <b>{base.description}:</b>
                                                <br/>
                                              </>
                                            )
                                          }
                                          {
                                            base.value && (
                                              <iframe width="560" height="315" 
                                                src={
                                                  `https://www.youtube.com/embed/${
                                                    base.value
                                                    .replace("https://youtu.be/", "")
                                                    .replace("embed//", "embed/")
                                                  }`
                                                } 
                                                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                            )
                                          }
                                        </div>
                                      )}

                                      {base.type == "file" && (
                                        <div key={index} className={base.type}>
                                          {base.description && (<b>{base.description}:</b>)}
                                          { 
                                            base.value && (
                                              <Tooltip title="Перейти к документу" placement="left">
                                                <Button>
                                                  <a href={base.value} target="_blank">
                                                    <svg width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M239.029 384.97a24 24 0 0033.942 0l90.509-90.509a24 24 0 000-33.941 24 24 0 00-33.941 0L280 310.059V48a24 24 0 00-48 0v262.059l-49.539-49.539a24 24 0 00-33.941 0 24 24 0 000 33.941z"></path><path d="M464 232a24 24 0 00-24 24v184H72V256a24 24 0 00-48 0v192a40 40 0 0040 40h384a40 40 0 0040-40V256a24 24 0 00-24-24z"></path></svg>
                                                  </a>
                                                </Button>
                                              </Tooltip>
                                            )
                                          }
                                        </div>
                                      )}
                                      
                                      {base.type == "image" && (
                                        <div className="image-container">
                                          {base.description && (<b>{base.description}:</b>)}
                                          <img
                                            src={String(base.value)}
                                            onClick={() => {
                                              setImageUrl(String(base.value))
                                              document.querySelector(".image-zoom-container").classList.add(("block"));
                                            }}
                                          />
                                        </div>
                                      )}
                                    </>
                                  )
                                })
                              )
                            )
                          })()}
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
          {continueNaniSession === true && messageLog.length == 0 && (
            <div className="continue-chat-container">
              <Button
                onClick={() => {
                  askQuestion();
                  setContinueNaniSession(false)

                  setTimeout(() => {
                    setBotTyping(true);
                  }, 500);

                  setTimeout(() => {
                    setBotTyping(false);
                  }, 800);
                }}
              >Продолжить чат</Button>
            </div>
          )}
          <div
            style={{ float: "left", clear: "both" }}
            ref={messagesEndRef}
          ></div>
        </div>
      </div>
    </div>
  );
};
