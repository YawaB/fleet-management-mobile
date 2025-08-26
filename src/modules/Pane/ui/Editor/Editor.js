import React, { useEffect, useState } from "react";
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
import { Audio } from "expo-av";
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
import { useRoute } from "@react-navigation/native";

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
      imageId: formData.imageId
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

  useEffect(() => {
    if (route.params?.pane) {
      console.log("route.params?.pane", route.params?.pane);
      let params = {
        name: route.params?.pane?.name,
        immatriculation: route.params?.pane?.VehiculeId,
        category: route.params?.pane?.CategoryTypeId,
        symptom: route.params?.pane?.Symptome,
        isImmobilizing: route.params?.pane?.panneImmobilisante,
        description: route.params?.pane?.Description,
        
        photo: route.params?.pane?.image,
        audio: route.params?.pane?.audio,
        imageId: route.params?.pane?.imageId,
        audioId: route.params?.pane?.audioId
      }
      setFormData(params);
    }else{
      setFormData(initialFormData);
    }
  }, [route.params?.pane]);

  useEffect(() => {
    if (photo && photo.length > 0) {
      setFormData(prev => ({ ...prev, photo: photo[0], imageId: photo[0].imageId }));
    }
  }, [photo]);

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
          {formData.photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image
                source={{ uri: formData.photo?.uri || process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE + formData.photo }}
                style={{ width: 100, height: 100 }}
                resizeMode="cover"
              />
              <IconButton
                icon="close-circle"
                size={24}
                style={styles.removePhotoButton}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, photo: null }))
                }
              />
            </View>
          ) : (
            <View className=" flex justify-between flex-row">
              <Button
                mode="outlined"
                onPress={() => handlePhotoUpload("camera")}
                icon="camera"
                style={styles.photoButton}
              >
                Camera
              </Button>
            </View>
          )}
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
