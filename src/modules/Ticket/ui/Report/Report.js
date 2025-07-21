import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrUpdateTicket, fetchTicketReport, fetchTicketResults, fetchTicketTemplate, getSelectedTicket } from '../../slice/slice'
import _ from 'lodash'
import { ScrollView , View , Text , Image, Dimensions} from 'react-native'
import { AnimatedFAB, DataTable, Dialog, Divider, FAB, IconButton, Portal, TextInput ,Button} from 'react-native-paper'
import ImageContainerComponent from '../../../../component/Shared/ImageContainer/ImageContainerComponent'
import { exportTicketReport } from '../utils/common'
import { setUiParams } from '../../../../store/slice/ui'
import BottomSheetComponent from '../../../../component/Shared/BottomSheet/BottomSheetComponent'
import { useNavigation } from '@react-navigation/native'
import { fetchUserAuthorizations, getCurrentUser, getUserAuthorizations } from '../../../Authentication/slice/auth.slice'
import moment from 'moment'

function TicketReport({route , ticketId}) {
  let [reportData , setReportData] = useState([])
  let [ticket , setTicket] = useState({})
  let navigation = useNavigation()
  let [comment , setComment] = useState('')
  let [showCorrectModal , setShowCorrectModal] = useState(false)
  let autorizations = useSelector(getUserAuthorizations)
  let current_user = useSelector(getCurrentUser)

  let [openSettings,setOpenSetting] = useState(false)

  let dispatch = useDispatch();

  let actions = useMemo(()=>{
    let _actions = 
    [
      {
        icon: 'download',
        onPress: e => print(), 
      }
    ]

    if(current_user?.id == ticket?.agentId) return _actions
    if((ticket?.allowed_actions|| []).includes('validate') && (autorizations.includes('ticket/validate') || current_user.is_super_admin)){
      _actions.push({
        icon: `bookmark`,
        onPress: e =>{
          setShowCorrectModal(true)
          setComment(false)
        },
      })
    }

    if((ticket?.allowed_actions || []).includes('close') &&  (autorizations.includes('ticket/close') || current_user.is_super_admin)){
      _actions.push({
        icon: `check-circle`,
        onPress: o => updateTo('closed'),
      })
    }

    return _actions
  }, [ticket , autorizations , current_user])

  let hideDialog = ()=>{
    setShowCorrectModal(false);
    setComment('')
  }

  const print = ()=>{
      dispatch(setUiParams({showLoader: true}))
      exportTicketReport(_.cloneDeep(reportData) , _.cloneDeep(ticket)).then(r =>{
        dispatch(setUiParams({showLoader: false}))
      })
  }

  const updateTo = (status)=>{
    let obj = {
      id: ticket?.id,
      statusId: status,
      fetchAfter: false
    }
    if(status == 'waiting_correction') {
      obj.text_1 = comment
    }
    dispatch(setUiParams({showLoader: true}))
    dispatch(createOrUpdateTicket(obj)).then(({payload})=>{
      dispatch(setUiParams({showLoader: false}))
      setShowCorrectModal(false)
      navigation.navigate("TicketList", {
          key: moment().unix()
      });
    })
  }
  
  useEffect(()=>{
    if(ticketId){
       dispatch(setUiParams({showLoader: true}))
       dispatch(fetchTicketReport(ticketId)).then(({payload})=>{
          dispatch(setUiParams({showLoader: false}))
          let expended = {}
          let imgCount = 1
          if(Array.isArray(payload?.response?.report)){
            payload?.response?.report.forEach(o =>{
              o.items.forEach(t =>{
                if(Array.isArray(t.images) && t.images?.length> 0){
                  expended[t.id] = true
                  t.images.forEach((img)=>{
                    img.path = imgCount%5 == 0 ? img.path : img.base64 || img.path
                    imgCount++
                  })
                }
              })
            })
            setReportData(payload?.response?.report)
          }else{
            setReportData([])
          }
          setTicket(payload?.response?.ticket)
       })
    }
  },[ticketId , route])

  return (
    <View  style={{flex: 1}}>
      <ScrollView  style={{flex: 1}}>
      <View className="border-1 border-blue-00 p-3 mb-5">
         <View className=" p-2 bg-indigo-500 justify-center items-center" style={{minHeight: 80}}>
            <View>
              <Text className="font-semibold text-white" style={{fontSize: 30}}>Rapport {ticket?.ticketType?.label}</Text>
              {/* <Text className="text-white">ref. {ticket?.reference}</Text> */}
            </View>
         </View>
         <View className="p-2 bg-gray-200">
            <View className="gap-2">
              <View className="flex-row align-items-center gap-2">
                <Text>Code du site:</Text>
                <Text className="font-semibold">{ticket?.site?.code}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text>Nom du site:</Text>
                <Text className="font-semibold">{ticket?.site?.label}</Text>
              </View>
              <View className="flex-row align-items-center gap-2">
                <Text>Agent:</Text>
                <Text className="font-semibold">{ticket?.agent?.fullname}</Text>
              </View>
            </View>
         </View>
      </View>
       <View className="m-3 ">
        {
          reportData.map( r =>(
            <View key={r.id} className="border border-gray-300 mt-5">
              <View className="bg-gray-500  justify-center p-3">
                <Text className="font-semibold text-xl text-white">{r.label}</Text>
              </View>
              <DataTable textStyle={{color: 'red'}}>
                <DataTable.Row  className="px-2">
                  <DataTable.Title><Text className="font-bold text-gray-800">Intitulé</Text></DataTable.Title>
                  <DataTable.Title className="justify-center"><Text className="font-bold text-gray-800">Valeur</Text></DataTable.Title>
                  <DataTable.Title className="justify-center"><Text className="font-bold text-gray-800">Commentaire</Text></DataTable.Title>
                </DataTable.Row>
                {
                  r.items.map(o =>(
                    <View key={o.id}>
                      <DataTable.Row   className="px-2" key={o.id}>
                        <DataTable.Cell className="border-r border-gray-200 ">
                          <Text className="font-semibold " style={{fontSize: 11}}>{o.label}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell  className="border-r border-gray-200  items-center justify-center" style={{}}>
                          <Text  style={{fontSize: 11}}>{o.value}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell  className="justify-center" style={{padding: 3}}>
                          <Text style={{fontSize: 11}}>{o.comment} </Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                      {
                        Array.isArray(o.images) && o?.images?.length > 0 && (
                            <View >
                              <View className="flex-row justify-between flex-wrap">
                                {
                                  o.images.map(img => (
                                    <View key={img.id} className="p-2"  style={{ width: '50%'}} >
                                      <ImageContainerComponent 
                                        source={{uri:img.base64 || img.path}}
                                        images = {o.images.map(o=>o.base64 || o.path)}
                                        width={'100%'}
                                        height={100}
                                        className="mb-2"
                                      />
                                    </View>
                                  ))
                                } 
                              </View>
                              <Divider />
                            </View>
                        )
                      }
                    </View>
                  ))
                }
              </DataTable>
            </View>
          ))
        }
       </View>
      </ScrollView>
      {
        actions.length == 1 ? (
          <FAB 
              icon="download"
              color='white'
              style={{backgroundColor: 'orange' , position: 'absolute' , bottom: 10 , right: 10}}
              onPress={print}
          />
        ): (
          <FAB.Group 
              className=""
              style={{  width: '100%' }}
              open={openSettings} 
              icon={openSettings ? 'cancel' : 'cog'}
              actions={actions}
              size='small'
              onStateChange={({open})=> setOpenSetting(open)}
              color='orange'
              backdropColor='rgba(231, 228, 228, 0.2)'
          />
        )
      } 

      {
        <Dialog dismissable className="bg-white" visible={showCorrectModal} onDismiss={hideDialog}>
          <Dialog.Title style={{fontSize: 16}}>
            Raison du besoin correction
            <Text className="text-red-500">*</Text>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput onChangeText={val => setComment(val)}  style={{backgroundColor: '#fff' , height: 70}}/>
          </Dialog.Content>
          <Dialog.Actions>
            <Button  mode='elevated'  textColor='red' onPress={hideDialog}>Fermer</Button>
            <Button mode='elevated' textColor='blue' onPress={()=>updateTo('waiting_correction')}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>
      }
      {/* <BottomSheetComponent initialHeight={100} backgroundColor="white">
        <Text>
          Raison du besoin correction
          <Text className="text-red-500">*</Text>
        </Text>
        <TextInput  style={{backgroundColor: '#fff' , height: 100}}/>
      </BottomSheetComponent> */}
    </View>
  )
}

export default TicketReport