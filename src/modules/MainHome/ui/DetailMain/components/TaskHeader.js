import { View, StyleSheet } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";

const TaskHeader = ({ category, createdDate, title, createdBy, taskId }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Chip
          style={[
            styles.categoryChip,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          textStyle={[styles.categoryText, { color: theme.colors.primary }]}
        >
          {category}
        </Chip>
        <Text style={styles.date}>{createdDate}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        Created by {createdBy} • ID: {taskId}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default TaskHeader;
