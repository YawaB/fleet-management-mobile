import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isCompleted, getTimelineColor } from "./taskHelpers";

const TimelineRow = ({ statusName, isLast, isLocked, isDone, children }) => {
  const color = isLocked
    ? "#D1D5DB"
    : isDone
    ? "#10B981"
    : getTimelineColor(statusName);

  const iconName = isDone
    ? "check-circle"
    : isLocked
    ? "lock-outline"
    : isCompleted(statusName)
    ? "check-circle"
    : "circle-outline";

  const dotFilled = isDone || isCompleted(statusName);

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            {
              borderColor: color,
              backgroundColor: dotFilled
                ? color
                : isLocked
                ? "#F3F4F6"
                : "transparent",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={dotFilled ? 24 : 20}
            color={dotFilled ? "#FFFFFF" : isLocked ? "#9CA3AF" : color}
          />
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: color }]} />
        )}
      </View>
      <View style={styles.timelineRight}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  timelineLeft: {
    width: 40,
    alignItems: "center",
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    minHeight: 16,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
});

export default TimelineRow;
