import { initializeApp } from 'firebase/app';
// import { getMessaging  } from "firebase/messaging/sw"
import { getMessaging } from '@react-native-firebase/messaging';

let firebaseConfig = {
    apiKey: "AIzaSyDC01JF-Ag1zff2PvnyW6TDaGByqYkectA",
    projectId: "asset-tracking-system-bf045",
    appId: "1:727610922410:android:d4737e21ca43050c9c07d3",
    messagingSenderId: "727610922410"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app)

console.log('firebase initialized:', messaging)