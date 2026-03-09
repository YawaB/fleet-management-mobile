import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { colors } from "../../../../theme/colors";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  Divider,
  IconButton,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import { Audio, Video } from "expo-av";
import CameraScreen from "../../../../component/Shared/CameraScreen/CameraScreen";
import {
  createOrUpdatePanne,
  createOrUpdatePanneType,
  fetchPannes,
  fetchPanneTypes,
  fetchVehicles,
  getPanneTypes,
  getVehicles,
} from "../../slice/panne.slice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  getPhoto,
  setPhoto,
} from "../../../../component/Shared/CameraScreen/slice/photo.slice";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../../../../core/utils/file";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import { getCurrentUser } from "../../../Authentication/slice/auth.slice";
import { useTranslation } from "react-i18next";
import DisplayImage from "./DisplayImage";

const normalizeImmobilizingValue = (value) => {
  if (value === 1 || value === "1" || value === "oui") return 1;
  return 0;
};

const isSamePaneForm = (a, b) => {
  if (!a || !b) return false;

  const sameValue = (x, y) => {
    const isObjX = x !== null && typeof x === "object";
    const isObjY = y !== null && typeof y === "object";
    if (isObjX || isObjY) {
      try {
        return JSON.stringify(x ?? null) === JSON.stringify(y ?? null);
      } catch (e) {
        return false;
      }
    }
    return x === y;
  };

  return (
    a.name === b.name &&
    a.immatriculation === b.immatriculation &&
    a.category === b.category &&
    a.isImmobilizing === b.isImmobilizing &&
    a.description === b.description &&
    sameValue(a.photo, b.photo) &&
    sameValue(a.audio, b.audio) &&
    sameValue(a.imageId, b.imageId) &&
    sameValue(a.audioId, b.audioId)
  );
};

function PaneEditor({ navigation }) {
  const photo = useSelector(getPhoto);

  const route = useRoute();

  const [recording, setRecording] = useState();
  const [sound, setSound] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [categoryFocus, setCategoryFocus] = useState(false);
  const [symptomFocus, setSymptomFocus] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const dispatch = useDispatch();

  const vehicles = useSelector(getVehicles);
  const panneTypes = useSelector(getPanneTypes);
  console.log("panneTypes", panneTypes);
  const currentUser = useSelector(getCurrentUser);

  const newLoad = useRef(false);

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: `#PDC${moment().format("DDMMYYHHmm")}`,
    immatriculation: currentUser?.vehiculeId,
    category: "",
    symptom: "",
    isImmobilizing: 0,
    description: "",
    photo: null,
    audio: null,
    audioId: null,
    imageId: null,
  });

  const symptoms = {
    280: ["Ne démarre pas", "Bruit anormal", "Perte de puissance"], // mécanique
    281: ["Batterie faible", "Éclairage défectueux"], // electrique
    300: ["Chocs visibles", "Portière bloquée", "Rayures profondes"], // carrosserie
    303: ["Pression basse", "Bruit de roulement", "Usure irrégulière"], // pneumatique
    304: ["Autre problème détecté", "Symptôme non identifié"], // autre
  };

  const handleAudioRecord = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        // Upload the audio file
        const uploadResult = await uploadFile(uri, {
          srcID: 0,
          desc: "audio",
          src: "pannes",
          extension: "m4a",
          model: "audio",
        });

        if (uploadResult.success) {
          setFormData((prev) => ({
            ...prev,
            audio: uri,
            audioId: uploadResult.save.data.result[0]?.id,
          }));
        }

        setRecording(undefined);
      } else {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const handleSave = () => {
    let args = {
      name: formData?.name,
      id: route.params?.pane?.id || 0,
      VehiculeId: formData.immatriculation,
      CategoryTypeId: formData.category,
      Symptome: formData.symptom,
      Description: formData.description,
      panneImmobilisante: formData.isImmobilizing,
      audioId: +formData.audioId,
      imageId: formData.imageId,
      declarantId: currentUser?.instID,
    };
    dispatch(createOrUpdatePanne(args)).then(({ payload }) => {
      if (payload) {
        if (
          formData.customCategoryName &&
          formData.customCategoryName.length > 2
        ) {
          let args = {
            id: 0,
            typeID: 41,
            label: formData.customCategoryName,
            name: formData.customCategoryName,
            icon: "",
            color: "",
            backgroundColor: "",
          };
          dispatch(createOrUpdatePanneType(args));
        }

        setFormData({
          immatriculation: currentUser?.vehiculeId,
          category: "",
          symptom: "",
          isImmobilizing: 0,
          description: "",
          photo: null,
          audio: null,
        });
        dispatch(fetchPannes());
        navigation.goBack();
      }
    });
    // TODO: Implement save functionality
  };

  const handlePhotoUpload = async (type) => {
    if (type === "camera") {
      navigation.navigate("CameraScreen", {
        src: "pannes",
        srcID: 0,
        desc: "image",
      });
    }
  };

  const initialFormData = useMemo(
    () => ({
      name: `#PDC${moment().format("DDMMYYHHmm")}`,
      immatriculation: currentUser?.vehiculeId,
      category: "",
      symptom: "",
      isImmobilizing: 0,
      description: "",
      photo: null,
      audio: null,
      imageId: null,
      audioId: null,
    }),
    [currentUser?.vehiculeId],
  );

  const playOrStopAudio = async () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      const audioUrl = formData.audio.startsWith("file:///")
        ? formData.audio
        : process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE + formData.audio;
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      );
      setSound(sound);
      setIsPlaying(true);
    }
  };

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     if (route.params?.pane?.new && !newLoad.current) {
  //       dispatch(setPhoto([]));
  //       setFormData(initialFormData);
  //       newLoad.current = true;
  //     }
  //   });

  //   return unsubscribe;
  // }, [navigation, route.params]);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchPanneTypes());
  }, []);

  useEffect(() => {
    const pane = route.params?.pane;
    if (!pane) {
      setFormData((prev) =>
        isSamePaneForm(prev, initialFormData) ? prev : initialFormData,
      );
      return;
    }

    const params = {
      name: pane?.name,
      immatriculation: pane?.VehiculeId,
      category: pane?.CategoryTypeId,
      symptom: pane?.Symptome,
      isImmobilizing: normalizeImmobilizingValue(pane?.panneImmobilisante),
      description: pane?.Description,
      photo: pane?.images,
      audio: pane?.audio,
      imageId: pane?.imageId,
      audioId: pane?.audioId,
    };

    setFormData((prev) => (isSamePaneForm(prev, params) ? prev : params));
  }, [route.params?.pane, initialFormData]);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (route.params?.pane) {
  //       console.log("route.params?.pane", route.params?.pane);
  //       let params = {
  //         name: route.params?.pane?.name,
  //         immatriculation: route.params?.pane?.VehiculeId,
  //         category: route.params?.pane?.CategoryTypeId,
  //         symptom: route.params?.pane?.Symptome,
  //         isImmobilizing: route.params?.pane?.panneImmobilisante,
  //         description: route.params?.pane?.Description,

  //         photo: route.params?.pane?.image,
  //         audio: route.params?.pane?.audio,
  //         imageId: route.params?.pane?.imageId,
  //         audioId: route.params?.pane?.audioId
  //       }
  //       setFormData(params);
  //     }else{
  //       setFormData(initialFormData);
  //     }
  //   }, [route.params?.pane])
  // );

  useEffect(() => {
    if (photo && photo.length > 0) {
      // Build a preview photo value and aggregate uploaded image IDs
      const firstPath =
        photo[0]?.path?.uri || photo[0]?.path || photo[0]?.uri || null;
      const next = {
        ...formData,
        photo: firstPath,
        imageId: photo[0]?.imageId,
      };
      setFormData(next);
    }
  }, [photo]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      dispatch(setPhoto([]));
      setFormData(initialFormData);
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View className="flex flex-col gap-1">
          <View className="flex flex-col ">
            <Text className="text-gray-500 font-bold pb-1">{t("name")}</Text>
            <TextInput
              mode="outlined"
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              right={
                <TextInput.Icon
                  icon="close-circle-outline"
                  onPress={() => setFormData({ ...formData, name: "" })}
                />
              }
            />
          </View>
          <View className="flex flex-col ">
            <Text className="text-gray-500 font-bold pb-1">
              {t("immatriculation")}
            </Text>
            <Dropdown
              style={[
                styles.dropdown,
                categoryFocus && { borderColor: colors.primary },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={vehicles}
              maxHeight={300}
              labelField="licensePlate"
              valueField="id"
              search
              placeholder="Immatriculation"
              value={formData.immatriculation}
              onFocus={() => setCategoryFocus(true)}
              onBlur={() => setCategoryFocus(false)}
              onChange={(item) => {
                setFormData({ ...formData, immatriculation: item.id });
                setCategoryFocus(false);
              }}
            />
          </View>
          <View className="flex flex-col">
            <Text className="text-gray-500 font-bold pb-1">
              {t("category")}
            </Text>
            <Dropdown
              style={[
                styles.dropdown,
                categoryFocus && { borderColor: colors.primary },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={panneTypes}
              maxHeight={300}
              labelField="label"
              valueField="uid"
              placeholder={!categoryFocus ? "Catégorie de la panne" : "..."}
              value={formData.category}
              onFocus={() => setCategoryFocus(true)}
              onBlur={() => setCategoryFocus(false)}
              onChange={(item) => {
                setFormData({ ...formData, category: item.uid, symptom: "" });
                setCategoryFocus(false);
              }}
              renderItem={(item) => {
                return (
                  <View className="flex flex-row items-center gap-2 p-2">
                    <FontAwesome
                      name={item?.iconreact || "cog"}
                      size={24}
                      color={item.backgroundColor}
                    />
                    <Text>{item?.label || "test"}</Text>
                  </View>
                );
              }}
            />
            {formData.category == 304 && (
              <View style={{ marginTop: 2 }}>
                <Text className="text-gray-500 font-bold pb-1">
                  {t("new_symptom")}
                </Text>
                <TextInput
                  mode="outlined"
                  style={styles.input}
                  placeholder={
                    t("custom_category_name") || "Nom de la catégorie"
                  }
                  value={formData.customCategoryName || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, customCategoryName: text })
                  }
                />
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  {t("custom_category_hint") ||
                    "Précisez le type de panne si elle n'est pas dans la liste."}
                </Text>
              </View>
            )}
          </View>
          {/* Advanced fields moved below under Show More */}
          <Text className="text-gray-500 font-bold pb-1">{t("photo")}</Text>
          <Divider />
          <DisplayImage
            setFormData={setFormData}
            photo={photo}
            formData={formData}
            route={route}
          />
          <View className=" flex justify-between flex-row">
            <Button
              mode="outlined"
              onPress={() => handlePhotoUpload("camera")}
              icon="camera"
              style={styles.photoButton}
            >
              {t("camera")}
            </Button>
            {formData.photo || (Array.isArray(photo) && photo?.length > 0) ? (
              <IconButton
                icon="close-circle"
                size={24}
                onPress={() => {
                  dispatch(setPhoto([]));
                  setFormData((prev) => ({
                    ...prev,
                    photo: null,
                    imageId: null,
                  }));
                }}
              />
            ) : null}
          </View>
        </View>
        <View className="flex  justify-start items-start flex-col">
          <Text className="text-gray-500 font-bold pb-1">{t("audio")}</Text>
          <View
            className="border border-gray-300 rounded-md w-full mt-2"
            style={styles.audioContainer}
          >
            {formData.audio ? (
              <View style={styles.audioPreview}>
                <Button
                  mode="text"
                  onPress={playOrStopAudio}
                  icon={isPlaying ? "pause" : "play"}
                >
                  {isPlaying ? "Pause" : "Écouter"}
                </Button>
                <IconButton
                  icon="delete"
                  size={24}
                  onPress={() => {
                    if (sound) {
                      sound.unloadAsync();
                    }
                    setFormData((prev) => ({ ...prev, audio: null }));
                    setSound(null);
                    setIsPlaying(false);
                  }}
                />
              </View>
            ) : (
              <Button
                mode="text"
                onPress={handleAudioRecord}
                icon={isRecording ? "stop" : "microphone"}
              >
                {isRecording ? "Arrêter" : "Enregistrer"}
              </Button>
            )}
          </View>
        </View>
        {/* Show More toggle and advanced fields */}
        <View>
          <Button
            mode="text"
            onPress={() => setShowMore((v) => !v)}
            icon={showMore ? "chevron-up" : "chevron-down"}
            style={styles.photoButton}
          >
            {showMore ? "Show Less" : "Show More"}
          </Button>
          {showMore && (
            <View>
              {/* <View className="flex flex-col">
                <Text className="text-gray-500 font-bold pb-1">
                  {t("symptom")}
                </Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    symptomFocus && { borderColor: colors.primary },
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={
                    formData.category
                      ? symptoms[formData.category]?.map((symptom) => ({
                          label: symptom,
                          value: symptom,
                        }))
                      : []
                  }
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!symptomFocus ? "Symptômes de la panne" : "..."}
                  value={formData.symptom}
                  onFocus={() => setSymptomFocus(true)}
                  onBlur={() => setSymptomFocus(false)}
                  onChange={(item) => {
                    setFormData({ ...formData, symptom: item.value });
                    setSymptomFocus(false);
                  }}
                  disable={!formData.category}
                />
              </View> */}
              <View className="flex flex-col">
                <Text className="text-gray-500 font-bold pb-1">
                  {t("immobilizing")}
                </Text>
                <SegmentedButtons
                  value={`${formData.isImmobilizing}`}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isImmobilizing: normalizeImmobilizingValue(value),
                    })
                  }
                  buttons={[
                    { value: "1", label: "Oui" },
                    { value: "0", label: "Non" },
                  ]}
                  style={styles.segmentedButton}
                />
              </View>
              <View className="flex flex-col">
                <Text className="text-gray-500 font-bold pb-1">
                  {t("description")}
                </Text>
                <TextInput
                  mode="outlined"
                  label={t("description")}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
              </View>
            </View>
          )}
        </View>
        <Divider />
        <View className="flex my-4">
          <Button
            mode="contained"
            onPress={handleSave}
            icon="content-save-all"
            style={styles.photoButton}
          >
            Save
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  audioPreview: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "start",
    gap: 8,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: "white",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  content: {
    marginTop: 16,
    padding: 16,
  },
  input: {
    backgroundColor: "white",
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  photoButton: {
    marginTop: 8,
    marginBottom: 24,
    width: "100%",
    borderRadius: 8,
  },
});

export default PaneEditor;
