import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

const ChatCard = ({ item, handleChatPress, resolveImageUrl }) => {
  console.log(item, "item ChatCard");
  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: resolveImageUrl(item.image),
          }}
          style={styles.avatar}
        />
        {item?.Read === 0 && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.label}
          </Text>
          <Text style={styles.timestamp}>{item.datecom}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.message}
          </Text>
          {item?.Read === 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item?.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default ChatCard;
