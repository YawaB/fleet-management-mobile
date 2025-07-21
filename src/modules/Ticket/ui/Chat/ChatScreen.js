import React, { useEffect } from 'react'
import { View } from 'react-native'
import ChatComponent from '../../../Chat/ui/ChatComponent'


function TicketChatScreen({route , navigation}) {
  const onBack = () => {
    navigation.goBack()
  }

  useEffect(()=>{
    console.log('route:', route?.params)
  }, [])
  return (
    <ChatComponent obj={route?.params} onBack={onBack} />
  )
}

export default TicketChatScreen