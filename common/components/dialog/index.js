import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'antd/es'

import CrossButton from "../cross-button"

import "./style.sass"

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
  const dialogs = document.querySelectorAll(".dialog:not([hidden])");
  return dialogs[dialogs.length - 1];
}

dialogAPI.trapFocus = event => {
  event.stopPropagation();

  const dialogHTML = dialogAPI.getCurrentDialog();
  const dialogContentHTML = dialogHTML.querySelector(".dialog__inner");
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
  // const key = event.which || event.keyCode;

  // if (key === 27) {
  //   dialogAPI.closeLast();
  //   event.stopPropagation();
  // }
}

dialogAPI.handleClick = event => {
  if (event.target == dialogAPI.getCurrentDialog()) {
    dialogAPI.closeLast();
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
  dialogAPI.focusFirstDescendant(dialogHTML.querySelector(".dialog__inner"));
  // Set lastFocus as the first focusable descendent
  dialogHTML.lastFocus = dialogAPI.getFocusableDescendants(dialogHTML.querySelector(".dialog__inner"))[0];
  // Disable scrolling
  document.body.classList.add("scroll-disabled");
  // Trap focus
  document.addEventListener("focus", dialogAPI.trapFocus, true);
  // Close dialog on Escape
  document.addEventListener("keyup", dialogAPI.handleEscape);
  // Close on click outside the dialog
  // document.addEventListener("click", dialogAPI.handleClick);
}

dialogAPI.closeLast = () => {
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

dialogAPI.close = dialogID => {
  const dialogHTML = document.getElementById(dialogID);;
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

  componentDidMount() {
    window.addEventListener("keyup", event => {
      const key = event.which || event.keyCode;

      if (key === 27) {
        this.onClose();
        event.stopPropagation();
      };
    })
  }

  onConfirm() {
    const { onConfirm } = this.props;
    if (onConfirm) {
      if (onConfirm()) {
        dialogAPI.closeLast();
      }
    }
  }

  onCancel() {
    const { onCancel, onClose } = this.props;
    var callback = onCancel || onClose;
    if (callback) {
      if (callback()) {
        dialogAPI.closeLast();
      }
    }
    else {
      dialogAPI.closeLast();
    }
  }

  onClose() {
    const { onClose } = this.props;
    if (onClose) {
      if (onClose()) {
        dialogAPI.closeLast();
      }
    }
    else {
      dialogAPI.closeLast();
    }
  }

  render() {
    let {
      id,
      className,
      title,

      contentClassName,

      footer,
      hideFooter,

      confirmText,
      confirmClass,
      hideConfirm,
      
      cancelText,
      cancelClass,
      hideCancel,
    } = this.props;
    
    className = className || "";
    const block = "dialog";

    contentClassName = contentClassName || "";

    return (
      <div
        id={id}
        className={[].concat(block).concat(className).join(" ").trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        hidden={true}
        onClick={e => {
          if (e.target.classList.contains(block)) {
            this.onClose();
          }
        }}>
        <div tabIndex="0" aria-hidden="true"></div>
        <div className={`${block}__inner card`}>
          <div className={["stack"].concat(className).join(" ").trim()}>
            <h2 className={`${block}__title`}>{title}</h2>

            <div className={`${block}__content`}>
              {this.props.children}
            </div>

            {footer 
              ? footer
              : !hideFooter && (
              <div className={`${block}-footer-wrap`}>
                <footer className={`${block}-footer`}>

                  {!hideCancel && (
                    <Button
                      className={[].concat("custom-btn").concat(cancelClass).join(" ").trim()}
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
            )}

          </div>
          <CrossButton 
            className={`${block}__close`}
            onClick={e => this.onClose()}
          />
        </div>
        <div tabIndex="0" aria-hidden="true"></div>
      </div>
    )
  }
}

export { Dialog, dialogAPI };
