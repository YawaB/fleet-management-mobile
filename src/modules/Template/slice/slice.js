import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _createTemplate,  _fetchTemplates, _removeTemplate, _updateTemplate } from "../api/index";
import _ from 'lodash'

const slice_name = "templates"
export const fetchTemplates = createAsyncThunk(`${slice_name}/fetchTemplates`, async (filter, { dispatch, getState }) => {
  const res = await _fetchTemplates(filter)
  console.log('templates:', res);
  if (Array.isArray(res.response)) dispatch(setTemplates(res.response))
  return res.success ? res.response : []
})

export const getSelectedTemplate = (state) => state[slice_name].selectedTemplate;
export const getTemplates = (state) => state[slice_name].templates;


export const templateslice = createSlice({
  initialState: {
    templates: [],
    selectedTemplate: null,
    editTemplate: false,
    view: 'list'
  },
  name: slice_name,
  reducers: {
      setTemplates: (state, { payload }) => {
        if(Array.isArray(payload)){
          state.templates = payload.map( u => ({
            ...u , 
            pseudo: ((u.fname?.[0] || '') + (u.sname?.[0] || ''))
            .toUpperCase()
          }))
        }else{
        state.templates = payload
        }
      },
      setSelectedTemplate: (state, { payload }) => {
        state.selectedTemplate = payload
      }
  }
  
});


export const {
    setTemplates ,
    setSelectedTemplate,
} = templateslice.actions


export default templateslice.reducer;


