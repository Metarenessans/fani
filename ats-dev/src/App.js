import { DonutChart } from "./components/DonutChart";
import { MainContent } from "./components/MainContent";
import { GlobalProvider } from "./context/GlobalState";

import "antd/dist/antd.css";
import "./App.scss";

function App() {
  return (
    <GlobalProvider>
      <DonutChart />
      <MainContent />
    </GlobalProvider>
  );
}

export default App;
