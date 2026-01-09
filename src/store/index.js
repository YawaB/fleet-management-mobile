import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../modules/Authentication/slice/auth.slice";
import featureSlice from "../modules/Feature/slice/slice";
import photoSlice from "../component/Shared/CameraScreen/slice/photo.slice";
import uiSlice from "./slice/ui";
import globalSlice from "./slice/global.slice";
import loggerSlice from "../hook/Logger/slice/logger.slice";
import paneslice from "../modules/Pane/slice/panne.slice";
import tasksSlice from "../modules/Tasks/slice/slice";
import toastSlice from "../component/Shared/ToastComponent/slice/toastSlice";
import mainHomeSlice from "../modules/MainHome/slice/slice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    features: featureSlice,
    ui: uiSlice,
    photo: photoSlice,
    global: globalSlice,
    logger: loggerSlice,
    pannes: paneslice,
    task: tasksSlice,
    toast: toastSlice,
    mainHome: mainHomeSlice,
  },
});
