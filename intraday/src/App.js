import { PriceMove } from "./components/PriceMove";
import { DataInputs } from "./components/DataInputs";
import { LoadTables } from "./components/LoadTables";

import { GlobalProvider } from "./context/GlobalState";

import "antd/dist/antd.css";
import "./App.scss";

function App() {
  return (
    <GlobalProvider>
      <PriceMove />
      <DataInputs />
      <LoadTables />
    </GlobalProvider>
  );
}

export default App;
