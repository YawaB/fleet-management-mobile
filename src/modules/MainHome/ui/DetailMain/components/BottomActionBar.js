import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const BottomActionBar = ({ onAddNote, onUpdateStatus }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      {/* <Button
        mode="outlined"
        icon="note-plus"
        onPress={onAddNote}
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.secondaryLabel}
      >
        Add Note
      </Button> */}
      <Button
        mode="contained"
        icon="update"
        onPress={onUpdateStatus}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
        ]}
        contentStyle={styles.buttonContent}
        labelStyle={styles.primaryLabel}
      >
        {t("update_status")}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: "#D1D5DB",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default BottomActionBar;
