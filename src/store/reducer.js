import * as actionType from "./types";
import { addCard as addNewCard } from "../utils";

const initialState = {
  user: {
    email: "",
    name: "",
    firstname: "",
    lastname: "",
    password: "",
    user_settings: {
      theme: "light",
      profilePicUrl: "url",
    },
    dashboards: [
      {
        name: "Dashboard 1",
        id: 0,
        owner: "",
        shared: [],
        columns: [],
        shared: [],
      },
    ],
    sharedToUser: [],
    sharedByUser: [],
  },
  currentDashboard: 0,
  currentUser:""
}

const user = (state = initialState, action) => {

  const newState = { ...state };
  const currentDashboard = state.currentDashboard;
  const { payload } = action;
  let dashboard = { ...state.user.dashboards[currentDashboard] };

  switch (action.type) {
    case actionType.ADD_COLUMN:
      dashboard = { ...state.user.dashboards[currentDashboard] };
      dashboard.columns.push(action.payload.column);
      newState.user.dashboards[currentDashboard] = dashboard;
      return newState;

    case actionType.DELETE_COLUMN:
      dashboard = { ...state.user.dashboards[currentDashboard] };
      dashboard.columns.splice(action.payload.colIndex, 1);
      newState.user.dashboards[currentDashboard] = dashboard;
      return newState;

    case actionType.SET_USER_PROFILE:
      newState.user = {...action.payload}
      return newState;

    case actionType.SET_CURRENT_USER:
      newState.currentUser = action.payload
      return newState

    case actionType.DELETE_CARD:
      dashboard = { ...state.user.dashboards[currentDashboard] };
      dashboard.columns[payload.colIndex].cards.splice(payload.cardIndex,1);
      newState.user.dashboards[currentDashboard] = dashboard;
      return newState;

    case actionType.ADD_CARD:
      dashboard = { ...state.user.dashboards[currentDashboard] };
      dashboard.columns[payload.colIndex].cards.unshift(addNewCard());
      newState.user.dashboards[currentDashboard] = dashboard;
      return newState;

    case actionType.UPDATE_CARD:
      console.log('[UPDATE_CARD] payload',payload)
      dashboard.columns[payload.colIndex].cards[payload.cardIndex] = payload.updatedCard;
      newState.user.dashboards[currentDashboard] = dashboard;
      return newState;

    case actionType.SET_CURR_DASHBOARD:
      newState.currentDashboard = action.payload.dashboard;
      return newState;

    case actionType.UPDATE_COL_TITLE:
      newState.user.dashboards[currentDashboard].columns[
        action.payload.colIndex
      ].name = action.payload.colTitle;
      return newState;

    case actionType.UPDATE_USER_REQUEST:
      return state;

    default:
      return state;
  }
};

export default user;
