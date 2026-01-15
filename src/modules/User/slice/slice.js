import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  _createUser,
  _fetchStaff,
  _fetchUsers,
  _removeUser,
  _updateUser,
} from "../api/index";
import _ from "lodash";

const slice_name = "users";

export const fetchUsers = createAsyncThunk(
  `${slice_name}/fetchUsers`,
  async (_args, { dispatch, getState }) => {
    const res = await _fetchUsers(_args?.role ? _args.role : "");
    console.log("users:", res);
    if (Array.isArray(res.response || res))
      dispatch(setUsers(res.response || res));
    return res.success ? res.data : [];
  }
);

export const createOrUpdateUser = createAsyncThunk(
  `${slice_name}/createOrUpdateTask`,
  async (_args, { dispatch, getState }) => {
    try {
      let { selectedUser } = getState()[slice_name];

      if (!_args) return;
      let data = _.cloneDeep(_args);

      delete data.pseudo;
      delete data.expired_at;
      let res = null;

      if (!data.id) res = await _createUser(data);
      else res = await _updateUser(data);
      res.success = res.success || res.status;
      console.log("res:", res);
      if (res.status) dispatch(fetchUsers());

      return res;
    } catch (e) {
      return { error: true, message: e.message };
    }
  }
);

export const fetchStaff = createAsyncThunk(
  `${slice_name}/fetchStaff`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchStaff(_args);
      console.log("resss:", res);
      const staff = res?.data?.result;
      const normalizedStaff = Array.isArray(staff) ? staff : [];
      if (res?.data?.success) dispatch(setStaff(normalizedStaff));
      return normalizedStaff;
    } catch (e) {
      console.log("Error fetch staff", e.message);
      return { error: true, message: e.message };
    }
  }
);

export const removeUser = createAsyncThunk(
  `${slice_name}/removeTask`,
  async (_args, { dispatch, getState }) => {
    const res = await _removeUser(_args.id);
    console.log("resss:", res);
    if (res.success) dispatch(fetchUsers());
    return res;
  }
);

export const userslice = createSlice({
  initialState: {
    users: [],
    selectedUser: null,
    editUser: false,
    staff: [],
    view: "list",
  },
  name: slice_name,
  reducers: {
    setUsers: (state, { payload }) => {
      if (Array.isArray(payload)) {
        state.users = payload.map((u) => ({
          ...u,
          pseudo: ((u.fname?.[0] || "") + (u.sname?.[0] || "")).toUpperCase(),
        }));
      } else {
        state.users = payload;
      }
    },
    setSelectedUser: (state, { payload }) => {
      state.selectedUser = payload;
    },
    setEditUser: (state, { payload }) => {
      state.editUser = payload;
    },
    setUserView: (state, { payload }) => {
      state.view = payload;
    },
    setStaff: (state, { payload }) => {
      state.staff = payload;
    },
  },
});

export const getSelectedUser = (state) => state[slice_name].selectedUser;
export const getUsers = (state) => state[slice_name].users;
export const getUserView = (state) => state[slice_name].view;
export const getEditUser = (state) => state[slice_name].editUser;
export const getStaff = (state) => state[slice_name].staff;

export const { setUsers, setSelectedUser, setEditUser, setUserView, setStaff } =
  userslice.actions;

export default userslice.reducer;
