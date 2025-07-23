import React from "react";
import { View, Text } from "react-native";
import { Button, Divider } from "react-native-paper";

function PaneList({ navigation }) {
  const navigateToEditor = () => {
    navigation.navigate("Editor");
  };
  return (
    <View>
      <View
        style={{ paddingHorizontal: 16 }}
        className="flex flex-row justify-between items-center py-2 bg-gray-50"
      >
        <Text style={{ fontSize: 16 }} className="font-bold text-gray-600">
          list
        </Text>
        <Button
          mode="text"
          icon="plus"
          onPress={navigateToEditor}
          className="w-1/2"
        >
          Ajouter une panne
        </Button>
      </View>
      <Divider />
    </View>
  );
}

export default PaneList;
