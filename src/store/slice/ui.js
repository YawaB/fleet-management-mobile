import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import _ from 'lodash'

const slice_name = "ui"

export const uiSlice = createSlice({
  initialState: {
    params: {

    }
  },
  name: slice_name,
  reducers: {
     setUiParams(state, {payload}){
        state.params = {...state.params , ...(payload || {})}
     }
  }
  
});

export const getUiParams = state => state[slice_name].params

export const {
    setUiParams
} = uiSlice.actions


export default uiSlice.reducer;


