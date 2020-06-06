import * as action from "../store/types";

export const addColumn = (payload) => {
  return {
    type: action.ADD_COLUMN,
    payload,
  };
};

export const deleteColumn = (payload) => {
  return {
    type: action.DELETE_COLUMN,
    payload,
  };
};

export const addCard = (payload) => {
  return {
    type: action.ADD_CARD,
    payload,
  };
};

export const deleteCard = (payload) => {
  return {
    type: action.DELETE_CARD,
    payload,
  };
};

export const updateCard = (payload) => {
  return {
    type: action.UPDATE_CARD,
    payload,
  };
};

export const updateColTitle = (payload) => {
  return {
    type: action.UPDATE_COL_TITLE,
    payload,
  };
};

export const setUserProfile = (payload) => {
  return {
    type: action.SET_USER_PROFILE,
    payload,
  };
};

export const setCurrentUser = (email) => {
  return {
    type: action.SET_CURRENT_USER,
    payload: email,
  };
};

export const updateUserRequest = (payload) => {
  return {
    type: action.UPDATE_USER_REQUEST,
    payload,
  };
};

export const updateUserRequestSuccess = (payload) => {
  return {
    type: action.UPDATE_USER_REQUEST_SUCCESS,
    payload : ''
  };
};

export const updateUserRequestFailure = (payload) => {
  return {
    type: action.UPDATE_USER_REQUEST_SUCCESS,
    payload : ''
  };
};

export const getUserRequest = (payload) => {
  return {
    type: action.GET_USER_REQUEST,
    payload: payload,
  };
};

export const getUserRequestSuccess = (res) => {
  return {
    type: action.GET_USER_REQUEST_SUCCESS,
    payload: res,
  };
};

export const getUserRequestFailure = (res) => {
  return {
    type: action.GET_USER_REQUEST_FAILURE,
    payload: "",
  };
};

export const getUserProfile = (payload) => {
  return async function (dispatch) {
    dispatch(getUserRequest(payload));
    const url = `/api/getUser/${payload}`;
    const result = await fetch(url)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .catch((err) => {
        dispatch(getUserRequestFailure());
        return {
          error: err,
        };
      });
    dispatch(getUserRequestSuccess(result));
    dispatch(setUserProfile(result[0][0]));
  };
};

export const updateUserProfile = (payload) => {
  return async function (dispatch) {
    dispatch(updateUserRequest(payload));
    const url = "/api/updateUserProfile";
    const options = {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const result = await fetch(url, options)
      .then((response) => response.json())
      .catch((err) => {
        dispatch(updateUserRequestFailure());
        return {
          error: err,
        };
      });
    dispatch(updateUserRequestSuccess());
  };
};


