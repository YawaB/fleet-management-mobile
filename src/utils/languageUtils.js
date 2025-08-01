import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const configureLanguage = async (language) => {
  await AsyncStorage.setItem('userLanguage', language);
  
  // Configure RTL
  const shouldBeRTL = language === 'ar'; // Only enable RTL for Arabic
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    return true; // Indicates app needs restart
  }
  return false;
};
