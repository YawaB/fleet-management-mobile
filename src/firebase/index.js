import { PermissionsAndroid } from "react-native";
import { Platform } from "react-native";
// import { messaging } from "./initialize";
import messaging2 from '@react-native-firebase/messaging';

import { saveFcmToken } from "./service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { displayNotitication, initNotifee } from "../notification";
const displayToastOnMessage = false;

let messaging = messaging2();
async function requestIosNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log("Authorization status:", authStatus);
  }

  return enabled;
}

async function requestAndroidNotificationPermission() {
  let permission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  return permission === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestNotificationPermission() {
  if (Platform.OS === "ios") {
    await requestIosNotificationPermission();
  } else {
    await requestAndroidNotificationPermission();
  }
  return null;
}

export async function getFcmToken() {
  // fcmToken = await messaging().getToken()
  console.log("FCM Token:", await messaging.getToken());
  return await messaging.getToken();
  // console.log('FCM Token:', fcmToken);
  return "";
}

export async function getAndSaveFcmToken(message) {
  getFcmToken()
    .then(async (fcm) => {
      let userID = await AsyncStorage.getItem("userID");
      // return
      if (fcm) {
        saveFcmToken({
          token: fcm,
          userID: userID,
          device_type: "mobile",
        }).then((res) => {
          console.log("res fcmToke", res)
        })
      }
    })
    .catch((e) => {
      console.log("error getting token", e);
    });
  return;
  requestNotificationPermission()
    .then((res) => {
      console.log("permission:", res);
      getFcmToken()
        .then((fcm) => {
          console.log("FCM Token:", fcm);
          return;
          if (fcm) {
            saveFcmToken({
              fcmtoken: fcm,
              device_type: "mobile",
            });
          }
        })
        .catch((e) => {
          console.log("error getting token", e);
        });
    })
    .catch((e) => {
      console.log("error getting permission", e);
    });
  console.log("App opened with message:", message);
  // Handle the app opening event here
}

async function onMessageReceived(message , isBackground) {
  try{
     
      console.log("Message received:", message, isBackground);
      let userID = await AsyncStorage.getItem("userID");
      let currentChatId = await AsyncStorage.getItem("current-chat-id");
    
      let data = message?.data?.data
      if(!data) return
      data = JSON.parse(data)
      console.log('data', data , data?.srcId)
      console.log('currentChatId:', currentChatId)
      
      

      // return
      if(1 || (userID != data.fromId && (currentChatId != data?.toId || isBackground))){
        let title = `Nouveau message ${data?.srcObject == 'user' ? `de [${data?.from}]` : `${data.srcObject} [${data?.object || data?.fromId}]`}`
        let body = data?.message

        if(!isBackground && displayToastOnMessage){
        //   toastMessage({
        //         text1: title || "Vous avez un nouveau message",
        //         text2: body
        //   })
        }

        if(isBackground || !displayToastOnMessage){
            let notifeeObj = {
                title: `<p style="color: #083859ff;"><strong >${title}</strong></p>` ,
                body:`<p>${data?.srcObject != 'user' ? `<strong>${data?.from}:</strong>`: ''} ${body}</p>`,
                channelId: (data.srcObject+'-'+data?.toId).toLowerCase(),
                channelName: (data.srcObject+'-'+data?.toId).toLowerCase(),
                // data,
                android: {
                  actions: [
                      {
                        title: 'Marquer comme lu',
                        icon: 'https://my-cdn.com/icons/snooze.png',
                        pressAction: {
                          id: 'mark-as-read',
                        },
                      },
                      {
                        title: 'Répondre',
                        icon: 'https://my-cdn.com/icons/snooze.png',
                        pressAction: {
                          id: 'reply',
                        },
                      },
                    ]
                }
            };
            displayNotitication(notifeeObj)
        }
      }
  }catch(e){
    console.log('error onMessageReceived', e)
    
  }
  
}

function onNotificationOpenedApp(message) {
  console.log("Notification opened app:", message);
  // Handle the app opening event here
}
function onTokenRefresh(token) {
  console.log("Token refreshed:", token);
  // Handle the token refresh event here
}

export function initFirebaseMessaging() {

  try {
    console.log('initFirebaseMessaging')
    // initNotifee()
    getAndSaveFcmToken();
  } catch (error) {
    console.log("error getting token initFirebaseMessaging", error);
  }
}

export function subscribeToTopic(topic) {
  messaging
    .subscribeToTopic(topic)
    .then((res) => {
      console.log(`Subscribed to topic ${topic} succcess`, res);
    })
    .catch((e) => {
      console.log(`Error subscribing to topic ${topic}`, e);
    });
}
export function unSubscribeFromTopic(topic) {
  messaging
    .unsubscribeFromTopic(topic)
    .then((res) => {
      console.log(`Subscribed to topic ${topic} succcess`, res);
    })
    .catch((e) => {
      console.log(`Error subscribing to topic ${topic}`, e);
    });
}


export function initFirebaseEvents(){
  console.log('initFirebaseEvents')
    messaging.onMessage(onMessageReceived);
    messaging.setBackgroundMessageHandler((message) =>  onMessageReceived(message , true));
    messaging.onNotificationOpenedApp(onNotificationOpenedApp);
    // messaging.onTokenRefresh(onTokenRefresh);
}