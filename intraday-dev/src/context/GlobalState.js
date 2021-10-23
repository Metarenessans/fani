import React, { createContext, useReducer } from "react";
import axios from "axios";
import qs from "qs";

import AppReducer from "./AppReducer";

import { Tools } from "../common/tools";

const initialState = {
  saves: [],
  currentSaveIdx: 0,
  tools: [],
  customTools: [],
  investorInfo: {
    deposit: 1500000,
    email: "user@mail.ru",
    status: "KSUR",
    skill: "UNSKILLED",
  },
  adrMode: "day",
  iterationQty: 10,
  stopValue: 0.5,
  minYield: 0.5,
  yieldStep: 0.02,
  loadTables: [
    {
      selectedTools: [{ code: "SBER", toolType: "shareRu" }],
      loadValue: 1,
      steps: [...Array(8)],
      extraSteps: [],
      guaranteeMode: "LONG",
    },
  ],
  error: null,
  loading: false,
  snapshotIsSaved: true,
  snapshotIsChanged: false,
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Actions
  async function setInitialState() {
    try {
      dispatch({
        type: "SET_INITIAL_STATE",
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }
  async function getTools() {
    try {
      const futuresRequest = axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures"
      );
      const sharesRequest = axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getTrademeterInfo"
      );

      const tools = await Promise.all([futuresRequest, sharesRequest]).then(
        (responses) => {
          let tools = [...responses[0].data.data, ...responses[1].data.data];

          tools = Tools.parse(tools, {
            investorInfo: state.investorInfo,
          });

          tools = Tools.sort(tools);

          return tools;
        }
      );

      dispatch({
        type: "GET_TOOLS",
        payload: tools,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function getInvestorInfo() {
    try {
      const res = await axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getInvestorInfo"
      );
      console.log(res);
      if (res.data.data) {
        dispatch({
          type: "GET_INVESTOR_INFO",
          payload: res.data.data,
        })
      }
      else {
        if (dev) {
          const investorInfo = { 
            "email": "zero.neitrino@gmail.com",
            "deposit": 3000000,
            "status": "KSUR",
            "skill": "UNSKILLED"
          };
          dispatch({
            type: "GET_INVESTOR_INFO",
            payload: investorInfo,
          });
        }
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function getSaves() {
    try {
      const res = await axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getIntradaySnapshots"
      );
      if (!res.data.error) {
        let sortedSaves = res.data.data.sort(
          (a, b) => b.dateUpdate - a.dateUpdate
        );

        dispatch({
          type: "GET_SAVES",
          payload: sortedSaves,
        });
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function getLastModifiedSave() {
    try {
      const res = await axios.get(
        `https://fani144.ru/local/php_interface/s1/ajax/?method=getLastModifiedIntradaySnapshot`
      );
      if (!res.data.error) {
        let expectedKeys = [
          "adrMode",
          "iterationQty",
          "stopValue",
          "minYield",
          "yieldStep",
          "loadTables",
          "customTools",
          "investorInfo",
        ];
        let save = JSON.parse(res.data.data.static);
        let keys = Object.keys(save);
        let isMatch = true;

        keys.map((key) => {
          if (!expectedKeys.includes(key)) isMatch = false;
        });

        if (isMatch) {
          dispatch({
            type: "GET_SAVE",
            payload: save,
          });
        } else {
          deleteSave(res.data.data.id);
        }
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }

  }


  async function getSave(id) {
    try {
      const res = await axios.get(
        `https://fani144.ru/local/php_interface/s1/ajax/?method=getIntradaySnapshot&id=${id}`
      );
      if (!res.data.error) {
        let expectedKeys = [
          "adrMode",
          "iterationQty",
          "stopValue",
          "minYield",
          "yieldStep",
          "loadTables",
          "customTools",
          "investorInfo",
        ];
        let save = JSON.parse(res.data.data.static);
        let keys = Object.keys(save);
        let isMatch = true;

        keys.map((key) => {
          if (!expectedKeys.includes(key)) isMatch = false;
        });

        if (isMatch) {
          dispatch({
            type: "GET_SAVE",
            payload: save,
          });
        } else {
          deleteSave(res.data.data.id);
        }
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function addSave(data) {
    try {
      const res = await axios.post(
        "/local/php_interface/s1/ajax/?method=addIntradaySnapshot",
        qs.stringify(data)
      );
      console.log("addIntradaySnapshot response:", res.data);
      if (!res.data.error) {
        data.id = res.data.id;
        dispatch({
          type: "ADD_SAVE",
          payload: data,
        });
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function updateSave(data) {
    try {
      const res = await axios.post(
        "/local/php_interface/s1/ajax/?method=updateIntradaySnapshot",
        qs.stringify(data)
      );

      console.log("updateIntradaySnapshot response:", res.data);
      if (!res.data.error) {
        dispatch({
          type: "UPDATE_SAVE",
          payload: data,
        });
      } else {
        console.log(res.data);
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function deleteSave(id) {
    try {
      const res = await axios.post(
        "/local/php_interface/s1/ajax/?method=deleteIntradaySnapshot",
        qs.stringify({ id })
      );

      if (!res.data.error) {
        console.log("Deleted snapshot:", id);

        dispatch({
          type: "DELETE_SAVE",
          payload: id,
        });
      } else {
        console.log(res.data.message);
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function setCurrentSaveIdx(idx) {
    try {
      dispatch({
        type: "SET_CURRENT_SAVE_IDX",
        payload: idx,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setCustomTools(tools) {
    try {
      dispatch({
        type: "SET_CUSTOM_TOOLS",
        payload: tools,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function addTool(tableIdx) {
    try {
      dispatch({
        type: "ADD_TOOL",
        payload: { tableIdx },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function deleteTool(tableIdx, rowIdx) {
    try {
      dispatch({
        type: "DELETE_TOOL",
        payload: { tableIdx, rowIdx },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function updateTool(tableIdx, rowIdx, code, toolType) {
    try {
      dispatch({
        type: "UPDATE_TOOL",
        payload: { tableIdx, rowIdx, code, toolType },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function setLoadValue(tableIdx, value) {
    try {
      dispatch({
        type: "SET_LOAD_VALUE",
        payload: { tableIdx, value },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setIterationQty(value) {
    try {
      dispatch({
        type: "SET_ITERATION_QTY",
        payload: value,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setStopValue(value) {
    try {
      dispatch({
        type: "SET_STOP_VALUE",
        payload: value,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setMinYield(value) {
    try {
      dispatch({
        type: "SET_MIN_YIELD",
        payload: value,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setYieldStep(value) {
    try {
      dispatch({
        type: "SET_YIELD_STEP",
        payload: value,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function updateSteps(tableIdx, steps) {
    try {
      dispatch({
        type: "UPDATE_STEPS",
        payload: { tableIdx, steps },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setAdrMode(value) {
    try {
      dispatch({
        type: "SET_ADR_MODE",
        payload: value,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function addStepColumn(tableIdx) {
    try {
      dispatch({
        type: "ADD_STEP_COLUMN",
        payload: { tableIdx },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setExtraStep(tableIdx, columnIdx, value) {
    try {
      dispatch({
        type: "SET_EXTRA_STEP",
        payload: { tableIdx, columnIdx, value },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function deleteExtraStep(tableIdx, columnIdx) {
    try {
      dispatch({
        type: "DELETE_EXTRA_STEP",
        payload: { tableIdx, columnIdx },
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function addLoadTable() {
    try {
      dispatch({
        type: "ADD_LOAD_TABLE",
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function deleteLoadTable(tableIdx) {
    try {
      dispatch({
        type: "DELETE_LOAD_TABLE",
        payload: tableIdx,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function updateDeposit(depoValue) {
    try {
      dispatch({
        type: "UPDATE_DEPOSIT",
        payload: depoValue,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  async function setIsLoading(bool) {
    try {
      dispatch({
        type: "SET_IS_LOADING",
        payload: bool,
      });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response.data.error,
      });
    }
  }

  return (
    <GlobalContext.Provider
      value={{
        tools: state.tools,
        investorInfo: state.investorInfo,
        loadTables: state.loadTables,
        iterationQty: state.iterationQty,
        stopValue: state.stopValue,
        minYield: state.minYield,
        yieldStep: state.yieldStep,
        adrMode: state.adrMode,
        error: state.error,
        loading: state.loading,
        saves: state.saves,
        snapshotIsChanged: state.snapshotIsChanged,
        snapshotIsSaved: state.snapshotIsSaved,
        currentSaveIdx: state.currentSaveIdx,
        customTools: state.customTools,

        setInitialState,
        setIsLoading,
        setCurrentSaveIdx,
        setCustomTools,
        getTools,
        getInvestorInfo,
        getSaves,
        getSave,
        getLastModifiedSave,
        addSave,
        updateSave,
        deleteSave,
        addTool,
        updateTool,
        deleteTool,
        updateSteps,
        setLoadValue,
        setIterationQty,
        setStopValue,
        setMinYield,
        setYieldStep,
        setAdrMode,
        setExtraStep,
        addStepColumn,
        deleteExtraStep,
        addLoadTable,
        deleteLoadTable,
        updateDeposit,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
