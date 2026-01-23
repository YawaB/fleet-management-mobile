import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../../../../theme/colors";
import { useDispatch } from "react-redux";
import { fetchResources } from "../../slice/slice";

const ChatTypeSelector = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const handleSelectType = (type) => {
    if (type === "users") {
      dispatch(fetchResources({ srcObject: "User" }));
      navigation.navigate("UserList");
    } else {
      dispatch(fetchResources({ srcObject: "Engin" }));
      navigation.navigate("EngineList");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t("new_discussion") || "Nouvelle discussion"}
        </Text>
        <Text style={styles.subtitle}>
          {t("select_chat_type") || "Sélectionnez le type de conversation"}
        </Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectType("users")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#dbeafe" }]}
            >
              <Ionicons name="people" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.cardTitle}>{t("users") || "Utilisateurs"}</Text>
            <Text style={styles.cardDescription}>
              {t("chat_with_drivers") ||
                "Discutez avec les conducteurs, le personnel logistique ou les administrateurs"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectType("engines")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}
            >
              <Ionicons name="car" size={32} color="#d97706" />
            </View>
            <Text style={styles.cardTitle}>{t("engines") || "Engins"}</Text>
            <Text style={styles.cardDescription}>
              {t("view_system_logs") ||
                "Consultez les journaux système et les alertes automatisées des véhicules"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});

export default ChatTypeSelector;
