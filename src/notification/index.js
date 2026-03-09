import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { routeNotificationData } from "../firebase";
// import { store } from "../store/store";
// import { fetchConversationList, setSelectedChat } from "../screens/Chat/slice/chat.slice";

export const initNotifee = () => {
  let bgSubscriber = notifee.onBackgroundEvent(onEvent);
  let fgSubscriber = notifee.onForegroundEvent(onEvent);

  return [bgSubscriber, fgSubscriber];
};
export async function displayNotitication(payload) {
  try {
    // Request permissions (required for iOS)
    console.log("START NOTIFICATION");
    // let granted = await notifee.requestPermission()

    console.log("START NOTIFICATION 2");
    // Create a channel (required for Android)
    // await notifee.deleteChannel(payload?.channelId)

    let silent = await AsyncStorage.getItem("silent-notification");

    console.log("silenttt:", silent);
    let importance =
      silent === "1" ? AndroidImportance.DEFAULT : AndroidImportance.HIGH;
    let id = payload?.channelId || "default";
    let channelId = await notifee.createChannel({
      id,
      name: payload?.channelName || "Default Channel",
      importance,
    });
    (delete payload.channelId, delete payload.channelName);
    // Display a notification
    let notifyResponse = await notifee.displayNotification({
      ...payload,
      android: {
        channelId,
        importance,
        color: "#4caf50",
        // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: "default",
        },
        ...(payload?.android || {}),
      },
    });

    console.log("notifyResponse", notifyResponse);
  } catch (e) {
    console.log("error displayNotitication", e);
  }
}

export function deleteChannel(channelId) {
  notifee.deleteChannel(channelId).then((r) => {});
}

export async function deleteAllChannels() {
  try {
    // Get all existing channels
    const channels = await notifee.getChannels();

    // Iterate through the channels and delete each one
    for (const channel of channels) {
      await notifee.deleteChannel(channel.id);
      console.log(`Channel '${channel.id}' deleted.`);
    }
    console.log("All Notifee channels deleted successfully.");
  } catch (error) {
    console.error("Error deleting Notifee channels:", error);
  }
}

export const PENDING_NOTIFICATION_KEY = "pending_notification_route";

export async function consumePendingNotification() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_NOTIFICATION_KEY);
    if (!raw) return;
    await AsyncStorage.removeItem(PENDING_NOTIFICATION_KEY);
    const data = JSON.parse(raw);
    routeNotificationData(data);
  } catch (e) {
    console.log("error consumePendingNotification", e);
  }
}

async function onEvent({ type, detail }) {
  console.log("detail", type, detail);
  let channel = detail?.notification?.android?.channelId;

  switch (type) {
    case EventType.PRESS: {
      deleteChannel(detail?.notification?.android?.channelId);
      try {
        const raw = detail?.notification?.data?.payload;
        const data = raw ? JSON.parse(raw) : null;
        if (!data) break;
        if (detail?.isForeground === false) {
          await AsyncStorage.setItem(
            PENDING_NOTIFICATION_KEY,
            JSON.stringify(data),
          );
        } else {
          routeNotificationData(data);
        }
      } catch (e) {
        console.log("error onEvent PRESS", e);
      }
      break;
    }
    case EventType.ACTION_PRESS:
      processActionPress(detail);
      break;
    default:
      console.log("default forground");
  }
  return null;
}

function processActionPress(detail) {
  return null;
  let action = detail?.pressAction?.id;
  let data = detail?.notification?.data;
  console.log("processActionPress data ", data);
  switch (action) {
    case "reply":
      store.dispatch(
        setSelectedChat({
          id: data?.id,
          srcId: data?.srcId,
          srcObject: "Engin",
        }),
      );
      store.dispatch(fetchConversationList());
      navigate("Home", {
        screen: "Engine",
        params: {
          screen: "EnginDetailChat",
          params: {
            id: data.srcId,
            name: data?.Object,
            image: data.image,
            src: data.src,
            channelId: data.channelId,
          },
        },
      });
      break;
    case "delete":
      console.log("delete");
      break;
    default:
      console.log("default");
  }
}
