import React from 'react'
import { Text, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'

function LoadingComponent(props) {
  return (
    <View style={{flex: 1 ,...(props.style || {})}}  className={`items-center gap-2 justify-center  ${props.className}`}>
          <ActivityIndicator size={80} color={props.iconColor || '#000'} />
          <Text className="font-semibold" style={{color: props.iconColor || '#000'}}>{props.label}</Text>
    </View>
  )
}

export default LoadingComponent