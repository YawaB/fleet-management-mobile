import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Avatar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STATUS_CONFIG = {
  completed: {
    iconName: "check-circle",
    iconColor: "#10B981",
    lineColor: "#10B981",
  },
  active: {
    iconName: "circle",
    iconColor: "#3B82F6",
    lineColor: "#3B82F6",
  },
  upcoming: {
    iconName: "circle-outline",
    iconColor: "#D1D5DB",
    lineColor: "#E5E7EB",
  },
};

const TimelineItem = ({
  status,
  title,
  description,
  date,
  actorInitials,
  actorName,
  isLast,
}) => {
  const theme = useTheme();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
  const isUpcoming = status === "upcoming";

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <MaterialCommunityIcons
          name={config.iconName}
          size={24}
          color={config.iconColor}
        />
        {!isLast && (
          <View style={[styles.line, { backgroundColor: config.lineColor }]} />
        )}
      </View>
      <View style={[styles.content, isUpcoming && styles.contentUpcoming]}>
        <View style={styles.header}>
          <Text style={[styles.title, isUpcoming && styles.titleUpcoming]}>
            {title}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text
          style={[styles.description, isUpcoming && styles.descriptionUpcoming]}
        >
          {description}
        </Text>
        {actorInitials && (
          <View style={styles.actorRow}>
            <Avatar.Text
              size={24}
              label={actorInitials}
              style={[
                styles.avatar,
                {
                  backgroundColor: isUpcoming
                    ? "#D1D5DB"
                    : theme.colors.primary,
                },
              ]}
              labelStyle={styles.avatarLabel}
            />
            <Text
              style={[styles.actorName, isUpcoming && styles.actorNameUpcoming]}
            >
              {actorName}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  leftColumn: {
    alignItems: "center",
    width: 32,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  contentUpcoming: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  titleUpcoming: {
    color: "#9CA3AF",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  descriptionUpcoming: {
    color: "#9CA3AF",
  },
  actorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    marginRight: 4,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  actorName: {
    fontSize: 12,
    color: "#6B7280",
  },
  actorNameUpcoming: {
    color: "#9CA3AF",
  },
});

export default TimelineItem;
