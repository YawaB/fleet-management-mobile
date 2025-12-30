import { createSlice } from "@reduxjs/toolkit";

let toastTimer = null;

const initialState = {
  visible: false,
  message: "",
  type: "info", // info | success | warning | error
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action) => {
      const { message = "", type = "info" } = action.payload || {};
      state.visible = true;
      state.message = message;
      state.type = type;
    },
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

const { showToast, hideToast } = toastSlice.actions;

export { hideToast };

export const setToast = (payload) => (dispatch) => {
  dispatch(showToast(payload));

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    dispatch(hideToast());
  }, 5000);
};

export const selectToast = (state) => state.toast;

export default toastSlice.reducer;
