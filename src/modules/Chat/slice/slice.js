import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { _createMessage, _fetchMessages, _removeMessage, _updateMessage } from "../api/index.js";
import _ from 'lodash'

const slice_name = 'chats'

export const fetchChats = createAsyncThunk(`${slice_name}/fetchChats`, async (_args, { dispatch, getState }) => {
  const res = await _fetchMessages(_args)
  dispatch(setChats(res?.response || []))
  return res
})

export const createOrUpdateChat = createAsyncThunk(`${slice_name}/createOrUpdateTask`, async (_args, { dispatch, getState }) => {
  try {
    let data = _.cloneDeep(_args)
    let res = null
    if (!data.id)
      res = await _createMessage(data)
    else
      res = await _updateMessage(data)
    return res
  } catch (e) {
    console.log('error:', e.message)
    return { error: true, message: e.message }
  }
})

export const removeChat = createAsyncThunk(`${slice_name}/removeTask`, async (_args, { dispatch, getState }) => {
  if(!_args) return
  return await _removeMessage(_args.id)
})

export const getSelectedChat = (state) => state[slice_name].selectedChat;
export const getChats = (state) => state[slice_name].chats;
export const getNewChat = (state) => state[slice_name].new_message;

export const chatSlice = createSlice({
  initialState: {
    chats: [],
    selectedChat: null,
    editChat: false,
    new_message: null
  },
  name: slice_name,
  reducers: {
    setChats(state, { payload }){
        state.chats = payload
    },
    setSelectedChat(state, { payload }){
        state.selectedChat = payload
    },
    setEditChat(state, { payload }){
        state.editChat = payload
    },
    setNewChat(state, { payload }){
      state.new_message = payload;
    },
    setNotify(state, { payload }){
        state.notify = payload
    }
  }
});

export const {
  setSelectedChat,
  setChats,
  setEditChat,
  setNewChat,
  setNotify
} = chatSlice.actions

export default chatSlice.reducer;