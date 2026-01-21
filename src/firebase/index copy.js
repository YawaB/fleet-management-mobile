import { PermissionsAndroid } from 'react-native';
import { Platform } from 'react-native';
import { messaging } from './initialize';
import { toastMessage } from '../core/ui';
import { saveFcmToken } from './service';
import AsyncStorage from '@react-native-async-storage/async-storage';


async function requestIosNotificationPermission() {
    console.log('start requestig permission')
  const authStatus = await messaging().requestPermission();
  console.log('Permission status:', authStatus);
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  return enabled
}

async function requestAndroidNotificationPermission() {
    let permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    console.log('Android Permission status:', permission)
    return permission === PermissionsAndroid.RESULTS.GRANTED
}

export async function requestNotificationPermission() {
    if (Platform.OS === 'ios') {
        await requestIosNotificationPermission();
    } else {
        await requestAndroidNotificationPermission();
    }
    return null
}

export async function getFcmToken() {
    console.log('start getting token')
    // fcmToken = await messaging().getToken()
    return  await messaging.getToken();
    // console.log('FCM Token:', fcmToken);
    return "";
}

export async function getAndSaveFcmToken(message) {
    requestNotificationPermission().then(res =>{
        console.log('permission:', res)
        getFcmToken().then(async fcm =>{
            console.log('FCM Token:', fcm);
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
    })
    console.log('App opened with message:', message);
    // Handle the app opening event here
}

async function onMessageReceived(message) {
    console.log('Message received:', message);
    toastMessage({
        text1: message?.notification?.title || "Vous avez un nouveau message",
        text2: message?.notification?.body
    })
}

function onNotificationOpenedApp(message) {
    console.log('Notification opened app:', message);
    // Handle the app opening event here
}
function onTokenRefresh(token) {
    console.log('Token refreshed:', token);
    // Handle the token refresh event here
}

export function initFirebaseMessaging2() {
    getAndSaveFcmToken()

    messaging.onMessage(onMessageReceived);
    messaging.setBackgroundMessageHandler(onMessageReceived);
    messaging.onNotificationOpenedApp(onNotificationOpenedApp);
    messaging.onTokenRefresh(onTokenRefresh)

    // messaging.subscribeToTopic('admin-topic').then(res => {
    //     console.log('subscribed to admin topic', res)
    // }).catch(e=>{
    //     console.log('error subscribing to admin topic', e)
    // })
}


export function subscribeToTopic(topic) {
    messaging.subscribeToTopic(topic).then(res => {
        console.log('subscribed to topic', res)
    }).catch(e=>{
        console.log('error subscribing to topic', e)
    })
}