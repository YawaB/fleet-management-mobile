import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const AudioPlayer = ({ audios, baseUrl }) => {
  const theme = useTheme();
  const [playingIndex, setPlayingIndex] = useState(null);
  const soundRef = useRef(null);
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  if (!audios || audios.length === 0) {
    return null;
  }

  const stopCurrentAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const playAudio = async (index) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const audioPath =
        typeof audios[index] === "string" ? audios[index] : audios[index]?.src;
      const audioUrl = baseUrl + audioPath;
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingIndex(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setPlayingIndex(null);
    }
  };

  const handlePlayPause = async (index) => {
    if (playingIndex === index) {
      await stopCurrentAudio();
      setPlayingIndex(null);
    } else {
      await stopCurrentAudio();
      setPlayingIndex(index);
      await playAudio(index);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio ({audios.length})</Text>
      {audios.map((audio, index) => (
        <Card key={`audio-${index}`} style={styles.audioCard}>
          <View style={styles.audioContent}>
            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handlePlayPause(index)}
            >
              <MaterialCommunityIcons
                name={playingIndex === index ? "pause" : "play"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <View style={styles.audioInfo}>
              <Text style={styles.audioName}>Audio {index + 1}</Text>
              <Text style={styles.audioFormat}>MPEG Audio</Text>
            </View>
            <MaterialCommunityIcons
              name="waveform"
              size={32}
              color="#D1D5DB"
              style={styles.waveform}
            />
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  audioCard: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  audioContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  audioFormat: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  waveform: {
    marginLeft: 8,
  },
});

export default AudioPlayer;
