import React from 'react'
import ReactDOM from 'react-dom'
import {
  Button,
} from 'antd/es'

import "./style.sass"

var bodyHTML = document.createElement(null);

var dialogAPI = {};

dialogAPI.getFocusableDescendants = function(element) {
  return element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
}

dialogAPI.focusFirstDescendant = function(element) {
  var focusable = dialogAPI.getFocusableDescendants(element);
  focusable[0].focus();
}

dialogAPI.focusLastDescendant = function(element) {
  var focusable = dialogAPI.getFocusableDescendants(element);
  focusable[focusable.length - 1].focus();
}

dialogAPI.getCurrentDialog = function() {
  return document.querySelector(".dialog:not([hidden])");
}

dialogAPI.trapFocus = function(event) {
  event.stopPropagation();

  var dialogHTML = dialogAPI.getCurrentDialog();
  var dialogContentHTML = dialogHTML.querySelector(".dialog-content");
  var focusable = dialogAPI.getFocusableDescendants(dialogContentHTML);

  if (dialogContentHTML.contains(event.target)) {
    dialogHTML.lastFocus = event.target;
  }
  else {
    if (dialogHTML.lastFocus == focusable[0]) {
      dialogAPI.focusLastDescendant(dialogContentHTML);
    }
    else {
      dialogAPI.focusFirstDescendant(dialogContentHTML);
    }
    dialogHTML.lastFocus = document.activeElement;
  }
}

dialogAPI.handleEscape = function(event) {
  var key = event.which || event.keyCode;

  if (key === 27) {
    dialogAPI.close();
    event.stopPropagation();
  }
}

dialogAPI.handleClick = function(event) {
  if (event.target == dialogAPI.getCurrentDialog()) {
    dialogAPI.close();
  }
}

dialogAPI.open = function(dialogID, initiator) {
  var dialogHTML = document.getElementById(dialogID);
  if (!dialogHTML) {
    return;
  }
  // Remember initiator
  dialogHTML.initiator = initiator;
  // Show dialog
  dialogHTML.removeAttribute("hidden");
  // Focus first descendent
  dialogAPI.focusFirstDescendant(dialogHTML.querySelector(".dialog-content"));
  // Set lastFocus as the first focusable descendent
  dialogHTML.lastFocus = dialogAPI.getFocusableDescendants(dialogHTML.querySelector(".dialog-content"))[0];
  // Disable scrolling
  document.body.classList.add("scroll-disabled");
  // Trap focus
  document.addEventListener("focus", dialogAPI.trapFocus, true);
  // Close dialog on Escape
  document.addEventListener("keyup", dialogAPI.handleEscape);
  // Close on click outside the dialog
  document.addEventListener("click", dialogAPI.handleClick);
}

dialogAPI.close = function() {
  var dialogHTML = dialogAPI.getCurrentDialog();
  if (!dialogHTML) {
    return;
  }
  // Hide dialog
  dialogHTML.setAttribute("hidden", "");
  // Enable scrolling
  document.body.classList.remove("scroll-disabled");
  // Release focus
  document.removeEventListener("focus", dialogAPI.trapFocus, true);
  // Return focus to initiator
  dialogHTML.initiator.focus();
}

// TODO: accessible close button that is visible only when focused
class Dialog extends React.Component {

  constructor(props) {
    super(props);

    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  onOk() {
    const { onOk } = this.props;
    if (onOk) {
      if (onOk()) {
        dialogAPI.close();
      }
    }
  }

  onCancel() {
    const { onCancel, onClose } = this.props;
    var callback = onCancel || onClose;
    if (callback) {
      if (callback()) {
        dialogAPI.close();
      }
    }
    else {
      dialogAPI.close();
    }
  }

  onClose() {
    const { onClose } = this.props
    if (onClose) {
      if (onClose()) {
        dialogAPI.close()
      }
    }
  }

  render() {
    var { id, className, title, hideFooter, okContent, cancelContent } = this.props;
    className = className || "";

    var blockClass = "dialog";

    return (
      <div
        id={id}
        className={blockClass}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        hidden="true"
        onClick={e => {
          if (e.target.classList.contains(blockClass)) {
            this.onClose();
          }
        }}>
        <div tabIndex="0" aria-hidden="true"></div>
        <div className={`${blockClass}-content`}>

          {

            <div className={
              ["card"]
                .concat(className)
                .join(" ")
                .trim()
            }>
              <h2 className={`${blockClass}__title`}>{title}</h2>

              {this.props.children}

              {
                !hideFooter && (

                  <div className={`${blockClass}-footer-wrap`}>
                    <footer className={`${blockClass}-footer`}>
                      <Button
                        className="custom-btn"
                        onClick={() => this.onCancel()}>
                        {cancelContent ? cancelContent : "Отмена"}
                      </Button>
                      <Button
                        className="custom-btn custom-btn--filled"
                        type="primary"
                        onClick={() => this.onOk()}>
                        {okContent ? okContent : "Сохранить"}
                      </Button>
                    </footer>
                  </div>

                )
              }

            </div>

          }

        </div>
        <div tabIndex="0" aria-hidden="true"></div>
      </div>
    )
  }
}

export { Dialog, dialogAPI };
