import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import {
  Text,
  Button,
  Card,
  TextInput,
  Avatar,
  IconButton,
} from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { colors } from "../../../theme/colors";
import { Dropdown } from "react-native-element-dropdown";
import { createTask, getDetailPanne } from "../../MainHome/slice/slice";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaff, fetchUsers, getStaff } from "../../User/slice/slice";
import { fetchVehicles, getVehicles } from "../../Pane/slice/panne.slice";
import { useFormik } from "formik";
import * as Yup from "yup";

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatMonthYear = (date) => {
  if (!date) return "";
  return moment(date).format("MMMM YYYY");
};

const CalendarDay = ({ label, disabled, selected, onPress }) => {
  if (!label) return <View style={styles.calendarDayEmpty} />;

  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <View
        style={[
          styles.calendarDay,
          selected && styles.calendarDaySelected,
          disabled && styles.calendarDayDisabled,
        ]}
      >
        <Text
          style={[
            styles.calendarDayText,
            selected && styles.calendarDayTextSelected,
            disabled && styles.calendarDayTextDisabled,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const EmbeddedCalendar = ({
  visibleMonth,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelect,
}) => {
  const daysGrid = useMemo(() => {
    const first = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const last = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    );

    const jsDay = first.getDay();
    const mondayBasedIndex = (jsDay + 6) % 7;

    const cells = [];
    for (let i = 0; i < mondayBasedIndex; i += 1) cells.push(null);
    for (let day = 1; day <= last.getDate(); day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [visibleMonth]);

  const weekLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <IconButton icon="chevron-left" onPress={onPrevMonth} />
        <Text style={styles.calendarTitle}>
          {formatMonthYear(visibleMonth)}
        </Text>
        <IconButton icon="chevron-right" onPress={onNextMonth} />
      </View>

      <View style={styles.calendarWeekRow}>
        {weekLabels.map((w, idx) => (
          <View key={`${w}-${idx}`} style={styles.calendarWeekCell}>
            <Text style={styles.calendarWeekText}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {daysGrid.map((day, idx) => {
          const dateForDay =
            day === null
              ? null
              : new Date(
                  visibleMonth.getFullYear(),
                  visibleMonth.getMonth(),
                  day,
                );

          const selected =
            dateForDay && selectedDate
              ? isSameDay(dateForDay, selectedDate)
              : false;

          return (
            <View key={`${idx}-${day ?? "x"}`} style={styles.calendarGridCell}>
              <CalendarDay
                label={day}
                disabled={!dateForDay}
                selected={selected}
                onPress={() => {
                  if (!dateForDay) return;
                  onSelect(dateForDay);
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const CreateTask = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [responsibleFocus, setResponsibleFocus] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const users = useSelector(getStaff);
  const vehicles = useSelector(getVehicles);

  const dispatch = useDispatch();

  const selectedPanne = useSelector(getDetailPanne);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        title: Yup.string()
          .trim()
          .required(t("required") || "Required"),
        description: Yup.string()
          .trim()
          .required(t("required") || "Required"),
        responsible: Yup.mixed().required(t("required") || "Required"),
        deadline: Yup.date().required(t("required") || "Required"),
      }),
    [t],
  );

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      responsible: null,
      deadline: null,
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: async (values, helpers) => {
      const payload = {
        taskName: values.title,
        assignedToUserId: values.responsible?.userID || null,
        description: values.description,
        deadline: values.deadline
          ? moment(values.deadline).format("YYYY-MM-DD")
          : null,
        idPanne: selectedPanne?.id || null,
      };

      try {
        const res = await dispatch(createTask(payload));
        if (!res?.payload) return;
        helpers.resetForm();
        navigation.goBack();
        // handleGoBack()
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  // Mock data for dropdowns
  const responsiblePersons = [
    { label: "Zakaria Rahali", value: "1", initials: "ZR" },
    { label: "Ahmed Ben Ali", value: "2", initials: "AB" },
    { label: "Mohamed Salah", value: "3", initials: "MS" },
  ];

  const assets = [
    { label: "CN191011234", value: "1" },
    { label: "CN191011235", value: "2" },
    { label: "CN191011236", value: "3" },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectResponsible = (item) => {
    formik.setFieldValue("responsible", item || null);
    formik.setFieldTouched("responsible", true, false);
  };

  const handleOpenCalendar = () => {
    const base = formik.values.deadline ?? new Date();
    setVisibleMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const handleSelectDate = (d) => {
    formik.setFieldValue("deadline", d);
    formik.setFieldTouched("deadline", true, false);
    setIsCalendarOpen(false);
  };

  const isCreateDisabled = !formik.isValid || formik.isSubmitting;

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchStaff());
        // dispatch(fetchVehicles());
      } catch (err) {
        console.log("Error fetch tasks", err.message);
      }
    }, []),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            {/* Task Title */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t("task_title") || "Task Title"} *
              </Text>
              <TextInput
                mode="outlined"
                value={formik.values.title}
                onChangeText={formik.handleChange("title")}
                onBlur={formik.handleBlur("title")}
                placeholder={t("enter_task_title") || "Enter task title"}
                placeholderTextColor={colors.gray?.[400] || "#9CA3AF"}
                style={styles.input}
                outlineColor="#ccc"
                activeOutlineColor={colors.primary}
              />
              {formik.touched.title && formik.errors.title ? (
                <Text style={styles.errorText}>{formik.errors.title}</Text>
              ) : null}
            </View>

            {/* Task Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t("task_description") || "Task Description"}
              </Text>
              <TextInput
                mode="outlined"
                value={formik.values.description}
                onChangeText={formik.handleChange("description")}
                onBlur={formik.handleBlur("description")}
                placeholder={
                  t("describe_task_details") ||
                  "Describe the task details here..."
                }
                placeholderTextColor={colors.gray?.[400] || "#9CA3AF"}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                outlineColor="#ccc"
                activeOutlineColor={colors.primary}
              />
              {formik.touched.description && formik.errors.description ? (
                <Text style={styles.errorText}>
                  {formik.errors.description}
                </Text>
              ) : null}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            {/* Responsible Person */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t("responsible_person") || "Responsible Person"}
              </Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  responsibleFocus && { borderColor: colors.primary },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={users}
                maxHeight={300}
                labelField="firstname"
                valueField="id"
                placeholder={t("select_person") || "Select person..."}
                value={formik.values.responsible?.id || null}
                onFocus={() => setResponsibleFocus(true)}
                onBlur={() => setResponsibleFocus(false)}
                onChange={(item) => {
                  handleSelectResponsible(item);
                  setResponsibleFocus(false);
                }}
                renderLeftIcon={() =>
                  formik.values.responsible?.initials ? (
                    <Avatar.Text
                      size={28}
                      label={formik.values.responsible.initials}
                      style={styles.dropdownAvatar}
                    />
                  ) : (
                    <View style={styles.leftIconContainer}>
                      <MaterialCommunityIcons
                        name="account"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                  )
                }
                renderRightIcon={() => (
                  <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                )}
              />
              {formik.touched.responsible && formik.errors.responsible ? (
                <Text style={styles.errorText}>
                  {formik.errors.responsible}
                </Text>
              ) : null}
            </View>

            {/* Related Asset */}
            {false && (
              <View
                style={[styles.fieldContainer, styles.fieldContainerNoMargin]}
              >
                <Text style={styles.label}>
                  {t("related_asset") || "Related Asset"}
                </Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    assetFocus && { borderColor: colors.primary },
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={assets}
                  maxHeight={300}
                  labelField="licensePlate"
                  valueField="value"
                  placeholder={t("select_asset") || "Select asset..."}
                  value={asset?.value || null}
                  onFocus={() => setAssetFocus(true)}
                  onBlur={() => setAssetFocus(false)}
                  onChange={(item) => {
                    handleSelectAsset(item);
                    setAssetFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View style={styles.leftIconContainer}>
                      <MaterialCommunityIcons
                        name="truck"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                  )}
                  renderRightIcon={() => (
                    <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                  )}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            {/* Deadline */}
            <View
              style={[styles.fieldContainer, styles.fieldContainerNoMargin]}
            >
              <Text style={styles.label}>{t("deadline") || "Deadline"}</Text>
              <Pressable
                style={styles.deadlinePressable}
                onPress={handleOpenCalendar}
              >
                <View style={styles.deadlineLeft}>
                  <MaterialCommunityIcons
                    name="calendar-edit"
                    size={18}
                    color="#475569"
                  />
                  <Text
                    style={
                      formik.values.deadline
                        ? styles.deadlineText
                        : styles.deadlinePlaceholder
                    }
                  >
                    {formik.values.deadline
                      ? moment(formik.values.deadline).format("ddd DD MMM")
                      : t("select_date") || "Select date"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
              {formik.touched.deadline && formik.errors.deadline ? (
                <Text style={styles.errorText}>{formik.errors.deadline}</Text>
              ) : null}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Modal
        visible={isCalendarOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCalendar}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseCalendar}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("new_deadline") || "New deadline"}
              </Text>
              <IconButton icon="close" onPress={handleCloseCalendar} />
            </View>

            <EmbeddedCalendar
              visibleMonth={visibleMonth}
              selectedDate={formik.values.deadline}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelect={handleSelectDate}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={formik.handleSubmit}
          disabled={isCreateDisabled}
          buttonColor={colors.primary}
          style={styles.createButton}
          contentStyle={styles.createButtonContent}
        >
          {t("create_task") || "Create Task"}
        </Button>
        <Button mode="text" onPress={handleGoBack} textColor={colors.secondary}>
          {t("cancel") || "Cancel"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  placeholderStyle: {
    fontSize: 14,
    color: colors.gray?.[400] || "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#111827",
  },
  leftIconContainer: {
    height: 30,
    width: 30,
    borderRadius: 10,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  dropdownAvatar: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldContainerNoMargin: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.error,
  },
  input: {
    backgroundColor: "#fff",
  },
  textArea: {
    backgroundColor: "#fff",
    minHeight: 100,
  },
  datePickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  datePicker: {
    height: 50,
  },
  deadlinePressable: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deadlineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deadlinePlaceholder: {
    fontSize: 14,
    color: colors.gray?.[400] || "#9CA3AF",
  },
  deadlineText: {
    fontSize: 14,
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: "#F8F8F5",
    borderRadius: 16,
    padding: 12,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  calendarWeekCell: {
    height: 24,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarWeekText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  calendarGridCell: {
    marginBottom: 8,
  },
  calendarDayEmpty: {
    height: 40,
    width: 40,
  },
  calendarDay: {
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  calendarDaySelected: {
    backgroundColor: "#F9F506",
  },
  calendarDayDisabled: {
    backgroundColor: "transparent",
  },
  calendarDayText: {
    fontSize: 14,
    color: "#334155",
  },
  calendarDayTextSelected: {
    color: "#000",
    fontWeight: "700",
  },
  calendarDayTextDisabled: {
    color: "#CBD5E1",
  },
  statusContainer: {
    flexDirection: "row",
  },
  statusPill: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F3E8FF",
  },
  statusText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: "#F8F8F5",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  createButton: {
    borderRadius: 8,
    marginBottom: 8,
  },
  createButtonContent: {
    paddingVertical: 6,
  },
});

export default CreateTask;
