import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  _checkUser,
  _fetchUserAuthorizations,
  _login,
  _logOut,
} from "../api/index";
import _ from "lodash";
import { initFirebaseMessaging, subscribeToTopic } from "../../../firebase";
const slice_name = "auth";

export const login = createAsyncThunk(
  `${slice_name}/login`,
  async (_args, { dispatch, getState }) => {
    try {
      console.log("login args:", _args);
      const res = await _login(_args);
      console.log("response auth:", res);
      if (res?.data?.success) {
        let user = res?.data?.result;
        console.log("user login:", user);
        dispatch(setCurrentUser(user));
        // dispatch(fetchUserAuthorizations())
        await AsyncStorage.setItem("token", user?.key);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("userID", user?.userID.toString());
        initFirebaseMessaging()
        
        return true;
      } else {
        dispatch(setCurrentUser(null));
        await AsyncStorage.setItem("token", "");
        return false;
      }
    } catch (e) {
      console.log("error:", e);
      return false;
    }
  }
);

export const checkUser = createAsyncThunk(
  `${slice_name}/checkUser`,
  async (token, { dispatch, getState }) => {
    try {
      if (!token) {
        console.warn("No token provided for user validation");
        return false;
      }

      const res = await _checkUser(token);

      if (res?.data?.success && res?.data?.result) {
        // Update current user in Redux state
        dispatch(setCurrentUser(res.data.result));
        console.log("Validated user:", res.data.result);

        // Store updated user data and token
        await AsyncStorage.setItem("token", res.data.key || token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.result));
        await AsyncStorage.setItem("userID", res.data.result?.userID.toString());


        // // Fetch user authorizations
        // await dispatch(fetchUserAuthorizations());
        initFirebaseMessaging()
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error validating user:", error);
      // Clear invalid auth data
      await AsyncStorage.multiRemove(["token", "user"]);
      return false;
    }
  }
);

export const logout = createAsyncThunk(
  `${slice_name}/logout`,
  async (_args, { dispatch, getState }) => {
    try {
      // Clear all auth-related data
      await AsyncStorage.multiRemove([
        "token",
        "user",
        "rememberMe",
        "savedCredentials",
      ]);

      // Clear Redux state
      dispatch(setCurrentUser(null));
      dispatch(setUserAuthorizations([]));

      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  }
);

export const fetchUserAuthorizations = createAsyncThunk(
  `${slice_name}/fetchUserAuthorizations`,
  async (_args, { dispatch, getState }) => {
    let { current_user } = getState()[slice_name];
    const res = await _fetchUserAuthorizations(current_user?.id);
    console.log("authorizations:", res);
    if (res?.data?.success)
      dispatch(setUserAuthorizations(res?.data?.actions || []));
    return res;
  }
);

export const setUserToken = createAction(`${slice_name}/setUserToken`);

export const authSlice = createSlice({
  initialState: {
    current_user: null,
    user_token: null,
    is_admin: false,
    users: [{ login: "admin", password: "ys25_@2022" }],
    mode: "prod",
    authorizations: [],
  },
  name: slice_name,
  reducers: {
    setUsers(state, { payload }) {
      state.users = payload;
    },
    setCurrentUser(state, { payload }) {
      if (!payload) payload = {};
      payload = _.cloneDeep(payload);
      payload.is_admin =
        _.intersection(payload?.rolesname || [], ["super_admin", "admin"])
          ?.length > 0;
      payload.is_super_admin = (payload?.rolesname || []).includes(
        "super_admin"
      );
      state.current_user = payload;
      console.log("isSuperad:", payload.is_super_admin);
      if (payload.is_super_admin) subscribeToTopic("admin-topic");
    },
    setIsAdmin(state, { payload }) {
      state.is_admin = payload;
    },
    setUserAuthorizations(state, { payload }) {
      state.authorizations = payload;
    },
  },
});

export const { setUsers, setCurrentUser, setIsAdmin, setUserAuthorizations } =
  authSlice.actions;

export const getCurrentUser = (state) => state[slice_name].current_user;
export const getIsAdmin = (state) => state[slice_name].is_admin;
export const getUserToken = (state) => state[slice_name].user_token;
export const getUserRoles = (state) => state[slice_name].roles;
export const getUsers = (state) => state[slice_name].users;
export const getUserAuthorizations = (state) =>
  state[slice_name].authorizations;

export default authSlice.reducer;
