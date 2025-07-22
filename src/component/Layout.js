import { StatusBar, Text, View } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthenticationScreen from "../modules/Authentication/ui/AuthenticationComponent"
import FeatureScreen from "../modules/Feature/ui/FeatureScreen";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../modules/Authentication/slice/auth.slice";
import FeatureTab from "./FeatureTab";
import { Ionicons } from "@expo/vector-icons";
import MenuComponent from "./MenuComponent";
import { Portal } from "react-native-paper";
import LoadingComponent from "./Shared/LoadingComponent/LoadingComponent";
import { getUiParams } from "../store/slice/ui";
import { useEffect } from "react";
import SqliteModule from "../core/modules/SqliteModule";
import { requestGeolocationCurrentPosition } from "../core/api/geolocation";
import Toast from "react-native-toast-message";
import { bindEvents, unbindEvents } from "../socket/socket";
import { getAndSaveFcmToken, initFirebaseMessaging } from "../firebase";
import { createFile, readFile } from "../core/utils/file";
import useLogger from "../hook/Logger/useLogger";
import LoggerScreen from "../modules/Logger/LoggerScreen";
import { navigationRef } from "../core/utils/navigation";

const Stack = createNativeStackNavigator();
function Layout() {
  const { log } = useLogger()
  const current_user = useSelector(getCurrentUser)
  console.log("current_user", current_user)
  let uiParams = useSelector(getUiParams)
  let dispatch = useDispatch()

  useEffect(() => {
    SqliteModule.init({
      debug: false
    }).then(async res=>{
      if(res.db){
      }
    })

    setTimeout(() => {
      bindEvents(dispatch);
    }, 5000);
    return ()=> unbindEvents()
  }, [])

  useEffect(()=>{
    initFirebaseMessaging()
  }, [])
  return (
    <View style={{flex: 1}}>
      <StatusBar backgroundColor={'#f97316'} />
      <Portal>
        <Toast />
        { uiParams.showLoader && <LoadingComponent  style={{backgroundColor: 'rgba(0,0,0,.1)'}} />}
      </Portal>
      <Stack.Navigator
        screenOptions={({route})=>({
            header: ()=>(
              <View>
                <MenuComponent/>
              </View>
            )
        })}
        >
        {
          false ? (
            <>
              <Stack.Screen
                name="Features"
                component={FeatureScreen}
                options={{ headerShown: false, headerTitle: "Les logs" }}
              />
               <Stack.Screen
                name="FeaturesTab"
                component={FeatureTab}
                options={{headerTitle: "Les logs"  , headerShown: false}}
              />
              <Stack.Screen
                name="Login"
                component={AuthenticationScreen}
                options={{ headerShown: false, headerTitle: "Les logs" }}
              />
              <Stack.Screen
                name="Logger"
                component={LoggerScreen}
                options={{ headerTitle: "Les logs" }}
              />
              
            </>
          ):(
            <>
             <Stack.Screen
                name="Login"
                component={AuthenticationScreen}
                options={{ headerShown: false, headerTitle: "Les logs" }}
              />
            </>
          )
        }
      </Stack.Navigator>
    </View>
  )
}

export default Layout