import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuComponent from "../../component/MenuComponent";
import FormScreen from "./ui/FormScreen";

const Stack = createNativeStackNavigator();

const FormStack = () => {
  return (
    <Stack.Navigator initialRouteName="FormScreen">
      <Stack.Screen
        name="FormScreen"
        component={FormScreen}
        options={{
          header: () => (
            <MenuComponent visibleBack={true} title="Fiche test tous" />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default FormStack;
