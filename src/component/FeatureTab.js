import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaneComponent from '../modules/Pane/ui/PaneComponent';
import DashboardComponent from '../modules/Dashboard/ui/DashboardComponent';

const Stack = createNativeStackNavigator();

function FeatureTab() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            component={PaneComponent}
            name='Panes'
            options={({route})=>({
                header: ()=> null
            })}
        />
        <Stack.Screen
            component={DashboardComponent}
            name='Dashboard'
            options={({route})=>({
                header: ()=> null
            })}
        />
    </Stack.Navigator>
  )
}

export default FeatureTab