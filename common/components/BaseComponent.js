import React from "react"
import extractSnapshot from "../utils/extract-snapshot"
import { cloneDeep } from "lodash"

export default class BaseComponent extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {};
    this.state = {};

    /** @type {extractSnapshot} */
    this.extractSnapshot = extractSnapshot.bind(this);
  }

  setStateAsync(state = {}) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  reset() {
    const initialState = cloneDeep(this.initialState);
    return this.setStateAsync(initialState);
  }
}