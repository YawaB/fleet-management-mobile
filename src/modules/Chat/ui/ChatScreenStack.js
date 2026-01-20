import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatTypeSelector from "./ChatTypeSelector/ChatTypeSelector";
import UserList from "./UserList/UserList";
import EngineList from "./EngineList/EngineList";
import DetailChat from "./DetailChat/DetailChat";
import MenuComponent from "../../../component/MenuComponent";

const Stack = createNativeStackNavigator();

const ChatScreenStack = () => {
  return (
    <Stack.Navigator initialRouteName="ChatTypeSelector">
      <Stack.Screen
        name="ChatTypeSelector"
        component={ChatTypeSelector}
        options={{
          header: () => <MenuComponent visibleBack={true} title="Chat" />,
        }}
      />
      <Stack.Screen
        name="UserList"
        component={UserList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EngineList"
        component={EngineList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetailChat"
        component={DetailChat}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ChatScreenStack;
