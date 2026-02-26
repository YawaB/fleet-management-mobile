import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../Authentication/slice/auth.slice";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { Avatar } from "react-native-paper";
import Constants from "expo-constants";
import MenuComponent from "../../../component/MenuComponent";

const APP_VERSION = Constants.expoConfig?.version || "1.0.0";
const IMAGE_BASE = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE || "";

function InfoRow({ icon, iconLib, label, value }) {
  const IconComp = iconLib === "fa5" ? FontAwesome5 : MaterialCommunityIcons;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <IconComp name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value ?? "—"}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const user = useSelector(getCurrentUser);

  const getInitials = () => {
    const f = user?.fName?.substr(0, 1) || "";
    const l = user?.lName?.substr(0, 1) || "";
    return (f + l).toUpperCase() || "U";
  };

  const avatarUri = user?.image ? `${IMAGE_BASE}${user.image}` : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          {avatarUri ? (
            <Avatar.Image
              size={88}
              source={{ uri: avatarUri }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={88}
              label={getInitials()}
              style={styles.avatar}
            />
          )}
          <Text style={styles.fullName}>
            {user?.fName} {user?.lName}
          </Text>
        </View>

        {/* User info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations utilisateur</Text>

          <InfoRow icon="account" label="Email" value={user?.userName} />
          <InfoRow
            icon="briefcase-account"
            label="Fonction"
            value={user?.function}
          />
          <InfoRow
            icon="car"
            iconLib="mci"
            label="Véhicule ID"
            value={user?.vehiculeId}
          />
          <InfoRow
            icon={user?.active === 1 ? "check-circle" : "close-circle"}
            label="Statut"
            value={user?.active === 1 ? "Actif" : "Inactif"}
          />
        </View>

        {/* App info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application</Text>

          <InfoRow icon="application" label="Nom" value="FLEET EYE" />
          <InfoRow icon="tag" label="Version" value={`v${APP_VERSION}`} />
        </View>

        <Text style={styles.versionFooter}>FLEET EYE v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: 12,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.gray[400],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: "500",
  },
  versionFooter: {
    textAlign: "center",
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 8,
  },
});
