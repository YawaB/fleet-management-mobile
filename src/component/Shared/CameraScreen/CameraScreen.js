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
import {
  getOpenPhotoView,
  setPhoto,
  setSavePhoto,
  getSavePhoto,
  _uploadBase64,
} from "./slice/photo.slice";

import { ActivityIndicator, Button } from "react-native-paper";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { compressBase64, moveFileToDocument } from "../../../core/utils/file";
import { _saveFile } from "./api";

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
  const picParams = useSelector(getSavePhoto);
  const [uploading, setUploading] = useState(false);
  const [sound, setSound] = useState();
  const [cameraMode, setCameraMode] = useState("picture");
  const [scanResult, setScanResult] = useState("");
  const canScan = useRef(false);
  const [pickType, setPickType] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);
  let [params, setParams] = useState({});

  console.log("pickType", pickType);

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
        })
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
        require("./assets/sound/beep-07a.mp3")
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
      const compressedImage = await manipulateAsync(
        image.uri,
        [{ resize: { width: image.width * 0.8, height: image.height * 0.8 } }],
        { compress: 0.5, format: SaveFormat.JPEG, base64: true }
      );
      let x = Math.floor(Math.random() * 10000000 + 1);
      let options = {
        srcID: 0,
        desc: 0,
        src: 0,
        id: 0,
      };
      console.log("image", compressedImage);
      Object.assign(options, params);
      let uploadRes = await _uploadBase64(compressedImage?.base64, {
        name: options.srcID + options.desc + options.src + "_" + x,
      });

      console.log("uploadRes", uploadRes);

      let saveRes = null;

      if (uploadRes?.data?.success) {
        let obj = {
          src: options.src,
          srcID: options.srcID,
          desc: options.desc,
          path: uploadRes.result,
          id: options.id,
        };
        saveRes = await _saveFile(obj);
        console.log("saveRes", saveRes);
      }

      if (typeof onUploadFinished == "function") {
        onUploadFinished(saveRes?.data?.[0], uploadRes);
      }
    } catch (err) {
      console.log("upload", err);
    }
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
    await upload(_images[0]);
    onCancel();
    dispatch(setPhoto(_images));
    setUploading(false);
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
    setScanResult(barcodeInfos?.data);
    canScan.current = true;
    setTimeout(() => {
      canScan.current = false;
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

  useEffect(() => {
    if (visible) startTimer();
  }, [visible]);

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

  useEffect(() => {
    if (isTimeout && pickType == "") onCancel();
  }, [pickType, isTimeout]);

  if (false) return null;
  return (
    <View
      className=""
      style={[
        styles.container,
        // style,
        // {
        //   flex: !enginDetail ? 1 : 0,
        //   justifyContent: !enginDetail ? "center" : null
        // },
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
        <View className=" w-full" style={{ flex: 1 }}>
          {pickType == "" && (
            <View className="flex-1">
              {/* <View className="items-end">
                  <Ionicons name="close-circle-outline"  />
                </View> */}
              <View className="flex-row items-center justify-around flex-1">
                <TouchableOpacity
                  onPress={(e) => {
                    setPickType("camera");
                  }}
                  style={{ width: 80, height: 80 }}
                  className="bg-gray-400 justify-center items-center"
                >
                  <Ionicons name="camera-outline" size={40} color={"#fff"} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickImageAsync}
                  style={{ width: 80, height: 80 }}
                  className="bg-blue-400 ml-5 justify-center items-center"
                >
                  <Ionicons name="image-outline" size={40} color={"#fff"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {pickType == "camera" && (
            <CameraView
              barCodeScannerSettings={{ barCodeTypes: ["qr", "barecode"] }}
              onBarCodeScanned={onBarcodeScanned}
              facing={type}
              style={{
                height: style?.height || GuidLines.windowHeight,
                width: GuidLines.windowWidth,
                zIndex: 120000,
                position: "relative",
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

                {mode !== "scan" && (
                  <View>
                    <Ionicons
                      name="close-outline"
                      color={GuidLines.colorRed}
                      size={GuidLines.large}
                      onPress={onCancel}
                    />
                  </View>
                )}
                {mode !== "scan" && (
                  <Ionicons
                    name="camera-reverse"
                    onPress={toggleCameraType}
                    color="#fff"
                    size={GuidLines.large}
                  />
                )}
                {images.length > 0 && !uploading && (
                  <Ionicons
                    name="checkmark-outline"
                    color="#fff"
                    size={30}
                    onPress={(e) => validate()}
                  />
                )}
                {uploading && (
                  <ActivityIndicator color="orange" size={"small"} />
                )}
              </View>

              {cameraMode === "scan" ? null : (
                <View
                  style={{
                    position: "absolute",
                    zIndex: 2,
                    width: "100%",
                    bottom: "10%",
                    margin: cameraMode == "scan" ? 0 : 10,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={[styles.actionBtn, { backgroundColor: "orange" }]}
                  >
                    <Ionicons name="camera-outline" color={"white"} size={30} />
                  </TouchableOpacity>
                  <ScrollView
                    style={{ width: "auto", marginTop: 10 }}
                    className="flex-row"
                    horizontal={true}
                  >
                    {images.length > 0 &&
                      images.map((img, idx) => (
                        <View key={idx} className="ml-2">
                          <Image
                            source={{ uri: img.uri }}
                            width={50}
                            height={50}
                          />
                          <Ionicons
                            onPress={(e) => removeImage(idx)}
                            style={{
                              position: "absolute",
                              zIndex: 3,
                              left: "30%",
                              top: "30%",
                            }}
                            name="close-outline"
                            color={"red"}
                            size={25}
                          />
                        </View>
                      ))}
                  </ScrollView>
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
    alignItems: "center",
    justifyContent: "center",
    width: GuidLines.windowWidth,
    height: GuidLines.windowHeight,
  },
  actionBtn: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },
});
