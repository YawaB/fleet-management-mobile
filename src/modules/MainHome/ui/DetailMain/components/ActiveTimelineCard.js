import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, Chip, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ActiveTimelineCard = ({ title, dueDate, department, onDetailsPress }) => {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.primary }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Chip style={styles.dueBadge} textStyle={styles.dueBadgeText} compact>
            Due: {dueDate}
          </Chip>
        </View>
        <View style={styles.footer}>
          <View style={styles.departmentRow}>
            <MaterialCommunityIcons
              name="domain"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.departmentText}>{department}</Text>
          </View>
          <TouchableOpacity
            onPress={onDetailsPress}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsText}>Details</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  content: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  dueBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  dueBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  departmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  departmentText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});

export default ActiveTimelineCard;
