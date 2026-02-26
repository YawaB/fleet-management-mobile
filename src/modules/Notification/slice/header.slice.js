import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { _fetchNotificationList, _readNotification } from "../api";

const name = "notification";

export const fetchNotifications = createAsyncThunk(
  `${name}/fetchNotifications`,
  async (_args, { dispatch, getState }) => {
    try {
      let res = await _fetchNotificationList(_args);
      console.log("res _fetchNotificationList:", res);
      if (!res.error) {
        dispatch(setNotifications(res.data.result));
        return { success: true };
      }
      return { success: false, error: res.result };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },
);

export const readNotification = createAsyncThunk(
  `${name}/readNotification`,
  async (_args, { dispatch, getState }) => {
    try {
      let res = await _readNotification(_args);
      console.log("res _readNotification:", res);
      if (!res.error) {
        dispatch(fetchNotifications({ filterType: "unread" }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
);

export const headerSlice = createSlice({
  initialState: {
    notifications: [],
  },
  name: name,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
  },
});

export const getNotifications = (state) => state[name].notifications;

export const { setNotifications } = headerSlice.actions;

export default headerSlice.reducer;
