import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Chip,
  IconButton,
  Text,
} from "react-native-paper";
import TaskCard from "./TaskCard";
import moment from "moment/moment";
import { useDispatch, useSelector } from "react-redux";
import { fetchTaskList, getTasks, startTaskOrStop } from "../slice/slice";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const TaskListScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { t } = useTranslation();

  const taskList = useSelector(getTasks);

  const dispatch = useDispatch();
  const FILTERS = [
    { label: t("all"), value: "all" },
    { label: t("late"), value: "overdue" },
    { label: t("today"), value: "today" },
    { label: t("in_progress"), value: "in_progress" },
  ];
  moment.locale("fr");

  const handleOpenDetails = (task) => {
    if (navigation?.navigate) {
      navigation.navigate("TaskDetails", { taskId: task.id });
      return;
    }
  };

  const navigateToTaskDetails = (task, intent = "view") => {
    console.log(task, "task navigateToTaskDetails");
    if (!navigation?.navigate) return;
    navigation.navigate("TaskDetails", {
      task: task,
      intent,
    });
  };

  const handleStart = (task) => {
    console.log(task, "task handleStart");
    let args = {
      srcObject: "Tasks",
      srcId: task.TaskId,
      status:
        task?.statusName === "terminer" || task?.statusName === "created"
          ? "start"
          : "end",
    };
    dispatch(startTaskOrStop(args));
    return;
  };

  const handleChangeDate = (task) => {
    navigateToTaskDetails(task, "change_date");
    return;
  };

  const handleRequestHelp = (task) => {
    return;
  };

  const handleMore = (task) => {
    return;
  };

  const today = moment().format("dddd, D MMMM");

  // Capitalize first letter (Moment gives lowercase by default)
  const formattedDate = moment();

  const renderItem = ({ item }) => (
    <TaskCard
      task={item}
      onPress={handleOpenDetails}
      onStart={handleStart}
      onChangeDate={handleChangeDate}
      onRequestHelp={handleRequestHelp}
      onMore={handleMore}
    />
  );

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchTaskList({ filterType: "all" }));
      } catch (err) {
        console.log("Error fetch tasks", err.message);
      }
    }, [])
  );

  return (
    <View className="flex-1 bg-[#F8F8F5]">
      <View className="flex-row items-center justify-between px-4 pt-4 ">
        {/* <Text className="text-xl font-bold text-black">{formattedDate}</Text> */}
        <Text className="text-sm text-gray-500">{taskList?.length} Tâches</Text>
      </View>

      <View className="px-4 pb-2">
        <View className="mt-4">
          <View className="flex-row items-center gap-3">
            {FILTERS.map((filter) => {
              const isActive = filter.value === activeFilter;
              return (
                <Button
                  style={{ minWidth: 60 }}
                  key={filter.value}
                  mode={isActive ? "contained" : "outlined"}
                  onPress={() => {
                    setActiveFilter(filter.value);
                    dispatch(fetchTaskList({ filterType: filter.value }));
                  }}
                  compact
                >
                  {filter.label}
                </Button>
              );
            })}
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-3">
        <FlatList
          data={taskList}
          keyExtractor={(item, index) => item?.taskId || `${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View className="h-8" />}
        />
      </View>
    </View>
  );
};

const TasksScreen = ({ navigation, route }) => {
  return <TaskListScreen navigation={navigation} />;
};

export default TasksScreen;
