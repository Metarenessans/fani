export default (state, action) => {
  const addTool = ({ tableIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const newTool = JSON.parse(JSON.stringify(updatedTable.selectedTools[0]));
    updatedTable.selectedTools.push(newTool);

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );
    return { ...state, loadTables: updatedLoadTables, snapshotIsChanged: true };
  };

  const updateTool = ({ tableIdx, rowIdx, code, toolType }) => {
    const tables = [...state.loadTables];
    tables[tableIdx].selectedTools[rowIdx].code = code;
    tables[tableIdx].selectedTools[rowIdx].toolType = toolType;

    return tables;
  };

  const updateSteps = ({ tableIdx, steps }) => {
    const tables = [...state.loadTables];
    tables[tableIdx].steps = steps;

    return tables;
  };

  const updateLoadValue = ({ tableIdx, value }) => {
    const tables = [...state.loadTables];
    tables[tableIdx].loadValue = value;

    return tables;
  };

  const deleteTool = ({ tableIdx, rowIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const updatedTools = updatedTable.selectedTools.filter(
      (tool, toolIdx) => rowIdx !== toolIdx
    );
    updatedTable.selectedTools = updatedTools;

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );

    return { ...state, loadTables: updatedLoadTables, snapshotIsChanged: true };
  };

  const addStepColumn = ({ tableIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const lastStep = +updatedTable.steps[updatedTable.steps.length - 1];
    const lastExtraStep =
      +updatedTable.extraSteps[updatedTable.extraSteps.length - 1];
    let newStep = 0;

    if (lastExtraStep) {
      newStep = lastExtraStep + state.yieldStep;
    } else {
      newStep = lastStep + state.yieldStep;
    }
    updatedTable.extraSteps.push(+newStep.toFixed(2));

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );
    return { ...state, loadTables: updatedLoadTables, snapshotIsChanged: true };
  };

  const deleteExtraStep = ({ tableIdx, columnIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const extraSteps = updatedTable.extraSteps;
    const updatedSteps = extraSteps.filter((step, idx) => idx !== columnIdx);
    updatedTable.extraSteps = updatedSteps;

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );

    return { ...state, loadTables: updatedLoadTables, snapshotIsChanged: true };
  };

  const setExtraStep = ({ tableIdx, columnIdx, value }) => {
    const tables = [...state.loadTables];
    tables[tableIdx].extraSteps[columnIdx] = +value;

    return tables;
  };

  const setGuaranteeMode = ({ tableIdx, guaranteeMode }) => {
    const tables = [...state.loadTables];
    tables[tableIdx].guaranteeMode = guaranteeMode;

    return tables;
  };

  switch (action.type) {
    case "SET_INITIAL_STATE":
      return {
        state: action.payload,
      };
    case "GET_TOOLS":
      return {
        ...state,
        tools: action.payload,
      };
    case "GET_INVESTOR_INFO":
      return {
        ...state,
        investorInfo: action.payload,
      };
    case "SET_CURRENT_SAVE_IDX":
      return {
        ...state,
        currentSaveIdx: action.payload,
      };
    case "GET_SAVES":
      let sortedSaves = action.payload.sort(
        (l, r) => r.dateUpdate - l.dateUpdate
      );
      return {
        ...state,
        saves: sortedSaves,
        currentSaveIdx: sortedSaves.length ? 1 : 0,
      };
    case "ADD_SAVE":
      return {
        ...state,
        saves: [action.payload, ...state.saves],
        currentSaveIdx: 1,
      };
    case "UPDATE_SAVE":
      return {
        ...state,
        snapshotIsSaved: true,
        snapshotIsChanged: false,
      };
    case "DELETE_SAVE":
      let filteredSaves = [...state.saves].filter(
        (save) => save.id !== action.payload
      );

      // if (state.saves.length > 0) {
      //   let idx = saves[currentSaveIndex - 1].id;

      // this.setState({ loading: true });
      // this.fetchSaveById(id)
      //   .then((response) => this.extractSave(response.data))
      //   .catch((error) => console.error(error));
      // } else {
      //   this.reset().catch((err) => this.showMessageDialog(err));

      //   saved = changed = false;
      // }
      return {
        ...state,
        saves: filteredSaves,
        currentSaveIdx: filteredSaves.length ? 1 : 0,
      };
    case "SET_IS_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "ADD_TOOL":
      return addTool(action.payload);
    case "UPDATE_TOOL":
      return {
        ...state,
        loadTables: updateTool(action.payload),
        snapshotIsChanged: true,
      };
    case "DELETE_TOOL":
      return deleteTool(action.payload);
    case "SET_LOAD_VALUE":
      return {
        ...state,
        loadTables: updateLoadValue(action.payload),
        snapshotIsChanged: true,
      };
    case "SET_ITERATION_QTY":
      return {
        ...state,
        iterationQty: action.payload,
        snapshotIsChanged: true,
      };
    case "SET_STOP_VALUE":
      return {
        ...state,
        stopValue: +action.payload,
        snapshotIsChanged: true,
      };
    case "SET_MIN_YIELD":
      return {
        ...state,
        minYield: +action.payload,
        snapshotIsChanged: true,
      };
    case "SET_YIELD_STEP":
      return {
        ...state,
        yieldStep: +action.payload,
        snapshotIsChanged: true,
      };
    case "UPDATE_STEPS":
      return {
        ...state,
        loadTables: updateSteps(action.payload),
      };
    case "SET_EXTRA_STEP":
      return {
        ...state,
        loadTables: setExtraStep(action.payload),
        snapshotIsChanged: true,
      };
    case "SET_ADR_MODE":
      return {
        ...state,
        adrMode: action.payload,
        snapshotIsChanged: true,
      };
    case "SET_GUARANTEE_MODE":
      return {
        ...state,
        loadTables: setGuaranteeMode(action.payload),
        snapshotIsChanged: true,
      };
    case "ADD_STEP_COLUMN":
      return addStepColumn(action.payload);
    case "DELETE_EXTRA_STEP":
      return deleteExtraStep(action.payload);
    case "ADD_LOAD_TABLE":
      return {
        ...state,
        loadTables: [
          ...state.loadTables,
          JSON.parse(JSON.stringify(state.loadTables[0])),
        ],
        snapshotIsChanged: true,
      };
    case "DELETE_LOAD_TABLE":
      return {
        ...state,
        loadTables: state.loadTables.filter(
          (table, idx) => idx !== action.payload
        ),
        snapshotIsChanged: true,
      };
    case "UPDATE_DEPOSIT":
      return {
        ...state,
        investorInfo: { ...state.investorInfo, deposit: action.payload },
        snapshotIsChanged: true,
      };
    case "FUTURE_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
