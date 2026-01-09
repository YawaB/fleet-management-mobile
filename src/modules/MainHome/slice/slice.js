import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _fetchDashboard, _fetchDetailPanne } from "../api/index.js";
import _ from "lodash";

const slice_name = "mainHome";

export const fetchDetailPanne = createAsyncThunk(
  `${slice_name}/fetchDetailPanne`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchDetailPanne(_args);
      console.log(res, "res _fetchDetailPanne");
      dispatch(setDetailPanne(res?.data?.result[0] || []));
      return res?.data?.result[0];
    } catch (error) {
      console.log(error);
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  `${slice_name}/fetchDashboard`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchDashboard(_args);
      console.log(res, "res _fetchDashboard");
      dispatch(setDashboard(res?.data?.result || []));
      return res?.data?.result[0];
    } catch (error) {
      console.log(error);
    }
  }
);

export const mainHomeSlice = createSlice({
  initialState: {
    detailPanne: [],
    dashboard: [],
  },
  name: slice_name,
  reducers: {
    setDetailPanne(state, { payload }) {
      state.detailPanne = payload;
    },
    setDashboard(state, { payload }) {
      state.dashboard = payload;
    },
  },
});

export const getDetailPanne = (state) => state[slice_name].detailPanne;
export const getDashboard = (state) => state[slice_name].dashboard;

export const { setDetailPanne, setDashboard } = mainHomeSlice.actions;

export default mainHomeSlice.reducer;
