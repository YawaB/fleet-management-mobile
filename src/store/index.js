import { configureStore } from "@reduxjs/toolkit"
import  authSlice  from "../modules/Authentication/slice/auth.slice"
import featureSlice  from "../modules/Feature/slice/slice"
import siteSlice  from "../modules/Site/slice/slice"
import ticketSlice  from "../modules/Ticket/slice/slice"
import templateSlice  from "../modules/Template/slice/slice"
import  userSlice  from "../modules/User/slice/slice"
import photoSlice from '../component/Shared/CameraScreen/slice/photo.slice'
import uiSlice  from "./slice/ui"
import globalSlice from "./slice/global.slice"
import chatSlice  from "../modules/Chat/slice/slice"
import loggerSlice  from "../hook/Logger/slice/logger.slice"

export const store = configureStore({
    reducer: {
        auth: authSlice,
        features: featureSlice,
        sites: siteSlice,
        tickets: ticketSlice,
        templates: templateSlice,
        users: userSlice,
        ui:uiSlice,
        photo: photoSlice,
        global: globalSlice,
        chats:chatSlice,
        logger: loggerSlice
    }
})