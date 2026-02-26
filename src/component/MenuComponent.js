import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { colors } from "../theme/colors";
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
  const { t, i18n } = useTranslation();
  const current_user = useSelector(getCurrentUser);
  let uiParams = useSelector(getUiParams);
  const [visible, setVisible] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");

  const getInitials = () => {
    const f = current_user?.fName?.substr(0, 1) || "";
    const l = current_user?.lName?.substr(0, 1) || "";
    return (f + l).toUpperCase();
  };

  const getAvatarUri = () => {
    const base = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE || "";
    if (!current_user?.image) return null;
    return `${base}${current_user.image}`;
  };

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("userLanguage");
        const languageToUse = savedLanguage || "fr";
        setSelectedLanguage(languageToUse);
        if (i18n.language !== languageToUse) {
          i18n.changeLanguage(languageToUse);
        }
        if (languageToUse === "ar") {
          I18nManager.forceRTL(true);
        } else {
          I18nManager.forceRTL(false);
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      }
    };
    loadSavedLanguage();
  }, [i18n]);
  let navigation = useNavigation();
  let dispatch = useDispatch();

  const openMenu = () => {
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
          { cancelable: false },
        );
      }
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  return (
    <>
      <View
        className="flex-row py-3 px-4 justify-between items-center shadow-3"
        style={{ backgroundColor: colors.primary }}
      >
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
            style={{ marginTop: 16 }}
            contentStyle={styles.menuContent}
            visible={visible}
            onDismiss={closeMenu}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setVisible((v) => !v)}
                style={styles.menuAnchor}
              >
                {current_user ? (
                  <>
                    <Text style={styles.anchorInitials}>{getInitials()}</Text>
                    {getAvatarUri() ? (
                      <Avatar.Image
                        size={32}
                        source={{ uri: getAvatarUri() }}
                      />
                    ) : (
                      <Avatar.Text size={32} label={getInitials() || "U"} />
                    )}
                  </>
                ) : (
                  <Ionicons
                    size={20}
                    color="#fff"
                    name="ellipsis-vertical-outline"
                  />
                )}
              </TouchableOpacity>
            }
          >
            {/* <Menu.Item onPress={closeMenu} title={t("profile")} />
            <Divider />
            <Menu.Item onPress={closeMenu} title={t("parametre")} />
            <Divider />
            <Menu.Item
              onPress={() => navigateTo("Features")}
              title={t("applications")}
            /> */}
            {/* <Divider /> */}
            <Menu.Item
              leadingIcon="translate"
              onPress={() => {
                closeMenu();
                setShowLanguageDialog(true);
              }}
              title={t("langue")}
            />
            <Divider />

            <Menu.Item
              leadingIcon="file-document-outline"
              onPress={() => navigateTo("Logger")}
              title={t("logs")}
            />
            <Divider />

            <Menu.Item
              leadingIcon="microsoft-excel"
              onPress={() => navigateTo("Excel")}
              title={t("excel")}
            />
            <Divider />

            <Menu.Item
              leadingIcon="information-outline"
              onPress={() => navigateTo("About")}
              title={t("About")}
            />
            <Divider />
            <Menu.Item
              leadingIcon="logout"
              onPress={_logOut}
              title={t("deconnexion")}
            />
          </Menu>
        </View>
      </View>
      <Portal>
        <Dialog
          visible={showLanguageDialog}
          onDismiss={() => setShowLanguageDialog(false)}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {t("select_language")}
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
  menuAnchor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  anchorInitials: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 200,
  },
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
