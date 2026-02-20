import { initializeApp } from "firebase/app";
// import { getMessaging  } from "firebase/messaging/sw"
import { getMessaging } from "@react-native-firebase/messaging";

let firebaseConfig = {
  apiKey: "AIzaSyAYrZBbfaMbcxFmXxW6ib4YnRYgktvx_eQ",
  projectId: "fleetmanagament-6c486",
  appId: "1:748968991885:android:7d57808aac4a4fc70396c4",
  messagingSenderId: "748968991885",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
