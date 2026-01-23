import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDetailMessage,
  saveConversation,
  setDetailChat,
  setSelectedChat,
} from "../../slice/slice";
import { socket } from "../../../../socket/socket";
import { getCurrentUser } from "../../../Authentication/slice/auth.slice";
import moment from "moment";

function DetailChat({ route, navigation }) {
  const { contact, type } = route.params;
  const { t } = useTranslation();
  const [localMessages, setLocalMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const flatListRef = useRef(null);

  const detailMessage = useSelector(getDetailMessage);
  const currentUser = useSelector(getCurrentUser);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSelectedChat(contact));
    dispatch(setDetailChat(true));
    return () => {
      dispatch(setDetailChat(false));
    };
  }, [dispatch, contact]);

  const displayMessages = [...localMessages];

  const normalizeMessage = (msg) => {
    const text = typeof msg?.text === "string" ? msg.text : msg?.message;
    const time = typeof msg?.time === "string" ? msg.time : msg?.datecom;
    const from = msg?.from;
    const sender =
      msg?.sender ||
      (typeof from === "string" && from.trim() && from !== "-" ? from : "");

    return {
      id: msg?.id,
      text: text || "",
      time: time || "",
      type: msg?.type,
      sender,
      from,
      userId: msg?.srcId,
    };
  };

  const resolveImageUrl = (path) => {
    if (!path) return null;
    return process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE + path;
  };

  const renderMessage = ({ item }) => {
    const isMe =
      currentUser.userID && item.fromId != null
        ? item.fromId == currentUser.userID
        : false;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
          {item.datecom}
        </Text>
      </View>
    );
  };

  const handleSend = () => {
    if (inputText.trim()) {
      let currentDate = new Date();
      currentDate = moment(currentDate).format("LT");
      let obj = {
        id: Date.now().toString(),
        label: contact?.label,
        message: inputText,
        // audioUrl: !!audioUrl,
        from: currentUser.userName,

        // subject: detailMessage?.[0]?.Object || "",
        image: contact?.image || "",
        datecom: currentDate,
        srcId: contact?.srcId || "",
        srcObject: contact?.srcObject || "",
        to: contact?.label || "",
        toId: contact?.srcId || "",
        fromId: currentUser?.userID,
        type: "Chat",
      };
      console.log(obj, "obj sendMessage");

      dispatch(saveConversation(obj)).then(() => {
        setInputText("");
        setLocalMessages([...localMessages, obj]);
        flatListRef.current?.scrollToEnd();
      });
    }
  };

  console.log("localMessages", localMessages);

  const handleMediaPicker = () => {
    console.log("Open media picker");
  };

  const getContactInfo = () => {
    const title = contact?.label || contact?.name || "";
    const subtitle =
      contact?.srcObject && contact?.srcId
        ? `${contact.srcObject} • ${contact.srcId}`
        : "";
    return { title, subtitle };
  };

  const info = getContactInfo();

  useEffect(() => {
    setLocalMessages([...detailMessage]);
  }, [detailMessage]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        {type === "user" ? (
          <Image
            source={{
              uri:
                resolveImageUrl(contact?.image) || "https://picsum.photos/200",
            }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={styles.engineIcon}>
            <Ionicons name="car" size={20} color="#d97706" />
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {info.title}
          </Text>
          {info.subtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {info.subtitle}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
      >
        <View style={styles.todayBadge}>
          <Text style={styles.todayText}>{t("today") || "Aujourd'hui"}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={displayMessages}
          renderItem={renderMessage}
          keyExtractor={(item) =>
            item?.id?.toString() || `msg-${Math.random()}`
          }
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={handleMediaPicker}
            style={styles.mediaButton}
          >
            <Ionicons name="image-outline" size={24} color="#6b7280" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("type_message") || "Tapez un message..."}
            placeholderTextColor="#9ca3af"
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={22}
              color={inputText.trim() ? "#3b82f6" : "#d1d5db"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  engineIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  todayBadge: {
    alignItems: "center",
    paddingVertical: 12,
  },
  todayText: {
    fontSize: 12,
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  messageText: {
    color: "#1f2937",
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemMessage: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: "90%",
  },
  systemMessageText: {
    color: "#10b981",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  systemTimestamp: {
    color: "#9ca3af",
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    color: "#1f2937",
  },
  mediaButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default DetailChat;
