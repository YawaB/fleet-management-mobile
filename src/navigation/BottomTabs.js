import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import FeatureScreen from "../modules/Feature/ui/FeatureScreen";
import { colors } from "../theme/colors";
import { useTranslation } from "react-i18next";
import ChatScreenStack from "../modules/Chat/ui/ChatScreenStack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import MenuComponent from "../component/MenuComponent";
import TaskStack from "../modules/Tasks/TaskStack";
import MainHomeScreenStack from "../modules/MainHome/ui/MainHomeScreenStack";
import NotificationList from "../modules/Notification/ui/NotificationList";
import AboutScreen from "../modules/About/ui/AboutScreen";

const Tab = createBottomTabNavigator();

function BottomTabs() {
  const { t } = useTranslation();

  function getRoutName(route) {
    const routeName = getFocusedRouteNameFromRoute(route);
    const noDisplayValues = [
      "DetailChat",
      "TaskDetails",
      "TaskDetail",
      "CreateTask",
      "AddPanne",
      "UserList",
      "EngineList",
      "FormTask",
    ];
    const display = noDisplayValues.includes(routeName);
    if (display) {
      return "none";
    }
    return "flex";
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[600],
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={MainHomeScreenStack}
        options={({ route }) => ({
          tabBarLabel: t("Dashboard"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-grid"
              color={color}
              size={size}
            />
          ),
          headerShown: false,
          tabBarStyle: { display: getRoutName(route) },
        })}
      />
      <Tab.Screen
        name="Task"
        initialRouteName="TasksList"
        component={TaskStack}
        options={({ route }) => ({
          tabBarLabel: t("tasks"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="tasks" color={color} size={size} />
          ),
          headerShown: false,
          tabBarStyle: { display: getRoutName(route) },
        })}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreenStack}
        options={({ route }) => ({
          tabBarLabel: t("Chat"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" color={color} size={size} />
          ),
          headerShown: false,
          tabBarStyle: { display: getRoutName(route) },
        })}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationList}
        options={({ route }) => ({
          tabBarLabel: t("Notification"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
          header: () => (
            <MenuComponent visibleBack={true} title="Notification" />
          ),
          tabBarStyle: { display: getRoutName(route) },
        })}
      />
      {/* <Tab.Screen
        name="About"
        component={AboutScreen}
        options={({ route }) => ({
          tabBarLabel: t("about"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="information"
              color={color}
              size={size}
            />
          ),
          headerShown: false,
          tabBarStyle: { display: getRoutName(route) },
        })}
      /> */}
    </Tab.Navigator>
  );
}

export default BottomTabs;
