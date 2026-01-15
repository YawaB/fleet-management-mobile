import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuComponent from "../../component/MenuComponent";
import TasksScreen from "./ui/TasksScreen";
import TaskDetail from "./ui/TaskDetail";
import TaskDetailHeader from "./ui/TaskDetailHeader";
import CreateTask from "./ui/CreateTask";

const Stack = createNativeStackNavigator();

const TaskStack = () => {
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
        options={{
          header: () => <TaskDetailHeader visibleBack={true} title="Tâches" />,
        }}
      />
    </Stack.Navigator>
  );
};

export default TaskStack;
