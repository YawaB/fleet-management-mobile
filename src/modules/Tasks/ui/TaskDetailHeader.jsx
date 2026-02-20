import { useNavigation } from "@react-navigation/native";
import { Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const TaskDetailHeader = ({ onBack, title }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) onBack();
    navigation.goBack();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        backgroundColor: "white",
        paddingVertical: 12,
      }}
      className="border-b-1 border-gray-600"
    >
      <Pressable onPress={handleBack} style={{ marginRight: 8, padding: 4 }}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#1e293b" />
      </Pressable>
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 16,
          fontWeight: "700",
          color: "#1e293b",
          marginRight: 30,
        }}
      >
        {t("confirm_change")}
      </Text>
    </View>
  );
};

export default TaskDetailHeader;
