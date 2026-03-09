import React, { memo } from 'react'
import { View , Text, FlatList, TouchableOpacity, Image, Linking } from 'react-native'
import { Divider } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
function SiteItem({data , onSelect}) {
  const openMap = () => {  
    const url = `https://www.google.com/maps/search/?api=1&query=${data?.lat},${data?.lng}`;  
    Linking.openURL(url).catch(err => console.error("Error opening map:", err));  
  };

  const processPress = (type)=>{
        if(typeof onSelect == 'function') onSelect(type , data)
  }
  return (
    <TouchableOpacity  activeOpacity={0.8} style={{elevation: 5}} className="size-20 h-fit bg-white rounded-md m-2 p-4">
        <View className="flex-row items-center gap-2 mb-2">
            <TouchableOpacity className="h-8 w-8 items-center bg-gray-400 text-orange-300 justify-center rounded-full">
                    <Ionicons className="text-white" size={20} name="home" />
            </TouchableOpacity>
            <Text className="font-semibold text-lg">{data.code} - {data.label}</Text>
        </View>
        <Divider />
        <View className="mt-2">

            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Configuration cible:</Text>
                <Text>{data.configuration || 'Non renseigné'}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Configuration NRJ:</Text>
                <Text>{data.nrjConfiguration || 'Non renseigné'}</Text>
            </View>
            {data.category && <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Category:</Text>
                <Text>{data.category || 'Non renseigné'}</Text>
            </View>}
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Site au Sol ou terrasse Audit:</Text>
                <Text>{data.floorType || 'Non renseigné'}</Text>
            </View>
            {data.classification && <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Classification:</Text>
                <Text>{data.classification || 'Non renseigné'}</Text>
            </View>}
            
        </View>
        <View className="mt-2 flex-row justify-end gap-2">
            <TouchableOpacity style={{width: 35 , height: 35 , elevation: 3}} className="bg-orange-100 items-center justify-center rounded-full">
                <Ionicons onPress={e=> processPress('info')} name='information-outline' color={'orange'} size={25} />
            </TouchableOpacity>
            <TouchableOpacity style={{width: 35 , height: 35, elevation: 3}} className=" bg-gray-100 items-center justify-center rounded-full">
                <Ionicons  onPress={openMap} name='navigate-outline' color={'gray'} size={25} />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
  )
}

export default memo(SiteItem)