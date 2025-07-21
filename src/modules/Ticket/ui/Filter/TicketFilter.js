import React , { useEffect } from 'react'
import { View , Text } from 'react-native'
import ISelectDropdown from '../../../../component/Shared/ISelectDropdown/ISelectDropdown'
import InputComponent from '../../../../component/Shared/InputComponent/InputComponent'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSites, getSites } from '../../../Site/slice/slice'
import { fetchAreas, fetchStatuses, getAreas, getStatuses } from '../../../../store/slice/global.slice'
import { getTicketFilters, setTicketFilters } from '../../slice/slice'

function TicketFilter() {
  let sites = useSelector(getSites)
  let areas = useSelector(getAreas)
  let statuses = useSelector(getStatuses)
  let filters = useSelector(getTicketFilters)
  
  let dispatch = useDispatch();

  const setFilter = (key , val)=>{
      let newVal = { ...filters , [key]: val}
      dispatch(setTicketFilters(newVal))
  }
  useEffect(()=>{
    dispatch(fetchSites())
    dispatch(fetchAreas())
    dispatch(fetchStatuses())
  },[])

  return (
    <View className="flex-row justify-between flex-wrap">
        <View style={{width: '50%'}} className="p-2">
          <Text>Site</Text>
          <ISelectDropdown style={{height: 40}} onSelect={val => setFilter('site' , val) } data={sites.map(o =>({label: o.code +'-'+ o.label , value: o.id}))} />
        </View>
        <View style={{width: '50%'}} className="p-2">
          <Text>Region</Text>
          <ISelectDropdown style={{height: 40}}  onSelect={val => setFilter('area' , val) }  data={areas.map(o =>({label: o.label , value: o.id}))} />
        </View>
        <View style={{width: '50%'}} className="p-2">
          <Text>Status</Text>
          <ISelectDropdown style={{height: 40}}  onSelect={val => setFilter('status' , val) }   data={statuses.map(o =>({label: o.label , value: o.id}))} />
        </View>
        <View style={{width: '50%'}} className="p-2">
          <Text>Référence</Text>
          <InputComponent onChangeText={val => setFilter('reference' , val)} style={{height: 40}} />
        </View>
    </View>
  )
}
export default TicketFilter