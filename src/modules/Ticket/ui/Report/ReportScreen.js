import React, { useEffect } from 'react'
import TicketReport from './Report'
import { View , Text} from 'react-native'
import { useState } from 'react'

function TicketReportScreen({ route }) {
  let [ticketId , setTicketId] = useState(0)
  useEffect(() => {
    console.log('ticketId:', ticketId)
    setTicketId(0)
    setTimeout(() => {
      setTicketId(route?.params?.ticketId)
    }, 1000);
  }, [route])
  useEffect(() => {
    console.log('ticketId000:', ticketId)
  }, [ticketId])
  return (
    <TicketReport ticketId={ticketId} />
  )
}

export default TicketReportScreen