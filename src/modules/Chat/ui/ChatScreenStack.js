import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListChat from './ListChat/ListChat';
import DetailChat from './DetailChat/DetailChat';
import MenuComponent from '../../../component/MenuComponent';

const Stack = createNativeStackNavigator();

const ChatScreenStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ListChat"
      
    >
      <Stack.Screen  options={{header: () => <MenuComponent visibleBack={true} title="Liste des chats" />}} name="ListChat" component={ListChat} />
      <Stack.Screen options={{headerShown: false}} name="DetailChat" component={DetailChat} />
    </Stack.Navigator>
  );
};

export default ChatScreenStack;