import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuComponent from "../../../component/MenuComponent";
import MainHomeComponent from "./MainHomeComponent";
import DetailMain from "./DetailMain/DetailMain";
import PaneEditor from "../../Pane/ui/Editor/Editor";
import { View } from "react-native";

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
    </Stack.Navigator>
  );
};

export default MainHomeScreenStack;
