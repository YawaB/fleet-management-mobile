import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import DatePicker from "react-native-date-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import moment from "moment";
import { colors } from "../../../../theme/colors";
import { socket } from "../../../../socket/socket";

function PlanScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const pane = route?.params?.pane || null;

  const [form, setForm] = useState({
    nextStep: "",
    responsible: "",
    deadline: "",
    notes: "",
  });
  const [openDeadline, setOpenDeadline] = useState(false);

  const fakeUsers = [
    { label: "Jean Dupont", value: "user_1", role: "Technicien" },
    { label: "Alice Martin", value: "user_2", role: "Chef d'atelier" },
    { label: "Mohamed Ali", value: "user_3", role: "Responsable flotte" },
    { label: "Sofia Ben", value: "user_4", role: "Opérateur" },
  ];

  const hasErrors = (key) => !form[key] || form[key].trim() === "";

  const onSave = () => {
    // TODO: integrate API to persist plan data
    // For now, just go back
    socket.emit("new_location", {
      name: "test"
    })
    // navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          {pane?.name ? `Planifier: ${pane.name}` : "Plan d'action"}
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Prochaine étape</Text>
          <TextInput
            mode="outlined"
            placeholder="Étape prévue dans le flux"
            value={form.nextStep}
            onChangeText={(v) => setForm((p) => ({ ...p, nextStep: v }))}
          />
          <HelperText type="error" visible={hasErrors("nextStep")}>
            Champs requis
          </HelperText>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Responsable de l'action</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={fakeUsers}
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder="Sélectionner un responsable"
            value={form.responsible}
            onChange={(item) => setForm((p) => ({ ...p, responsible: item.value }))}
            renderLeftIcon={() => (
              <MaterialCommunityIcons name="account" size={20} color="#6b7280" />
            )}
            renderItem={(item, selected) => (
              <View className="flex flex-row items-center gap-2 p-2">
                <FontAwesome name="user" size={24} color={colors.primary} />
                <Text style={[styles.dropdownItemText, selected && { color: "#0ea5e9" }]}>
                  {item.label} · {item.role}
                </Text>
              </View>
            )}
          />
          <HelperText type="error" visible={hasErrors("responsible")}>
            Champs requis
          </HelperText>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Deadline</Text>
          <TextInput
            mode="outlined"
            placeholder="YYYY-MM-DD HH:mm"
            value={form.deadline}
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => setOpenDeadline(true)} />}
            onPressIn={() => setOpenDeadline(true)}
          />
          <HelperText type="error" visible={hasErrors("deadline")}>
            Champs requis
          </HelperText>
          <DatePicker
            modal
            open={openDeadline}
            date={form.deadline ? moment(form.deadline, "YYYY-MM-DD HH:mm").toDate() : new Date()}
            mode="datetime"
            onConfirm={(date) => {
              setOpenDeadline(false);
              const formatted = moment(date).format("YYYY-MM-DD HH:mm");
              setForm((p) => ({ ...p, deadline: formatted }));
            }}
            onCancel={() => setOpenDeadline(false)}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Informations / Remarques</Text>
          <TextInput
            mode="outlined"
            placeholder="Notes complémentaires"
            value={form.notes}
            onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button mode="contained" icon="content-save" onPress={onSave}>
          Enregistrer
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: "bold",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    color: "#6b7280",
    fontWeight: "600",
  },
  dropdown: {
    height: 50,
    borderColor: "#6b7280",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#6b7280",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#374151",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#374151",
  },
});

export default PlanScreen;
