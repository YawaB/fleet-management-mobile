import { StatusBar, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthenticationScreen from "../modules/Authentication/ui/AuthenticationComponent";
import BottomTabs from "../navigation/BottomTabs";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../modules/Authentication/slice/auth.slice";
import FeatureTab from "./FeatureTab";
import MenuComponent from "./MenuComponent";
import { Portal } from "react-native-paper";
import LoadingComponent from "./Shared/LoadingComponent/LoadingComponent";
import { getUiParams } from "../store/slice/ui";
import { useEffect } from "react";
import SqliteModule from "../core/modules/SqliteModule";
import { colors } from "../theme/colors";
import { bindEvents, unbindEvents } from "../socket/socket";
import { getAndSaveFcmToken, initFirebaseMessaging } from "../firebase";
import useLogger from "../hook/Logger/useLogger";
import LoggerScreen from "../modules/Logger/LoggerScreen";
import CameraScreen from "./Shared/CameraScreen/CameraScreen";
import ToastComponent from "./Shared/ToastComponent/ToastComponent";
import { I18nManager } from "react-native";
import i18n from "../i18n";

const Stack = createNativeStackNavigator();
function Layout() {
  const { log } = useLogger();
  const current_user = useSelector(getCurrentUser);
  console.log("current_user", current_user);
  let uiParams = useSelector(getUiParams);
  let dispatch = useDispatch();

  useEffect(() => {
    SqliteModule.init({
      debug: false,
    }).then(async (res) => {
      if (res.db) {
      }
    });

    setTimeout(() => {
      bindEvents(dispatch);
    }, 5000);
    return () => unbindEvents();
  }, []);

  useEffect(() => {
    // initFirebaseMessaging();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.primary} />
      <Portal>
        <ToastComponent />
        {uiParams?.showLoader && (
          <LoadingComponent style={{ backgroundColor: "rgba(0,0,0,.1)" }} />
        )}
      </Portal>
      <Stack.Navigator
        initialRouteName={current_user ? "Features" : "Login"}
        screenOptions={({ route }) => ({
          header: () => (
            <View>
              <MenuComponent />
            </View>
          ),
        })}
      >
        <Stack.Screen
          name="Features"
          component={BottomTabs}
          options={({ route }) => ({
            header: () => null,
          })}
        />
        <Stack.Screen
          name="FeaturesTab"
          component={FeatureTab}
          options={{ headerTitle: "Les logs", headerShown: false }}
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
        <Stack.Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{
            header: () => <MenuComponent title={"Prendre une photo"} />,
          }}
        />
      </Stack.Navigator>
    </View>
  );
}

export default Layout;
