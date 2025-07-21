import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SiteScreen from '../modules/Site/user-interface/SiteScreen';
import TicketScreen from '../modules/Ticket/ui/TicketScreen';

const Stack = createNativeStackNavigator();

function FeatureTab() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            component={SiteScreen}
            name='Sites'
            options={({route})=>({
                header: ()=> null
            })}
        />
        <Stack.Screen
            component={TicketScreen}
            name='Tickets'
            options={({route})=>({
                header: ()=> null
            })}
        />
    </Stack.Navigator>
  )
}

export default FeatureTab