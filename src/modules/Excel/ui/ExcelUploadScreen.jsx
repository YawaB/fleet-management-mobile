import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { uploadFile } from "../../../core/utils/file";
import { colors } from "../../../theme/colors";

const EXCEL_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExcelUploadScreen() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: EXCEL_TYPES,
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result || result.canceled) return;

      const assets = Array.isArray(result.assets) ? result.assets : [];
      if (assets.length === 0) return;

      const newFiles = assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        size: a.size,
        status: "pending",
        error: null,
        uploadPath: null,
      }));

      setFiles((prev) => {
        const existingUris = new Set(prev.map((f) => f.uri));
        return [...prev, ...newFiles.filter((f) => !existingUris.has(f.uri))];
      });
    } catch (e) {
      console.log("pickExcel error", e);
    }
  };

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;

    setUploading(true);

    const updated = [...files];

    for (const file of pending) {
      const idx = updated.findIndex((f) => f.uri === file.uri);
      updated[idx] = { ...updated[idx], status: "uploading" };
      setFiles([...updated]);

      const extension = file.name?.split(".").pop() || "xlsx";
      const result = await uploadFile(file.uri, {
        src: "Excel",
        srcID: 0,
        desc: "excel-import",
        extension,
        name: file.name,
        model: "upload",
        path: "import/uploads",
      });

      if (result?.success) {
        updated[idx] = {
          ...updated[idx],
          status: "done",
          uploadPath: result?.upload?.data?.result,
        };
      } else {
        updated[idx] = {
          ...updated[idx],
          status: "error",
          error: result?.error?.message || "Échec de l'envoi",
        };
      }
      setFiles([...updated]);
    }

    setUploading(false);
  };

  const removeFile = (uri) => {
    setFiles((prev) => prev.filter((f) => f.uri !== uri));
  };

  const clearAll = () => {
    Alert.alert("Vider la liste", "Supprimer tous les fichiers ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => setFiles([]) },
    ]);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;

  const renderItem = ({ item }) => {
    const statusIcon =
      item.status === "done"
        ? { name: "checkmark-circle", color: "#22c55e" }
        : item.status === "error"
          ? { name: "close-circle", color: "#ef4444" }
          : item.status === "uploading"
            ? null
            : { name: "time-outline", color: "#94a3b8" };

    return (
      <View style={styles.fileRow}>
        <MaterialCommunityIcons
          name="microsoft-excel"
          size={32}
          color="#217346"
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.fileSize}>{formatSize(item.size)}</Text>
          {item.status === "error" && (
            <Text style={styles.errorText}>{item.error}</Text>
          )}
        </View>

        {item.status === "uploading" ? (
          <ActivityIndicator size={20} color={colors.primary} />
        ) : (
          statusIcon && (
            <Ionicons
              name={statusIcon.name}
              size={22}
              color={statusIcon.color}
              style={{ marginRight: 6 }}
            />
          )
        )}

        {item.status !== "uploading" && (
          <TouchableOpacity onPress={() => removeFile(item.uri)}>
            <Ionicons name="trash-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Drop zone / pick button */}
      <TouchableOpacity style={styles.dropZone} onPress={pickExcel}>
        <MaterialCommunityIcons
          name="microsoft-excel"
          size={48}
          color="#217346"
        />
        <Text style={styles.dropTitle}>Sélectionner des fichiers Excel</Text>
        <Text style={styles.dropSub}>.xlsx · .xls · .csv</Text>
      </TouchableOpacity>

      {/* File list */}
      {files.length > 0 && (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {files.length} fichier{files.length > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearText}>Tout vider</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={files}
            keyExtractor={(item) => item.uri}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={{ maxHeight: 320 }}
          />
        </View>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={uploadAll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size={20} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
          )}
          <Text style={styles.uploadBtnText}>
            {uploading
              ? "Envoi en cours..."
              : `Envoyer ${pendingCount} fichier${pendingCount > 1 ? "s" : ""}`}
          </Text>
        </TouchableOpacity>
      )}

      {files.length > 0 && pendingCount === 0 && !uploading && (
        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
          <Text style={styles.doneText}>Tous les fichiers ont été envoyés</Text>
        </View>
      )}

      {/* Bottom action buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setFiles([])}
          disabled={uploading}
        >
          <Ionicons name="close-outline" size={20} color="#64748b" />
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            (pendingCount === 0 || uploading) && styles.saveBtnDisabled,
          ]}
          onPress={uploadAll}
          disabled={pendingCount === 0 || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size={18} />
          ) : (
            <Ionicons name="save-outline" size={20} color="#fff" />
          )}
          <Text style={styles.saveBtnText}>
            {uploading ? "Envoi..." : "Enregistrer"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    gap: 16,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: "#217346",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    gap: 8,
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  dropSub: {
    fontSize: 13,
    color: "#64748b",
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  clearText: {
    fontSize: 13,
    color: "#ef4444",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  fileSize: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  uploadBtnDisabled: {
    opacity: 0.7,
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  doneText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
