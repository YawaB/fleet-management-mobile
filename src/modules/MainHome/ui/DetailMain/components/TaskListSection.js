import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Chip, Avatar, useTheme, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../../../Authentication/slice/auth.slice";
import { getUpdatedTask } from "../../../../Tasks/slice/slice";

const getStatusConfig = (statusName) => {
  switch (statusName?.toLowerCase()) {
    case "valide":
    case "completed":
    case "done":
      return {
        icon: "check-circle",
        iconColor: "#10B981",
        lineColor: "#10B981",
        status: "completed",
      };
    case "encours":
    case "inprogress":
    case "active":
      return {
        icon: "progress-clock",
        iconColor: "#3B82F6",
        lineColor: "#3B82F6",
        status: "active",
      };
    default:
      return {
        icon: "circle-outline",
        iconColor: "#D1D5DB",
        lineColor: "#E5E7EB",
        status: "upcoming",
      };
  }
};

const TaskListSection = ({ tasks, onTaskPress, navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currentUser = useSelector(getCurrentUser);
  const updatedTask = useSelector(getUpdatedTask);
  console.log(updatedTask, "xxxtask updatedTask selector");

  const [tasksArray, setTasksArray] = useState(
    Array.isArray(tasks) ? tasks : [],
  );
  console.log(tasksArray, "xxxtask tasksArray");
  const tasksCount = tasksArray.length;

  useEffect(() => {
    setTasksArray(Array.isArray(tasks) ? tasks : []);
  }, [tasks]);

  const handleDetailsPress = (task) => {
    console.log(task, "task handleDetailsPress");
    if (navigation?.navigate) {
      navigation.navigate("Task", {
        screen: "TasksList",
        params: { searchQuery: task.taskName, id: task.TaskId },
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "N/A";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleCreateTask = () => {
    navigation?.navigate?.("CreateTask");
  };

  useEffect(() => {
    if (updatedTask?.TaskId && Array.isArray(tasksArray)) {
      const updatedList = tasksArray.map((task) => {
        if (task.TaskId === updatedTask.TaskId) {
          return updatedTask;
        }
        return task;
      });
      console.log(updatedList, "xxxtask updated");
      setTasksArray(updatedList);
    }
  }, [updatedTask]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {t("Tasks")} ({tasksCount})
        </Text>
        <Button icon="plus" mode="outlined" onPress={handleCreateTask}>
          {t("create_task")}
        </Button>
      </View>

      {tasksCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t("no_tasks_available")}</Text>
        </View>
      ) : null}

      {tasksArray.map((task, index) => {
        const statusConfig = getStatusConfig(task.statusName);
        const isLast = index === tasksArray.length - 1;
        const isActive =
          task?.assigned_user_id == currentUser?.userID &&
          (task?.statusName === "created" || task?.statusName === "encours");

        return (
          <View
            key={`task-${task.TaskId || index}`}
            style={styles.timelineItem}
          >
            <View style={styles.leftColumn}>
              <MaterialCommunityIcons
                name={statusConfig.icon}
                size={24}
                color={statusConfig.iconColor}
              />
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: statusConfig.lineColor },
                  ]}
                />
              )}
            </View>

            <View style={styles.rightColumn}>
              {isActive ? (
                <Card
                  style={[
                    styles.activeCard,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={onTaskPress}
                >
                  <View style={styles.activeCardContent}>
                    <View style={styles.activeHeader}>
                      <Text style={styles.activeTitle}>{task.taskName}</Text>
                      <Chip
                        style={styles.dueBadge}
                        textStyle={styles.dueBadgeText}
                        compact
                      >
                        {task.ElapsedTime}
                      </Chip>
                    </View>
                    <Text style={styles.activeDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                    <View style={styles.activeFooter}>
                      <View style={styles.responsibleRow}>
                        <Avatar.Text
                          size={24}
                          label={getInitials(task.Responsible)}
                          style={styles.activeAvatar}
                          labelStyle={styles.avatarLabel}
                        />
                        <Text style={styles.activeResponsible}>
                          {task.Responsible}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => handleDetailsPress(task)}
                      >
                        <Text style={styles.detailsText}>{t("Details")}</Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={16}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ) : (
                <View
                  style={[
                    styles.taskContent,
                    statusConfig.status === "upcoming" &&
                      styles.taskContentUpcoming,
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Text
                      style={[
                        styles.taskName,
                        statusConfig.status === "upcoming" &&
                          styles.textUpcoming,
                      ]}
                    >
                      {task.taskName}
                    </Text>
                    <Text style={styles.taskDate}>
                      {moment(task?.deadline).format("DD/MM/YYYY")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.taskDescription,
                      statusConfig.status === "upcoming" && styles.textUpcoming,
                    ]}
                    numberOfLines={2}
                  >
                    {task.description}
                  </Text>
                  <View style={styles.taskFooter}>
                    <View style={styles.responsibleRow}>
                      <Avatar.Text
                        size={24}
                        label={getInitials(task.assigned_user_name)}
                        style={[
                          styles.avatar,
                          {
                            backgroundColor:
                              statusConfig.status === "upcoming"
                                ? "#D1D5DB"
                                : theme.colors.primary,
                          },
                        ]}
                        labelStyle={styles.avatarLabel}
                      />
                      <Text
                        style={[
                          styles.assigned_user_name,
                          statusConfig.status === "upcoming" &&
                            styles.textUpcoming,
                        ]}
                      >
                        {task.assigned_user_name}
                      </Text>
                    </View>
                    <Chip
                      style={[{ backgroundColor: task.bgColor || "#E5E7EB" }]}
                      textStyle={[
                        styles.statusText,
                        { color: task.color || "#1F2937" },
                      ]}
                    >
                      {task.statusLabel}
                    </Chip>
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  emptyState: {
    paddingVertical: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  timelineItem: {
    flexDirection: "row",
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
  rightColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  activeCard: {
    borderRadius: 12,
    elevation: 3,
  },
  activeCardContent: {
    padding: 16,
  },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  dueBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dueBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  activeDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
  },
  activeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeAvatar: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  activeResponsible: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  taskContent: {
    paddingBottom: 4,
  },
  taskContentUpcoming: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  textUpcoming: {
    color: "#9CA3AF",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  responsibleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    marginRight: 4,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  responsibleName: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default TaskListSection;
