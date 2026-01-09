import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TaskCard = ({
  taskId,
  title,
  subtitle,
  date,
  status,
  onPress,
  onActionPress,
  statusColor,
}) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <View style={[styles.indicator, { backgroundColor: statusColor }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.taskId}>{taskId}</Text>
              <Chip
                style={[styles.chip, { backgroundColor: statusColor }]}
                textStyle={[styles.chipText, { color: "white" }]}
              >
                {status}
              </Chip>
            </View>
            <TouchableOpacity
              onPress={onActionPress}
              style={styles.actionButton}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#9CA3AF" />
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
  },
  indicator: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskId: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  // chip: {
  //   height: 24,
  // },
  chipText: {
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionButton: {
    padding: 4,
  },
});

export default TaskCard;
