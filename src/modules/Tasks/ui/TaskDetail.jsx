import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  List,
  Portal,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";
import moment from "moment";
import "moment/locale/fr";
import { useDispatch, useSelector } from "react-redux";
import { getTasks, saveOrUpdateTask, startTaskOrStop } from "../slice/slice";
import { uploadFile } from "../../../core/utils/file";
import { useTranslation } from "react-i18next";

const formatFullDateFr = (date) => {
  if (!date) return "";
  const m = moment.utc(date);
  if (!m.isValid()) return "";
  return m.locale("fr").format("DD MMM YYYY");
};

const formatMonthYearFr = (date) => {
  if (!date) return "";
  const m = moment.utc(date);
  if (!m.isValid()) return "";
  return m.locale("fr").format("MMMM YYYY");
};

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getDelayDays = (plannedDate) => {
  const planned = startOfDay(plannedDate);
  const now = startOfDay(new Date());
  const diffMs = now.getTime() - planned.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

const isLightColor = (hex) => {
  if (typeof hex !== "string") return false;
  let c = hex.trim();
  if (!c.startsWith("#")) return false;
  c = c.slice(1);
  if (c.length === 3)
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  if (c.length !== 6) return false;

  const r = Number.parseInt(c.slice(0, 2), 16);
  const g = Number.parseInt(c.slice(2, 4), 16);
  const b = Number.parseInt(c.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
};

const CalendarDay = ({ label, disabled, selected, onPress }) => {
  if (!label) {
    return <View className="h-10 w-10" />;
  }

  const baseClass = "h-10 w-10 rounded-xl items-center justify-center";
  const selectedClass = selected ? "bg-[#F9F506]" : "bg-white";
  const textClass = disabled
    ? "text-slate-300"
    : selected
      ? "text-black font-bold"
      : "text-slate-700";

  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <View className={`${baseClass} ${selectedClass}`}>
        <Text className={`text-sm ${textClass}`}>{label}</Text>
      </View>
    </Pressable>
  );
};

const TaskSummaryCard = ({ task }) => {
  return (
    <Card className="bg-white rounded-2xl overflow-hidden">
      <Card.Content className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <Text
            className="flex-1 text-lg font-bold text-slate-900"
            numberOfLines={3}
          >
            {task.taskName}
          </Text>
          <View
            style={{ backgroundColor: task.bgColor }}
            className="px-3 py-1 rounded-full "
          >
            <Text className="text-white text-xs font-bold">
              {task.statusLabel}
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-sm text-slate-600" numberOfLines={2}>
          {task.licensePlate}
        </Text>
      </Card.Content>
    </Card>
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
    for (let i = 0; i < mondayBasedIndex; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= last.getDate(); day += 1) {
      cells.push(day);
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [visibleMonth]);

  const weekLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <View className="bg-white rounded-2xl p-4">
      <View className="flex-row items-center justify-between">
        <IconButton icon="chevron-left" onPress={onPrevMonth} />
        <Text className="text-base font-semibold text-slate-900">
          {formatMonthYearFr(visibleMonth)}
        </Text>
        <IconButton icon="chevron-right" onPress={onNextMonth} />
      </View>

      <View className="mt-2 flex-row justify-between">
        {weekLabels.map((w, idx) => (
          <View
            key={`${w}-${idx}`}
            className="h-6 w-10 items-center justify-center"
          >
            <Text className="text-xs font-semibold text-slate-500">{w}</Text>
          </View>
        ))}
      </View>

      <View className="mt-2 flex-row flex-wrap justify-between">
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
            <View key={`${idx}-${day ?? "x"}`} className="mb-2">
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

const TaskDetail = ({ navigation, route }) => {
  const {
    taskData: taskDataFromParams,
    task: taskFromParams,
    id,
  } = route?.params ?? {};

  const tasks = useSelector(getTasks);
  const taskId =
    id ??
    taskDataFromParams?.TaskId ??
    taskFromParams?.TaskId ??
    taskDataFromParams?.id ??
    taskFromParams?.id;

  const taskFromStore = useMemo(() => {
    if (taskId === undefined || taskId === null) return null;
    return (Array.isArray(tasks) ? tasks : []).find(
      (t) => String(t?.TaskId ?? t?.taskId ?? t?.id) === String(taskId),
    );
  }, [taskId, tasks]);

  let task = taskFromStore ?? taskDataFromParams ?? taskFromParams;

  console.log(task, "task");

  const { t } = useTranslation();

  if (!task) return null;

  const [selectedDate, setSelectedDate] = useState(
    moment(task?.deadline).toDate() || null,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const taskStatus = useMemo(
    () => [
      {
        statusId: 49,
        statusName: "created",
        statusLabel: "Créer",
        icon: "",
        iconreact: "",
        color: "#ffffff",
        backgroundColor: "#6c757d",
        isTransitionAllowed: true,
        isCurrentStatus: false,
        hasPermission: true,
        displayOrder: 1,
      },
      {
        statusId: 61,
        statusName: "encours",
        statusLabel: "En cours",
        icon: "",
        iconreact: "",
        color: "#ffffff",
        backgroundColor: "#ffc107",
        isTransitionAllowed: true,
        isCurrentStatus: false,
        hasPermission: true,
        displayOrder: 1,
      },
      {
        statusId: 63,
        statusName: "verification",
        statusLabel: "En vérification",
        icon: "",
        iconreact: "circle",
        color: "",
        backgroundColor: "",
        isTransitionAllowed: true,
        isCurrentStatus: false,
        hasPermission: true,
        displayOrder: 1,
      },
      {
        statusId: 62,
        statusName: "terminer",
        statusLabel: "Terminer",
        icon: "",
        iconreact: "",
        color: "#ffffff",
        backgroundColor: "#28a745",
        isTransitionAllowed: true,
        isCurrentStatus: false,
        hasPermission: true,
        displayOrder: 1,
      },
      {
        statusId: 64,
        statusName: "valide",
        statusLabel: "Validé",
        icon: "fas fa-circle",
        iconreact: "circle",
        color: "#000",
        backgroundColor: "#fff",
        isTransitionAllowed: true,
        isCurrentStatus: false,
        hasPermission: true,
        displayOrder: 1,
      },
    ],
    [],
  );

  const currentStatusId = useMemo(() => {
    const direct = task?.statusId ?? task?.statusID ?? task?.StatusId;
    if (direct !== undefined && direct !== null) return String(direct);

    const match = taskStatus.find(
      (s) =>
        s.statusName === task?.statusName ||
        s.statusLabel === task?.statusLabel,
    );
    return match ? String(match.statusId) : "";
  }, [
    task?.StatusId,
    task?.statusId,
    task?.statusID,
    task?.statusLabel,
    task?.statusName,
    taskStatus,
  ]);

  const [selectedStatusId, setSelectedStatusId] = useState(currentStatusId);

  useEffect(() => {
    setSelectedStatusId(currentStatusId);
  }, [currentStatusId]);

  useEffect(() => {
    setSelectedDate(moment(task?.deadline).toDate() || null);
  }, [task?.deadline]);

  const dispatch = useDispatch();

  const isLate = useMemo(() => {
    if (task.status !== "EN RETARD") return false;
    return getDelayDays(task.plannedDate) > 0;
  }, [task.plannedDate, task.status]);

  const delayDays = useMemo(() => {
    return isLate ? getDelayDays(task.plannedDate) : 0;
  }, [isLate, task.plannedDate]);

  const canConfirm = Boolean(selectedDate);

  const handleGoBack = () => {
    if (navigation?.goBack) navigation.goBack();
  };

  const handleOpenStatusDialog = () => {
    setSelectedStatusId(currentStatusId);
    setStatusModalVisible(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusModalVisible(false);
  };

  const handleChangeStatus = (status) => {
    const srcId = task?.TaskId ?? task?.id;
    if (!srcId) return;

    const args = {
      srcObject: "Tasks",
      srcId,
      status,
    };

    dispatch(startTaskOrStop(args)).then(({ payload }) => {
      if (payload) {
        handleCloseStatusDialog();
        handleGoBack();
      }
    });
  };

  const handleSelectStatus = (status) => {
    setSelectedStatusId(String(status.statusId));
  };

  const handleConfirmStatus = () => {
    if (!canConfirm) return;
    let foundStatus = taskStatus.find((s) => s.statusId == selectedStatusId);
    let args = {
      srcObject: "Tasks",
      srcId: task.TaskId,
      status: foundStatus?.statusName,
    };
    console.log(args, "args");
    dispatch(startTaskOrStop(args)).then(({ payload }) => {
      if (payload) {
        let tempTask = {
          ...task,
          statusLabel: foundStatus?.statusLabel,
          statusName: foundStatus?.statusName,
          bgColor: foundStatus?.backgroundColor,
          color: foundStatus?.color,
        };
        task = tempTask;
        handleCloseStatusDialog();
      }
    });
  };

  const RadioComponent =
    Platform.OS === "ios" ? RadioButton.IOS : RadioButton.Android;

  const handleConfirm = () => {
    const taskData = {
      ...task,
      id: task.TaskId,
      description: reason || task?.description,
      deadline: moment(selectedDate).format("YYYY-MM-DD"),
    };
    console.log(taskData, "handleConfirm");
    dispatch(saveOrUpdateTask(taskData)).then(({ payload }) => {
      if (payload) {
        handleGoBack();
      }
    });
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

  const handleOpenCalendar = () => {
    const base = selectedDate ?? new Date();
    setVisibleMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleSelectDate = (d) => {
    setSelectedDate(d);
    setIsCalendarOpen(false);
  };

  const handlePickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
          "application/*",
        ],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result || result.canceled) return;

      const nextAssets = Array.isArray(result.assets)
        ? result.assets
        : result.uri
          ? [result]
          : [];

      if (nextAssets.length === 0) return;

      setIsUploading(true);

      const taskId = task?.TaskId ?? task?.id;
      const uploadedFiles = [];

      for (const asset of nextAssets) {
        if (!asset?.uri) continue;

        const extension = asset.name?.split(".").pop() || "file";
        const uploadResult = await uploadFile(asset.uri, {
          src: "Tasks",
          srcID: taskId,
          desc: "attachment",
          extension: extension,
          name: asset.name,
          model: "upload",
          path: "import/uploads",
        });

        if (uploadResult?.success) {
          uploadedFiles.push({
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            uploadPath: uploadResult.upload?.data?.result,
            uploaded: true,
          });
        } else {
          uploadedFiles.push({
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            uploaded: false,
            error: uploadResult?.error,
          });
        }
      }

      setIsUploading(false);

      setAttachments((prev) => {
        const existingUris = new Set(prev.map((a) => a?.uri).filter(Boolean));
        const merged = [...prev];
        for (const a of uploadedFiles) {
          if (!a?.uri || existingUris.has(a.uri)) continue;
          merged.push(a);
          existingUris.add(a.uri);
        }
        return merged;
      });
    } catch (e) {
      setIsUploading(false);
      console.log("Error picking/uploading attachment:", e);
    }
  };

  const handleRemoveAttachment = (uri) => {
    setAttachments((prev) => prev.filter((a) => a?.uri !== uri));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#F8F8F5]"
    >
      <ScrollView
        className="flex-1 mt-2 p-2"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        <View className="px-4 ">
          <TaskSummaryCard task={task} />

          <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-700">
              {t("created")}
            </Text>
            <View className="mt-2 bg-white rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm text-slate-700">
                  {t("created")} {formatFullDateFr(task.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-700">
              {t("deadline")}
            </Text>
            <View className="mt-2 bg-white rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm text-slate-700">
                  {formatFullDateFr(task.deadline)}
                </Text>
              </View>
            </View>
          </View> */}

          <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-700">
              {t("deadline")}
            </Text>
            <Pressable
              className="mt-2 bg-white rounded-2xl p-4 flex-row items-center justify-between"
              onPress={handleOpenCalendar}
            >
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-edit"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm text-slate-700">
                  {selectedDate
                    ? `${t("selected_date")}: ${formatFullDateFr(selectedDate)}`
                    : formatFullDateFr(task.deadline)}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#94a3b8"
              />
            </Pressable>
          </View>

          {isLate ? (
            <View className="mt-5 bg-red-50 rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="clock-alert-outline"
                  size={18}
                  color="#dc2626"
                />
                <Text className="text-sm font-semibold text-red-600">
                  {t("late_by")} {delayDays}{" "}
                  {t("day_plural", { count: delayDays })}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="mt-5 mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-700">
                {t("attachments")}
              </Text>
              <Text className="text-xs text-slate-400">{t("pdf_excel")}</Text>
            </View>

            <View className="mt-2 bg-white rounded-2xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name="paperclip"
                    size={18}
                    color="#475569"
                  />
                  <Text className="text-sm text-slate-700">
                    {attachments.length > 0
                      ? `${attachments.length} fichier${
                          attachments.length === 1 ? "" : "s"
                        } sélectionné${attachments.length === 1 ? "" : "s"}`
                      : "Aucun fichier sélectionné"}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handlePickAttachment}
                  buttonColor="#F9F506"
                  textColor="#000000"
                  compact
                  disabled={isUploading}
                  loading={isUploading}
                >
                  {isUploading
                    ? t("uploading") || "Uploading..."
                    : t("select_files")}
                </Button>
              </View>

              {attachments.length > 0 ? (
                <View className="mt-3">
                  {attachments.map((a) => (
                    <View
                      key={a.uri}
                      className="flex-row items-center justify-between py-2 border-t border-slate-100"
                    >
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-1">
                          <Text
                            className="text-sm text-slate-800 flex-1"
                            numberOfLines={1}
                          >
                            {a.name || "Fichier"}
                          </Text>
                          {a.uploaded === true && (
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={16}
                              color="#22c55e"
                            />
                          )}
                          {a.uploaded === false && (
                            <MaterialCommunityIcons
                              name="alert-circle"
                              size={16}
                              color="#ef4444"
                            />
                          )}
                        </View>
                        {typeof a.size === "number" ? (
                          <Text className="text-xs text-slate-400">
                            {(a.size / 1024).toFixed(0)} KB
                          </Text>
                        ) : null}
                      </View>

                      <IconButton
                        icon="close"
                        size={18}
                        onPress={() => handleRemoveAttachment(a.uri)}
                        accessibilityLabel="Remove attachment"
                      />
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          {Array.isArray(task?.documents) && task.documents.length > 0 ? (
            <View className="mt-5">
              <Text className="text-sm font-semibold text-slate-700">
                {t("documents")}
              </Text>

              <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
                {task.documents.map((doc, idx) => {
                  const iconName =
                    typeof doc?.icon === "string"
                      ? doc.icon.replace(/^fa-/, "")
                      : "file";
                  const label = doc?.label ?? "";
                  const srcId = doc?.srcId;

                  return (
                    <View
                      key={`${doc?.code ?? "doc"}-${srcId ?? idx}`}
                      className="px-3 py-2 rounded-full flex-row items-center"
                      style={{ backgroundColor: doc?.color || "#64748b" }}
                    >
                      <FontAwesome5 name={iconName} size={14} color="#fff" />
                      <Text className="text-xs font-semibold text-white ml-2">
                        {label}
                        {srcId ? ` • ${srcId}` : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View className="mt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-700">
                {t("change_reason")}
              </Text>
              <Text className="text-xs text-slate-400">{t("optional")}</Text>
            </View>

            <View className="mt-2 mb-6">
              <TextInput
                mode="outlined"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={5}
                placeholder="Expliquez la raison du report (ex : pièce manquante, technicien malade)"
                className="bg-white"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isCalendarOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCalendar}
      >
        <Pressable
          className="flex-1 justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={handleCloseCalendar}
        >
          <Pressable
            className="bg-[#F8F8F5] rounded-2xl p-3"
            style={{ maxHeight: "80%" }}
            onPress={() => {}}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-slate-900">
                {t("new_deadline")}
              </Text>
              <IconButton icon="close" onPress={handleCloseCalendar} />
            </View>

            <EmbeddedCalendar
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelect={handleSelectDate}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <View className="absolute bottom-0 left-0 right-0 bg-[#F8F8F5] px-4 pb-4 pt-3 border-t border-slate-200">
        <Button mode="outlined" onPress={handleOpenStatusDialog}>
          {t("update_status")}
        </Button>
        <Button
          mode="contained"
          onPress={handleConfirm}
          disabled={!canConfirm}
          buttonColor="#F9F506"
          textColor="#000000"
          className="rounded-2xl"
          style={{ marginTop: 10 }}
        >
          {t("confirm_change")}
        </Button>
        <Button mode="text" onPress={handleGoBack} className="mt-2">
          {t("cancel")}
        </Button>
      </View>

      <Portal>
        <Dialog
          visible={statusModalVisible}
          onDismiss={handleCloseStatusDialog}
        >
          <Dialog.Title>{t("update_status")}</Dialog.Title>
          <Dialog.Content>
            <View className="flex flex-col gap-3">
              {taskStatus.map((status) => {
                const accentColor = status.backgroundColor || "#64748B";
                const isSelected =
                  String(status.statusId) === String(selectedStatusId);
                const selectedTextColor =
                  status.color ||
                  (isLightColor(accentColor) ? "#111827" : "#FFFFFF");
                const unselectedTextColor = accentColor;
                return (
                  <Pressable
                    key={status.statusId}
                    onPress={() => handleSelectStatus(status)}
                  >
                    <View
                      style={{
                        minWidth: 150,
                        borderRadius: 12,
                        backgroundColor: isSelected ? accentColor : "#F8FAFC",
                        padding: 12,
                        borderWidth: 1,
                        borderColor: isSelected ? accentColor : "#E2E8F0",
                      }}
                      className="flex-row items-center gap-2"
                    >
                      <View pointerEvents="none">
                        <RadioComponent
                          status={isSelected ? "checked" : "unchecked"}
                          color={selectedTextColor}
                          uncheckedColor={unselectedTextColor}
                        />
                      </View>
                      <Text
                        style={{
                          color: isSelected
                            ? selectedTextColor
                            : unselectedTextColor,
                        }}
                        className="font-semibold text-base"
                      >
                        {status.statusLabel}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseStatusDialog}>{t("cancel")}</Button>
            <Button onPress={handleConfirmStatus}>{t("confirm")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

export default TaskDetail;
