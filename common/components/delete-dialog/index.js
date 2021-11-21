import React, { useContext } from "react";
import { Dialog } from "../dialog";
import { Context } from "../BaseComponent";

/** ID диалогового окна удаления */
export const dialogID = "delete-dialog";

export default function DeleteDialog() {
  const context = useContext(Context);
  const { state } = context;
  return (
    <Dialog
      id={dialogID}
      title="Удаление сохранения"
      confirmText="Удалить"
      onConfirm={() => {
        const { id } = state;
        context.delete(id);
        return true;
      }}
    >
      Вы уверены, что хотите удалить {context.getTitle()}?
    </Dialog>
  );
}