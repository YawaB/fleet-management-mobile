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
import { CameraView, Camera, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { setPhoto, setSavePhoto, getSavePhoto } from "./slice/photo.slice";

import { ActivityIndicator } from "react-native-paper";
import { compressBase64, moveFileToDocument } from "../../../core/utils/file";

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

const CameraScreenX = ({
  visible = true,
  style,
  open,
  onImage,
  onHide,
  from,
  extraInfo,
  mode = "picture",
  onScan,
  enginDetail,
  height,
  navigation,
  route,
}) => {
  const [type, setType] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [images, setImages] = useState([]);
  const photoRef = useRef(null);
  const picParams = useSelector(getSavePhoto);
  const [uploading, setUploading] = useState(false);
  const [sound, setSound] = useState();
  const [cameraMode, setCameraMode] = useState(mode);
  const [scanResult, setScanResult] = useState("");
  const canScan = useRef(false);
  const [pickType, setPickType] = useState("camera");
  const [isTimeout, setIsTimeout] = useState(false);
  let [params, setParams] = useState({});

  const dispatch = useDispatch();

  const [show, setShow] = useState(true);

  function toggleCameraType() {
    setType((current) => (current === "back" ? "front" : "back"));
  }

  const pickImageAsync = async () => {
    setPickType("gallery");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      // base64: true,
    });
    if (!result.canceled) {
      let assets = await Promise.all(
        result.assets.map(async (o) => {
          let obj = { ...o, uri: o.uri };
          if (obj?.uri) {
            let uri = moveFileToDocument(obj.uri);
            if (uri) obj.uri = uri;
            let base64Cpmpresed = await compressBase64(obj.uri);
            obj.base64 = base64Cpmpresed || obj.base64;
          }
          return obj;
        }),
      );
      validate(assets);
    } else {
      console.log("error:");
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
    console.log("📱 CameraScreen: takePhoto called");
    let options = {
      // base64: true,
      quality: 1,
      exif: false,
    };
    try {
      let photo = await photoRef.current.takePictureAsync(options);
      console.log("📱 CameraScreen: Photo taken:", photo);
      photo = { ...photo };
      if (photo?.uri) {
        let uri = moveFileToDocument(photo?.uri);
        if (uri) photo.uri = uri;
        let base64Cpmpresed = await compressBase64(photo?.uri);
        photo.base64 = base64Cpmpresed || photo.base64;
      }
      console.log("📱 CameraScreen: Photo processed:", photo);
      addImage(photo);
    } catch (error) {
      console.error("📱 CameraScreen: Error taking photo:", error);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => {
      let t = [...prev];
      t.splice(index, 1);
      return t;
    });
  };
  const onCancel = () => {
    setImages([]);
    setPickType("");
    setIsTimeout(false);
    if (typeof onHide === "function") onHide();
    else if (navigation?.canGoBack?.()) navigation.goBack();
  };

  const validate = async (_images) => {
    _images = _images || [...images];
    setUploading(true);
    if (typeof onImage == "function") {
      onImage([..._images]);
    }
    onCancel();
    dispatch(setPhoto(_images));
    setUploading(false);
  };

  const onBarcodeScanned = (barcodeInfos) => {
    console.log("📱 CameraScreen: Barcode detected:", barcodeInfos);
    console.log("📱 CameraScreen: canScan.current:", canScan.current);
    console.log("📱 CameraScreen: cameraMode:", cameraMode);

    if (canScan.current) {
      console.log("📱 CameraScreen: Scan blocked by canScan.current");
      return;
    }
    if (cameraMode !== "scan") {
      console.log("📱 CameraScreen: Not in scan mode");
      return;
    }

    console.log("📱 CameraScreen: Processing scan result");
    playSound();
    if (typeof onScan === "function") {
      console.log("📱 CameraScreen: Calling onScan callback");
      onScan({
        text: barcodeInfos?.data,
        type: barcodeInfos?.type,
        target: barcodeInfos?.target,
      });
    }
    setScanResult(barcodeInfos?.data);
    canScan.current = true;
    setTimeout(() => {
      canScan.current = false;
      console.log("📱 CameraScreen: canScan reset to false after timeout");
    }, 4000);
  };

  const startTimer = () => {
    setTimeout(() => {
      setIsTimeout(true);
    }, 2000);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    setShow(open);
  }, [open]);

  // Only start timer if used as modal (not as navigation screen)
  useEffect(() => {
    if (visible && !navigation) startTimer();
  }, [visible, navigation]);

  useEffect(() => {
    if (!show) {
      dispatch(setPhoto(null));
      setPickType("");
    }
  }, [show]);

  useEffect(() => {
    return () => {
      dispatch(setPhoto(null));
      dispatch(setSavePhoto(true));
    };
  }, []);

  useEffect(() => {
    if (from == "global") setParams(picParams);
    else setParams(extraInfo);
  }, [picParams, from, extraInfo]);

  // Only auto-cancel on timeout if used as modal (not as navigation screen)
  useEffect(() => {
    if (isTimeout && pickType === "" && !navigation) onCancel();
  }, [pickType, isTimeout, navigation]);

  // Synchroniser le mode externe avec l'état interne
  useEffect(() => {
    if (mode) {
      setCameraMode(mode);
      // Définir pickType à 'camera' pour afficher la caméra
      setPickType("camera");
      // Réinitialiser le scan quand on change de mode
      if (mode === "scan") {
        canScan.current = false;
        setScanResult("");
        console.log(
          "📱 CameraScreen: Mode set to scan, canScan reset to false",
        );
      }
      console.log("📱 CameraScreen: pickType set to camera, mode:", mode);
    }
  }, [mode]);

  if (!visible) return null;
  return (
    <View
      className="flex-1"
      style={[
        styles.container,
        // style,
        {
          flex: !enginDetail ? 1 : 0,
          justifyContent: !enginDetail ? "center" : null,
        },
      ]}
    >
      {permission?.granted !== true ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          {permission?.granted === false ? (
            <Text>Your didn't grant your app the permission to take photo</Text>
          ) : (
            <Text> Requesting permission to take photo .... </Text>
          )}
        </View>
      ) : null}
      {permission?.granted === true && (
        <View style={{ flex: 1 }}>
          {/* Sélecteur supprimé - flux direct */}
          {(pickType == "camera" || pickType == "") && (
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
              style={{
                flex: 1,
                width: "100%",
                height: style?.height || "100%",
                zIndex: 120000,
              }}
              ref={photoRef}
            >
              <View
                style={{
                  position: "absolute",
                  zIndex: 50,
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  // top: 200,
                  // top: openPhoto ? 30 :  0,
                  paddingHorizontal: GuidLines.base,
                  paddingVertical: GuidLines.small,
                }}
              >
                {mode === "scan" && (
                  <View
                    style={{
                      marginTop: "20%",
                    }}
                    className="flex-1 justify-center items-center "
                  >
                    <Image
                      style={{
                        width: 300,
                        height: 300,
                      }}
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
                    style={{
                      backgroundColor: "rgba(255,0,0,0.8)",
                      borderRadius: 30,
                      width: 60,
                      height: 60,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" color="#fff" size={35} />
                  </TouchableOpacity>
                )}
                {mode !== "scan" && images.length === 0 && (
                  <TouchableOpacity
                    onPress={toggleCameraType}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.3)",
                      borderRadius: 30,
                      width: 60,
                      height: 60,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="camera-reverse" color="#fff" size={35} />
                  </TouchableOpacity>
                )}
                {images.length > 0 && !uploading && (
                  <TouchableOpacity
                    onPress={(e) => validate()}
                    style={{
                      backgroundColor: "rgba(0,200,0,0.9)",
                      borderRadius: 30,
                      width: 60,
                      height: 60,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="checkmark" color="#fff" size={40} />
                  </TouchableOpacity>
                )}
                {uploading && (
                  <ActivityIndicator color="orange" size={"large"} />
                )}
              </View>

              {cameraMode === "scan" ? null : (
                <View
                  style={{
                    position: "absolute",
                    zIndex: 2,
                    width: "100%",
                    bottom: 50,
                    paddingBottom: 20,
                    alignItems: "center",
                  }}
                >
                  {console.log(
                    "📱 CameraScreen: Rendering capture button, cameraMode:",
                    cameraMode,
                  )}
                  {images.length === 0 ? (
                    <TouchableOpacity
                      onPress={takePhoto}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: "#fff",
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          marginBottom: 10,
                          borderWidth: 5,
                          borderColor: "orange",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 8,
                        },
                      ]}
                    >
                      <Ionicons name="camera" color={"orange"} size={45} />
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        alignItems: "center",
                        width: "100%",
                        paddingHorizontal: 20,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "rgba(0,0,0,0.7)",
                          borderRadius: 15,
                          padding: 10,
                          width: "100%",
                        }}
                      >
                        <Image
                          source={{ uri: images[0].uri }}
                          style={{
                            width: "100%",
                            height: 300,
                            borderRadius: 10,
                          }}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </CameraView>
          )}
        </View>
      )}
    </View>
  );
};

export default CameraScreenX;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    // justifyContent: "center",
  },
  actionBtn: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
});
