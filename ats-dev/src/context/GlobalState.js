import React, { createContext, useReducer } from "react";
// import axios from "axios";
import AppReducer from "./AppReducer";

const initialState = {
  activeView: 1,
  investorInfo: { deposit: 1500000, status: "KSUR", skill: "UNSKILLED" },
  error: null,
  loading: false,
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Actions
  async function setActiveView(value) {
    try {
      dispatch({
        type: "SET_ACTIVE_VIEW",
        payload: value,
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
        activeView: state.activeView,
        investorInfo: state.investorInfo,
        error: state.error,
        loading: state.loading,

        setActiveView,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
