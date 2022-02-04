// import React from "react"
import ReactDOM from "react-dom"

import React, { useContext, useState, useRef } from "react";

import { PriceMove } from "./components/PriceMove";
import { DataInputs } from "./components/DataInputs";
import { LoadTables } from "./components/LoadTables";
import { NanniBot } from "./components/nanni-bot";
import { Popup } from "./components/Popup";

import { GlobalProvider } from "./context/GlobalState";
import { GlobalContext } from "./context/GlobalState";

import "antd/dist/antd.css";
import "./App.scss";

function App() {
  return (
    <GlobalProvider>
      <PriceMove />
      <DataInputs />
      <LoadTables />
      {(
        location.href.replace(/\/$/g, "").endsWith("-dev")  ||
        location.href.replace(/\/$/g, "").endsWith(":8080") ||
        location.href.replace(/\/$/g, "").endsWith(":8081") ||
        location.href.replace(/\/$/g, "").endsWith("-ex")
      ) && (
        <NanniBot />
      )};
      <Popup />
    </GlobalProvider>
  );
}

export default App;
