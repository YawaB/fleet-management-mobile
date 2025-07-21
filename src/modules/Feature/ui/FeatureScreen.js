import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Ionicons from "@expo/vector-icons/Ionicons.js"
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from '../../Authentication/slice/auth.slice'
import moment from 'moment'
import { fetchfeatures, getfeatures, setSelectedfeature } from '../slice/slice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Divider } from 'react-native-paper'
import { fetchTicketsStatistics, getTicketDashboardFilters, setTicketDashboardFilter, setTicketFilters } from '../../Ticket/slice/slice'
import { setUiParams } from '../../../store/slice/ui'
import IDatePicker from '../../../component/Shared/IDatePicker/IDatePicker'
import { useFocusEffect } from '@react-navigation/native'
const FeatureScreen = ({navigation , route}) => {
  let current_user = useSelector(getCurrentUser)
  let features = useSelector(getfeatures)
  let [stats , setStats] = useState([])
  const dispatch = useDispatch()
  const dashboard_filters = useSelector(getTicketDashboardFilters)

  const onFeatureSelected = (feature)=>{
      dispatch(setSelectedfeature(feature?.code))
      AsyncStorage.setItem('app' , feature?.code)
      if(feature?.code == 'tickets'){
        dispatch(setTicketFilters({}))
      }
      navigation.navigate('FeaturesTab' ,{
        screen: feature.route,
      })
  }

  useFocusEffect(useCallback(()=>{
    dispatch(fetchfeatures())
  }, []))

  useFocusEffect(useCallback(()=>{
    if(!dashboard_filters?.startDate || !dashboard_filters?.endDate) return
    dispatch(setUiParams({showLoader: true}))
    dispatch(fetchTicketsStatistics(dashboard_filters)).then(({payload})=>{
      setStats(payload)
      dispatch(setUiParams({showLoader: false}))
    })
  },[route , dashboard_filters]))
  
  const autoGoToApp = async ()=>{
      let app = await AsyncStorage.getItem('app');
      if(app){
          let infos = features.find(o => o.code == app)
          if(infos) onFeatureSelected(infos)
      }
  }
  const onStatusPress = (status , count)=>{
    if(count !== undefined && count == 0) return
    dispatch(setTicketFilters({
      status: status?.id,
      statusId: status?.id
    }))
    navigation.navigate('FeaturesTab' ,{
      screen: 'Tickets',
      params: {
        statusId: status?.id,
        status: status?.code
      }
    })
  }

  const onDashPeriodChanged = (val)=>{
    AsyncStorage.setItem('dashboard_period', moment(val).format('YYYY-MM-DD'))
    dispatch(setTicketDashboardFilter({
      startDate: moment(val).startOf('month').format('YYYY-MM-DD'),
      endDate: moment(val).endOf('month').format('YYYY-MM-DD')
    }))
  }

  useFocusEffect(useCallback(()=>{
    (async ()=>{
      let period = await AsyncStorage.getItem('dashboard_period');
      onDashPeriodChanged(period || moment());
    })()
  },[]))

  useEffect(()=>{
    return
    if(Array.isArray(features) && route?.params?.from == 'auth'){
      autoGoToApp()
    }else{
      AsyncStorage.removeItem('app')
    }
  },[route , features])

  return (
    <View style={{flex: 1}} className="bg-orange-500">
      <View className="h-60  items-center justify-center gap-3">
          <Text className="font-semibold text-white text-4xl">{moment().hours() <= 14 ? 'Bonjour' : 'Bonsoir'}</Text>
          <Text className="text-white font-semibold">{current_user?.fullname}</Text>
      </View>
      <View style={{padding: 6, flex: 1}} className="bg-white   rounded-t-2xl">
        <View  className="flex-row flex-wrap mt-5 pt-5">
          {
            features.map(o =>(
                <View key={o.label} className="p-2" style={{width: '50%' }}>
                  <TouchableOpacity onPress={()=> onFeatureSelected(o)} activeOpacity={0.9}   className="bg-blue-400 p-2" style={{gap: 10, borderRadius: 10, minHeight: 120  , elevation: 10 }}>
                    <View className="flex-row gap-2 items-center">
                      <TouchableOpacity  className="h-8 w-8 items-center justify-center rounded-full bg-white">
                        <Ionicons className="" size={20} name={o.icon} color={ o.icon_color || o.color || 'gray'} />
                      </TouchableOpacity>
                      <Text className="font-bold text-xl" style={{color: '#fff'}}>{o.label}</Text>
                    </View>
                    <Text style={{color: '#fff'}}>{o.description}</Text>
                  </TouchableOpacity>
                </View>
            ))
          }
        </View>
        <ScrollView showsVerticalScrollIndicator={false} className="mt-5">
          <Divider />
          <View className="flex-row justify-between items-center mx-5 mt-2">
            <Text className="font-semibold text-xl text-gray-400">Statistiques</Text>
            <IDatePicker mode={'month'} format={'MM/YYYY'} defaultStyle={false}  value={dashboard_filters?.startDate} onChange={onDashPeriodChanged } style={{height: 30 , minWidth: 50 , border: 'none !important'}} />
          </View>
          <View className="my-5 mx-2 flex-row flex-wrap justify-between">
              <TouchableOpacity  onPress={()=> onStatusPress({} , stats?.total || 0)}   activeOpacity={0.9}   className="bg-blue-100  p-2 items-center " style={{borderRadius: 10, width: '49%'  , elevation: 10 }}>
                <Text className="font-bold text-blue-500" style={{}}>Total des taches</Text>
                <View className="items-center mt-3">
                  <Text className="text-4xl font-semibold  text-blue-500"  style={{}}>{(stats?.total || 0).toString().padStart(2, '0')}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity     activeOpacity={0.9}   className="bg-gray-100 p-2 items-center " style={{borderRadius: 10, width: '49%'  , elevation: 10 }}>
                <Text className="font-bold text-gray-500" style={{}}>Progression</Text>
                <View className="items-center mt-3">
                  <Text className="text-4xl font-semibold text-gary-500"  style={{}}>{stats?.progress || 0} %</Text>
                </View>
              </TouchableOpacity>
              {
                (stats?.statistics || []).map(o =>(
                  <TouchableOpacity onPress={()=> onStatusPress(o , o.count)}  key={o.label} activeOpacity={0.9}   className="bg-blue-100 p-2 mt-2 items-center " style={{borderRadius: 10, width: '49%' , elevation: 10 ,backgroundColor: o.bgColor }}>
                    <Text className="font-bold text-blue-500" style={{color: o.color}}>{o.label}</Text>
                    <View className="items-center mt-3">
                      <Text className="text-4xl font-semibold  text-blue-500"  style={{color: o.color}}>{(o.count || 0).toString().padStart(2, "0")}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              }
          </View>
        </ScrollView>
      </View>
      
    </View>
  )
}

export default FeatureScreen

const styles = StyleSheet.create({})