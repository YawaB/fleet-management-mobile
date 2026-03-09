import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";

const NotificationHeader = ({ title = "Communication", onMarkAllRead }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Button
        mode="text"
        onPress={onMarkAllRead}
        textColor="#3B82F6"
        compact
        labelStyle={styles.buttonLabel}
      >
        {t("mark_all_read") || "Tout marquer comme lu"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  buttonLabel: {
    fontSize: 14,
  },
});

export default NotificationHeader;
