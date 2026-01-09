import React, { useState, useCallback, useLayoutEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import { Text, Chip, FAB, useTheme } from "react-native-paper";
import StatCard from "./StatCard";
import TaskCard from "./TaskCard";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchPannes,
  getPanes,
  getPanneTypes,
} from "../../../Pane/slice/panne.slice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchDashboard,
  fetchDetailPanne,
  getDashboard,
} from "../../slice/slice";
import { getCurrentUser } from "../../../Authentication/slice/auth.slice";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
];

const STATS_DATA = [
  {
    id: "1",
    icon: "calendar-today",
    label: "Due Today",
    value: "8",
    backgroundColor: "#3B82F6",
    iconColor: "#2563EB",
  },
  {
    id: "2",
    icon: "alert-circle",
    label: "High Priority",
    value: "4",
    backgroundColor: "#EF4444",
    iconColor: "#DC2626",
  },
  {
    id: "3",
    icon: "clock-outline",
    label: "Pending",
    value: "12",
    backgroundColor: "#F97316",
    iconColor: "#EA580C",
  },
];

const DashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const panneList = useSelector(getPanes);
  const currentUser = useSelector(getCurrentUser);
  const dashboard = useSelector(getDashboard);
  console.log(currentUser, "currentUser");

  const urgentTasksCount =
    panneList?.filter((p) => p.pannePrioritaire === 1)?.length || 0;

  const filteredPannes =
    panneList?.filter((panne) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "urgent") return panne.pannePrioritaire === 1;
      if (selectedFilter === "vehicle")
        return panne.categoryLabel?.toLowerCase().includes("mécanique");
      if (selectedFilter === "claims")
        return panne.panneImmobilisante === "oui";
      return true;
    }) || [];

  const handleTaskPress = useCallback(
    (task) => {
      dispatch(fetchDetailPanne({ id: task.id })).then(({ payload }) => {
        navigation?.navigate("TaskDetail", { payload });
      });
    },
    [navigation]
  );

  const handleTaskAction = useCallback((task) => {
    console.log("Task action:", task.taskId);
  }, []);

  const handleFabPress = useCallback(() => {
    navigation?.navigate("AddPanne", { new: true });
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.greeting}>
        {t("hello")},{" "}
        {currentUser?.fName.toLowerCase() || currentUser?.lName.toLowerCase()}.
      </Text>
      <Text style={styles.subtitle}>
        {t("you_have")}{" "}
        <Text style={[styles.urgentCount, { color: theme.colors.primary }]}>
          {urgentTasksCount} {t("urgent")}
        </Text>{" "}
        {t("tasks")}.
      </Text>
    </View>
  );

  const renderStatItem = useCallback(
    ({ item }) => (
      <StatCard
        icon={item.icon}
        label={item.label}
        value={item.value}
        iconColor={item.iconColor}
      />
    ),
    []
  );

  const renderStats = () => (
    <FlatList
      data={dashboard}
      renderItem={renderStatItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statsContainer}
    />
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {FILTER_OPTIONS.map((filter) => (
        <Chip
          key={filter.key}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && styles.filterChipSelected,
          ]}
          textStyle={[
            styles.filterChipText,
            selectedFilter === filter.key && styles.filterChipTextSelected,
          ]}
          mode={selectedFilter === filter.key ? "flat" : "outlined"}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderTaskItem = useCallback(
    ({ item }) => (
      <TaskCard
        taskId={`#${item.id}`}
        title={item.name}
        subtitle={`${item.marque} ${item.model} - ${item.licensePlate}`}
        date={item.DaysAgo}
        status={item?.statusLabel}
        onPress={() => handleTaskPress(item)}
        onActionPress={() => handleTaskAction(item)}
        statusColor={item?.bgColor}
      />
    ),
    [handleTaskPress, handleTaskAction]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const ListHeaderComponent = () => (
    <>
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      <Text style={styles.sectionTitle}>{t("pannes")}</Text>
    </>
  );

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchPannes());
        dispatch(fetchDashboard());
      } catch (err) {
        console.log("Error fetch tasks", err.message);
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPannes}
        renderItem={renderTaskItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleFabPress}
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  listContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  urgentCount: {
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 20,
  },
  filterChipSelected: {
    backgroundColor: "#3B82F6",
  },
  filterChipText: {
    color: "#6B7280",
  },
  filterChipTextSelected: {
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 28,
  },
});

export default DashboardScreen;
