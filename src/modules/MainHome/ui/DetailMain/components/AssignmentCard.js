import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Avatar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AssignmentCard = ({
  assigneeName,
  assigneeInitials,
  department,
  departmentIcon,
}) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.column}>
          <Text style={styles.label}>Assignee</Text>
          <View style={styles.row}>
            <Avatar.Text
              size={40}
              label={assigneeInitials}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.avatarLabel}
            />
            <Text style={styles.value}>{assigneeName}</Text>
          </View>
        </View>
        <View style={styles.divider} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "#E5E7EB",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    marginRight: 4,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default AssignmentCard;
