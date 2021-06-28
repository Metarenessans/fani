import { Tools } from "../common/tools";

export default (state, action) => {
  const getTools = ({ tools }) => {
    tools = Tools.parse(tools, {
      investorInfo: state.investorInfo,
    });

    tools = Tools.sort(tools);

    return { ...state, loading: false, tools };
  };

  const addTool = ({ tableIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const newTool = JSON.parse(JSON.stringify(updatedTable.selectedTools[0]));
    updatedTable.selectedTools.push(newTool);

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );
    return { ...state, loadTables: updatedLoadTables };
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

    return { ...state, loadTables: updatedLoadTables };
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
    return { ...state, loadTables: updatedLoadTables };
  };

  const deleteExtraStep = ({ tableIdx, columnIdx }) => {
    const updatedTable = [...state.loadTables][tableIdx];
    const extraSteps = updatedTable.extraSteps;
    const updatedSteps = extraSteps.filter((step, idx) => idx !== columnIdx);
    updatedTable.extraSteps = updatedSteps;

    const updatedLoadTables = state.loadTables.map((table, idx) =>
      idx !== tableIdx ? table : updatedTable
    );

    return { ...state, loadTables: updatedLoadTables };
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
    case "GET_TOOLS":
      return getTools(action.payload);
    case "GET_INVESTOR_INFO":
      return {
        ...state,
        investorInfo: action.payload,
      };
    case "GET_INTRADAY_SNAPSHOTS":
      return {
        ...state,
      };
    case "ADD_TOOL":
      return addTool(action.payload);
    case "UPDATE_TOOL":
      return {
        ...state,
        loadTables: updateTool(action.payload),
      };
    case "DELETE_TOOL":
      return deleteTool(action.payload);
    case "SET_LOAD_VALUE":
      return {
        ...state,
        loadTables: updateLoadValue(action.payload),
      };
    case "SET_ITERATION_QTY":
      return {
        ...state,
        iterationQty: action.payload,
      };
    case "SET_STOP_VALUE":
      return {
        ...state,
        stopValue: +action.payload,
      };
    case "SET_MIN_YIELD":
      return {
        ...state,
        minYield: +action.payload,
      };
    case "SET_YIELD_STEP":
      return {
        ...state,
        yieldStep: +action.payload,
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
      };
    case "SET_ADR_MODE":
      return {
        ...state,
        adrMode: action.payload,
      };
    case "SET_GUARANTEE_MODE":
      return {
        ...state,
        loadTables: setGuaranteeMode(action.payload),
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
      };
    case "DELETE_LOAD_TABLE":
      return {
        ...state,
        loadTables: state.loadTables.filter(
          (table, idx) => idx !== action.payload
        ),
      };
    case "UPDATE_DEPOSIT":
      return {
        ...state,
        investorInfo: { ...state.investorInfo, deposit: action.payload },
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
