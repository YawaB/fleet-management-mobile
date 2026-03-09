import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _fetchAreas , _fetchStatuses } from "../../api/global";
import _ from 'lodash'

const slice_name = "global"
export const fetchAreas = createAsyncThunk(`${slice_name}/fetchAreas`, async (_args, { dispatch, getState }) => {
  const res = await _fetchAreas()
  if (Array.isArray(res.response)) dispatch(setAreas(res.response))
  return res.response || []
})


export const fetchStatuses = createAsyncThunk(`${slice_name}/fetchStatuses`, async (_args, { dispatch, getState }) => {
  const res = await _fetchStatuses()
  if (Array.isArray(res.response)) dispatch(setStatuses(res.response))
  return res.response || []
})



export const getAreas = (state) => state[slice_name].areas;
export const getStatuses = (state) => state[slice_name].statuses;


export const globalSlice = createSlice({
  initialState: {
    areas: [],
    statuses: []
  },
  name: slice_name,
  reducers: {
      setAreas: (state, { payload }) => {
        state.areas = payload
      },
      setStatuses: (state, { payload }) => {
        state.statuses = payload
      }
  }
});


export const {
    setAreas ,
    setStatuses
} = globalSlice.actions


export default globalSlice.reducer;


