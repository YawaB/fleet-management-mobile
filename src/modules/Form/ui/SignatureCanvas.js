import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SignatureCanvas from "react-native-signature-canvas";
import { uploadFile } from "../../../core/utils/file";

const SignatureCanvasScreen = ({ onSignature }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef();

  const { height, width } = useWindowDimensions();

  const handleSignature = (signature) => {
    console.log("Signature captured:", signature);
    setSignature(signature);
    setIsLoading(false);
  };

  const handleEmpty = () => {
    console.log("Signature is empty");
    setIsLoading(false);
    alert("Please draw a signature before saving");
  };

  const handleClear = () => {
    console.log("Signature cleared");
    setSignature(null);
  };

  const handleError = (error) => {
    console.error("Signature pad error:", error);
    setIsLoading(false);
  };

  const handleEnd = () => {
    setIsLoading(true);
    ref.current?.readSignature();
  };

  const handleCancel = () => {
    setModalVisible(false);
    setIsLoading(false);
  };

  const handleSaveSignature = async () => {
    try {
      const uploadResult = await uploadFile(signature, {
        srcID: 0,
        desc: "signature",
        src: "forms",
        extension: "png",
        model: "image",
      });

      if (uploadResult.success) {
        const fileId = uploadResult.save.data.result[0]?.id;
        setSignature(signature); // Keep base64 for preview
        if (typeof onSignature === "function") {
          onSignature(fileId); // Pass file ID to parent
        }
        setModalVisible(false);
      } else {
        console.error("❌ Failed to upload signature");
      }
    } catch (error) {
      console.error("Error in handleSignature:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Signature Preview or Button */}
      <TouchableOpacity
        style={styles.signatureButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        {signature ? (
          <View style={styles.signaturePreview}>
            <Image
              source={{ uri: signature }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
            <View style={styles.signatureInfo}>
              <Text style={styles.signatureInfoText}>✓ Signature saved</Text>
            </View>
            <View style={styles.editOverlay}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.editText}>Tap to edit</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContent}>
            <Ionicons name="create-outline" size={32} color="#9CA3AF" />
            <Text style={styles.placeholderText}>Tap to sign</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Signature Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sign Here</Text>
            <TouchableOpacity
              onPress={handleClear}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={28} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Signature Canvas */}
          <View style={styles.canvasContainer}>
            <View style={[styles.preview, { width: width }]}>
              {signature && (
                <Image
                  resizeMode="contain"
                  style={{ width: 335, height: 114 }}
                  source={{ uri: signature }}
                />
              )}
            </View>
            <SignatureCanvas
              ref={ref}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              onClear={handleClear}
              onError={handleError}
              onEnd={handleEnd}
              autoClear={true}
              descriptionText="Sign here"
              clearText="Clear"
              confirmText={isLoading ? "Processing..." : "Save"}
              penColor="#000000"
              backgroundColor="rgba(255,255,255,0)"
              webviewProps={{
                cacheEnabled: true,
                androidLayerType: "hardware",
              }}
            />
          </View>

          {/* Footer with Save Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveSignature}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>
                {isLoading ? "Processing..." : "Save Signature"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  signatureButton: {
    width: "100%",
    height: 160,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  placeholderContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  signaturePreview: {
    flex: 1,
    position: "relative",
  },
  signatureImage: {
    width: "100%",
    height: "100%",
  },
  editOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
  signatureInfo: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  signatureInfoText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalFooter: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  preview: {
    height: 114,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    marginTop: 15,
  },
});

export default SignatureCanvasScreen;
