import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchMessagesList,
  getMessageList,
  fetchConversationList,
  readMsg,
  setSelectedChat,
  fetchResources,
} from "../../slice/slice";

const EngineList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const messageList = useSelector(getMessageList);

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

  console.log("filteredConversations", filteredConversations);

  const handleEnginePress = (conv) => {
    const obj = {
      srcId: conv.srcId,
      srcObject: conv?.srcObject || "Engin",
    };

    dispatch(readMsg({ id: conv.id }));
    dispatch(setSelectedChat(conv));
    dispatch(fetchConversationList(obj));

    navigation.navigate("DetailChat", { contact: conv, type: "engine" });
  };

  const renderEngineItem = ({ item }) => (
    <TouchableOpacity
      style={styles.engineItem}
      onPress={() => handleEnginePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="car" size={24} color="#d97706" />
      </View>
      <View style={styles.engineInfo}>
        <View style={styles.engineHeader}>
          <Text style={styles.engineName} numberOfLines={1}>
            {item.label}
          </Text>
          <Text style={styles.timestamp}>{item.datecom}</Text>
        </View>
        <View style={styles.engineFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.message}
          </Text>
          {item?.Read === 1 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>1</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchResources({ srcObject: "panne" }));
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
        <Text style={styles.headerTitle}>{t("engines") || "Engins"}</Text>
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
          placeholder={t("search_vehicle") || "Rechercher un véhicule..."}
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderEngineItem}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("no_engines_found") || "Aucun engin trouvé"}
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
  engineItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  engineInfo: {
    flex: 1,
  },
  engineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  engineName: {
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
  engineFooter: {
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
});

export default EngineList;
