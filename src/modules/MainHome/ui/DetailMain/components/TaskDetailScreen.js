import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Appbar,
  Text,
  Chip,
  useTheme,
  Portal,
  Dialog,
  List,
  Button,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TaskHeader from "./TaskHeader";
import StatusHeroCard from "./StatusHeroCard";
import AssignmentCard from "./AssignmentCard";
import BottomActionBar from "./BottomActionBar";
import ImageGallery from "./ImageGallery";
import AudioPlayer from "./AudioPlayer";
import TaskListSection from "./TaskListSection";
import { getDetailPanne } from "../../../slice/slice";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE;

const MOCK_PANNE = {
  id: "30078",
  name: "panne_29_12_2025_11:46:14",
  Description: "",
  dateCreate: "2025-12-29T11:47:40.830Z",
  declarantFullName: null,
  licensePlate: "CN191011234",
  model: "MODEL2008",
  marque: "VEH12",
  nochassis: "CHASSIS22",
  DaysAgo: "29/12/2025",
  EstimatedTime: "8h",
  ListeTaches: [
    {
      panneId: 30078,
      TaskId: 50428,
      Responsible: "zakaria Rahali",
      description: "desc",
      deadline: "2025-12-31T00:00:00",
      taskName: "task 2225",
      ElapsedTime: "31/12/2025",
      statusName: "encours",
      statusLabel: "En cours",
      icon: "",
      iconreact: "",
      color: "#ffffff",
      bgColor: "#ffc107",
    },
    {
      panneId: 30078,
      TaskId: 60421,
      Responsible: "zakaria Rahali",
      description: "desc tache panne 29",
      deadline: "2025-12-31T00:00:00",
      taskName: "tache panne 29",
      ElapsedTime: "31/12/2025",
      statusName: "valide",
      statusLabel: "Validé",
      icon: "",
      iconreact: "",
      color: "",
      bgColor: "#10B981",
    },
  ],
  agence: "",
  declarationId: "",
  declarationNo: "",
  panneImmobilisante: "Oui",
  pannePrioritaire: 1,
  statusName: "onhold",
  statusLabel: "En cours",
  icon: "",
  iconreact: "",
  color: "#ffffff",
  bgColor: "#ffc107",
  images: [
    { src: "default/4135fa26-d1ef-4d20-b713-41d3168e7aaf.jpg" },
    { src: "default/9f8d6b85-1e9d-4b0c-bb1b-3691d478237d.jpg" },
    { src: "default/1e7d2dc4-d22c-4e3c-ae3c-ad3f83482df0.jpg" },
  ],
  audios: [{ src: "default/691ec159-91f4-4d33-8896-15a255d5d1dd.mpeg" }],
  videos: null,
};

const TaskDetailScreen = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const panne = useSelector(getDetailPanne);
  const { t } = useTranslation();

  const statusOptions = useMemo(
    () => [
      {
        key: "encours",
        label: "En cours",
        icon: "progress-clock",
        color: "#3B82F6",
      },
      {
        key: "onhold",
        label: "En attente",
        icon: "pause-circle",
        color: "#F59E0B",
      },
      {
        key: "valide",
        label: "Validé",
        icon: "check-circle",
        color: "#10B981",
      },
      {
        key: "rejected",
        label: "Rejeté",
        icon: "close-circle",
        color: "#EF4444",
      },
    ],
    []
  );

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState({
    key: null,
    label: null,
  });

  useEffect(() => {
    if (!panne) return;
    setSelectedStatus({
      key: panne?.statusName ?? null,
      label: panne?.statusLabel ?? null,
    });
  }, [panne?.statusName, panne?.statusLabel]);

  const handleBack = useCallback(() => {
    navigation?.goBack?.();
  }, [navigation]);

  const handleMenu = useCallback(() => {
    console.log("Menu pressed");
  }, []);

  const handleViewHistory = useCallback(() => {
    console.log("View history pressed");
  }, []);

  const handleDetailsPress = useCallback(() => {
    console.log("Details pressed");
  }, []);

  const handleAddNote = useCallback(() => {
    console.log("Add note pressed");
  }, []);

  const handleUpdateStatus = useCallback(() => {
    setStatusModalVisible(true);
  }, []);

  const handleSelectStatus = useCallback((option) => {
    setSelectedStatus({ key: option.key, label: option.label });
    setStatusModalVisible(false);
  }, []);

  const getPriority = () => {
    if (panne?.pannePrioritaire === 1) return "High";
    return "Normal";
  };

  if (!panne) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="Détail" titleStyle={styles.appbarTitle} />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <Text>Aucune donnée disponible</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content
          title={`Panne #${panne.id}`}
          titleStyle={styles.appbarTitle}
        />
        <Appbar.Action icon="dots-vertical" onPress={handleMenu} />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TaskHeader
          category={
            panne.panneImmobilisante === "Oui"
              ? "Immobilisante"
              : "Non Immobilisante"
          }
          createdDate={panne.DaysAgo}
          title={panne.name}
          createdBy={panne.declarantFullName || "Système"}
          taskId={panne.id}
        />

        <StatusHeroCard
          priority={getPriority()}
          status={selectedStatus?.label || panne.statusLabel}
          description={
            panne.Description ||
            `${panne.marque} ${panne.model} - ${panne.licensePlate}`
          }
          daysOpen={panne.EstimatedTime || "N/A"}
          images={panne.images}
          baseUrl={IMAGE_BASE_URL}
        />

        <AssignmentCard
          assigneeName={panne?.responsableFullName || "Non assigné"}
          assigneeInitials={
            panne?.responsableFullName
              ? panne.responsableFullName.substring(0, 2).toUpperCase()
              : "NA"
          }
          department="Fleet Mgmt"
          departmentIcon="truck"
        />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t("vehicule")}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("marque")}:</Text>
            <Text style={styles.infoValue}>{panne.marque}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("modele")}:</Text>
            <Text style={styles.infoValue}>{panne.model}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("immatriculation")}:</Text>
            <Text style={styles.infoValue}>{panne.licensePlate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("chassis")}:</Text>
            <Text style={styles.infoValue}>{panne.nochassis}</Text>
          </View>
        </View>

        {/* <ImageGallery images={panne.images} baseUrl={IMAGE_BASE_URL} /> */}

        <AudioPlayer audios={panne.audios} baseUrl={IMAGE_BASE_URL} />

        <TaskListSection
          tasks={panne.ListeTaches?.length > 0 ? panne.ListeTaches : []}
          navigation={navigation}
        />
      </ScrollView>

      <BottomActionBar onUpdateStatus={handleUpdateStatus} />

      <Portal>
        <Dialog
          visible={statusModalVisible}
          onDismiss={() => setStatusModalVisible(false)}
          style={styles.statusDialog}
        >
          <Dialog.Title>{t("update_status")}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.statusList}>
              {statusOptions.map((option) => {
                const isSelected = option.key === selectedStatus?.key;

                return (
                  <List.Item
                    key={option.key}
                    title={option.label}
                    onPress={() => handleSelectStatus(option)}
                    style={styles.statusItem}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={option.icon}
                        color={option.color}
                      />
                    )}
                    right={() =>
                      isSelected ? (
                        <Chip
                          compact
                          style={[
                            styles.selectedChip,
                            { backgroundColor: option.color },
                          ]}
                          textStyle={styles.selectedChipText}
                        >
                          {t("selected")}
                        </Chip>
                      ) : null
                    }
                  />
                );
              })}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusModalVisible(false)}>
              {t("cancel")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  appbar: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  statusDialog: {
    borderRadius: 12,
  },
  statusList: {
    gap: 6,
  },
  statusItem: {
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  selectedChip: {
    alignSelf: "center",
    borderRadius: 999,
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default TaskDetailScreen;
