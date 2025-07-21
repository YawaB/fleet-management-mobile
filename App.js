import { NavigationContainer } from "@react-navigation/native";
import { Provider,  } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { store } from "./src/store/index";
import "./index.css"
// import { ToastProvider } from "react-native-paper-toast";


import { Platform, UIManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Layout from "./src/component/Layout";
import { navigationRef } from "./src/core/utils/navigation";

// store.dispatch(checkUser());

// library.add(faB);

export default function App() {
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        {/* <ToastProvider> */}
          <NavigationContainer ref={navigationRef}>
            {/* <AutocompleteDropdownContextProvider> */}
              <GestureHandlerRootView style={{ flex: 1 }}>
               <Layout />
              </GestureHandlerRootView>
            {/* </AutocompleteDropdownContextProvider> */}
          </NavigationContainer>
        {/* </ToastProvider> */}
      </PaperProvider>
    </Provider>
  );
}
