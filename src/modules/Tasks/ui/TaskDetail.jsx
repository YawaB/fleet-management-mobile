import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Button, Card, IconButton, Text, TextInput } from "react-native-paper";
import moment from "moment";
import "moment/locale/fr";
import { useDispatch } from "react-redux";
import { saveOrUpdateTask } from "../slice/slice";

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

const StatusBadge = ({ status }) => {
  const { label, className } = useMemo(() => {
    switch (status) {
      case "EN COURS":
        return { label: "EN COURS", className: "bg-blue-600" };
      case "EN RETARD":
        return { label: "EN RETARD", className: "bg-red-600" };
      case "À FAIRE":
      default:
        return { label: "À FAIRE", className: "bg-amber-600" };
    }
  }, [status]);

  return (
    <View className={`px-3 py-1 rounded-full ${className}`}>
      <Text className="text-white text-xs font-bold">{label}</Text>
    </View>
  );
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
            {task.title}
          </Text>
          <StatusBadge status={task.status} />
        </View>

        <Text className="mt-2 text-sm text-slate-600" numberOfLines={2}>
          {task.type} • {task.location}
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
      1
    );
    const last = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
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
        {weekLabels.map((w) => (
          <View key={w} className="h-6 w-10 items-center justify-center">
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
                  day
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
  const { taskData: taskDataFromParams, task: taskFromParams } =
    route?.params ?? {};
  const task = taskDataFromParams ?? taskFromParams;

  console.log(task, "task");

  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

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

  const handleConfirm = () => {
    if (!canConfirm) return;

    const taskData = {
      id: task.id,
      name: task._raw.taskName,
      vehiculeId: task._raw.vehiculeId,
      description: reason || task._raw.description,
      plannedDate: moment(selectedDate).format("YYYY-MM-DD"),
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
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
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

      setAttachments((prev) => {
        const existingUris = new Set(prev.map((a) => a?.uri).filter(Boolean));
        const merged = [...prev];
        for (const a of nextAssets) {
          if (!a?.uri || existingUris.has(a.uri)) continue;
          merged.push(a);
          existingUris.add(a.uri);
        }
        return merged;
      });
    } catch (e) {
      // no-op
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
      >
        <View className="px-4 pb-28">
          <TaskSummaryCard task={task} />

          <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-700">
              Date Creation
            </Text>
            <View className="mt-2 bg-white rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm text-slate-700">
                  Créée le {formatFullDateFr(task._raw.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-700">
              Date limite
            </Text>
            <View className="mt-2 bg-white rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm text-slate-700">
                  {formatFullDateFr(task._raw.deadline)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-sm font-semibold text-slate-700">
              Nouvelle date souhaitée
            </Text>
            <View className="mt-2">
              <EmbeddedCalendar
                visibleMonth={visibleMonth}
                selectedDate={selectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelect={(d) => setSelectedDate(d)}
              />
            </View>

            <View className="mt-3 bg-white rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-edit"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm text-slate-700">
                  {selectedDate
                    ? `Sélectionnée : ${formatFullDateFr(selectedDate)}`
                    : "Aucune date sélectionnée"}
                </Text>
              </View>
            </View>
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
                  Retard : {delayDays} jour{delayDays === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="mt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-700">
                Motif du changement
              </Text>
              <Text className="text-xs text-slate-400">Optionnel</Text>
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

          <View className="mt-5 mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-700">
                Pièces jointes
              </Text>
              <Text className="text-xs text-slate-400">PDF, Excel, ...</Text>
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
                >
                  Importer
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
                        <Text
                          className="text-sm text-slate-800"
                          numberOfLines={1}
                        >
                          {a.name || "Fichier"}
                        </Text>
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
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-[#F8F8F5] px-4 pb-4 pt-3 border-t border-slate-200">
        <Button
          mode="contained"
          onPress={handleConfirm}
          disabled={!canConfirm}
          buttonColor="#F9F506"
          textColor="#000000"
          className="rounded-2xl"
        >
          Confirmer le changement
        </Button>
        <Button mode="text" onPress={handleGoBack} className="mt-2">
          Annuler
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TaskDetail;
