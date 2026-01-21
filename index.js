// import { registerRootComponent } from 'expo';

// import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

// registerRootComponent(App);

import "react-native-gesture-handler";

import App from "./App";

import { AppRegistry } from "react-native";
import { initNotifee } from "./src/notification";
import { initFirebaseEvents } from "./src/firebase";
initNotifee();
initFirebaseEvents()
AppRegistry.registerComponent("FleetManagement", () => App);
