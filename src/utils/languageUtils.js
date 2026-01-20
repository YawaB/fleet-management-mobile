import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const configureLanguage = async (language) => {
  await AsyncStorage.setItem("userLanguage", language);

  // Configure RTL
  const shouldBeRTL = language === "ar"; // Only enable RTL for Arabic

  // Always set RTL configuration to ensure correct state on app start
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);

  // Return true if RTL state changed (app needs restart)
  if (I18nManager.isRTL !== shouldBeRTL) {
    return true; // Indicates app needs restart
  }
  return false;
};
