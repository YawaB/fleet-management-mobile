import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _createSite,  _fetchSites, _removeSite, _updateSite } from "../api/index";
import _ from 'lodash'

const slice_name = "sites"
export const fetchSites = createAsyncThunk(`${slice_name}/fetchSites`, async (_args, { dispatch, getState }) => {
  const res = await _fetchSites(_args?.role ? _args.role : '' )
  if (Array.isArray(res.response || res)) dispatch(setSites(res.response || res))
  return res.success ? res.data : []
})


export const createOrUpdateSite = createAsyncThunk(`${slice_name}/createOrUpdateTask`, async (_args, { dispatch, getState }) => {
  try {
    let { selectedSite } = getState()[slice_name]

    if (!_args) return
    let data = _.cloneDeep(_args)
 
    delete data.pseudo
    delete data.expired_at
    let res = null


    if (!data.id)
      res = await _createSite(data)
    else
      res = await _updateSite(data)
    res.success = res.success || res.status
    console.log('res:', res)
    if (res.status) dispatch(fetchSites())

    return res
  } catch (e) {
    
    return { error: true, message: e.message }
  }
})

export const removeSite = createAsyncThunk(`${slice_name}/removeTask`, async (_args, { dispatch, getState }) => {
  const res = await _removeSite(_args.id)
  console.log('resss:', res)
  if (res.success) dispatch(fetchSites())
  return res
})

export const getSelectedSite = (state) => state[slice_name].selectedSite;
export const getSites = (state) => state[slice_name].sites;
export const getSiteView = (state) => state[slice_name].view;
export const getEditSite = (state) => state[slice_name].editSite;

export const siteslice = createSlice({
  initialState: {
    sites: [],
    selectedSite: null,
    editSite: false,
    view: 'list'
    
  },
  name: slice_name,
  reducers: {
      setSites: (state, { payload }) => {
        if(Array.isArray(payload)){
          state.sites = payload.map( u => ({
            ...u , 
            pseudo: ((u.fname?.[0] || '') + (u.sname?.[0] || ''))
            .toUpperCase()
          }))
        }else{
        state.sites = payload
        }
      },
      setSelectedSite: (state, { payload }) => {
        state.selectedSite = payload
      },
      setEditSite: (state, { payload }) => {
        state.editSite = payload
      },
      setSiteView: (state, { payload }) => {
        state.view = payload
      }
  }
  
});


export const {
    setSites ,
    setSelectedSite,
    setEditSite,
    setSiteView
} = siteslice.actions


export default siteslice.reducer;


