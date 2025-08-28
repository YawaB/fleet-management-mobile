import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { colors } from '../../../theme/colors';
import Ionicons from "@expo/vector-icons/Ionicons.js";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../../Authentication/slice/auth.slice";
import moment from "moment";
import { fetchfeatures, getfeatures, setSelectedfeature } from "../slice/slice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Divider, Card, Avatar } from "react-native-paper";
import { setUiParams } from "../../../store/slice/ui";
import IDatePicker from "../../../component/Shared/IDatePicker/IDatePicker";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { GuidLines } from "../../../component/Shared/CameraScreen/CameraScreen";
import { fetchPannes, getPanes } from "../../Pane/slice/panne.slice";

const FeatureScreen = ({ navigation, route }) => {
  let current_user = useSelector(getCurrentUser);
  let features = useSelector(getfeatures);
  const panes = useSelector(getPanes);
  let [stats, setStats] = useState([]);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const dashboard_filters = [];

  const onFeatureSelected = (feature) => {
    console.log("feature selected", feature);
    dispatch(setSelectedfeature(feature?.code));
    AsyncStorage.setItem("app", feature?.code);

    navigation.navigate("FeaturesTab", {
      screen: feature.route,
    });
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     // dispatch(fetchfeatures())
  //   }, [])
  // );

  useFocusEffect(
    useCallback(() => {
      if (!dashboard_filters?.startDate || !dashboard_filters?.endDate) return;
      dispatch(setUiParams({ showLoader: true }));
    }, [route, dashboard_filters])
  );

  const autoGoToApp = async () => {
    let app = await AsyncStorage.getItem("app");
    if (app) {
      let infos = features.find((o) => o.code == app);
      if (infos) onFeatureSelected(infos);
    }
  };
  const onStatusPress = (status, count) => {
    if (count !== undefined && count == 0) return;
    dispatch(
      setTicketFilters({
        status: status?.id,
        statusId: status?.id,
      })
    );
    navigation.navigate("FeaturesTab", {
      screen: "Tickets",
      params: {
        statusId: status?.id,
        status: status?.code,
      },
    });
  };

  console.log(current_user, "current_user");

  const onDashPeriodChanged = (val) => {
    AsyncStorage.setItem("dashboard_period", moment(val).format("YYYY-MM-DD"));
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchPannes());
      (async () => {
        let period = await AsyncStorage.getItem("dashboard_period");
        onDashPeriodChanged(period || moment());
      })();
    }, [])
  );

  useEffect(() => {
    return;
    if (Array.isArray(features) && route?.params?.from == "auth") {
      autoGoToApp();
    } else {
      AsyncStorage.removeItem("app");
    }
  }, [route, features]);


  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View
        style={{ padding: 6, flex: 1 }}
        className="bg-white   rounded-t-2xl"
      >
        <View className="flex-row flex-wrap pt-5">
          {features.map((o) => (
            <View key={o.label} className="p-2" style={{ width: "100%" }}>
              <TouchableOpacity
                onPress={() => onFeatureSelected(o)}
                activeOpacity={0.9}
                className="bg-blue-400 p-2"
                style={{
                  gap: 10,
                  borderRadius: 10,
                  minHeight: 120,
                  elevation: 10,
                }}
              >
                <View className="flex-row gap-2 items-center">
                  <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Ionicons
                      className=""
                      size={20}
                      name={o.icon}
                      color={o.icon_color || o.color || "gray"}
                    />
                  </TouchableOpacity>
                  <Text className="font-bold text-xl" style={{ color: "#fff" }}>
                    {t(o.code) + " " + (panes?.length || 0)}
                  </Text>
                </View>
                <Text style={{ color: "#fff" }}>
                  {t(o.code === "pane" ? "breakdown_management" : "dashboard")}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <ScrollView showsVerticalScrollIndicator={false} className="mt-5">
          <Divider />
          <View className="mx-4 mt-4">
            <Text className="font-semibold text-xl text-gray-700 mb-4">
              {t("vh_info")}
            </Text>

            <Card className="mb-5" style={[styles.card, styles.cardMarginTop]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.cardTitle}>{t("schedule_service")}</Text>
                </View>
                <View style={styles.scheduleItem}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>AUG 15</Text>
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleTitle}>{t("mec_check")}</Text>
                    <Text style={styles.scheduleTime}>09:00 AM</Text>
                  </View>
                </View>
                <View style={styles.scheduleItem}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>SEP 01</Text>
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleTitle}>
                      {t("tire_rotation")}
                    </Text>
                    <Text style={styles.scheduleTime}>02:30 PM</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="truck-check"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.cardTitle}>{t("nxt_mec_check")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={colors.gray[600]}
                  />
                  <Text style={styles.infoText}>{t("schedule_service")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color={colors.gray[600]}
                  />
                  <Text style={styles.infoText}>John Smith (Mechanic)</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color={colors.gray[600]} />
                  <Text style={styles.infoText}>+1 234-567-8900</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={styles.scheduleButton}
                  icon="calendar-clock"
                >
                  {t("schedule_service")}
                </Button>
              </Card.Content>
            </Card>

            <Card style={[styles.card, styles.cardMarginTop]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="car-info"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.cardTitle}>{t("vh_details")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="gas-station"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.infoText}>{t("fuel_level")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="speedometer"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.infoText}>{t("mileage")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="oil" size={20} color="#666" />
                  <Text style={styles.infoText}>{t("last_oil_change")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="tire" size={20} color="#666" />
                  <Text style={styles.infoText}>{t("tire_pressure")}</Text>
                </View>
              </Card.Content>
            </Card>

            
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default FeatureScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardMarginTop: {
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#444",
  },
  scheduleButton: {
    marginTop: 12,
    backgroundColor: colors.blueSecondary,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateBadge: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    width: 70,
    alignItems: "center",
  },
  dateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scheduleDetails: {
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  scheduleTime: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
