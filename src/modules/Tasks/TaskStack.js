import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuComponent from "../../component/MenuComponent";
import TasksScreen from "./ui/TasksScreen";
import TaskDetail from "./ui/TaskDetail";
import TaskDetailHeader from "./ui/TaskDetailHeader";
import FormScreen from "../Form/ui/FormScreen";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

const TaskStack = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator initialRouteName="TasksList">
      <Stack.Screen
        name="TasksList"
        component={TasksScreen}
        options={{
          header: () => <MenuComponent visibleBack={true} title="Tâches" />,
        }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetail}
        options={() => ({
          header: () => (
            <TaskDetailHeader
              onBack={() => navigation.goBack()}
              visibleBack={true}
              title="Tâches"
            />
          ),
        })}
      />
      <Stack.Screen
        name="FormTask"
        component={FormScreen}
        options={{
          header: () => (
            <TaskDetailHeader visibleBack={true} title="Formulaire" />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default TaskStack;
