import React from 'react'
import ReactDOM from 'react-dom'
import { App } from "./App"
ReactDOM.render(<App pageName="Mts" />, document.querySelector("#root"));

// import "../sass/style.sass"
// import { SettingsGenerator } from "./components/settings-generator"
// ReactDOM.render(
//   <SettingsGenerator
//     // defaultToolCode="SiU1"
//     // defaultPresetName="СМС + ТОР"
//     load={50}
//     depo={1_000_000}
//   />,
//   document.querySelector("#root")
// );