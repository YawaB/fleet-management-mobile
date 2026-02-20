import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import { getAccentColor, getInitials } from "./taskHelpers";

const FullTaskCard = ({ task, onDetailsPress, t }) => {
  const isOverdue =
    task.deadline && moment(task.deadline).isBefore(moment(), "day");

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: task.bgColor }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.taskName} numberOfLines={2}>
            {task.taskName}
          </Text>
          <View
            className="bg-slate-200 text-slate-800 border rounded-full px-2 py-1 border-slate-300"
            compact
          >
            <Text style={{ fontSize: 12 }}>{task.ElapsedTime}</Text>
          </View>
        </View>

        <View style={styles.statusChipWrap}>
          <View
            style={[
              styles.statusChip,
              { backgroundColor: task.bgColor || "#FEF3C7" },
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                { color: task.color || "#92400E" },
              ]}
            >
              {task.statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.datesRow}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>
              {t("creation_date").toUpperCase()}
            </Text>
            <View style={styles.dateValueRow}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={14}
                color="#6B7280"
                style={styles.dateIcon}
              />
              <Text style={styles.dateValue}>
                {task.creaDate
                  ? moment(task.creaDate).format("MMM DD, YYYY")
                  : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>{t("deadline").toUpperCase()}</Text>
            <View style={styles.dateValueRow}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={14}
                color={isOverdue ? "#EF4444" : "#6B7280"}
                style={styles.dateIcon}
              />
              <Text style={[styles.dateValue, isOverdue && styles.dateOverdue]}>
                {task.deadline
                  ? moment(task.deadline).format("MMM DD, YYYY")
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.assigneeRow}>
            <View style={styles.avatarWrap}>
              <Avatar.Text
                size={36}
                label={getInitials(task.assigned_user_name)}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.assigneeCaption}>{t("Assignee")}</Text>
              <Text style={styles.assigneeName}>
                {task.assigned_user_name || "—"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onDetailsPress(task)}
          >
            <Text style={styles.detailsBtnText}>{t("Details")}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#3B82F6"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardAccent: {
    width: 5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginTop: 2,
  },
  statusChipWrap: {
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  datesRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 14,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 4,
  },
  dateValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  dateOverdue: {
    color: "#EF4444",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    backgroundColor: "#BFDBFE",
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  assigneeCaption: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 1,
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
});

export default FullTaskCard;
