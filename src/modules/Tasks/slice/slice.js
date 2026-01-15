import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import _ from "lodash";
import {
  _fetchTaskList,
  _fetchTaskStatus,
  _saveOrUpdateTask,
  _startTaskOrStop,
} from "../api";
import { setToast } from "../../../component/Shared/ToastComponent/slice/toastSlice";

const slice_name = "task";

export const fetchTaskList = createAsyncThunk(
  `${slice_name}/fetchTaskList`,
  async (_args, { dispatch, getState }) => {
    try {
      const user = getState()["auth"].current_user;
      console.log(user, "user fetchTaskList");
      const res = await _fetchTaskList(_args);
      console.log(res, "res fetchTaskList");
      const tasks = res?.data?.result ?? res?.data ?? res;
      if (Array.isArray(tasks)) dispatch(setTasks(tasks));
      return Array.isArray(tasks) ? tasks : [];
    } catch (err) {
      console.log("Error fetch tasks", err.message);
    }
  }
);

export const fetchTaskStatus = createAsyncThunk(
  `${slice_name}/fetchTaskStatus`,
  async (_args, { dispatch, getState }) => {
    try {
      const user = getState()["auth"].current_user;
      console.log(user, "user fetchTaskStatus");
      const res = await _fetchTaskStatus(_args);
      console.log(res, "res fetchTaskStatus");
      const tasks = res?.data?.result ?? res?.data ?? res;
      if (Array.isArray(tasks)) dispatch(setTaskStatus(tasks));
      return Array.isArray(tasks) ? tasks : [];
    } catch (err) {
      console.log("Error fetch tasks", err.message);
    }
  }
);

export const startTaskOrStop = createAsyncThunk(
  `${slice_name}/startTaskOrStop`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _startTaskOrStop(_args);
      console.log(res, "res startTaskOrStop");
      if (res?.data.typeMsg === "success") {
        dispatch(fetchTaskList());
        dispatch(
          setToast({
            message: res?.data?.message,
            type: "success",
          })
        );
        return true;
      }
      dispatch(
        setToast({
          message: res?.data?.msg,
          type: "error",
        })
      );
      return false;
    } catch (err) {
      console.log("Error start or stop task", err.message);
      return false;
    }
  }
);

export const saveOrUpdateTask = createAsyncThunk(
  `${slice_name}/saveOrUpdateTask`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _saveOrUpdateTask(_args);
      console.log(res, "res saveOrUpdateTask");
      if (res.data.result[0].typeMsg === "success") {
        dispatch(fetchTaskList());
        dispatch(
          setToast({
            message: "Tâche modifiée avec succès",
            type: "success",
          })
        );
        return true;
      }
      return false;
    } catch (err) {
      console.log("Error save or update task", err.message);
    }
  }
);

export const tasksSlice = createSlice({
  initialState: {
    tasks: [],
    taskStatus: [],
  },
  name: slice_name,
  reducers: {
    setTasks: (state, { payload }) => {
      state.tasks = payload;
    },
    setTaskStatus: (state, { payload }) => {
      state.taskStatus = payload;
    },
  },
});

export const getTasks = (state) => state[slice_name].tasks;
export const getTaskStatus = (state) => state[slice_name].taskStatus;

export const { setTasks, setTaskStatus } = tasksSlice.actions;

export default tasksSlice.reducer;
