import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const LoadingComponent = ({
  message = "Loading...",
  size = "large",
  color = "#007AFF",
  fullScreen = true,
}) => {
  return (
    <View style={fullScreen ? styles.fullScreenContainer : styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={[styles.message, { color }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoadingComponent;
