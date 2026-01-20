import { useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import { IconButton } from "react-native-paper";

const TaskDetailHeader = ({ onBack, title }) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) onBack();
    navigation.goBack();
  };

  return (
    <View className="flex-row items-center justify-between">
      <IconButton icon="arrow-left" onPress={handleBack} />
      <Text className="text-base font-bold text-slate-900">{title}</Text>
      <IconButton icon="weather-night" onPress={() => {}} />
    </View>
  );
};

export default TaskDetailHeader;
