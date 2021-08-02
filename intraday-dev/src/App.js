import { PriceMove } from "./components/PriceMove";
import { DataInputs } from "./components/DataInputs";
import { LoadTables } from "./components/LoadTables";
import { NanniBot } from "./components/nanni-bot";

import { GlobalProvider } from "./context/GlobalState";

import "antd/dist/antd.css";
import "./App.scss";

function App() {
  return (
    <GlobalProvider>
      <PriceMove />
      <DataInputs />
      <LoadTables />
      <NanniBot />
    </GlobalProvider>
  );
}

export default App;
