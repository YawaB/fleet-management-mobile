import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import NotificationHeader from "./NotificationHeader";
import NotificationItem from "./NotificationItem";

const MOCK_NOTIFICATIONS = [
  {
    id: "61665",
    srcId: "2147",
    srcObject: "user",
    Subject: "Besoin de validation de tache",
    Message: "La tache MIGRATION CASTOLI 1234 a besoin d'etre valider",
    from: null,
    isSent: 1,
    creaDate: "2026-01-29T08:33:43.533Z",
    isRead: 0,
  },
  {
    id: "61664",
    srcId: "2146",
    srcObject: "user",
    Subject: "Nouvelle panne créée",
    Message: "La panne panne_03_02_2026_10:30:29 a été créée avec succès",
    from: null,
    isSent: 1,
    creaDate: "2026-02-03T12:30:00.000Z",
    isRead: 0,
  },
  {
    id: "61663",
    srcId: "2145",
    srcObject: "user",
    Subject: "Nouvelle panne créée",
    Message: "La panne A finaliser version 0 a été créée avec succès",
    from: null,
    isSent: 1,
    creaDate: "2026-01-30T11:45:00.000Z",
    isRead: 1,
  },
];

const NotificationList = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: 1 })));
  }, []);

  const handleNotificationPress = useCallback((notification) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notification.id ? { ...notif, isRead: 1 } : notif,
      ),
    );
  }, []);

  const handleLoadMore = useCallback(() => {
    // Implement pagination logic here
  }, []);

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
  }, [loading, handleLoadMore]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notifications</Text>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
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
});

export default NotificationList;
