import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Button,
  Divider,
  Card,
  Text,
  Chip,
  List,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

function PaneList({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigateToEditor = (incident) => {
    navigation.navigate("Editor", { incident });
  };

  const handleDelete = (incident) => {
    Alert.alert(
      t("delete_confirmation"),
      `${t("delete_message")} "${incident.title}"?`,
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          onPress: () => {
            // Add your delete logic here
            console.log("Deleting incident:", incident.id);
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Sample data - replace with actual data from your backend
  const incidents = [
    {
      id: 1,
      title: "Panne NEW CAR",
      dateMec: "2025-07-24",
      dateDec: "2025-07-25",
      driver: {
        name: "John Doe",
        phone: "+212 666-123456",
      },
      vehicleReg: "123 ABC 45",
      category: "Électrique",
      description: "Problème de batterie - ne démarre pas",
      status: "En attente",
    },
    // Add more sample incidents as needed
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case "Électrique":
        return "#2196F3";
      case "Mécanique":
        return "#4CAF50";
      case "Carrosserie":
        return "#FF9800";
      default:
        return theme.colors.primary;
    }
  };

  const renderIncidentCard = (incident) => (
    <Card key={incident.id} style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          {incident.title}
        </Text>

        <View style={styles.dateContainer}>
          <List.Item
            title="Date MEC"
            description={incident.dateMec}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            style={styles.dateItem}
          />
          <List.Item
            title="Date DEC"
            description={incident.dateDec}
            left={(props) => <List.Icon {...props} icon="calendar-clock" />}
            style={styles.dateItem}
          />
        </View>

        <List.Item
          title={incident.driver.name}
          description={incident.driver.phone}
          left={(props) => <List.Icon {...props} icon="account" />}
        />

        <List.Item
          title={incident.vehicleReg}
          left={(props) => <List.Icon {...props} icon="car" />}
        />

        <View style={styles.chipContainer}>
          <Chip
            style={[
              styles.categoryChip,
              { backgroundColor: getCategoryColor(incident.category) },
            ]}
            textStyle={{ color: "white" }}
          >
            {incident.category}
          </Chip>
          <Chip style={styles.statusChip} icon="clock-outline">
            {incident.status}
          </Chip>
        </View>

        {incident.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {incident.description}
          </Text>
        )}
      </Card.Content>
      <Divider className="mt-3" />
      <Card.Actions style={styles.cardActions}>
        <Button
          icon="pencil"
          mode="text"
          onPress={() => navigateToEditor(incident)}
        >
          {t("edit")}
        </Button>
        <Button
          icon="delete"
          mode="text"
          textColor="#dc3545"
          onPress={() => handleDelete(incident)}
        >
          {t("delete")}
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Incidents
        </Text>
        <Button
          mode="text"
          icon="plus"
          onPress={navigateToEditor}
          style={styles.addButton}
        >
          Ajouteré
        </Button>
      </View>
      <Divider />
      <ScrollView style={styles.scrollView}>
        {incidents.map(renderIncidentCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardActions: {
    justifyContent: "flex-end",
    paddingRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
  },
  headerTitle: {
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateItem: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    borderRadius: 16,
  },
  statusChip: {
    backgroundColor: "#FFA000",
    borderRadius: 16,
  },
  description: {
    marginTop: 16,
    color: "#666",
  },
});

export default PaneList;
