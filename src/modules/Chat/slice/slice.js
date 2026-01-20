import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  _fetchConversationList,
  _fetchMessagesList,
  _getUserRead,
  _readMsg,
  _saveConversation,
} from "../api/index.js";
import _ from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

const name = "chat";

export const fetchConversationList = createAsyncThunk(
  `${name}/fetchConversationList`,
  async (_args, { getState, dispatch }) => {
    let response = await _fetchConversationList(_args);
    console.log("response fetchConversationList", response);
    if (response?.data?.success && Array.isArray(response?.data?.result)) {
      dispatch(setDetailMessage(response?.data?.result || []));
    }
    return response?.data?.result;
  },
);

export const saveConversation = createAsyncThunk(
  `${name}/saveConversation`,
  async (_args, { dispatch, getState }) => {
    try {
      let { selectedChat } = getState()[name];
      let obj = {
        id: 0,
        subject: selectedChat?.Subject || _args?.subject,
        message: _args?.message,
        to: "",
        from: _args?.from,
        Object: _args?.Object,
        type: "Chat",
        srcId: _args.srcId,
        src: "Engin",
        datecom: _args?.datecom || "",
      };

      console.log("obj saveConversation", obj);

      let res = await _saveConversation(obj);

      if (
        Array.isArray(res?.data?.result) &&
        (res?.data?.result || [])[0]?.msg === "ok"
      ) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
);

export const fetchMessagesList = createAsyncThunk(
  `${name}/fetchMessagesList`,
  async (_args, { getState, dispatch }) => {
    let response = await _fetchMessagesList();
    console.log("response fetchMessagesList", response);
    if (response?.data?.success && Array.isArray(response?.data?.result)) {
      dispatch(setMessageList(response?.data?.result || []));
    }
    return response?.data?.result;
  },
);

export const readMsg = createAsyncThunk(
  `${name}/readMsg`,
  async (_args, { getState, dispatch }) => {
    const response = await _readMsg(_args);
    return response;
  },
);

export const userRead = createAsyncThunk(
  `${name}/userRead`,
  async (_args, { getState, dispatch }) => {
    const response = await _getUserRead();
    dispatch(setUserRead(response?.result?.[0]?.Read || 0));
  },
);

export const setDetailMessage = createAction(`${name}/setDetailMessage`);

const chatSlice = createSlice({
  name,
  initialState: {
    messages: [],
    messageList: [],
    detailMessage: [],
    selectedChat: null,
    detailChat: false,
    userRead: 0,
    notify: false,
    enableNotification: true,
  },
  reducers: {
    setDetailChat: (state, action) => {
      state.detailChat = action.payload;
    },
    setNotify: (state, action) => {
      state.notify = action.payload;
    },
    setEnableNotification: (state, { payload }) => {
      state.enableNotification = payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    setMessageList: (state, action) => {
      state.messageList = action.payload;
    },
    setUserRead: (state, action) => {
      state.userRead = action.payload;
    },
    setChatMessages: (state, action) => {
      try {
        let checkObject =
          action.payload.msg?.Object === state.selectedChat?.Object;
        console.log("checkObject:", checkObject);
        if (state.detailChat && checkObject) {
          const details = [...state.detailMessage];
          details.push(action.payload.msg);
          state.detailMessage = details;
        } else {
          let findObject = state.messageList?.find(
            (msg) => msg.Object === action.payload.msg?.Object,
          );

          if (!findObject) {
            state.messageList.unshift(action.payload.msg);
          } else if (findObject) {
            state.messageList = [
              { ...findObject, message: action.payload.msg.message, Read: 1 },
              ...state.messageList.filter(
                (msg) => msg.Object !== action.payload.msg.Object,
              ),
            ];
          }
        }

        state.notify = state.enableNotification;
      } catch (e) {}

      console.log("state.detailMessage:", _.cloneDeep(state.detailMessage));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setDetailMessage, (state, { payload }) => {
      state.detailMessage = payload;
    });
  },
});

export const getDetailChat = (state) => state[name].detailChat;
export const getChatMessages = (state) => state[name].messages;
export const getSelectedChat = (state) => state[name].selectedChat;
export const getMessageList = (state) => state[name].messageList;
export const getDetailMessage = (state) => state[name].detailMessage;
export const getNotify = (state) => state[name].notify;
export const getEnableNotification = (state) => state[name].enableNotification;
export const getUserRead = (state) => state[name].userRead;

export const {
  setDetailChat,
  setNotify,
  setEnableNotification,
  setChatMessages,
  setSelectedChat,
  setMessageList,
  setUserRead,
} = chatSlice.actions;

export default chatSlice.reducer;
