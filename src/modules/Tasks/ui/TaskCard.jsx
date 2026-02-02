import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import "moment/locale/fr";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable } from "react-native";
import { Button, Card, Chip, IconButton } from "react-native-paper";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../Authentication/slice/auth.slice";

moment.locale("fr");

const TaskCard = ({
  task,
  onPress,
  onChangeStatus,
  onChangeDate,
  onRequestHelp,
  onMore,
  onDone,
}) => {
  const { t } = useTranslation();
  const current_user = useSelector(getCurrentUser)
  console.log('current_user in TaskCard', current_user);
  const formatReadableDate = (date) => {
    if (!date) return "";

    const raw = typeof date === "string" ? date.trim() : date;
    let m = moment.parseZone(raw);
    if (!m.isValid()) m = moment.utc(raw);
    if (!m.isValid()) m = moment(raw);
    if (!m.isValid()) return "";

    return m.locale("fr").format("ddd DD MMM");
  };

  return (
    <Card className="bg-white rounded-2xl mb-4 overflow-hidden">
      <Card.Content className="p-4">
        <View className="flex-row items-center justify-between gap-3 mb-2">
          <Text
            numberOfLines={2}
            className="flex-1 text-base font-bold text-slate-900"
          >
            {task?.taskName?.toUpperCase()}
          </Text>
          <Chip
            style={{ backgroundColor: task?.bgColor || "#E5E7EB" }}
            textStyle={{ color: "white" }}
          >
            {task?.statusLabel}
          </Chip>
        </View>

        <View className="mt-3 gap-2">
          <Chip textStyle={{ color: "red" }} icon={"car-brake-alert"} compact>
            {task?.panneName}
          </Chip>
          <View className="flex-row flex-wrap items-center justify-start gap-2">
            <Chip icon={"truck"} compact className="bg-slate-100">
              {task.licensePlate}
            </Chip>
            <Chip icon={"account"} compact className="bg-slate-100">
              {task.assigned_user_name}
            </Chip>
          </View>

          {task?.description ? (
            <Text
              numberOfLines={2}
              className="mt-2 text-sm leading-5 text-slate-600"
            >
              {task.description}
            </Text>
          ) : null}

          {task?.createdAt ? (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name="calendar-plus"
                  size={18}
                  color="#475569"
                />
                <Text className="text-sm font-semibold text-slate-700">
                  {t("created")} {formatReadableDate(task?.createdAt)} par {task?.Responsible}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="calendar-outline"
                size={18}
                color="#475569"
              />
              <Text className="text-sm font-semibold text-slate-700">
                {t("Deadline_date")} {formatReadableDate(task?.deadline)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          {task?.statusName !== "terminer" && (
            <View className="flex-row items-center">
              <IconButton
                icon="calendar-edit"
                size={20}
                onPress={() => onChangeDate(task)}
                accessibilityLabel="Change date"
              />
              {/* <IconButton
                icon="dots-horizontal"
                size={20}
                onPress={() => onMore(task)}
                accessibilityLabel="More options"
              /> */}
            </View>
          )}

          {task?.statusName !== "verification" &&
            task?.statusName !== "valide" && (
              <View className="flex-row items-center justify-end">
                {task?.statusName == "onDemand" && +current_user?.userID === +task?.assigned_user_id && (
                  <Button
                    style={{
                      borderColor: task?.bgColor,
                    }}
                    mode="outlined"
                    onPress={() => onChangeStatus(task, "start")}
                    icon={task?.statusName === "encours" ? "stop" : "play"}
                    textColor="black"
                  >
                    {t("start")}
                  </Button>
                )}
                {task?.statusName === "encours" && +current_user?.userID === +task?.assigned_user_id && (
                  <Button
                    mode="outlined"
                    onPress={() => onChangeStatus(task , 'end')}
                    icon={"check"}
                    textColor="#004b23"
                    style={{
                      borderColor: "#008000",
                    }}
                  >
                    {t("finish")}
                  </Button>
                )}
              </View>
            )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default TaskCard;
