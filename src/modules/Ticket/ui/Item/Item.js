import React, { memo } from 'react'
import { View , Text, FlatList, TouchableOpacity, Image, Linking } from 'react-native'
import { Divider } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import moment from 'moment';
import IconComponent from '../../../../component/Shared/IconComponent/IconComponent';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../../../Authentication/slice/auth.slice';

function TicketItem({data , onSelect}) {
  const current_user = useSelector(getCurrentUser)
  const processPress = (type , ...args)=>{
        if(typeof onSelect == 'function') onSelect(type , data ,...args)
  }

  function canDoAction(action){
    let can = (data.allowed_actions || []).includes(action);
    if(can && ['accept', 'edit_check'].includes(action)){
        can = current_user?.id == data?.agentId
    }
    return can
  }
  
  return (
    <TouchableOpacity  activeOpacity={0.8} style={{elevation: 5}} className="size-20 h-fit bg-white rounded-md m-2 p-4">
        <View className="flex-row items-center justify-between gap-2 mb-2">
            <View className="flex-row items-center gap-2">
                <TouchableOpacity className="h-8 w-8 items-center bg-gray-400 text-orange-300 justify-center rounded-full">
                        <Ionicons className="text-white" size={20} name="ticket-outline" />
                </TouchableOpacity>
                <View>
                  <Text className="font-semibold text-lg">{data.reference}</Text>
                  <Text className="text-indigo-500 font-semibold text-sm">{data?.ticketType?.label}</Text>
                </View>
            </View>
            <TouchableOpacity style={{backgroundColor: data?.status?.color}} className="px-1 rounded-sm">
                <Text  className="font-semibold text-white" style={{fontSize: 11}}>
                    {
                        data?.status?.label
                    }
                </Text>
            </TouchableOpacity>
            
        </View>
        <Divider />
        <View className="my-2">
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Site:</Text>
                <Text>{data.site?.label} ({data.site?.code}) {data.area?.label}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Date de création:</Text>
                <Text>{moment(data.createdAt).format('DD/MM/YYYY')}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Date d'execution:</Text>
                <Text>{moment(data.date).format('DD/MM/YYYY')  || 'Non renseigné'}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Agent:</Text>
                <Text>{data.agent?.fullname || 'Non renseigné'}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
                <Text className="font-semibold text-sm">Note:</Text>
                <Text>{data.note }</Text>
            </View>
            
            {
                data.status?.code == 'waiting_correction' && (
                    <View className="flex-row items-center mt-2 mb-5 bg-orange-50 border-orange-100 border p-2">
                        <Ionicons size={20} color={'orange'} name='warning-outline' />
                        <Text className="ml-2 text-gray-800 text-md font-semibold">{data.text_1}</Text>
                    </View>
                )
            }
        </View>
        <View className="-mt-5 flex-row justify-end  items-center">
            {
                canDoAction('accept') &&  <IconComponent  icon="checkmark"  onPress={e=> processPress('changeStatus', 'accepted')} color={'indigo'}/>
            }
            {
                canDoAction('edit_check') &&  <IconComponent icon="create-outline"   color={'bg-blue-500'}  onPress={e=> processPress('edit_check')}/>
            }
            {
                canDoAction('report') && <IconComponent icon="download" color={'bg-orange-500'} onPress={e=> processPress('repport')}/>
            } 
            {
                canDoAction('delete')  && <IconComponent icon="trash-outline" color={'bg-red-500'} onPress={e=> processPress('remove')}/>
            }
            {
                 <IconComponent icon="chatbubble-outline" color={'bg-blue-500'} onPress={e=> processPress('chat')}/>
            }
        </View>
    </TouchableOpacity>
  )
}

export default memo(TicketItem)