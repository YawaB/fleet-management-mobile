import { View } from 'react-native'
import TicketList from '../List/List'
import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
function ClosedTicket({route}) {
  let [filter , setFilter] = useState(null)

  useFocusEffect(useCallback(()=>{
    setFilter({statusId: 'closed'})
    return ()=>setFilter(null)
  },[]))
  return (
    filter && <TicketList filterFields={['site', 'area', 'reference']}  filter={{statusId: 'closed'}} />
  )
}

export default ClosedTicket