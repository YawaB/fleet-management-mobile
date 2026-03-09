import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

const CompletedTaskRow = ({ task, t }) => (
  <View style={styles.compactBody}>
    <Text style={styles.completedLabel}>{t("completed").toUpperCase()}</Text>
    <Text style={styles.completedTaskName} numberOfLines={2}>
      {task.taskName}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  compactBody: {
    flex: 1,
    paddingTop: 4,
  },
  completedLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  completedTaskName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
});

export default CompletedTaskRow;
