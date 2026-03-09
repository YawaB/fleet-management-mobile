import { PermissionsAndroid } from "react-native";
import { Platform } from "react-native";
// import { messaging } from "./initialize";
import messaging2 from "@react-native-firebase/messaging";

import { saveFcmToken } from "./service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  displayNotitication,
  initNotifee,
  consumePendingNotification,
} from "../notification";
import { navigate } from "../core/utils/navigation";
import { store } from "../store/index";
import { fetchDetailPanne } from "../modules/MainHome/slice/slice";
import { fetchTaskList } from "../modules/Tasks/slice/slice";
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
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
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
          console.log("res fcmToke", res);
        });
      }
    })
    .catch((e) => {
      console.log("error getting token", e);
    });
  return;
}

async function onMessageReceived(message, isBackground) {
  try {
    console.log("Message received:", message, isBackground);
    let userID = await AsyncStorage.getItem("userID");
    let currentChatId = await AsyncStorage.getItem("current-chat-id");

    let data = message?.data?.data;
    if (!data) return;
    data = JSON.parse(data);
    console.log("data", data, data?.srcId);
    console.log("currentChatId:", currentChatId);
    const channelId =
      `${data.srcObject}-${data.srcObject == "user" ? data?.senderId : data?.recipientId}`.toLowerCase();

    console.log("currentChatId", currentChatId, channelId);

    // return
    const isChatMessage = data?.type === "Chat";
    const shouldShow = isChatMessage
      ? userID != data.senderId && (currentChatId != channelId || isBackground)
      : true;
    if (shouldShow) {
      let title = `Nouveau message ${data?.srcObject == "user" ? `de [${data?.sender}]` : `${data.srcObject} [${data?.object || data?.recipientId}]`}`;

      if (!isBackground && displayToastOnMessage) {
        //   toastMessage({
        //         text1: title || "Vous avez un nouveau message",
        //         text2: body
        //   })
      }

      if (isBackground || !displayToastOnMessage) {
        let notifeeObj = {
          title: `<p style="color: #083859ff;"><strong >${data.title || title}</strong></p>`,
          body: `<p>${data?.srcObject == "user" && data?.sender ? `<strong>${data?.sender}:</strong>` : ""} ${data?.message}</p>`,
          channelId: channelId,
          channelName: (data.srcObject + "-" + data?.recipientId).toLowerCase(),
          // data,
          android: {
            actions: [
              {
                title: "Marquer comme lu",
                icon: "https://my-cdn.com/icons/snooze.png",
                pressAction: {
                  id: "mark-as-read",
                },
              },
              {
                title: "Répondre",
                icon: "https://my-cdn.com/icons/snooze.png",
                pressAction: {
                  id: "reply",
                },
              },
            ],
          },
        };
        displayNotitication({
          ...notifeeObj,
          data: { payload: JSON.stringify(data) },
        });
      }
    }
  } catch (e) {
    console.log("error onMessageReceived", e);
  }
}

export async function navigateToTask(data) {
  await store.dispatch(fetchTaskList({ filterType: "all" }));
  navigate("Task", {
    screen: "TasksList",
    params: { id: data?.subjectId },
  });
}

export async function navigateToPanneDetail(data) {
  console.log("navigateToPanneDetail", data);
  await store.dispatch(fetchDetailPanne({ id: +data?.subjectId }));
  navigate("Dashboard", {
    screen: "TaskDetail",
  });
}

export function routeNotificationData(data) {
  console.log("routeNotificationData", data);
  if (!data) return;
  if (data?.type === "Chat") {
    navigateToDetailChat(data);
  } else if (data?.subjectObject === "Tasks") {
    navigateToTask(data);
  } else if (data?.subjectObject === "pannes") {
    navigateToPanneDetail(data);
  }
}

function onNotificationOpenedApp(message) {
  console.log("Notification opened app:", message);
  try {
    let data = message?.data?.data;
    if (!data) return;
    data = JSON.parse(data);
    routeNotificationData(data);
  } catch (e) {
    console.log("error onNotificationOpenedApp", e);
  }
}

export function navigateToDetailChat(data) {
  const contact = {
    srcId: data?.senderId,
    srcObject: data?.srcObject || "user",
    label: data?.sender,
    image: null,
  };
  navigate("Chat", {
    screen: "DetailChat",
    params: { contact, type: data?.srcObject || "user" },
  });
}
function onTokenRefresh(token) {
  console.log("Token refreshed:", token);
  // Handle the token refresh event here
}

export function initFirebaseMessaging() {
  try {
    console.log("initFirebaseMessaging");
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

export function initFirebaseEvents() {
  console.log("initFirebaseEvents");
  messaging.onMessage(onMessageReceived);
  messaging.setBackgroundMessageHandler((message) =>
    onMessageReceived(message, true),
  );
  messaging.onNotificationOpenedApp(onNotificationOpenedApp);
  messaging.getInitialNotification().then((message) => {
    if (!message) return;
    console.log("getInitialNotification:", message);
    try {
      let data = message?.data?.data;
      if (!data) return;
      data = JSON.parse(data);
      routeNotificationData(data);
    } catch (e) {
      console.log("error getInitialNotification", e);
    }
  });
  AsyncStorage.removeItem("current-chat-id");
  setTimeout(() => consumePendingNotification(), 1500);
  // messaging.onTokenRefresh(onTokenRefresh);
}
