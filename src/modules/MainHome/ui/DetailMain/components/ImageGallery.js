import React from "react";
import { View, StyleSheet, FlatList, Image, Dimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 48) / 3;

const ImageGallery = ({ images, baseUrl }) => {
  const theme = useTheme();

  if (!images || images.length === 0) {
    return null;
  }

  const renderImage = ({ item, index }) => {
    const imageUri = baseUrl ? `${baseUrl}/${item.src}` : item.src;
    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Images ({images.length})</Text>
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item, index) => `image-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    gap: 8,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
});

export default ImageGallery;
