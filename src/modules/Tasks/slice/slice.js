import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import _ from "lodash";
import {
  _fetchFormFields,
  _fetchTaskDetail,
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
  },
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
  },
);

export const fetchFormFields = createAsyncThunk(
  `${slice_name}/fetchFormFields`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchFormFields(_args);
      console.log(res, "res fetchFormFields");
      dispatch(setFormFields(res.data.result));
      return res;
    } catch (err) {
      console.log("Error fetch tasks", err.message);
    }
  },
);

export const fetchTaskDetail = createAsyncThunk(
  `${slice_name}/fetchTaskDetail`,
  async (_args, { dispatch }) => {
    try {
      const res = await _fetchTaskDetail(_args);
      console.log(res, "res fetchTaskDetail");
      const task = res?.data?.result?.[0] ?? res?.data?.result ?? res?.data;
      if (task) dispatch(upsertTask(task));
      return task ?? null;
    } catch (err) {
      console.log("Error fetch task detail", err.message);
      return null;
    }
  },
);

export const startTaskOrStop = createAsyncThunk(
  `${slice_name}/startTaskOrStop`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _startTaskOrStop(_args);
      console.log(res, "res startTaskOrStop");
      if (res?.data?.typeMsg === "success") {
        dispatch(fetchTaskList());
        dispatch(
          setToast({
            message: "Tache mise à jour avec succès",
            type: "success",
          }),
        );
        return true;
      } else {
        dispatch(
          setToast({
            message:
              "Transition non autorisée de En cours vers En vérification",
            type: "error",
          }),
        );
      }
      return false;
    } catch (err) {
      console.log("Error start or stop task", err.message);
      return false;
    }
  },
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
          }),
        );
        return true;
      }
      dispatch(
        setToast({
          message: res.data.result[0].msg,
          type: "error",
        }),
      );
      return false;
    } catch (err) {
      console.log("Error save or update task", err.message);
    }
  },
);

export const tasksSlice = createSlice({
  initialState: {
    tasks: [],
    taskStatus: [],
    formFields: [],
    updatedTaskVar: null,
  },
  name: slice_name,
  reducers: {
    setTasks: (state, { payload }) => {
      state.tasks = payload;
    },
    upsertTask: (state, { payload }) => {
      const incoming = payload;
      state.updatedTaskVar = incoming;
      if (!incoming) return;

      const incomingId = incoming?.TaskId ?? incoming?.taskId ?? incoming?.id;
      if (incomingId === undefined || incomingId === null) return;

      const idx = (state.tasks || []).findIndex(
        (t) => String(t?.TaskId ?? t?.taskId ?? t?.id) === String(incomingId),
      );

      if (idx >= 0) {
        state.tasks[idx] = { ...state.tasks[idx], ...incoming };
      } else {
        state.tasks.unshift(incoming);
      }
    },
    setTaskStatus: (state, { payload }) => {
      state.taskStatus = payload;
    },
    setFormFields: (state, { payload }) => {
      state.formFields = payload;
    },
  },
});

export const getTasks = (state) => state[slice_name].tasks;
export const getTaskStatus = (state) => state[slice_name].taskStatus;
export const getUpdatedTask = (state) => state[slice_name].updatedTaskVar;
export const getFormFields = (state) => state[slice_name].formFields;

export const { setTasks, upsertTask, setTaskStatus, setFormFields } =
  tasksSlice.actions;

export default tasksSlice.reducer;
