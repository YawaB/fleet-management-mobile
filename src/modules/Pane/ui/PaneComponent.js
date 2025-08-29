import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MenuComponent from "../../../component/MenuComponent";
import PaneList from "./List/List";
import PaneEditor from "./Editor/Editor";
import PlanScreen from "./Plan/Plan";

const BottomTab = createBottomTabNavigator();
const PaneComponent = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="List"
      screenOptions={() => ({
        header: ({ navigation }) => (
          <View>
            <MenuComponent navigator={navigation} />
          </View>
        ),
        tabBarStyle: { display: "none" },
      })}
    >
      <BottomTab.Screen
        name="List"
        options={() => ({
          title: "Liste",
        })}
        component={PaneList}
      />

      <BottomTab.Screen
        name="Editor"
        options={() => ({
          header: ({ navigation }) => (
            <View>
              <MenuComponent
                title="Déclaration de l'incident"
                navigator={navigation}
              />
            </View>
          ),
        })}
        component={PaneEditor}
      />
      <BottomTab.Screen
        name="Plan"
        options={() => ({
          header: ({ navigation }) => (
            <View>
              <MenuComponent title="Plan d'action" navigator={navigation} />
            </View>
          ),
        })}
        component={PlanScreen}
      />
    </BottomTab.Navigator>
  );
};

export default PaneComponent;
