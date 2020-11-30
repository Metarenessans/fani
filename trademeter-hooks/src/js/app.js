import React, { Component } from "react"
const { Provider, Consumer } = React.createContext();

import "../sass/style.scss"

class App extends Component {
  
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <h1>App</h1>
    );
  }
}

export { App, Consumer }