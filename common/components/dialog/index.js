import React, { memo } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import clsx from "clsx";

import CrossButton from "../cross-button";
import Stack from "../stack";

import "./style.sass";

var dialogAPI = {};

dialogAPI.getFocusableDescendants = element => {
  return element.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
};

dialogAPI.focusFirstDescendant = element => {
  let elementToFocus;
  const focusFirstElement = element.querySelector(".js-dialog-focus-first");
  if (focusFirstElement) {
    elementToFocus = focusFirstElement;
  }
  else {
    const focusable = dialogAPI.getFocusableDescendants(element);
    elementToFocus = focusable[0];
  }

  elementToFocus.focus();
};

dialogAPI.focusLastDescendant = element => {
  const focusable = dialogAPI.getFocusableDescendants(element);
  focusable[focusable.length - 1].focus();
};

dialogAPI.getCurrentDialog = () => {
  const dialogs = document.querySelectorAll(".dialog:not([hidden])");
  return dialogs[dialogs.length - 1];
};

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
};

dialogAPI.handleEscape = (event) => {
  // const key = event.which || event.keyCode;

  // if (key === 27) {
  //   dialogAPI.closeLast();
  //   event.stopPropagation();
  // }
};

dialogAPI.handleClick = event => {
  if (event.target == dialogAPI.getCurrentDialog()) {
    dialogAPI.closeLast();
  }
};

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
};

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
};

dialogAPI.close = dialogID => {
  const dialogHTML = document.getElementById(dialogID);
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
};

const propTypes = {
  /**
   * Заголовок
   * 
   * @type {string|JSX.Element}
   */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Класс обертки, внутри которой будет отрендерено содержимое компонента
   * 
   * @type {string}
   */
  contentClassName: PropTypes.string,

  /**
   * Перезаписывает содержимое нижней части диалогового окна
   * 
   * @type {JSX.Element}
   */
  footer: PropTypes.element,

  /**
   * Прячет футер, если `true`
   * 
   * @type {boolean}
   */
  hideFooter: PropTypes.bool,

  /**
   * Текстовое содержимое кнопки подтверждения
   * 
   * @type {string|JSX.Element}
   */
  confirmText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  
  /**
   * Класс кнопки подтверждения
   * 
   * @type {string}
   */
  confirmClass: PropTypes.string,
  
  /**
   * Если `true`, то кнопка подтверждения будет скрыта
   * 
   * @type {boolean}
   */
  hideConfirm: PropTypes.bool,

  /**
   * Текстовое содержимое кнопки отмены
   * 
   * @type {string|JSX.Element}
   */
  cancelText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Класс кнопки отмены
   * 
   * @type {string}
   */
  cancelClass: PropTypes.string,

  /**
   * Текстовое содержимое кнопки отмены
   * 
   * @type {string|JSX.Element}
   */
  hideCancel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Режим "чистого" модального окна: прячет заголовок и футер
   * 
   * По умолчанию режим выключен
   * 
   * @type {boolean}
   */
  pure: PropTypes.bool
};

// TODO: accessible close button that is visible only when focused

/** @typedef {propTypes & React.HTMLAttributes} Props */

/**
 * Модальное окно
 * 
 * @augments React.Component<Props>
 */
class Dialog extends React.Component {

  static propTypes = propTypes;

  /** @param {Props} props */
  constructor(props) {
    super(props);

    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  componentDidMount() {
    window.addEventListener("keyup", e => {
      const key = e.which || e.keyCode;
      if (key === 27) {
        this.onClose();
        e.stopPropagation();
      }
    });
  }

  onConfirm() {
    const { onConfirm } = this.props;
    if (onConfirm) {
      const shouldClose = onConfirm();
      if (shouldClose) {
        dialogAPI.closeLast();
      }
    }
  }

  onCancel() {
    const { onCancel, onClose } = this.props;
    const callback = onCancel || onClose;
    if (callback) {
      const shouldClose = callback();
      if (shouldClose) {
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
      const shouldClose = onClose();
      if (shouldClose) {
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
      children,

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

      pure
    } = this.props;

    const block = "dialog";

    return (
      <div
        id={id}
        className={clsx(block, className, pure && "pure")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        hidden={true}
        onClick={e => {
          if (e.target.id.split(" ").indexOf(id) > -1) {
            this.onClose();
          }
        }}>
        <div tabIndex="0" aria-hidden="true"></div>
        <div className={`${block}__inner card`}>
          <Stack>
            {!pure && <h2 className={`${block}__title`}>{title}</h2>}

            <div className={clsx(`${block}__content`, contentClassName)}>
              {children}
            </div>

            {!pure && (
              footer
                ? footer
                : !hideFooter && (
                  <div className={`${block}-footer-wrap`}>
                    <footer className={`${block}-footer`}>

                      {!hideCancel && 
                        <Button
                          className={clsx("custom-btn", cancelClass)}
                          onClick={() => this.onCancel()}>
                          {cancelText ?? "Отмена"}
                        </Button>
                      }

                      {!hideConfirm && 
                        <Button
                          className={clsx("custom-btn", "custom-btn--filled", confirmClass)}
                          type="primary"
                          onClick={() => this.onConfirm()}>
                          {confirmText ?? "ОК"}
                        </Button>
                      }

                    </footer>
                  </div>
                )
            )}

          </Stack>
          {!pure &&
            <CrossButton
              className={`${block}__close`}
              onClick={e => this.onClose()}
            />
          }
        </div>
        <div tabIndex="0" aria-hidden="true"></div>
      </div>
    );
  }
}

export { Dialog, dialogAPI };