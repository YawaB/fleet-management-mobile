import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LockedTaskRow = ({ task, t }) => (
  <View
    className="border border-gray-200 rounded-lg p-4"
    style={styles.compactBody}
  >
    <View className="flex-row justify-between items-center mt-2">
      <Text style={styles.compactLabel}>{task.assigned_user_name || "—"}</Text>
      <View style={styles.statusChipWrap}>
        <View
          style={[
            styles.statusChip,
            { backgroundColor: task.bgColor || "#FEF3C7" },
          ]}
        >
          <Text
            style={[styles.statusChipText, { color: task.color || "#92400E" }]}
          >
            {task.statusLabel}
          </Text>
        </View>
      </View>
    </View>
    <View style={styles.compactNameRow}>
      <Text
        className="text-gray-600 text-sm"
        style={styles.compactTaskName}
        numberOfLines={2}
      >
        {task.taskName}
      </Text>
      <MaterialCommunityIcons
        name="lock-outline"
        size={16}
        color="#D1D5DB"
        style={styles.lockIcon}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  compactBody: {
    flex: 1,
    paddingTop: 4,
  },
  compactLabel: {
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  compactNameRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  compactTaskName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    flex: 1,
  },
  lockIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  statusChipWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default LockedTaskRow;
