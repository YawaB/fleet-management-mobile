import { useCallback, useEffect, useState } from "react"
import TicketList from "./List"
import { useFocusEffect } from "@react-navigation/native"
import { getTicketFilters } from "../../slice/slice"
import { useSelector } from "react-redux"

function TicketListScreen({route , navigation}) {
  let [filter , setFilter] = useState(null)
  let ticketsFilters = useSelector(getTicketFilters)
  
  useFocusEffect(useCallback(()=>{
      setFilter(ticketsFilters)
      return ()=>setFilter(null)
  },[ticketsFilters]))
  return (
    filter && <TicketList filter={filter} />
  )
}

export default TicketListScreen