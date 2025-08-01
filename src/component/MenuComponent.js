import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { colors } from '../theme/colors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  Alert,
  BackHandler,
} from "react-native";
import {
  Menu,
  Button,
  Divider,
  PaperProvider,
  Portal,
  Dialog,
  List,
  Avatar,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  logout,
} from "../modules/Authentication/slice/auth.slice";
import { getUiParams } from "../store/slice/ui";
import { useTranslation } from "react-i18next";

function MenuComponent({ navigator, title, visibleBack = false }) {
  const current_user = useSelector(getCurrentUser);
  let uiParams = useSelector(getUiParams);
  const [visible, setVisible] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("userLanguage");
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
          if (savedLanguage === "ar") {
            I18nManager.forceRTL(true);
          } else {
            I18nManager.forceRTL(false);
          }
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      }
    };
    loadSavedLanguage();
  }, []);
  const { t, i18n } = useTranslation();
  let navigation = useNavigation();
  let dispatch = useDispatch();

  const openMenu = () => {
    console.log("openMenu");
    setVisible(true);
  };

  const closeMenu = () => setVisible(false);
  const _logOut = () => {
    dispatch(logout()).then(({ payload }) => {
      navigation.navigate("Login");
    });
  };

  const navigateTo = (app) => {
    navigation.navigate(app);
    closeMenu();
  };

  const goBack = () => {
    if (navigator) navigator.goBack();
    else navigation.goBack();
  };

  const handleLanguageSelect = async (lang) => {
    try {
      const currentLang = await AsyncStorage.getItem("userLanguage");
      const isChangingToOrFromArabic =
        (currentLang === "ar" || lang === "ar") && currentLang !== lang;

      await AsyncStorage.setItem("userLanguage", lang);
      setSelectedLanguage(lang);
      setShowLanguageDialog(false);
      i18n.changeLanguage(lang);

      if (lang === "ar") {
        I18nManager.forceRTL(true);
      } else {
        I18nManager.forceRTL(false);
      }

      if (isChangingToOrFromArabic) {
        Alert.alert(
          t("restart_title"),
          t("restart_message"),
          [
            {
              text: t("restart_cancel"),
              style: "cancel",
            },
            {
              text: t("restart_ok"),
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  return (
    <>
      <View className="flex-row py-3 px-4 justify-between items-center shadow-3" style={{ backgroundColor: colors.primary }}>
        {!visibleBack && (
          <Ionicons
            name="arrow-undo-outline"
            color={"#fff"}
            size={30}
            onPress={goBack}
          />
        )}
        <View>
          <Text
            className="text-white font-bold text-xl"
            style={{ color: "#fff", fontWeight: "bold" }}
          >
            {uiParams?.title || title}
          </Text>
        </View>
        <View className="flex-row  items-center justify-center ">
          <Menu
            style={{ backgroundColor: "white" }}
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              current_user ? (
                <View className="flex-row items-center gap-2">
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {current_user?.fName?.substr(0, 1).toUpperCase() +
                      current_user?.lName?.substr(0, 1).toUpperCase()}
                  </Text>
                  <TouchableOpacity onPress={() => setVisible(!visible)}>
                    <Avatar.Image
                      size={32}
                      source={{
                        uri:
                          process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE +
                          current_user?.image,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <Ionicons
                  size={20}
                  onPress={() => setVisible(!visible)}
                  name="ellipsis-vertical-outline"
                />
              )
            }
          >
            <Menu.Item onPress={closeMenu} title={t("profile")} />
            <Divider />
            <Menu.Item onPress={closeMenu} title={t("parametre")} />
            <Divider />
            <Menu.Item
              onPress={() => navigateTo("Features")}
              title={t("applications")}
            />
            <Divider />
            <Menu.Item
              onPress={() => setShowLanguageDialog(true)}
              title={t("langue")}
            />
            <Divider />
            <Menu.Item onPress={_logOut} title={t("deconnexion")} />
            <Divider />
            <Menu.Item onPress={() => navigateTo("Logger")} title={t("logs")} />
          </Menu>
        </View>
      </View>
      <Portal>
        <Dialog
          visible={showLanguageDialog}
          onDismiss={() => setShowLanguageDialog(false)}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Select Language
          </Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              style={[
                styles.languageItem,
                selectedLanguage === "en" && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageSelect("en")}
            >
              <View style={styles.flagContainer}>
                <Text style={styles.flag}>🇬🇧</Text>
              </View>
              <Text style={styles.languageText}>English</Text>
              {selectedLanguage === "en" && (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color="#fff"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageItem,
                selectedLanguage === "fr" && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageSelect("fr")}
            >
              <View style={styles.flagContainer}>
                <Text style={styles.flag}>🇫🇷</Text>
              </View>
              <Text style={styles.languageText}>Français</Text>
              {selectedLanguage === "fr" && (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color="#fff"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageItem,
                selectedLanguage === "ar" && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageSelect("ar")}
            >
              <View style={styles.flagContainer}>
                <Text style={styles.flag}>🇸🇦</Text>
              </View>
              <Text style={styles.languageText}>العربية</Text>
              {selectedLanguage === "ar" && (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color="#fff"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  dialogTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  selectedLanguage: {
    backgroundColor: "#ff9500",
  },
  flagContainer: {
    marginRight: 15,
  },
  flag: {
    fontSize: 24,
  },
  languageText: {
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default MenuComponent;
