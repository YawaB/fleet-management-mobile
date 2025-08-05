import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FeatureScreen from '../modules/Feature/ui/FeatureScreen';
import ChatScreen from '../modules/Chat/ui/ChatScreen';
import { colors } from '../theme/colors';
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

function BottomTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[600],
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Features"
        component={FeatureScreen}
        options={{
          tabBarLabel: t('Features'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: t('Chat'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
