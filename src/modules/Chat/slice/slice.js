import {
  createSlice,
  createAction,
  createAsyncThunk,
  current,
} from "@reduxjs/toolkit";
import {
  _fetchConversationList,
  _fetchMessagesList,
  _fetchResources,
  _getUserRead,
  _readMsg,
  _saveConversation,
} from "../api/index.js";
import _ from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

const name = "chat";

const getChatKey = (msg) => {
  const srcId = msg?.srcId ?? msg?.srcID;
  const srcObject = msg?.srcObject ?? msg?.src;
  if (srcId != null && srcObject != null) {
    return `${String(srcObject)}:${String(srcId)}`;
  }
  const obj = msg?.Object ?? msg?.label ?? msg?.subject;
  return obj != null ? `obj:${String(obj)}` : "";
};

const mergeChatMeta = (incoming, metaSource) => {
  if (!incoming || typeof incoming !== "object") return incoming;
  if (!metaSource || typeof metaSource !== "object") return incoming;

  return {
    ...incoming,
    srcId: incoming?.srcId ?? metaSource?.srcId,
    srcObject: incoming?.srcObject ?? metaSource?.srcObject ?? incoming?.src,
    src: incoming?.src ?? metaSource?.srcObject ?? metaSource?.src,
    label: incoming?.label ?? metaSource?.label ?? metaSource?.Object,
    image: incoming?.image ?? metaSource?.image,
    imageid: incoming?.imageid ?? metaSource?.imageid,
  };
};

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
        ..._args,
        id: 0,
        type: "Chat",
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
    try {
      const response = await _readMsg(_args);
      console.log("response readMsg", response);
      if (response?.data?.success) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
);

export const userRead = createAsyncThunk(
  `${name}/userRead`,
  async (_args, { getState, dispatch }) => {
    const response = await _getUserRead();
    dispatch(setUserRead(response?.result?.[0]?.Read || 0));
  },
);

export const fetchResources = createAsyncThunk(
  `${name}/fetchResources`,
  async (_args, { getState, dispatch }) => {
    try {
      let response = await _fetchResources(_args);
      console.log("response fetchResources", response);
      if (response?.data?.success && Array.isArray(response?.data?.result)) {
        dispatch(setMessageList(response?.data?.result.slice(0, 10)));
      }
      return response?.data?.result;
    } catch (e) {
      return false;
    }
  },
);

export const setDetailMessage = createAction(`${name}/setDetailMessage`);

const chatSlice = createSlice({
  name,
  initialState: {
    messages: [],
    messageList: [],
    detailMessage: [],
    resources: [],
    selectedChat: null,
    detailChat: false,
    userRead: 0,
    notify: false,
    enableNotification: true,
    newChat: null,
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
    setNewChat: (state, action) => {
      try {
        const normalizedMsg = action.payload.msg;

        const listMsg = Array.isArray(state.messageList)
          ? state.messageList
          : [];

        const detailMsg = Array.isArray(state.detailMessage)
          ? state.detailMessage
          : [];
        if (listMsg.length > 0) {
          const foundMsgFromList = listMsg.find(
            (msg) => msg.srcId == normalizedMsg.fromId,
          );
          if (foundMsgFromList) {
            const idx = listMsg.findIndex(
              (msg) => msg.srcId == normalizedMsg.fromId,
            );
            listMsg[idx] = {
              ...foundMsgFromList,
              message: normalizedMsg.message,
              Read: 0,
              datecom: normalizedMsg.datecom,
            };
          }
        }

        if (state.detailChat && detailMsg.length > 0) {
          const isMyThread = detailMsg.some(
            (msg) =>
              msg.srcId == normalizedMsg.toId ||
              msg.srcId == normalizedMsg.fromId,
          );
          if (isMyThread) {
            state.detailMessage = [...detailMsg, normalizedMsg];
          }
        }
      } catch (e) {
        console.log("chat error", e);
      }
    },
    setChatMessages: (state, action) => {
      try {
        const incomingRaw = action.payload?.msg;
        if (!incomingRaw) return;

        const selected = state.selectedChat;
        const incoming = mergeChatMeta(incomingRaw, selected);

        const incomingKey = getChatKey(incoming);
        const selectedKey = getChatKey(selected);
        const checkObject =
          incomingKey && selectedKey && incomingKey === selectedKey;

        console.log("checkObject:", checkObject);

        if (state.detailChat && checkObject) {
          const details = [...state.detailMessage];
          details.push(incoming);
          state.detailMessage = details;
        }

        const idx = (state.messageList || []).findIndex(
          (m) => getChatKey(m) === incomingKey,
        );

        if (idx >= 0) {
          const found = state.messageList[idx];
          state.messageList = [
            {
              ...found,
              ...incoming,
              message: incoming?.message ?? found?.message,
              Read: 1,
            },
            ...state.messageList.filter((_, i) => i !== idx),
          ];
        } else {
          state.messageList = [incoming, ...(state.messageList || [])];
        }

        state.notify = state.enableNotification;
      } catch (e) {}

      console.log("state.detailMessage:", _.cloneDeep(state.detailMessage));
    },
    setResources: (state, action) => {
      state.resources = action.payload;
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
export const getResources = (state) => state[name].resources;
export const getNewChat = (state) => state[name].newChat;

export const {
  setDetailChat,
  setNotify,
  setEnableNotification,
  setChatMessages,
  setNewChat,
  setSelectedChat,
  setMessageList,
  setUserRead,
  setResources,
} = chatSlice.actions;

export default chatSlice.reducer;
