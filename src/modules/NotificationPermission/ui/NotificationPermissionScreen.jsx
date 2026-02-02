import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { Button } from "react-native-paper";
import { colors } from "../../../theme/colors";
import { useTranslation } from "react-i18next";
import { requestNotificationPermission } from "../../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bgImage from "../../../../assets/logo.png";

const NOTIFICATION_PERMISSION_KEY = "notification_permission_checked";

const NotificationPermissionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    setLoading(true);
    try {
      await requestNotificationPermission();
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
      navigation.replace("Login");
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  const skipPermission = async () => {
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
    navigation.replace("Login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 30,
        }}
      >
        <Image
          resizeMode="contain"
          source={bgImage}
          style={{ width: 300, height: 80, marginBottom: 40 }}
        />

        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 100,
            width: 100,
            height: 100,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ fontSize: 50 }}>🔔</Text>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: colors.primary,
            textAlign: "center",
            marginBottom: 15,
          }}
        >
          {t("notification_permission_title")}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.gray[600],
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 40,
          }}
        >
          {t("notification_permission_description")}
        </Text>

        <Button
          mode="contained"
          onPress={requestPermission}
          loading={loading}
          disabled={loading}
          style={{
            width: "100%",
            borderRadius: 10,
            backgroundColor: colors.primary,
          }}
          contentStyle={{ height: 55 }}
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          {t("notification_permission_authorize")}
        </Button>

        <Button
          mode="text"
          onPress={skipPermission}
          style={{ marginTop: 15 }}
          labelStyle={{ color: colors.gray[500], fontSize: 14 }}
        >
          {t("notification_permission_skip")}
        </Button>
      </View>
    </View>
  );
};

export default NotificationPermissionScreen;
