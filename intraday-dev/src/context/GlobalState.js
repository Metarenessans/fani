import React, { createContext, useReducer } from "react";
import axios from "axios";
import qs from "qs";

import AppReducer from "./AppReducer";

const initialState = {
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
  loading: true,
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Actions
  async function getTools() {
    try {
      const futuresRequest = axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getFutures"
      );
      const sharesRequest = axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getTrademeterInfo"
      );

      Promise.all([futuresRequest, sharesRequest]).then((responses) => {
        const tools = [...responses[0].data.data, ...responses[1].data.data];

        dispatch({
          type: "GET_TOOLS",
          payload: { tools },
        });
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
      if (res.data.data)
        dispatch({
          type: "GET_INVESTOR_INFO",
          payload: res.data.data,
        });
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function getIntradaySnapshots() {
    try {
      const res = await axios.get(
        "https://fani144.ru/local/php_interface/s1/ajax/?method=getIntradaySnapshots"
      );
      if (!res.data.error) {
        console.log("Shapshots:", res.data.data);
        dispatch({
          type: "GET_INTRADAY_SNAPSHOTS",
          payload: res.data.data,
        });
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function getIntradaySnapshot(id) {
    try {
      const res = await axios.get(
        `https://fani144.ru/local/php_interface/s1/ajax/?method=getIntradaySnapshot&id=${id}`
      );
      if (!res.data.error) {
        dispatch({
          type: "GET_INTRADAY_SNAPSHOT",
          payload: res.data.data,
        });
      }
      // else dispatch обработчик
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function addIntradaySnapshot(data) {
    try {
      const res = await axios.post(
        "/local/php_interface/s1/ajax/?method=addIntradaySnapshot",
        qs.stringify(data)
      );
      console.log("addIntradaySnapshot response:", res.data);
      if (!res.data.error) {
        dispatch({
          type: "ADD_INTRADAY_SNAPSHOT",
          payload: res.data,
        });
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response,
      });
    }
  }

  async function updateIntradaySnapshot(data) {
    try {
      const res = await axios.post(
        "/local/php_interface/s1/ajax/?method=updateIntradaySnapshot",
        qs.stringify(data)
      );

      if (!res.data.error) {
        dispatch({
          type: "UPDATE_INTRADAY_SNAPSHOT",
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

  async function deleteIntradaySnapshot(id) {
    try {
      const res = await axios.post(
        "/local/php_interface/s1/ajax/?method=deleteIntradaySnapshot",
        qs.stringify({ id })
      );

      if (!res.data.error) {
        console.log("Deleted snapshot", id);
        dispatch({
          type: "DELETE_INTRADAY_SNAPSHOT",
          payload: id,
        });
      } else {
        console.log(res.data);
      }
    } catch (err) {
      dispatch({
        type: "FUTURE_ERROR",
        payload: err.response, //res.data.message
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
      //   await axios.delete(`/api/futures/${id}`)
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

  async function setGuaranteeMode(tableIdx, guaranteeMode) {
    try {
      dispatch({
        type: "SET_GUARANTEE_MODE",
        payload: { tableIdx, guaranteeMode },
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
      //   const res = await axios.post('/api/futures', future, config)

      //   dispatch({
      //     type: 'ADD_STEP_COLUMN',
      //     payload: res.data.data
      //   })
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
      //   await axios.delete(`/api/futures/step/${id}`)
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

        getTools,
        getInvestorInfo,
        getIntradaySnapshots,
        getIntradaySnapshot,
        addIntradaySnapshot,
        updateIntradaySnapshot,
        deleteIntradaySnapshot,
        addTool,
        updateTool,
        deleteTool,
        setLoadValue,
        setIterationQty,
        setStopValue,
        setMinYield,
        setYieldStep,
        updateSteps,
        setAdrMode,
        setGuaranteeMode,
        addStepColumn,
        setExtraStep,
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
