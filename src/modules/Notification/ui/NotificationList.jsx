import { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import NotificationHeader from "./NotificationHeader";
import NotificationItem from "./NotificationItem";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  getNotifications,
  readNotification,
} from "../slice/header.slice";
import { fetchTaskDetail } from "../../Tasks/slice/slice";
import { fetchDetailPanne } from "../../MainHome/slice/slice";
import { useTranslation } from "react-i18next";
const NotificationList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openingNotification, setOpeningNotification] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(true);

  const navigation = useNavigation();

  const notifications = useSelector(getNotifications);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    dispatch(readNotification({ markAll: true }));
  }, []);

  const handleNotificationPress = useCallback(
    async (notification) => {
      const to = String(notification?.to || "");
      const toId = notification?.toId;
      if (!toId) return;

      try {
        setOpeningNotification(true);
        dispatch(readNotification({ id: notification.id }));

        if (to === "assets/tasks/list") {
          setOpeningNotification(false);
          navigation.navigate("Task", {
            screen: "TasksList",
            params: { id: toId },
          });
          return;
        }

        if (to === "assets/panneList") {
          await dispatch(fetchDetailPanne({ id: toId }));
          setOpeningNotification(false);
          navigation?.navigate("Dashboard", {
            screen: "TaskDetail",
          });
          return;
        }
      } finally {
        setOpeningNotification(false);
      }
    },
    [dispatch, navigation],
  );

  const handleLoadMore = () => {
    dispatch(fetchNotifications());
    setShowLoadingModal(false);
  };

  const renderItem = useCallback(
    ({ item }) => (
      <NotificationItem notification={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress],
  );

  const renderFooter = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" />
        </View>
      );
    }
  }, [loading]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notifications</Text>
        <Button icon="arrow-down" mode="text" onPress={handleLoadMore}>
          {t("load_more")}
        </Button>
      </View>
    ),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchNotifications({ filterType: "unread" }));
        setShowLoadingModal(true);
      } catch (err) {
        console.log("Error fetch tasks", err.message);
      }
    }, []),
  );

  return (
    <View style={styles.container}>
      <Modal transparent visible={openingNotification} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" />
            <Text style={styles.modalText}>{t("loading")}</Text>
          </View>
        </View>
      </Modal>

      <NotificationHeader onMarkAllRead={handleMarkAllRead} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
      {showLoadingModal && (
        <Button icon="arrow-down" mode="text" onPress={handleLoadMore}>
          {t("load_more")}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    flexGrow: 1,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 220,
    alignItems: "center",
  },
  modalText: {
    marginTop: 12,
  },
});

export default NotificationList;
