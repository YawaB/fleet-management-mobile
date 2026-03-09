import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/fr";

moment.locale("fr");

const NotificationItem = ({ notification, onPress }) => {
  const formatDate = (date) => {
    if (!date) return "";
    const m = moment(date);
    if (!m.isValid()) return "";
    return m.format("DD MMM, HH:mm");
  };

  const isUnread = notification?.isRead === 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color="#6B7280"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subject} numberOfLines={2}>
            {notification?.Subject}
          </Text>
          <Text style={styles.date}>{formatDate(notification?.creaDate)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification?.Message}
        </Text>
      </View>

      {isUnread && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  subject: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  message: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginLeft: 8,
    marginTop: 6,
  },
});

export default NotificationItem;
