import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuComponent from "../../../component/MenuComponent";
import MainHomeComponent from "./MainHomeComponent";
import DetailMain from "./DetailMain/DetailMain";
import PaneEditor from "../../Pane/ui/Editor/Editor";
import { View } from "react-native";
import TaskDetailHeader from "../../Tasks/ui/TaskDetailHeader";
import CreateTask from "../../Tasks/ui/CreateTask";

const Stack = createNativeStackNavigator();

const MainHomeScreenStack = () => {
  return (
    <Stack.Navigator initialRouteName="MainHome">
      <Stack.Screen
        options={{
          header: () => <MenuComponent visibleBack={true} title="Accueil" />,
        }}
        name="MainHome"
        component={MainHomeComponent}
      />
      <Stack.Screen
        name="TaskDetail"
        component={DetailMain}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddPanne"
        component={PaneEditor}
        options={{
          header: ({ navigation }) => (
            <View>
              <MenuComponent
                title="Déclaration de l'incident"
                navigator={navigation}
              />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTask}
        options={{
          header: () => (
            <TaskDetailHeader visibleBack={true} title="Créer une tâche" />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default MainHomeScreenStack;
