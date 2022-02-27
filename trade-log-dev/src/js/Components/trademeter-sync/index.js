import React, { useContext, useState, useEffect } from "react";
import { Button, message, Radio } from "antd";
const { Group } = Radio;
import locale from "antd/es/date-picker/locale/ru_RU";
import { ReloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { cloneDeep } from "lodash";
import clsx from "clsx";
import fetchSaveById from "../../../../../common/api/fetch/fetch-save-by-id";
import { dialogAPI } from "../../../../../common/components/dialog";
import { dialogID as saveDialogID } from "../../../../../common/components/save-dialog";
import parseTrademeterSnapshot from "./parse-trademeter-snapshot";

import { StateContext } from "../../App";

import "./style.scss";

export default function TrademeterSync() {
  const context = useContext(StateContext);
  const { state } = context;
  const {
    trademeterSnapshots,
    loadingTrademeterSnapshots,
    syncedWithTrademeter,
    selectedTrademeterSnapshotID,
    currentSyncedTrademeterSnapshotID
  } = state;
  const selectedID = selectedTrademeterSnapshotID;

  const [open, setOpen] = useState(false);

  const isSynced = selectedID === currentSyncedTrademeterSnapshotID && syncedWithTrademeter;

  return (
    <div className="trademeter-sync">
      <div className="trademeter-sync-header">
        <Button 
          className={clsx(
            "trademeter-sync__sync-btn",
            "custom-btn",
            !isSynced && "custom-btn--filled"
          )}
          onClick={async e => {
            if (!open) {
              setOpen(true);
              return;
            }

            if (selectedID == -1) {
              message.error("Не выбрано сохранение Трейдометра!");
              return;
            }

            if (state.changed) {
              dialogAPI.open("sync-with-trademeter-waring-dialog", e.target);
            }
            else {
              context.syncWithTrademeter(selectedID);
            }
          }}
        >
          {isSynced ? "Синхронизировано!" : "Связать с Трейдометром"}
        </Button>
        <button 
          className="trademeter-sync__refresh-btn"
          type="button" 
          aria-label="Обновить сохранение Трейдометра"
          onClick={e => {
            context.fetchTrademeterSnapshots();
          }}
        >
          <ReloadOutlined />
        </button>
      </div>
      <div className={clsx("trademeter-sync-content", open && "open")}>
        <h4 className="trademeter-sync-content__title">
          Выберите сохранение для синхронизации
        </h4>
        <Radio.Group
          value={selectedID}
          onChange={e => {
            const { value } = e.target;
            // Разрываем связь с Трейдометром
            if (value == -1 && syncedWithTrademeter) {
              dialogAPI.open("cancel-sync-with-trademeter-waring-dialog");
              return;
            }
            context.setState({ selectedTrademeterSnapshotID: value });
          }} 
        >
          {loadingTrademeterSnapshots
            ? <LoadingOutlined />
            :
              <>
                {trademeterSnapshots.map((snapshot, index) =>
                  <Radio value={snapshot.id} key={snapshot.id}>
                    {snapshot.name}
                  </Radio>
                )}
                <Radio value={-1} key={-1}>
                  Не выбрано (отменить связь)
                </Radio>
              </>
          }
        </Radio.Group>
        <div className="trademeter-sync-content-footer">
          <Button
            className="custom-btn"
            onClick={e => {
              setOpen(false);
              context.setState({ selectedTrademeterSnapshotID: -1 });
            }}
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}