import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { SCREENS_ICONS } from "../../../data"
import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"
import EditTicket from "./Edit/Edit"
import CheckTicket from "./Check/Check"
import MenuComponent from "../../../component/MenuComponent"
import TicketReportScreen from "./Report/ReportScreen"
import TicketChatScreen from "./Chat/ChatScreen"
import ClosedTicket from "./ClosedTicket/ClosedTicket"
import TicketListScreen from "./List/ListScreen"

const BottomTab = createBottomTabNavigator()
const TicketScreen = () => {
  return (
     <BottomTab.Navigator
        screenOptions={({route})=>{
           let keys = Object.keys(SCREENS_ICONS)
           let key = keys.find( o =>  route.name.includes(o))
           if(!key)
             key = Object.keys(SCREENS_ICONS).find( o =>  route.name == o)
           let routeOptions = SCREENS_ICONS[key];
           let iconOptions = routeOptions?.icon || {name: "list"};
           let IconComponent = iconOptions.type || Ionicons;
           delete iconOptions.type;
           return  {
                header:({navigation}) => (
                  <View>
                    <MenuComponent navigator={navigation}/>
                  </View>
                ),
                tabBarIcon: (props) => {
                  return iconOptions?.component ? (
                    iconOptions.component
                  ) : (
                    <View className="relative">
                      <IconComponent
                        style={{ fontSize: 20 }}
                        size={35}
                        {...iconOptions}
                        {...props}
                      />
                    </View>
                  );
                }
           }
        }}>
        <BottomTab.Screen 
          name="TicketList"
          options={()=>({
            title:"Liste",
          })}
          component={TicketListScreen}
        />
        <BottomTab.Screen 
          name="AddTicket"
          options={()=>({
            title:"Ajouter",
          })}
          component={EditTicket}
        />
        <BottomTab.Screen 
          name="CheckTicket"
          options={()=>({
            title:"Renseigner",
            tabBarItemStyle:{ display: 'none'}
          })}
          component={CheckTicket}
        />
        <BottomTab.Screen 
          name="TicketReport"
          options={()=>({
            title:"Rapport",
            tabBarItemStyle:{ display: 'none'}
          })}
          component={TicketReportScreen}
        />
        <BottomTab.Screen 
          name="TicketChat"
          options={()=>({
            title:"Chat",
            headerShown: false,
            tabBarItemStyle:{ display: 'none'}
          })}
          component={TicketChatScreen}
        />
        <BottomTab.Screen 
          name="ClosedTickets"
          options={()=>({
            title:"Tickets Cloturés",
          })}
          component={ClosedTicket}
        />
     </BottomTab.Navigator>
  )
}

export default TicketScreen
