import React, { useEffect, useState } from 'react'
import { View ,TouchableOpacity, Text, FlatList} from 'react-native'
import { Divider, TextInput } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'
import { createOrUpdateChat, fetchChats, getChats, getNewChat, setNewChat, setNotify } from '../slice/slice'
import { setUiParams } from '../../../store/slice/ui'
import { Ionicons } from '@expo/vector-icons'
import { getCurrentUser } from '../../Authentication/slice/auth.slice'
import moment from 'moment'
function ChatComponent({obj , onBack}) {
  let [message , setMessage] = useState('')
  let [messages , setMessages] = useState([])
  let chats = useSelector(getChats)
  let dispatch = useDispatch()
  let user = useSelector(getCurrentUser)
  let new_chat = useSelector(getNewChat)
  let [selectedChats , setSelectedChats] = useState([])
  let [replyTo , setReplyTo] = useState(null)
  let [selectedChatToReply , setSelectedChatToReply] = useState(null)

  const toggleSelect = (_message , remove)=>{
    if(_message?.from != user?.id) return
    if(selectedChats.includes(_message.id) || remove) setSelectedChats(prev => prev.filter(o => o != _message.id))
    else setSelectedChats(prev => [...prev, _message.id])
  }
  const send = ()=>{
    if(message){
      let _obj = {
        message,
        srcObject: obj?.srcObject,
        srcId: obj?.srcId || obj?.id,
        from: user?.id
      }
      dispatch(createOrUpdateChat(_obj)).then(({payload}) => {
        console.log('response:', payload)
        if(payload?.response?.id){
          addMessage(payload?.response)
        }
      })
      setMessage('')
    }
  }

  const onReturn = ()=>{
    if(typeof onBack == 'function') onBack()
  }

  let addMessage = (message)=>{
    if(message?.srcObject == obj?.srcObject && message?.srcId == obj?.srcId){
      let index = messages.findIndex(o => o.id == message.id)
      if(index != -1) {
        let _messages = [...messages]
        _messages[index] = {..._messages[index], ...message}
        setMessages(_messages)
      }else{
        setMessages(prev => [...prev, message])
      }
    }
  }

  useEffect(()=>{
    if(obj){
      dispatch(setUiParams({showLoader: true}))
      dispatch(fetchChats({
        srcObject: obj.srcObject,
        srcId: obj.srcId || obj.id
      })).then(({payload}) =>{
          if(Array.isArray(payload?.response)) setMessages(payload?.response)
          dispatch(setUiParams({showLoader: false}))
      })
    }
  },[obj])

  useEffect(()=>{
    if(new_chat){
      addMessage(new_chat)
      dispatch(setNewChat(null))
      if(new_chat?.from != user?.id){
        dispatch(setNotify(true))
      }
    }
  },[new_chat])

  useEffect(()=>{
    if(replyTo){
      setSelectedChatToReply(messages.find(o => o.id == replyTo))
    }
  },[replyTo , messages])

  return (
    <View style={{flex: 1}}>
        <View className="items-center justify-around bg-orange-500 p-2 flex-row ">
         <Ionicons name='arrow-undo-outline' color={'white'} size={24} onPress={onReturn} />
         <Text className="text-white text-sm font-semibold ml-5">{obj?.label}</Text>
         <View className="">
           {
            selectedChats.length > 0 && 
            (<View className="flex-row gap-5">
                <Ionicons name='trash-bin' color={"#fff"} size={20}/>
                {selectedChats.length == 1 && <Ionicons name='copy-outline' color={"#fff"}  size={20} />} 
                {selectedChats.length == 1 && <Ionicons onPress={e => setReplyTo(selectedChats[0])} name='arrow-undo-outline' color={"#fff"}  size={20} />} 
            </View>)
           }
         </View>
        </View>
        <FlatList 
            style={{flex: 1}} 
            data={messages}
            className="bg-gray-700"
            renderItem={({item})=>(
              <TouchableOpacity  activeOpacity={0.8} 
                                 onLongPress={e => toggleSelect(item)}
                                 onPress={e => toggleSelect(item , true)}
                                 className={`w-full rounded-md my-1 p-2 ${selectedChats.includes(item.id) ? 'bg-gray-100' : ''} ${item?.from == user?.id ? 'items-end': ''}`}>
                <View style={{width: '70%'}} className="p-2 bg-white rounded-lg">
                  <Text className="font-semibold text-blue-600">{item?.from == user?.id ? 'Vous' : item?.sender?.fullname}</Text>
                  <View className="mt-2">
                   <Text>{item?.message}</Text>
                  </View>
                  <View className="items-end">
                     <Text className="text-gray-400">{moment(item.date || item.createdAt).format('HH:mm')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(chat , idx)=> chat?.from+"-"+idx}
        />
        <View className="p-2 bg-gray-700">
          <View className="bg-white rounded-lg">
           {replyTo && (
            <View  className="bg-white  rounded-t-lg">
              <View className="p-2">
                 <Text style={{fontStyle: 'italic'}}>{selectedChatToReply?.message}</Text>
              </View>
              <Ionicons name='close-circle-outline' style={{position: 'absolute', top: 2 , right: 2}}/>
              <Divider />
            </View>
           )} 
            <TextInput  value={message} onChangeText={setMessage} className="bg-white rounded-xl"  label='Message'  right={<TextInput.Icon onPress={send} disabled={!message || message?.length < 2} color={'blue'} icon='send-outline' />}/>
          </View>
          
        </View>
    </View>
  )
}

export default ChatComponent