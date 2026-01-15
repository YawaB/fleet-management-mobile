import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Button, Divider, Text } from "react-native-paper";
import TaskHeader from "./TaskHeader";
import StatusHeroCard from "./StatusHeroCard";
import AssignmentCard from "./AssignmentCard";
import ImageGallery from "./ImageGallery";
import AudioPlayer from "./AudioPlayer";
import TaskListSection from "./TaskListSection";
import { getDetailPanne } from "../../../slice/slice";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE;

const TaskDetailScreen = ({ navigation }) => {
  const panne = useSelector(getDetailPanne);
  console.log(panne, "panne TaskDetailScreen");
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    navigation?.goBack?.();
  }, [navigation]);

  const handleAddNote = useCallback(() => {
    console.log("Add note pressed");
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
          status={panne.statusLabel}
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
        {/* <View className="flex-row items-center justify-around">
          <Divider style={{ width: "50%" }} />
          
        </View> */}

        <TaskListSection
          tasks={panne.ListeTaches?.length > 0 ? panne.ListeTaches : []}
          navigation={navigation}
        />
      </ScrollView>
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
    paddingBottom: 20,
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
});

export default TaskDetailScreen;
