import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../../../Authentication/slice/auth.slice";
import { getUpdatedTask } from "../../../../Tasks/slice/slice";
import {
  FullTaskCard,
  LockedTaskRow,
  CompletedTaskRow,
  TimelineRow,
  isCompleted,
} from "./taskCards";

const TaskListSection = ({ tasks, onTaskPress, navigation }) => {
  const { t } = useTranslation();
  const currentUser = useSelector(getCurrentUser);
  const updatedTask = useSelector(getUpdatedTask);

  const [tasksArray, setTasksArray] = useState(
    Array.isArray(tasks) ? tasks : [],
  );
  const tasksCount = tasksArray.length;

  useEffect(() => {
    setTasksArray(Array.isArray(tasks) ? tasks : []);
  }, [tasks]);

  useEffect(() => {
    if (updatedTask?.TaskId && Array.isArray(tasksArray)) {
      const updatedList = tasksArray.map((task) =>
        task.TaskId === updatedTask.TaskId ? updatedTask : task,
      );
      setTasksArray(updatedList);
    }
  }, [updatedTask]);

  const handleDetailsPress = (task) => {
    if (navigation?.navigate) {
      navigation.navigate("Task", {
        screen: "TasksList",
        params: { searchQuery: task.taskName, id: task.TaskId },
      });
    }
  };

  const handleCreateTask = () => {
    navigation?.navigate?.("CreateTask");
  };

  const isAdmin = currentUser?.is_admin || currentUser?.is_super_admin || false;

  const renderTask = (task, index) => {
    const assignedToMe = task?.assigned_user_id == currentUser?.userID;
    const done = isCompleted(task.statusName);
    const isLast = index === tasksArray.length - 1;
    const isLocked = !assignedToMe && !isAdmin && !done;

    return (
      <TimelineRow
        key={`task-${task.TaskId}-${index}`}
        statusName={task.statusName}
        isLast={isLast}
        isLocked={isLocked}
        isDone={done && !assignedToMe && !isAdmin}
      >
        {assignedToMe || isAdmin ? (
          <FullTaskCard task={task} onDetailsPress={handleDetailsPress} t={t} />
        ) : done ? (
          <CompletedTaskRow task={task} t={t} />
        ) : (
          <LockedTaskRow task={task} t={t} />
        )}
      </TimelineRow>
    );
  };

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

      {tasksCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t("no_tasks_available")}</Text>
        </View>
      )}

      {tasksArray.map((task, index) => renderTask(task, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
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
  emptyState: {
    paddingVertical: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
  },
});

export default TaskListSection;
