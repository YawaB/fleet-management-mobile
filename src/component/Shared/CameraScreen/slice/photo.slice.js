import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { _uploadBase64 } from "../../../../cors/modules/file/api";
const _uploadBase64 = ()=>{}
const name = 'photo'

export const savePhoto = createAsyncThunk(`${name}/savePhoto` , async (_arg , { getState , dispatch })=> {
    let { params } =  getState()[name];
    if(_arg.params) params = _arg.params

    let result = await _uploadBase64(_arg.base64 , _arg.params);
    dispatch(setSavePhotoResult(result))
    return result 
})

export const getPhoto = state => state[name].photo
export const getPhotos = state => state[name].photos
export const getOpenPhotoView = state => state[name].open
export const getSavePhoto = state => state[name].save
export const getSavePhotoResult = state => state[name].save_result
const photoSlice = createSlice({
    name,
    initialState: {
        photo: null,
        photos: [],
        open: false,
        save: true,
        params: null,
        save_result: null
    },
    reducers: {
        setPhoto: (state , { payload })=>{
            state.photo = payload
        },
        setPhotos: (state , { payload })=>{
            state.photos = payload
        },
        appendPhoto: (state , { payload })=>{
            if(Array.isArray(state.photo)) state.photo.push(payload)
            else state.photo = [payload]
        },
        setOpenPhotoView: (state , { payload })=>{
            state.open = payload
            state.photo = null
            state.params = null
        },
        setSavePhoto: (state , { payload })=>{
            state.save = payload
        },
        setSavePhotoResult: (state , { payload})=>{
            state.save_result = payload
        }
    }
})


export const {
    setPhoto,
    setPhotos,
    appendPhoto,
    setOpenPhotoView,
    setSavePhoto,
    setSavePhotoResult
} = photoSlice.actions

export default photoSlice.reducer