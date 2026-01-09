import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const StatCard = ({ icon, label, value, iconColor }) => {
  return (
    <Card style={[styles.card, { backgroundColor: "#FFFFFF" }]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: 150,
    marginHorizontal: 6,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    alignItems: "center",
    paddingVertical: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#637588",
    opacity: 0.9,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
});

export default StatCard;
