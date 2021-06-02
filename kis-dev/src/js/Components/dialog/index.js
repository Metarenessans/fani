import React from 'react'
import ReactDOM from 'react-dom'
import {
  Button,
} from 'antd/es'

import "./style.sass"

var bodyHTML = document.createElement(null);

var dialogAPI = {};

dialogAPI.getFocusableDescendants = element => {
  return element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
}

dialogAPI.focusFirstDescendant = element => {
  const focusable = dialogAPI.getFocusableDescendants(element);
  focusable[0].focus();
}

dialogAPI.focusLastDescendant = element => {
  const focusable = dialogAPI.getFocusableDescendants(element);
  focusable[focusable.length - 1].focus();
}

dialogAPI.getCurrentDialog = () => {
  return document.querySelector(".dialog:not([hidden])");
}

dialogAPI.trapFocus = event => {
  event.stopPropagation();

  const dialogHTML = dialogAPI.getCurrentDialog();
  const dialogContentHTML = dialogHTML.querySelector(".dialog-content");
  const focusable = dialogAPI.getFocusableDescendants(dialogContentHTML);

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

dialogAPI.handleEscape = (event) => {
  const key = event.which || event.keyCode;

  if (key === 27) {
    dialogAPI.close();
    event.stopPropagation();
  }
}

dialogAPI.handleClick = event => {
  if (event.target == dialogAPI.getCurrentDialog()) {
    dialogAPI.close();
  }
}

dialogAPI.open = (dialogID, initiator) => {
  const dialogHTML = document.getElementById(dialogID);
  if (!dialogHTML) {
    return;
  }
  // Remember initiator
  dialogHTML.initiator = initiator ? initiator : document.activeElement;
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

dialogAPI.close = () => {
  const dialogHTML = dialogAPI.getCurrentDialog();
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
  if (dialogHTML.initiator) {
    dialogHTML.initiator.focus();
  }
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

  onConfirm() {
    const { onConfirm } = this.props;
    if (onConfirm) {
      if (onConfirm()) {
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
    let {
      id,
      className,
      title,
      hideFooter,
      confirmText,
      hideConfirm,
      cancelText,
      hideCancel,
    } = this.props;
    className = className || "";

    const blockClass = "dialog";

    return (
      <div
        id={id}
        className={blockClass}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        hidden={true}
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

                      {!hideCancel && (
                        <Button
                          className="custom-btn"
                          onClick={() => this.onCancel()}>
                          {cancelText ? cancelText : "Отмена"}
                        </Button>
                      )}

                      {!hideConfirm && (
                        <Button
                          className="custom-btn custom-btn--filled"
                          type="primary"
                          onClick={() => this.onConfirm()}>
                          {confirmText ? confirmText : "Сохранить"}
                        </Button>
                      )}

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
