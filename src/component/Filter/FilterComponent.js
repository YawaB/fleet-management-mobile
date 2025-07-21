import React , { useEffect, useMemo, useState } from 'react'
import { View , Text } from 'react-native'

import { useDispatch, useSelector } from 'react-redux'
import ISelectDropdown from '../Shared/ISelectDropdown/ISelectDropdown'
import InputComponent from '../Shared/InputComponent/InputComponent'
import { fetchSites, getSites } from '../../modules/Site/slice/slice'
import { fetchAreas, fetchStatuses, getAreas ,getStatuses } from '../../store/slice/global.slice'


function FilterComponent({fields , onChange}) {
  let sites = useSelector(getSites)
  let areas = useSelector(getAreas)
  let statuses = useSelector(getStatuses)
  let [filters , setFilters] = useState({})

  let [allowed_fields , setAllowedField] = useState([])
  
//   let fields = useMemo(()=>{
//     return [
//       {label: 'Site', key: 'site', type: 'select', data: sites.map(o => ({label: o.code +'-'+ o.label, value: o.id}))},
//       {label: 'Region', key: 'area', type: 'select', data: areas.map(o => ({label: o.label, value: o.id}))},
//       {label: 'Status', key: 'status', type: 'select', data: statuses.map(o => ({label: o.label, value: o.id}))},
//       {label: 'Référence', key: 'reference', type: 'text'},
//     ]
//   },[sites , areas , statuses])
  let dispatch = useDispatch();

  const setFilter = (key , val)=>{
      let newVal = { ...filters , [key]: val}
      if(typeof onChange == 'function') onChange(newVal)
  }

  useEffect(()=>{
    setAllowedField(fields || [])
  },[fields])
  useEffect(()=>{
    allowed_fields.includes('site')
        dispatch(fetchSites())
    allowed_fields.includes('area')
        dispatch(fetchAreas())
    allowed_fields.includes('status')
        dispatch(fetchStatuses())
  },[filters])


  return (
    <View className="flex-row justify-between flex-wrap">
        {
            allowed_fields.includes('site') &&  (
                <View style={{width: '50%'}} className="p-2">
                    <Text>Site</Text>
                    <ISelectDropdown style={{height: 40}} onSelect={val => setFilter('site' , val) } data={sites.map(o =>({label: o.code +'-'+ o.label , value: o.id}))} />
                </View>
            )
        }
        {
           allowed_fields.includes('area') &&  (
                <View style={{width: '50%'}} className="p-2">
                    <Text>Région</Text>
                    <ISelectDropdown style={{height: 40}}  onSelect={val => setFilter('area' , val) }  data={areas.map(o =>({label: o.label , value: o.id}))} />
                </View>
           ) 
        }
         {
           allowed_fields.includes('status') &&  (
                <View style={{width: '50%'}} className="p-2">
                    <Text>Status</Text>
                    <ISelectDropdown style={{height: 40}}  onSelect={val => setFilter('status' , val) }   data={statuses.map(o =>({label: o.label , value: o.id}))} />
                </View>
           ) 
        }
         {
           allowed_fields.includes('reference') &&  (
                <View style={{width: '50%'}} className="p-2">
                    <Text>Référence</Text>
                    <InputComponent onChangeText={val => setFilter('reference' , val)} style={{height: 40}} />
                </View>
           ) 
        }
    </View>
  )
}
export default FilterComponent