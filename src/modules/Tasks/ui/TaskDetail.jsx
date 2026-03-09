import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTaskStatus,
  getTasks,
  getTaskStatus,
  saveOrUpdateTask,
  startTaskOrStop,
} from "../slice/slice";
import { uploadFile } from "../../../core/utils/file";
import { useTranslation } from "react-i18next";
import { EXPO_PUBLIC_REACT_APP_API } from "@env";
import IDatePicker from "../../../component/Shared/IDatePicker/IDatePicker";

const formatFullDateFr = (date) => {
  if (!date) return "";
  const m = moment.utc(date);
  if (!m.isValid()) return "";
  return m.locale("fr").format("DD MMM YYYY");
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

const TaskSummaryCard = ({ task }) => {
  const taskId = task?.TaskId ?? task?.id ?? "";
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        marginTop: 16,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text
          className="flex-1 text-lg font-bold text-slate-900"
          numberOfLines={3}
        >
          {task.taskName}
        </Text>
        {taskId ? (
          <View
            style={{
              backgroundColor: "#f1f5f9",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#475569", fontSize: 12, fontWeight: "600" }}>
              {taskId}
            </Text>
          </View>
        ) : null}
      </View>
      {task?.description ? (
        <Text
          className="text-slate-600 mt-3"
          style={{ fontSize: 14, lineHeight: 20 }}
          numberOfLines={4}
        >
          {task.description}
        </Text>
      ) : null}

      <View className="flex-row items-center gap-2 mt-2">
        <MaterialCommunityIcons
          name="calendar-outline"
          size={14}
          color="#94a3b8"
        />
        <Text style={{ fontSize: 13, color: "#94a3b8" }}>
          {formatFullDateFr(task.createdAt)}
        </Text>
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

  const { t } = useTranslation();

  if (!task) return null;

  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingPath, setDownloadingPath] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [loadingStatus, setLoadingStatus] = useState(false);

  const taskStatus = useSelector(getTaskStatus);

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

  const dispatch = useDispatch();

  const isLate = useMemo(() => {
    if (task.status !== "EN RETARD") return false;
    return getDelayDays(task.plannedDate) > 0;
  }, [task.plannedDate, task.status]);

  const delayDays = useMemo(() => {
    return isLate ? getDelayDays(task.plannedDate) : 0;
  }, [isLate, task.plannedDate]);

  const canConfirm = Boolean(selectedDate);

  const validTaskFiles = useMemo(() => {
    const list = Array.isArray(task?.files) ? task.files : [];
    return list
      .map((f) => {
        if (typeof f === "string") return { path: f };
        if (typeof f?.path === "string") return { path: f.path };
        return null;
      })
      .filter((f) => typeof f?.path === "string" && f.path.trim().length > 0);
  }, [task?.files]);

  const existingFilesCount = validTaskFiles.length;

  const totalAttachmentsCount = attachments.length + existingFilesCount;

  const getFileBaseUrl = useCallback((apiBaseUrl) => {
    if (typeof apiBaseUrl !== "string" || apiBaseUrl.trim().length === 0)
      return "";
    return apiBaseUrl.replace(/\/api\/?$/i, "");
  }, []);

  const handleDownloadServerFile = useCallback(
    async (path) => {
      try {
        if (typeof path !== "string" || path.trim().length === 0) return;

        const baseUrl = getFileBaseUrl(EXPO_PUBLIC_REACT_APP_API);
        if (!baseUrl) {
          Alert.alert("Missing base URL", "API base URL is not configured");
          return;
        }

        const normalizedBase = baseUrl.replace(/\/+$/, "");
        const normalizedPath = path.replace(/^\/+/, "");
        const remoteUrl = `${normalizedBase}/${normalizedPath}`;

        const fileNameRaw = normalizedPath.split("/").pop() || "file";
        const fileName = fileNameRaw.replace(/[^a-zA-Z0-9._-]/g, "_");
        const localUri = `${FileSystem.documentDirectory || ""}${fileName}`;

        setDownloadingPath(path);

        const token = await AsyncStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await FileSystem.downloadAsync(remoteUrl, localUri, {
          headers,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(res.uri);
        } else {
          await Linking.openURL(res.uri);
        }
      } catch (e) {
        console.log("Download/open attachment error:", e);
        Alert.alert(
          "Download failed",
          e?.message || "Could not download the attachment",
        );
      } finally {
        setDownloadingPath(null);
      }
    },
    [getFileBaseUrl],
  );

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
    setLoadingStatus(true);
    let foundStatus = taskStatus.find((s) => s.statusId == selectedStatusId);
    let args = {
      srcObject: "Tasks",
      srcId: task.TaskId,
      status: foundStatus?.statusName,
    };
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
        setLoadingStatus(false);
      } else {
        handleCloseStatusDialog();
        setLoadingStatus(false);
      }
    });
  };

  const handleConfirm = () => {
    const taskData = {
      ...task,
      idPanne: task?.panneId,
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

  useEffect(() => {
    setSelectedStatusId(currentStatusId);
  }, [currentStatusId]);

  useEffect(() => {
    if (task?.deadline) {
      const m = moment(task.deadline);
      setSelectedDate(m.isValid() ? m.toDate() : null);
    } else {
      setSelectedDate(null);
    }
  }, [task?.deadline]);

  useEffect(() => {
    dispatch(fetchTaskStatus());
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F0F2F5" }}
    >
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 180, paddingHorizontal: 16 }}
      >
        {/* ── Task card ── */}
        <TaskSummaryCard task={task} />

        {/* ── STATUT ── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: 1.2,
            marginTop: 24,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {t("status")}
        </Text>
        {(() => {
          const current = taskStatus.find(
            (s) => String(s.statusId) === String(selectedStatusId),
          );
          const bg = current?.backgroundColor || "#64748b";
          const textColor = current?.color || "#fff";
          return (
            <View
              className="rounded-full"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: bg,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: bg,
                  }}
                />
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}
                >
                  {current?.statusLabel || "—"}
                </Text>
              </View>
              <Pressable
                onPress={handleOpenStatusDialog}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#f1f5f9",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 50,
                }}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={12}
                  color="#475569"
                />
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#475569" }}
                >
                  {t("update_status")}
                </Text>
              </Pressable>
            </View>
          );
        })()}

        {/* ── DATE D'ÉCHÉANCE ── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: 1.2,
            marginTop: 24,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {t("deadline")}
        </Text>
        <IDatePicker value={selectedDate} onChange={setSelectedDate} />

        {isLate ? (
          <View
            style={{
              marginTop: 10,
              backgroundColor: "#fef2f2",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MaterialCommunityIcons
              name="clock-alert-outline"
              size={16}
              color="#dc2626"
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#dc2626" }}>
              {t("late_by")} {delayDays} {t("day_plural", { count: delayDays })}
            </Text>
          </View>
        ) : null}

        {/* ── PIÈCES JOINTES ── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: 1.2,
            marginTop: 24,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {t("attachments")}
        </Text>
        <Pressable
          onPress={handlePickAttachment}
          disabled={isUploading}
          style={{
            borderWidth: 1.5,
            borderColor: "#cbd5e1",
            borderStyle: "dashed",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingVertical: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#eff6ff",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="paperclip"
                  size={22}
                  color="#2563eb"
                />
              </View>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#334155" }}
              >
                {totalAttachmentsCount > 0
                  ? `${totalAttachmentsCount} fichier${totalAttachmentsCount === 1 ? "" : "s"} sélectionné${totalAttachmentsCount === 1 ? "" : "s"}`
                  : t("select_files") || "Ajouter un fichier"}
              </Text>
              <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                {t("pdf_excel") || "PDF, JPG ou PNG (max. 10MB)"}
              </Text>
            </>
          )}
        </Pressable>

        {/* Existing server files */}
        {validTaskFiles.length > 0 ? (
          <View
            style={{
              marginTop: 10,
              backgroundColor: "#fff",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {validTaskFiles.map((f, idx) => {
              const path = f?.path;
              const name =
                typeof path === "string" && path.length > 0
                  ? path.split("/").pop()
                  : `Fichier ${idx + 1}`;
              return (
                <Pressable
                  key={`${path ?? "file"}-${idx}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f1f5f9",
                  }}
                  onPress={() => handleDownloadServerFile(path)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      paddingRight: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="file-outline"
                      size={16}
                      color="#64748b"
                    />
                    <Text
                      style={{ fontSize: 13, color: "#1e293b", flex: 1 }}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                  </View>
                  {downloadingPath === path ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <MaterialCommunityIcons
                      name="download"
                      size={18}
                      color="#2563eb"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* Newly picked attachments */}
        {attachments.length > 0 ? (
          <View
            style={{
              marginTop: 10,
              backgroundColor: "#fff",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {attachments.map((a) => (
              <View
                key={a.uri}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f1f5f9",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                    paddingRight: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      a.uploaded === true
                        ? "check-circle"
                        : a.uploaded === false
                          ? "alert-circle"
                          : "file-outline"
                    }
                    size={16}
                    color={
                      a.uploaded === true
                        ? "#22c55e"
                        : a.uploaded === false
                          ? "#ef4444"
                          : "#64748b"
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 13, color: "#1e293b" }}
                      numberOfLines={1}
                    >
                      {a.name || "Fichier"}
                    </Text>
                    {typeof a.size === "number" ? (
                      <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                        {(a.size / 1024).toFixed(0)} KB
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  onPress={() => handleRemoveAttachment(a.uri)}
                  style={{ padding: 4 }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={18}
                    color="#94a3b8"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        {/* Documents */}
        {Array.isArray(task?.documents) && task.documents.length > 0 ? (
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 1.2,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              {t("documents")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 50,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: doc?.color || "#64748b",
                    }}
                  >
                    <FontAwesome5 name={iconName} size={14} color="#fff" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#fff",
                        marginLeft: 6,
                      }}
                    >
                      {label}
                      {srcId ? ` • ${srcId}` : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* ── RAISON (OPTIONNEL) ── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#94a3b8",
            letterSpacing: 1.2,
            marginTop: 24,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {t("reason")}
        </Text>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            paddingHorizontal: 14,
            paddingVertical: 10,
            minHeight: 110,
          }}
        >
          <TextInput
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            placeholder="Expliquez brièvement le changement de statut ou d'échéance..."
            placeholderTextColor="#adb5bd"
            style={{
              backgroundColor: "transparent",
              fontSize: 14,
              color: "#1e293b",
              textAlignVertical: "top",
              padding: 0,
              margin: 0,
            }}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            mode="flat"
          />
        </View>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#F0F2F5",
          paddingHorizontal: 16,
          paddingBottom: 32,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
        }}
      >
        <Pressable
          onPress={handleConfirm}
          disabled={!canConfirm}
          style={{
            backgroundColor: canConfirm ? "#2563eb" : "#93c5fd",
            borderRadius: 50,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            {t("confirm_change")}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleGoBack}
          style={{ alignItems: "center", marginTop: 14 }}
        >
          <Text style={{ color: "#64748b", fontSize: 14 }}>{t("cancel")}</Text>
        </Pressable>
      </View>

      <Portal>
        <Dialog
          visible={statusModalVisible}
          onDismiss={handleCloseStatusDialog}
        >
          <Dialog.Title>{t("update_status")}</Dialog.Title>
          <Dialog.Content>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 4,
              }}
            >
              {taskStatus.map((status) => {
                const isSelected =
                  String(status.statusId) === String(selectedStatusId);
                const bg = status.backgroundColor || "#64748b";
                const textColor = status.color || "#fff";
                return (
                  <Pressable
                    key={status.statusId}
                    onPress={() => handleSelectStatus(status)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 50,
                      backgroundColor: isSelected ? bg : "#f1f5f9",
                      borderWidth: 2,
                      borderColor: isSelected ? bg : "#e2e8f0",
                    }}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={14}
                        color={textColor}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: isSelected ? textColor : "#475569",
                      }}
                    >
                      {status.statusLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button disabled={loadingStatus} onPress={handleCloseStatusDialog}>
              {t("cancel")}
            </Button>
            <Button
              loading={loadingStatus}
              disabled={loadingStatus}
              onPress={handleConfirmStatus}
            >
              {t("confirm")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

export default TaskDetail;
