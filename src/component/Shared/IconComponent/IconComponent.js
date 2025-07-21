import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity } from 'react-native'

function IconComponent({icon , size , style , onPress , color , iconColor}) {
  const _onPress = (e)=>{
    if(typeof onPress == 'function') onPress(e)
  }
  return (
    <TouchableOpacity style={{width:  35 , height: 35 , ...(style || {}) , elevation: 2}} className={`${color} bg-${color || 'gray'}-500 m-1 items-center justify-center rounded-full`}>
        <Ionicons onPress={_onPress} name={icon} color={iconColor || '#fff'} size={size || 25} />
    </TouchableOpacity>
  )
}


export default IconComponent