import React, { useCallback, useEffect, useMemo, useState } from "react";
import { colors } from '../../../../theme/colors';
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
  fetchPanneTypes,
  fetchVehicles,
  getPanneTypes,
  getVehicles,
} from "../../slice/panne.slice";
import { getPhoto, setPhoto } from "../../../../component/Shared/CameraScreen/slice/photo.slice";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../../../../core/utils/file";
import { useFocusEffect, useRoute } from "@react-navigation/native";

function PaneEditor({ navigation }) {
  const [formData, setFormData] = useState({
    immatriculation: "",
    category: "",
    symptom: "",
    isImmobilizing: "non",
    description: "",
    photo: null,
    audio: null,
    audioId: null,
    imageId: null
  });

  
  const photo = useSelector(getPhoto);

  const route = useRoute();
  
 
  const [recording, setRecording] = useState();
  const [sound, setSound] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [categoryFocus, setCategoryFocus] = useState(false);
  const [symptomFocus, setSymptomFocus] = useState(false);

  const dispatch = useDispatch();

  const vehicles = useSelector(getVehicles);
  const panneTypes = useSelector(getPanneTypes);

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
        console.log("handleAudioRecord uri", uri);
        // Upload the audio file
        const uploadResult = await uploadFile(uri, {
          srcID: 0,
          desc: 'audio',
          src: 'pannes',
          extension: 'm4a',
          model: 'audio'
        });


        if (uploadResult.success) {
          setFormData((prev) => ({ 
            ...prev, 
            audio: uri,
            audioId: uploadResult.save.data.result[0]?.id
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
          Audio.RecordingOptionsPresets.HIGH_QUALITY
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
      name: formData.name,
      id: route.params?.pane?.id || 0,
      VehiculeId: formData.immatriculation,
      CategoryTypeId: formData.category,
      Symptome: formData.symptom,
      Description: formData.description,
      panneImmobilisante: formData.isImmobilizing,
      audioId: formData.audioId,
      imageId: JSON.parse(formData.imageId)
    };
    console.log("args handleSave", args);
    dispatch(createOrUpdatePanne(args)).then(({ payload }) => {
      if (payload) {
        setFormData({
          immatriculation: "",
          category: "",
          symptom: "",
          isImmobilizing: "non",
          description: "",
          photo: null,
          audio: null,
        });
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

  const initialFormData = {
    immatriculation: "",
    category: "",
    symptom: "",
    isImmobilizing: "non",
    description: "",
    photo: null,
    audio: null,
    imageId: null,
    audioId: null
  };

  const playOrStopAudio = async () => {
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE + formData.audio },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 }
      );
      setSound(sound);
      setIsPlaying(true);
    }
  };
  console.log("photo out", photo);
  const displayImage = () => {
    const baseUrl = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE || "";

    const isImagePath = (p) =>
      typeof p === "string" && /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(p);
    const isVideoPath = (p) =>
      typeof p === "string" && /\.(mp4|mov|m4v|avi|mkv|webm)$/i.test(p);

    const parseMaybeJsonArray = (s) => {
      try {
        if (typeof s === "string" && s.trim().startsWith("[")) {
          const arr = JSON.parse(s);
          console.log("arr", arr);
          return Array.isArray(arr) ? arr : [];
        }
      } catch (e) {
        // ignore parsing errors
      }
      return [];
    };

    // Normalize any incoming items into a list of image URI strings
    const normalize = (items) => {
      console.log("items normalize",  items);
      if (!items) return [];
      const arr = Array.isArray(items) ? items : [items];
      console.log("arr normalize", arr);
      const out = [];
      for (const it of arr) {
        if (!it) continue;
        console.log("it", typeof it);
        // 1) Expo ImageManipulator/File picker style
        if (typeof it === "object") {
          if (it.uri && isImagePath(it.uri)) {
            out.push(it.uri);
            continue;
          }
          if (it.path && isImagePath(it.path)) {
            out.push(it.path);
            continue;
          }
          if (it.src) {
            // it.src can be a single path or a stringified JSON array
            const parsed = parseMaybeJsonArray(it.src);
            if (parsed.length) {
              parsed.forEach((p) => {
                if (isImagePath(p)) out.push(baseUrl + p);
              });
              continue;
            }
            if (typeof it.src === "string" && isImagePath(it.src)) {
              out.push(baseUrl + it.src);
              continue;
            }
          }
          continue;
        }

        // 2) Raw string
        if (typeof it === "string") {
          const parsed = parseMaybeJsonArray(it);
          if (parsed.length) {
            parsed.forEach((p) => {

              if (isImagePath(p.src)) out.push(baseUrl + p.src);
            });
          } else if (isImagePath(it)) {
            // If it's a relative path, prefix with baseUrl
            const uri = it.startsWith("http") || it.startsWith("file://") ? it : baseUrl + it;
            out.push(uri);
          }
        }
      }
      // Deduplicate
      return Array.from(new Set(out));
    };

    // Normalize any incoming items into a list of video URI strings
    const normalizeVideos = (items) => {
      if (!items) return [];
      const arr = Array.isArray(items) ? items : [items];
      const out = [];
      for (const it of arr) {
        if (!it) continue;
        if (typeof it === 'object') {
          if (it.uri && isVideoPath(it.uri)) { out.push(it.uri); continue; }
          if (it.path && isVideoPath(it.path)) { out.push(it.path); continue; }
          if (it.src) {
            const parsed = parseMaybeJsonArray(it.src);
            if (parsed.length) {
              parsed.forEach((p) => { if (isVideoPath(p)) out.push(baseUrl + p); });
              continue;
            }
            if (typeof it.src === 'string' && isVideoPath(it.src)) { out.push(baseUrl + it.src); continue; }
          }
          continue;
        }
        if (typeof it === 'string') {
          const parsed = parseMaybeJsonArray(it);
          if (parsed.length) {
            parsed.forEach((p) => { if (isVideoPath(p?.src || p)) out.push(baseUrl + (p?.src || p)); });
          } else if (isVideoPath(it)) {
            const uri = it.startsWith('http') || it.startsWith('file://') ? it : baseUrl + it;
            out.push(uri);
          }
        }
      }
      return Array.from(new Set(out));
    };

    // If user has selected assets in CameraScreen (Redux photo), show them with remove buttons
    if (Array.isArray(photo) && photo.length > 0) {
      console.log("photo func",typeof photo);
      const resolvePreview = (item) => {
        // Prefer explicit image URIs
        if (item?.uri && isImagePath(item.uri)) return item.uri;
        // If path is an object from manipulateAsync
        if (item?.path && typeof item.path === 'object' && item.path?.uri && isImagePath(item.path.uri)) return item.path.uri;
        if (item?.path && typeof item.path === 'string') {
          const p = item.path.startsWith('http') || item.path.startsWith('file://') ? item.path : baseUrl + item.path;
          if (isImagePath(p)) return p;
        }
        if (item?.src && typeof item.src === 'string') {
          const parsed = parseMaybeJsonArray(item.src);
          if (parsed.length && typeof parsed[0] === 'string' && isImagePath(parsed[0])) return baseUrl + parsed[0];
          if (isImagePath(item.src)) return baseUrl + item.src;
        }
        return null;
      };

      const removeAt = (idx) => {
        const next = photo.filter((_, i) => i !== idx);
        // update imageId array with uploaded ones
        const ids = next.filter((x) => x?.uploaded && x?.imageId).map((x) => x.imageId);
        dispatch(setPhoto(next));
        setFormData((prev) => ({ ...prev, photo: next, imageId: ids.length ? JSON.stringify(ids) : null }));
      };

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {photo.map((item, idx) => {
            const isVideo = item?.type === 'video' || (typeof item?.mimeType === 'string' && item.mimeType.startsWith('video'));
            const uri = resolvePreview(item);
            return (
              <View key={idx} style={{ width: 100, height: 100, marginRight: 8, position: 'relative' }}>
                {isVideo ? (
                  <Video
                    source={{ uri: item?.uri || item?.path || (typeof item?.path === 'object' ? item?.path?.uri : null) }}
                    style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#000' }}
                    resizeMode="cover"
                    useNativeControls
                    isMuted
                  />
                ) : (
                  uri ? (
                    <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#e5e7eb' }} />
                  )
                )}
                <IconButton
                  icon="close-circle"
                  size={18}
                  style={{ position: 'absolute', top: -8, right: -8 }}
                  onPress={() => removeAt(idx)}
                />
              </View>
            );
          })}
        </ScrollView>
      );
    }

    // Otherwise, fallback to normalized sources (e.g., when editing an existing pane)
    let imageSources = [];
    // let videoSources = [];
    if (formData?.photo) {
      console.log("formData.photo", formData.photo);
      imageSources = normalize(formData.photo);
      // videoSources = normalizeVideos(formData.photo);
    } else if (route?.params?.pane?.images) {
      imageSources = normalize(route.params.pane.images);
      // videoSources = normalizeVideos(route.params.pane.images);
    }

    if (!imageSources.length) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
        {imageSources.map((uri, idx) => (
          <Image
            key={`img-${idx}`}
            source={{ uri }}
            style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8 }}
            resizeMode="cover"
          />
        ))}
        {/* {videoSources.map((uri, idx) => (
          <Video
            key={`vid-${idx}`}
            source={{ uri }}
            style={{ width: 100, height: 100, borderRadius: 8, backgroundColor: '#000', marginRight: 8 }}
            resizeMode="cover"
            useNativeControls
            isMuted
          />
        ))} */}
      </ScrollView>
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset form data when screen is focused, except when returning with a photo
      if (!photo) {
        dispatch(setPhoto([]));
        setFormData(initialFormData);
      }
    });

    return unsubscribe;
  }, [navigation, photo]);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchPanneTypes());
  }, []);

  console.log("route.params?.pane use", route.params?.pane);



  useEffect(() => {
    const pane = route.params?.pane;
    if (!pane) {
      setFormData(initialFormData);
      return;
    }

    const params = {
      name: pane.name,
      immatriculation: pane.VehiculeId,
      category: pane.CategoryTypeId,
      symptom: pane.Symptome,
      isImmobilizing: pane.panneImmobilisante,
      description: pane.Description,
      photo: pane.images,
      audio: pane.audio,
      imageId: pane.imageId,
      audioId: pane.audioId,
    };

    setFormData(params);
  }, [route.params]);
  console.log("formData", formData);

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
      const firstPath = photo[0]?.path?.uri || photo[0]?.path || photo[0]?.uri || null;
      const ids = photo
        .filter((x) => x?.uploaded && x?.imageId)
        .map((x) => x.imageId);
      const next = {
        ...formData,
        photo: firstPath,
        imageId: ids.length ? JSON.stringify(ids) : null,
      };
      console.log("prev use", next);
      setFormData(next);
    }
  }, [photo]);

  console.log("formData", formData);
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View className="flex flex-col gap-1"><View className="flex flex-col ">
            <Text className="text-gray-500 font-bold pb-1">
            Name            
            </Text>
            <TextInput
              mode="outlined"
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>
          <View className="flex flex-col ">
            <Text className="text-gray-500 font-bold pb-1">
              N° Immatriculation
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
            <Text className="text-gray-500 font-bold pb-1">Catégorie</Text>
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
                console.log("item Dropdown", item);
                setFormData({ ...formData, category: item.uid, symptom: "" });
                setCategoryFocus(false);
              }}
            />
          </View>
          <View className="flex flex-col">
            <Text className="text-gray-500 font-bold pb-1">Symptômes</Text>
            <Dropdown
              style={[
                styles.dropdown,
                symptomFocus && { borderColor: colors.primary },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={
                formData.category
                  ? symptoms[formData.category].map((symptom) => ({
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
          </View>
          <View className="flex flex-col">
            <Text className="text-gray-500 font-bold pb-1">
              Panne immobilisante ?
            </Text>
            <SegmentedButtons
              value={formData.isImmobilizing}
              onValueChange={(value) =>
                setFormData({ ...formData, isImmobilizing: value })
              }
              buttons={[
                { value: "oui", label: "Oui" },
                { value: "non", label: "Non" },
              ]}
              style={styles.segmentedButton}
            />
          </View>
          <View className="flex flex-col">
            <Text className="text-gray-500 font-bold pb-1">
              Descriptif de la panne
            </Text>
            <TextInput
              mode="outlined"
              label="Descriptif de la panne"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </View>
          <Text className="text-gray-500 font-bold pb-1">Photo</Text>
          <Divider />
          <View >

          {displayImage()}
          </View>
          <View className=" flex justify-between flex-row">
            <Button
              mode="outlined"
              onPress={() => handlePhotoUpload("camera")}
              icon="camera"
              style={styles.photoButton}
            >
              Camera
            </Button>
            {formData.photo || (Array.isArray(photo) && photo.length > 0) ? (
              <IconButton
                icon="close-circle"
                size={24}
                onPress={() => {
                  dispatch(setPhoto([]));
                  setFormData((prev) => ({ ...prev, photo: null, imageId: null }));
                }}
              />
            ) : null}
          </View>
        </View>
        <View className="flex  justify-start items-start flex-col">
          <Text className="text-gray-500 font-bold pb-1">
            Enregistrement audio
          </Text>
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
        <View style={{ marginHorizontal: 16 }} className="flex mb-4">
          <Button
            mode="contained"
            onPress={handleSave}
            icon="content-save-all"
            style={styles.photoButton}
          >
            Enregistrer
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
