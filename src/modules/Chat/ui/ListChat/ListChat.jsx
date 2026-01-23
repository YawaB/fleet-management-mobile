import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

// Fake user data
const fakeUsers = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://picsum.photos/200",
    lastMessage: "Hey, how are you?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://picsum.photos/201",
    lastMessage: "Meeting at 2 PM",
    timestamp: "9:45 AM",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://picsum.photos/202",
    lastMessage: "Please check the report",
    timestamp: "Yesterday",
  },
];

const ListChat = () => {
  const navigation = useNavigation();

  const handleChatPress = (user) => {
    navigation.navigate("DetailChat", { user });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={fakeUsers}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  chatItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
});

export default ListChat;
