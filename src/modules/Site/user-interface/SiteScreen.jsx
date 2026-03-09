import { View , Text} from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import SiteList from "./List/List"
import MenuComponent from "../../../component/MenuComponent"

const BottomTab = createBottomTabNavigator()
const SiteScreen = () => {
  return (
     <BottomTab.Navigator
        screenOptions={()=>({
          header:({navigation})=>(
            <View>
              <MenuComponent navigator={navigation} />
            </View>
          ),
          tabBarStyle: {display: 'none'}
        })}>
        <BottomTab.Screen 
          name="List"
          options={()=>({
            title:"Liste"
          })}
          component={SiteList}
        />
     </BottomTab.Navigator>
      
  )
}


export default SiteScreen
