import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  FlatList,
} from "react-native";
import { Card, Text, Chip, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

const StatusHeroCard = ({
  priority,
  status,
  description,
  daysOpen,
  images = [],
  baseUrl = "",
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const getPriorityColor = () => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#F59E0B";
      case "medium":
        return "#3B82F6";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const defaultImage =
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800";

  const imageList =
    images?.length > 0
      ? images.map((img) => ({
          uri: `${baseUrl}/${img.src}`,
        }))
      : [{ uri: defaultImage }];

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCarouselItem = ({ item, index }) => (
    <ImageBackground
      source={{ uri: item.uri }}
      style={styles.imageBackground}
      imageStyle={styles.image}
    >
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Chip
              style={[
                styles.priorityChip,
                { backgroundColor: getPriorityColor() },
              ]}
              textStyle={styles.priorityText}
              // compact
            >
              Priority: {priority}
            </Chip>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{status}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            </View>
            <View style={styles.daysOpenBadge}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.daysOpenText}>{daysOpen} Days Open</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );

  return (
    <Card style={styles.card}>
      <FlatList
        ref={flatListRef}
        data={imageList}
        renderItem={renderCarouselItem}
        keyExtractor={(item, index) => `carousel-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        bounces={false}
      />
      {imageList.length > 1 && (
        <View style={styles.pagination}>
          {imageList.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageBackground: {
    width: CARD_WIDTH,
    height: 200,
  },
  image: {
    borderRadius: 16,
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },

  priorityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statusInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  daysOpenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  daysOpenText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  pagination: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default StatusHeroCard;
