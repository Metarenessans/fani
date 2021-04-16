export default (state, action) => {
  switch (action.type) {
    case "SET_ACTIVE_VIEW":
      return {
        ...state,
        activeView: action.payload,
      };
    default:
      return state;
  }
};
