import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _cratePanne, _fetchTypes, _fetchVehicles } from "../api";
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
              })
        }
      
    }
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
    }
  );


export const createOrUpdatePanne = createAsyncThunk(
  `${slice_name}/createOrUpdateTask`,
  async (_args, { dispatch, getState }) => {
    try {
      let res = null;
      res = await _cratePanne(_args);
      if (res?.data?.result?.[0].typeMsg === "success") {
        toastMessage({
          show: true,
          severity: "success",
          summary: "SUCCÈS",
          detail: res?.data?.result?.[0]?.msg,
        })
        return true;
      }
      toastMessage({
        show: true,
        severity: "error",
        summary: "ERREUR",
        detail: res?.data?.result?.[0]?.msg,
      })
      return false;
    } catch (e) {
      toastMessage({
        show: true,
        severity: "error",
        summary: "ERREUR",
        detail: e.message,
      })
      return { error: true, message: e.message };
    }
  }
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

export const { setPanes, setVehicles, setPanneTypes } =
  paneslice.actions;

export default paneslice.reducer;
