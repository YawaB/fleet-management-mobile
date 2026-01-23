import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  _cratePanne,
  _fetchPannes,
  _fetchTypes,
  _fetchVehicles,
  _removePanne,
} from "../api";
import { toastMessage } from "../../../core/ui";

const slice_name = "pannes";

export const fetchVehicles = createAsyncThunk(
  `${slice_name}/fetchVehicles`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchVehicles();
      console.log("vehicles:", res?.data?.result);
      if (res?.data?.success) dispatch(setVehicles(res?.data?.result || []));
    } catch (error) {
      toastMessage({
        show: true,
        severity: "error",
        summary: "ERREUR",
        detail: error.message,
      });
    }
  },
);

export const fetchPanneTypes = createAsyncThunk(
  `${slice_name}/fetchPanneTypes`,
  async (_args, { dispatch, getState }) => {
    try {
      let dataArgs = {
        src: "PannesCategories",
      };
      const res = await _fetchTypes(dataArgs);
      console.log("fetchPanneTypes res:", res);
      if (res?.data?.success) {
        dispatch(setPanneTypes(res?.data?.result || []));
        return true;
      }
      return false;
    } catch (e) {
      console.log("fetchPanneTypes error:", e);
      return { error: true, message: e.message };
    }
  },
);

export const fetchPannes = createAsyncThunk(
  `${slice_name}/fetchPannes`,
  async (_args, { dispatch, getState }) => {
    const { current_user } = getState()["auth"];
    console.log("current_user", current_user);
    let dataArgs = {
      ..._args,
      userId: current_user?.instID,
    };
    try {
      const res = await _fetchPannes(dataArgs);
      console.log("fetchPannes res:", res);
      if (res?.data?.success) {
        dispatch(setPanes(res?.data?.result || []));
        return true;
      }
      return false;
    } catch (e) {
      console.log("fetchPannes error:", e);
      return { error: true, message: e.message };
    }
  },
);

export const removePanne = createAsyncThunk(
  `${slice_name}/removePanne`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _removePanne(_args);
      console.log("removePanne res:", res);
      if (res?.data?.success) {
        toastMessage({
          text1: "SUCCÈS",
          text2: res?.data?.result?.[0]?.msg,
          tag: "location",
          type: "success",
        });
        return true;
      }
      toastMessage({
        text1: "ERREUR",
        text2: res?.data?.result?.[0]?.msg,
        tag: "location",
        type: "error",
      });
      return false;
    } catch (e) {
      console.log("removePanne error:", e);
      return { error: true, message: e.message };
    }
  },
);

export const createOrUpdatePanne = createAsyncThunk(
  `${slice_name}/createOrUpdateTask`,
  async (_args, { dispatch, getState }) => {
    try {
      let res = null;
      res = await _cratePanne(_args);
      console.log("createOrUpdatePanne res:", res);
      if (res?.data?.result?.[0].typeMsg === "success") {
        toastMessage({
          text1: "SUCCÈS",
          text2: res?.data?.result?.[0]?.msg,
          tag: "location",
          type: "success",
        });
        return true;
      }
      toastMessage({
        text1: "ERREUR",
        text2: res?.data?.result?.[0]?.msg,
        tag: "location",
        type: "error",
      });
      return false;
    } catch (e) {
      toastMessage({
        text1: "ERREUR",
        text2: e.message,
        tag: "location",
        type: "error",
      });
      return { error: true, message: e.message };
    }
  },
);

export const paneslice = createSlice({
  initialState: {
    panes: [],
    vehicles: [],
    panneTypes: [],
  },
  name: slice_name,
  reducers: {
    setPanes: (state, { payload }) => {
      state.panes = payload;
    },
    setVehicles: (state, { payload }) => {
      state.vehicles = payload;
    },
    setPanneTypes: (state, { payload }) => {
      state.panneTypes = payload;
    },
  },
});

export const getPanes = (state) => state[slice_name].panes;
export const getVehicles = (state) => state[slice_name].vehicles;
export const getPanneTypes = (state) => state[slice_name].panneTypes;

export const { setPanes, setVehicles, setPanneTypes } = paneslice.actions;

export default paneslice.reducer;
