import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {  _fetchfeatures} from "../api/index";
import _ from 'lodash'

const slice_name = "features"
export const fetchfeatures = createAsyncThunk(`${slice_name}/fetchfeatures`, async (_args, { dispatch, getState }) => {
  const res = await _fetchfeatures(_args?.role ? _args.role : '' )
  console.log('features:', res);
  if (Array.isArray(res.response || res)) dispatch(setfeatures(res.response || res))
  return res.success ? res.data : []
})


export const getSelectedfeature = (state) => state[slice_name].selectedfeature;
export const getfeatures = (state) => state[slice_name].features;


export const featureslice = createSlice({
  initialState: {
    features: [
        {code: "pane" ,label: 'Panes' , description: 'Gestion des panes' , icon: 'home-outline' , color: 'blue', route: 'Panes'},
        // {code: "dashboard",label: 'Dashboard' , description: 'Tableau de bord',icon: 'analytics', color: "green",  route: 'Dashboard'}
    ],
    local_features: [
        {code: "panes" ,label: 'Site' },
        {code: "dashboard" ,label: 'Dashboard' }
    ],
    selectedfeature: null,
    editfeature: false,
    view: 'list'
  },
  name: slice_name,
  reducers: {
      setfeatures: (state, { payload }) => {
        if (!payload) return
        let list = [];

        console.log('payload:', payload)
        payload.forEach(_item => {
            let o = state.local_features.find(_dt => _dt.code == _item.code);
            if(o){
                list.push({..._item , ...o})
            }
        })

        let names = list.map( o => o.name)
        let forced = state.local_features.filter( o => !names.includes(o.name) && o.force);

        list = [...list , ...forced]

        list.push(...state.local_features.filter( o => o.isDev && !names.includes(o.name)))
        
        state.features = list
      },
      setSelectedfeature: (state, { payload }) => {
        state.selectedfeature = payload
      }
  }
  
});


export const {
    setfeatures ,
    setSelectedfeature,
    setEditfeature,
    setfeatureView
} = featureslice.actions


export default featureslice.reducer;


