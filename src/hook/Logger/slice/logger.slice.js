import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import moment from "moment";
import { clearLogsTable, getLogs, _getLogTags } from "../service";
import { useState } from "react";
const name = "logger";

export const fetchLogs = createAsyncThunk(
  `${name}/fetchLogs`,
  async (_args, { dispatch }) => {
    try {
      let logs = await getLogs();
      if (logs?.success) dispatch(setMessages(logs?.response || []));
    } catch (e) {}
  }
);

export const fetchLogTags = createAsyncThunk(
  `${name}/fetchLogs`,
  async (_args, { dispatch }) => {
    try {
      let logs = await _getLogTags();
      if (logs?.success) dispatch(setLogTags((logs?.response || []).map(o =>o?.tag).filter(o=>o)));
    } catch (e) {}
  }
);

export const clearLogs = createAsyncThunk(
  `${name}/clearLogs`,
  async (_args, { dispatch }) => {
    try {
      let res = await clearLogsTable();
      if (res?.success) dispatch(setMessages([]));
    } catch (e) {}
  }
);
const initialState = {
  messages: [],
  currentId: 0,
  tags: []
};

const loggerSlice = createSlice({
  name,
  initialState,
  reducers: {
    setMessages(state, { payload }) {
      state.messages = Array.isArray(payload) ? payload : [];
    },
    setTableIsCreated(state, { payload }){
      state.table_is_created = payload
    },
    setLogTags(state, { payload }){
      state.tags = payload
    },
    setMessage(state, { payload }) {
      if (!_.isPlainObject(payload)) return;
      state.currentId = state.currentId + 1;
      payload.logAt = moment().format("YYYY-MM-DDTHH:mm:ss");
      payload.id = state.currentId;
      if (!Array.isArray(state.messages)) {
        state.messages = [payload];
      } else {
        state.messages = [payload, ...state.messages];
      }
    },
  },
});

export const getMessages = (state) => state[name].messages;
export const getTableIsCreated = (state) => state[name].table_is_created;
export const getLogTags = (state) => state[name].tags;

export const { setMessages, setMessage , setTableIsCreated , setLogTags } = loggerSlice.actions;
export default loggerSlice.reducer;
