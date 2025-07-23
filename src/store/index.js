import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../modules/Authentication/slice/auth.slice";
import featureSlice from "../modules/Feature/slice/slice";
import photoSlice from "../component/Shared/CameraScreen/slice/photo.slice";
import uiSlice from "./slice/ui";
import globalSlice from "./slice/global.slice";
import loggerSlice from "../hook/Logger/slice/logger.slice";
import paneslice from "../modules/Pane/slice/panne.slice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    features: featureSlice,
    ui: uiSlice,
    photo: photoSlice,
    global: globalSlice,
    logger: loggerSlice,
    pannes: paneslice,
  },
});
