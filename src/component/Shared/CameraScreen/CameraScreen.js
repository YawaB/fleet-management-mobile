import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { useDispatch } from "react-redux";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { setPhoto, setSavePhoto, _uploadBase64 } from "./slice/photo.slice";
import { Video } from "expo-av";
import { ActivityIndicator } from "react-native-paper";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { compressBase64, moveFileToDocument } from "../../../core/utils/file";
import { _saveFile } from "./api";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";

export const GuidLines = {
  base: 18,
  small: 12,
  large: 26,
  extraLarge: 32,
  marginHor: 16,
  colorGray: "#d3d3d3",
  colorBl: "#4a5759",
  colorRed: "#D64B70",
  colorPr: "#4a5759",
  colorSec: "#b0c4b1",
  colorWht: "#dedbd2",
  colorBlSec: "#0fa3b1",
  windowWidth: Dimensions.get("window").width,
  windowHeight: Dimensions.get("window").height,
};

const CameraScreen = ({
  visible,
  style,
  open,
  onImage,
  onHide,
  from,
  extraInfo,
  mode,
  onScan,
  enginDetail,
  onUploadFinished,
  height,
}) => {
  const [type, setType] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [images, setImages] = useState([]);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [sound, setSound] = useState();
  const [cameraMode, setCameraMode] = useState("picture");
  const [isRecording, setIsRecording] = useState(false);
  const canScan = useRef(false);
  const [pickType, setPickType] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);
  const [video, setVideo] = useState();
  let [params, setParams] = useState({});

  const timerRef = useRef(null);

  const dispatch = useDispatch();

  const [show, setShow] = useState(true);

  const route = useRoute();
  const navigation = useNavigation();

  function toggleCameraType() {
    setType((current) => (current === "back" ? "front" : "back"));
  }

  const pickImageAsync = async () => {
    setPickType("gallery");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsMultipleSelection: true,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      base64: true,
    });
    if (!result.canceled) {
      let assets = await Promise.all(
        result.assets.map(async (o) => {
          let obj = { ...o, uri: o.uri };
          const isVideo =
            o?.type === "video" ||
            (typeof o?.mimeType === "string" && o.mimeType.startsWith("video"));
          if (obj?.uri) {
            let uri = moveFileToDocument(obj.uri);
            if (uri) obj.uri = uri;
            if (!isVideo) {
              let base64Cpmpresed = await compressBase64(obj.uri);
              obj.base64 = base64Cpmpresed || obj.base64;
            } else {
              obj.type = "video";
            }
          }

          return obj;
        }),
      );
      validate(assets);
    } else {
      // alert('You did not select any image.');
      onCancel();
    }
  };

  useEffect(() => {
    setCameraMode(["picture", "scan"].includes(mode) ? mode : "camera");
  }, [mode]);

  async function playSound() {
    try {
      if (!audioPermission?.granted) await requestAudioPermission();
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/sound/beep-07a.mp3"),
      );
      setSound(sound);
      await sound.playAsync();
    } catch (e) {
      console.log("error:", e.message);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const addImage = (image) => {
    setImages((prev) => [...prev, image]);
  };

  const takePhoto = async () => {
    let options = {
      // base64: true,
      quality: 1,
      exif: false,
    };
    let photo = await photoRef.current.takePictureAsync(options);
    photo = { ...photo };
    if (photo?.uri) {
      let uri = moveFileToDocument(photo?.uri);
      if (uri) photo.uri = uri;
      let base64Cpmpresed = await compressBase64(photo?.uri);
      photo.base64 = base64Cpmpresed || photo.base64;
    }
    addImage(photo);
  };

  const upload = async (image) => {
    // const img = await compressImage(image);
    try {
      if (Array.isArray(image) && image?.length > 0) {
        const imageItems = image.filter((it) => it?.type !== "video");
        // const videoItems = image.filter((it) => it?.type === "video");
        // console.log("videoItems", videoItems);
        let compressedImages = await Promise.all(
          imageItems.map(async (img) => {
            const compressedImage = await manipulateAsync(
              img.uri,
              [
                {
                  resize: { width: img.width * 0.8, height: img.height * 0.8 },
                },
              ],
              { compress: 0.5, format: SaveFormat.JPEG, base64: true },
            );
            return compressedImage;
          }),
        );

        // Read video files as base64 (no compression via image-manipulator)
        // const videoBase64s = await Promise.all(
        //   videoItems.map(async (vid) => {
        //     try {
        //       const b64 = await FileSystem.readAsStringAsync(vid.uri, { encoding: FileSystem.EncodingType.Base64 });
        //       return b64;
        //     } catch (e) {
        //       console.log("video base64 error", e?.message);
        //       return null;
        //     }
        //   })
        // );
        // const validVideoBase64s = videoBase64s.filter(Boolean);

        let x = Math.floor(Math.random() * 10000000 + 1);
        let options = {
          srcID: 0,
          desc: 0,
          src: 0,
          id: 0,
        };
        Object.assign(options, params);
        const imageBase64s = compressedImages.map((img) => img.base64);
        let uploadRes = await _uploadBase64(imageBase64s, {
          name: options.srcID + options.desc + options.src + "_" + x,
        });

        if (uploadRes?.data?.success) {
          navigation.goBack();
          let obj = {
            src: options.src,
            srcID: options.srcID,
            desc: options.desc,
            path: uploadRes?.data?.result,
            id: options.id,
          };
          saveRes = await _saveFile(obj);
          if (saveRes?.data?.success && Array.isArray(saveRes?.data?.result)) {
            const payload = imageItems.map((item, idx) => ({
              ...item,
              uploaded: true,
              ...(idx === 0 && {
                imageId: JSON.parse(saveRes.data.result?.[idx]?.id || "[]"),
              }),
              path: saveRes.data.result[idx]?.path,
            }));
            dispatch(setPhoto(payload));
          }
        }
        return;
      }
      // Single item upload (image or video)
      let base64Payload = null;
      let width = image.width,
        height = image.height;
      if (image?.type === "video") {
        try {
          base64Payload = await FileSystem.readAsStringAsync(image.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          console.log("single video base64 error", e?.message);
        }
      } else {
        const compressedImage = await manipulateAsync(
          image.uri,
          [
            {
              resize: { width: image.width * 0.8, height: image.height * 0.8 },
            },
          ],
          { compress: 0.5, format: SaveFormat.JPEG, base64: true },
        );
        base64Payload = compressedImage?.base64;
        width = compressedImage?.width || width;
        height = compressedImage?.height || height;
      }
      let x = Math.floor(Math.random() * 10000000 + 1);
      let options = {
        srcID: 0,
        desc: 0,
        src: 0,
        id: 0,
      };
      Object.assign(options, params);
      let uploadRes = await _uploadBase64(base64Payload, {
        name: options.srcID + options.desc + options.src + "_" + x,
      });

      let saveRes = null;

      if (uploadRes?.data?.success) {
        let obj = {
          src: options.src,
          srcID: options.srcID,
          desc: options.desc,
          path: uploadRes?.data?.result,
          id: options.id,
        };
        saveRes = await _saveFile(obj);
        if (saveRes?.data?.success && Array.isArray(saveRes?.data?.result)) {
          const updatedMedia = {
            ...image,
            uploaded: true,
            imageId: saveRes.data.result[0]?.id,
            path: saveRes.data.result[0]?.path,
          };
          dispatch(setPhoto([updatedMedia]));
          navigation?.goBack();
        }
      }

      if (typeof onUploadFinished == "function") {
        onUploadFinished(saveRes?.data?.[0], uploadRes);
      }
    } catch (err) {
      console.log("upload", err);
    }
  };

  const takeVideo = () => {
    setIsRecording(true);
    let options = {
      quality: "1080p",
      maxDuration: 60,
      mute: false,
    };
    photoRef.current.recordAsync(options).then((recordedVideo) => {
      setVideo(recordedVideo);
      setIsRecording(false);
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    photoRef.current.stopRecording();
  };

  const removeImage = (index) => {
    setImages((prev) => {
      let t = [...prev];
      t.splice(index, 1);
      return t;
    });
  };
  const onCancel = (index) => {
    setImages([]);
    setPickType("");
    setIsTimeout(false);
    if (typeof onHide == "function") onHide();
  };

  const validate = async (_images) => {
    _images = _images || [...images];
    setUploading(true);
    if (typeof onImage == "function") {
      onImage([..._images]);
    }
    // Don't dispatch setPhoto here since it will be handled in upload function
    await upload(_images);
    setUploading(false);
    onCancel();
  };

  const onBarcodeScanned = (barcodeInfos) => {
    if (canScan.current) return;
    if (cameraMode !== "scan") return;
    playSound();
    if (typeof onScan === "function") {
      onScan({
        text: barcodeInfos?.data,
        type: barcodeInfos?.type,
        target: barcodeInfos?.target,
      });
    }
    canScan.current = true;
    setTimeout(() => {
      canScan.current = false;
    }, 4000);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    setShow(open);
  }, [open]);

  useEffect(() => {
    if (visible) startTimer();
  }, [visible]);

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsTimeout(true);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!show) {
      // Do not clear selected photos here; PaneEditor needs them after navigation
      setPickType("");
    }
  }, [show]);

  useEffect(() => {
    return () => {
      // Keep selected photos in Redux so the caller (PaneEditor) can render them
      dispatch(setSavePhoto(true));
    };
  }, []);

  useEffect(() => {
    // if (from == "global") setParams(picParams);
    // else setParams(extraInfo);
    if (route?.params) setParams(route.params);
  }, [route.params]);

  useEffect(() => {
    if (isTimeout && pickType == "") onCancel();
  }, [pickType, isTimeout]);

  const VideoPreview = ({ item }) => {
    const replayVideo = async () => {
      try {
        if (!videoRef.current) return;
        await videoRef.current.setPositionAsync(0);
        await videoRef.current.playAsync();
      } catch (e) {
        console.log("replayVideo error", e?.message || e);
      }
    };

    const acceptVideo = async () => {
      try {
        setUploading(true);
        const videoItem = { uri: item.uri, type: "video" };
        await upload(videoItem);
        setVideo(undefined);
      } catch (e) {
        console.log("acceptVideo error", e?.message || e);
      } finally {
        setUploading(false);
      }
    };

    const deleteVideo = () => {
      Alert.alert(
        "Discard video",
        "Are you sure you want to delete this video?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                if (item?.uri) {
                  await FileSystem.deleteAsync(item.uri, { idempotent: true });
                }
              } catch (e) {
                console.log("deleteVideo error", e?.message || e);
              } finally {
                setVideo(undefined);
              }
            },
          },
        ],
      );
    };

    return (
      <SafeAreaView style={styles.videoContainer}>
        <View style={styles.videoTopBar}>
          <TouchableOpacity onPress={deleteVideo} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.videoTitle}>Preview</Text>
          <TouchableOpacity
            onPress={() => setVideo(undefined)}
            style={styles.iconBtn}
          >
            <Ionicons name="close-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.videoPreviewWrapper}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: item.uri }}
            resizeMode="contain"
            isLooping
            shouldPlay
          />
        </View>

        <View style={styles.videoBottomBar}>
          <TouchableOpacity
            onPress={replayVideo}
            disabled={uploading}
            style={[styles.videoActionBtn, styles.videoActionSecondary]}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.videoActionText}>Replay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={acceptVideo}
            disabled={uploading}
            style={[styles.videoActionBtn, styles.videoActionPrimary]}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size={18} />
            ) : (
              <Ionicons name="checkmark-outline" size={22} color="#fff" />
            )}
            <Text style={styles.videoActionText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteVideo}
            disabled={uploading}
            style={[styles.videoActionBtn, styles.videoActionDanger]}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.videoActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  console.log(video, "video");

  if (video) return <VideoPreview item={video} />;
  return (
    <View
      style={[
        styles.container,
        {
          flex: 1,
        },
      ]}
    >
      {permission?.granted !== true ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {permission?.granted === false ? (
            <Text>You didn't grant your app the permission to take photo</Text>
          ) : (
            <Text>Requesting permission to take photo...</Text>
          )}
        </View>
      ) : null}
      {permission?.granted === true && (
        <View style={{ flex: 1 }}>
          {/* Mode selector - only show if pickType is empty */}
          {pickType === "" && (
            <View style={styles.modeSelectorContainer}>
              <TouchableOpacity
                onPress={() => setPickType("camera")}
                style={[styles.modeButton, { backgroundColor: "#6B7280" }]}
              >
                <Ionicons name="camera" size={32} color="#fff" />
                <Text style={styles.modeButtonText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setCameraMode("video");
                  setPickType("video");
                }}
                style={[styles.modeButton, { backgroundColor: "#EF4444" }]}
              >
                <Ionicons name="videocam" size={32} color="#fff" />
                <Text style={styles.modeButtonText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImageAsync}
                style={[styles.modeButton, { backgroundColor: "#3B82F6" }]}
              >
                <Ionicons name="images" size={32} color="#fff" />
                <Text style={styles.modeButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Camera view */}
          {(pickType === "camera" || pickType === "video") && (
            <CameraView
              barCodeScannerSettings={{
                barCodeTypes: [
                  "qr",
                  "pdf417",
                  "datamatrix",
                  "code128",
                  "code39",
                  "code93",
                  "codabar",
                  "ean13",
                  "ean8",
                  "upc_e",
                  "upc_a",
                  "interleaved2of5",
                  "itf14",
                  "aztec",
                ],
              }}
              onBarcodeScanned={onBarcodeScanned}
              facing={type}
              style={{ flex: 1, width: "100%" }}
              mode={cameraMode}
              ref={photoRef}
            >
              {/* Top action bar */}
              <View style={styles.topActionBar}>
                {mode === "scan" && (
                  <View style={styles.scanOverlay}>
                    <Image
                      style={{ width: 300, height: 300 }}
                      source={require("./assets/images/Square.png")}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {mode !== "scan" && images.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setImages([]);
                      onCancel();
                    }}
                    style={styles.topActionButton}
                  >
                    <Ionicons name="close" color="#fff" size={28} />
                  </TouchableOpacity>
                )}

                {mode !== "scan" && images.length === 0 && (
                  <TouchableOpacity
                    onPress={toggleCameraType}
                    style={[
                      styles.topActionButton,
                      { backgroundColor: "rgba(255,255,255,0.3)" },
                    ]}
                  >
                    <Ionicons name="camera-reverse" color="#fff" size={28} />
                  </TouchableOpacity>
                )}

                {images.length > 0 && !uploading && (
                  <TouchableOpacity
                    onPress={() => validate()}
                    style={[
                      styles.topActionButton,
                      { backgroundColor: "rgba(0,200,0,0.9)" },
                    ]}
                  >
                    <Ionicons name="checkmark" color="#fff" size={32} />
                  </TouchableOpacity>
                )}

                {uploading && <ActivityIndicator color="orange" size="large" />}
              </View>

              {/* Bottom capture area */}
              {cameraMode !== "scan" && (
                <View style={styles.bottomCaptureArea}>
                  {/* Thumbnail strip — always visible when photos exist */}
                  {images.length > 0 && (
                    <View style={styles.previewContainer}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.previewScrollContent}
                      >
                        {images.map((img, idx) => (
                          <View key={idx} style={styles.previewImageWrapper}>
                            <Image
                              source={{ uri: img.uri }}
                              style={styles.previewImage}
                              resizeMode="cover"
                            />
                            <TouchableOpacity
                              onPress={() => removeImage(idx)}
                              style={styles.previewRemoveButton}
                            >
                              <Ionicons
                                name="close-circle"
                                color="#EF4444"
                                size={24}
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Capture button — always visible */}
                  <View style={styles.captureButtonContainer}>
                    <TouchableOpacity
                      onPress={
                        pickType === "camera"
                          ? takePhoto
                          : isRecording
                            ? stopRecording
                            : takeVideo
                      }
                      style={[
                        styles.captureButton,
                        pickType === "video" &&
                          isRecording &&
                          styles.captureButtonRecording,
                      ]}
                    >
                      <Ionicons
                        name={
                          pickType === "camera"
                            ? "camera"
                            : isRecording
                              ? "stop"
                              : "videocam"
                        }
                        color={pickType === "video" ? "#fff" : "orange"}
                        size={40}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </CameraView>
          )}
        </View>
      )}
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#000",
  },
  modeSelectorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    backgroundColor: "#1F2937",
  },
  modeButton: {
    width: 90,
    height: 90,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  modeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  topActionBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: GuidLines.base,
    paddingVertical: GuidLines.base,
  },
  topActionButton: {
    backgroundColor: "rgba(255,0,0,0.8)",
    borderRadius: 30,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  scanOverlay: {
    flex: 1,
    marginTop: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomCaptureArea: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  captureButtonContainer: {
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#fff",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "orange",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonRecording: {
    backgroundColor: "#EF4444",
    borderColor: "#fff",
  },
  previewContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  previewScrollContent: {
    gap: 10,
  },
  previewImageWrapper: {
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  previewRemoveButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  actionBtn: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
  buttonContainer: {
    backgroundColor: "#fff",
    alignSelf: "flex-end",
  },
  video: {
    flex: 1,
    alignSelf: "stretch",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoTopBar: {
    height: 56,
    paddingHorizontal: GuidLines.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreviewWrapper: {
    flex: 1,
    paddingHorizontal: GuidLines.base,
    paddingBottom: GuidLines.base,
  },
  videoBottomBar: {
    paddingHorizontal: GuidLines.base,
    paddingBottom: GuidLines.base,
    paddingTop: GuidLines.small,
    flexDirection: "row",
    gap: 10,
  },
  videoActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  videoActionPrimary: {
    backgroundColor: "#22c55e",
  },
  videoActionSecondary: {
    backgroundColor: "#334155",
  },
  videoActionDanger: {
    backgroundColor: "#ef4444",
  },
  videoActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
