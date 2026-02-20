import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  getMessageList,
  fetchConversationList,
  readMsg,
  setSelectedChat,
  fetchResources,
} from "../../slice/slice";
import ChatCard from "./ChatCard";

const UserList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const messageList = useSelector(getMessageList);

  const resolveImageUrl = (path) => {
    if (!path) return null;
    return process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE + path;
  };

  const filteredConversations = useMemo(() => {
    const conversations = Array.isArray(messageList) ? messageList : [];

    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();

    return conversations.filter((c) => {
      const title = String(c?.label || "").toLowerCase();
      const preview = String(c?.message || "").toLowerCase();
      return title.includes(term) || preview.includes(term);
    });
  }, [messageList, searchTerm]);

  const handleChatPress = (conv) => {
    const obj = {
      srcId: conv.srcId,
      srcObject: conv?.srcObject || "Engin",
    };
    dispatch(readMsg({ id: conv?.comid }));
    dispatch(setSelectedChat(conv));
    dispatch(fetchConversationList(obj));

    navigation.navigate("DetailChat", { contact: conv, type: "user" });
  };

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchResources({ srcObject: "User" }));
      } catch (err) {
        console.log("Error fetch tasks", err.message);
      }
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("users") || "Utilisateurs"}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9ca3af"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_driver") || "Rechercher un conducteur..."}
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={(item) => (
          <ChatCard
            resolveImageUrl={resolveImageUrl}
            handleChatPress={handleChatPress}
            item={item.item}
          />
        )}
        keyExtractor={(item) => item.srcId}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("no_users_found") || "Aucun utilisateur trouvé"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  listContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
});

export default UserList;
