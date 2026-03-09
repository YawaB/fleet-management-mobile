import React, { useCallback, useEffect, useState } from 'react'
import { View , Text, FlatList, TouchableOpacity, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSites, getSites } from '../../slice/slice'
import SiteItem from '../Item/Item'
import BottomSheetComponent from '../../../../component/Shared/BottomSheet/BottomSheetComponent'
import { Ionicons } from '@expo/vector-icons'
import FilterComponent from '../../../../component/Filter/FilterComponent'
import _ from 'lodash'
import { setUiParams } from '../../../../store/slice/ui'

function SiteList({route}) {
  let sites = useSelector(getSites)
  let [selectedSite , setSelectedSite] = useState(null)
  let [showFilter , setShowFilter]=useState(true)
  let [filteredList , setFilteredList]=useState(true)
  let [filter , setFilter]=useState({})
  const dispatch = useDispatch()

  const onSelect = useCallback((type , item)=>{
    setSelectedSite(null)
    setTimeout(()=>{
      setSelectedSite(item)
    },500)
  })

  const onFilterChange = (data)=>{
     setFilter(data)
  }

  useEffect(()=>{
      dispatch(setUiParams({showLoader: true}))
      dispatch(fetchSites()).then(()=>{
        dispatch(setUiParams({showLoader: false}))
      })
  }, [route])

  useEffect(()=>{
    let list = _.cloneDeep(sites);
    if(!Array.isArray(list)) list = [];
    list = list.filter(o =>(
      (!filter?.area || o?.areaId == filter?.area) &&
      (!filter?.reference || (o.code+"-"+o?.label).toLowerCase().includes((filter?.reference || '').toLowerCase()))
    ))

    setFilteredList(list)
  }, [filter , sites])

  return (
    <View style={{flex: 1}}>
       {  showFilter && 
            (
                <View className="bg-white" style={{elevation: 7}}>
                  <FilterComponent onChange={onFilterChange} fields={['area', 'reference']} />
                </View>
            )
        }
        <FlatList  
          data={filteredList}
          renderItem={({item})=>(
            <SiteItem data={item} onSelect={onSelect}  />
          )}
          keyExtractor={(item)=> item.id}
        />
        {
          selectedSite && (
            <BottomSheetComponent onHide={e => {
              setSelectedSite(null)
            }} initialHeight={100} backgroundColor="gray">
              <View className="flex-row gap-2 items-center">
                  <Ionicons  name='information-outline' color={'orange'} size={25} />
                  <Text className="text-white text-lg font-semibold">Informations</Text>
              </View>
              <View className="mt-2 px-2">
                  <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm">Type de site:</Text>
                      <Text>{selectedSite.type || 'Non renseigné'}</Text>
                  </View>
                  <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm">Configuration cible:</Text>
                      <Text>{selectedSite.configuration || 'Non renseigné'}</Text>
                  </View>
                  <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm">Configuration NRJ:</Text>
                      <Text>{selectedSite.nrjConfiguration || 'Non renseigné'}</Text>
                  </View>
                  {selectedSite.category && <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm ">Category:</Text>
                      <Text>{selectedSite.category || 'Non renseigné'}</Text>
                  </View>}
                  <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm">Site au Sol ou terrasse Audit:</Text>
                      <Text>{selectedSite.floorType || 'Non renseigné'}</Text>
                  </View>
                  {selectedSite.classification && <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm">Classification:</Text>
                      <Text>{selectedSite.classification || 'Non renseigné'}</Text>
                  </View>}
                  {selectedSite.gardingBy && <View className="flex-row gap-2 items-center">
                      <Text className="font-semibold text-sm">Site gardé:</Text>
                      <Text>{selectedSite.gardingBy || 'Non renseigné'}</Text>
                  </View>}
              </View>
            </BottomSheetComponent>
          )
        }
        
    </View>
  )
}

export default SiteList