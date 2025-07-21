import { View , Text} from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import SiteList from "./List/List"
import MenuComponent from "../../../component/MenuComponent"
import PaneList from "./List/List"
import PaneEditor from "./Editor/Editor"

const BottomTab = createBottomTabNavigator()
const PaneComponent = () => {
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
          component={PaneList}
        />
        <BottomTab.Screen 
          name="Editor"
          options={()=>({
            title:"Declaration de panne"
          })}
          component={PaneEditor}
        />
     </BottomTab.Navigator>
      
  )
}


export default PaneComponent
