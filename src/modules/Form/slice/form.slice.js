import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _fetchForms, _saveForm, _fetchFormById } from "../api";
import { setToast } from "../../../component/Shared/ToastComponent/slice/toastSlice";

const slice_name = "form";

export const fetchForms = createAsyncThunk(
  `${slice_name}/fetchForms`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchForms(_args);
      console.log(res, "res fetchForms");
      const forms = res?.data?.result ?? res?.data ?? res;
      if (Array.isArray(forms)) dispatch(setForms(forms));
      return Array.isArray(forms) ? forms : [];
    } catch (err) {
      console.log("Error fetch forms", err.message);
    }
  },
);

export const fetchFormById = createAsyncThunk(
  `${slice_name}/fetchFormById`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _fetchFormById(_args);
      console.log(res, "res fetchFormById");
      if (res?.data?.success) {
        dispatch(setSelectedForm(res?.data?.result));
        return res?.data?.result;
      }
      return null;
    } catch (err) {
      console.log("Error fetch form by id", err.message);
    }
  },
);

export const saveForm = createAsyncThunk(
  `${slice_name}/saveForm`,
  async (_args, { dispatch, getState }) => {
    try {
      const res = await _saveForm(_args);
      console.log(res, "res saveForm");
      if (res?.data?.result?.[0]?.typeMsg === "success") {
        dispatch(
          setToast({
            message: "Formulaire enregistre avec succes",
            type: "success",
          }),
        );
        return true;
      }
      dispatch(
        setToast({
          message: res?.data?.result?.[0]?.msg || "Erreur",
          type: "error",
        }),
      );
      return false;
    } catch (err) {
      console.log("Error save form", err.message);
      return false;
    }
  },
);

export const formSlice = createSlice({
  initialState: {
    forms: [],
    selectedForm: null,
    formData: {},
  },
  name: slice_name,
  reducers: {
    setForms: (state, { payload }) => {
      state.forms = payload;
    },
    setSelectedForm: (state, { payload }) => {
      state.selectedForm = payload;
    },
    setFormData: (state, { payload }) => {
      state.formData = { ...state.formData, ...payload };
    },
    resetFormData: (state) => {
      state.formData = {};
    },
  },
});

export const getForms = (state) => state[slice_name].forms;
export const getSelectedForm = (state) => state[slice_name].selectedForm;
export const getFormData = (state) => state[slice_name].formData;

export const { setForms, setSelectedForm, setFormData, resetFormData } =
  formSlice.actions;

export default formSlice.reducer;
