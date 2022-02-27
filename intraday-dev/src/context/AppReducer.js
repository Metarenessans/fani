import params from "../common/utils/params";

export default (state, action) => {
  const addTool = ({ tableIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const newTool = JSON.parse(JSON.stringify(updatedTable.selectedTools[0]));
    updatedTable.selectedTools.push(newTool);

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );
    return {
      ...state,
      loadTables: updatedLoadTables,
      snapshotIsChanged: true,
      snapshotIsSaved: false,
    };
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

    return {
      ...state,
      loadTables: updatedLoadTables,
      snapshotIsChanged: true,
      snapshotIsSaved: false,
    };
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
    return {
      ...state,
      loadTables: updatedLoadTables,
      snapshotIsChanged: true,
      snapshotIsSaved: false,
    };
  };

  const deleteExtraStep = ({ tableIdx, columnIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const extraSteps = updatedTable.extraSteps;
    const updatedSteps = extraSteps.filter((step, idx) => idx !== columnIdx);
    updatedTable.extraSteps = updatedSteps;

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );

    return {
      ...state,
      loadTables: updatedLoadTables,
      snapshotIsChanged: true,
      snapshotIsSaved: false,
    };
  };

  const setExtraStep = ({ tableIdx, columnIdx, value }) => {
    const tables = [...state.loadTables];
    tables[tableIdx].extraSteps[columnIdx] = +value;

    return tables;
  };

  switch (action.type) {
    case "SET_INITIAL_STATE":
      return {
        ...state,
        currentSaveIdx: 0,
        customTools: [],
        investorInfo: {
          deposit: 1500000,
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
            steps: [0.5, 0.52, 0.54, 0.56, 0.58, 0.6, 0.62, 0.64],
            extraSteps: [],
            guaranteeMode: "LONG",
          },
        ],
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
    case "SET_CUSTOM_TOOLS":
      return {
        ...state,
        customTools: action.payload,
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "GET_SAVES":
      let pure = params.get("pure") === "true";

      return {
        ...state,
        saves: action.payload,
        currentSaveIdx: action.payload.length && !pure ? 1 : 0,
      };
    case "GET_SAVE":
      let save = action.payload;

      return {
        ...state,
        adrMode: save.adrMode,
        iterationQty: save.iterationQty,
        stopValue: save.stopValue,
        minYield: save.minYield,
        yieldStep: save.yieldStep,
        loadTables: save.loadTables,
        customTools: save.customTools,
        // investorInfo: {
        //   ...state.investorInfo,
        //   deposit: save.investorInfo.deposit,
        // },
        snapshotIsSaved: true,
        snapshotIsChanged: false,
      };
    case "ADD_SAVE":
      return {
        ...state,
        saves: [action.payload, ...state.saves],
        currentSaveIdx: 1,
      };
    case "UPDATE_SAVE":
      let updatedSaves = [...state.saves].map((save) => {
        if (save.id == action.payload.id) {
          save.name = action.payload.name;
          save.static = action.payload.static;
        }
        return save;
      });
      return {
        ...state,
        saves: updatedSaves,
        snapshotIsSaved: true,
        snapshotIsChanged: false,
      };
    case "DELETE_SAVE":
      let filteredSaves = [...state.saves].filter(
        (save) => save.id !== action.payload
      );

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
    case "SET_IMAGE_URL":
      return {
        ...state,
        imageUrl: action.payload,
      };
    case "SET_NODE_ID":
      return {
        ...state,
        nodeId: action.payload,
      };
    case "SET_ASK_NUMBER":
      return {
        ...state,
        askNumber: action.payload,
      };
    case "SET_COMTINUE_NANI_SESSION":
      return {
        ...state,
        continueNaniSession: action.payload,
      };
    case "SET_GRAPH_REVISION":
      return {
        ...state,
        graphRevision: action.payload,
      };
    case "SET_EASTER_EGG":
      return {
        ...state,
        easterEgg: action.payload,
      };
    case "ADD_TOOL":
      return addTool(action.payload);
    case "UPDATE_TOOL":
      return {
        ...state,
        loadTables: updateTool(action.payload),
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "DELETE_TOOL":
      return deleteTool(action.payload);
    case "SET_LOAD_VALUE":
      return {
        ...state,
        loadTables: updateLoadValue(action.payload),
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "SET_ITERATION_QTY":
      return {
        ...state,
        iterationQty: action.payload,
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "SET_STOP_VALUE":
      return {
        ...state,
        stopValue: +action.payload,
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "SET_MIN_YIELD":
      return {
        ...state,
        minYield: +action.payload,
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "SET_YIELD_STEP":
      return {
        ...state,
        yieldStep: +action.payload,
        snapshotIsChanged: true,
        snapshotIsSaved: false,
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
        snapshotIsSaved: false,
      };
    case "SET_ADR_MODE":
      return {
        ...state,
        adrMode: action.payload,
        snapshotIsChanged: true,
        snapshotIsSaved: false,
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
        snapshotIsSaved: false,
      };
    case "DELETE_LOAD_TABLE":
      return {
        ...state,
        loadTables: state.loadTables.filter(
          (table, idx) => idx !== action.payload
        ),
        snapshotIsChanged: true,
        snapshotIsSaved: false,
      };
    case "UPDATE_DEPOSIT":
      return {
        ...state,
        investorInfo: { ...state.investorInfo, deposit: action.payload },
        snapshotIsChanged: true,
        snapshotIsSaved: false,
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
