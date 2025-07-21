import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Button, Divider, TextInput } from 'react-native-paper'
import SelectDropdown from 'react-native-select-dropdown'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSites, getSites } from '../../../Site/slice/slice'
import { Ionicons } from '@expo/vector-icons'
import ISelectDropdown from '../../../../component/Shared/ISelectDropdown/ISelectDropdown'
import DatePicker from 'react-native-date-picker'
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import moment from 'moment'
import _ from 'lodash'
import { createOrUpdateTicket, fetchTicketTypes, getTicketTypes } from '../../slice/slice'
import { fetchUsers, getUsers } from '../../../User/slice/slice'
import { useNavigation } from '@react-navigation/native'
import IDatePicker from '../../../../component/Shared/IDatePicker/IDatePicker'
import InputComponent from '../../../../component/Shared/InputComponent/InputComponent'
import { setUiParams } from '../../../../store/slice/ui'

let mandatories = ['ticket_typeId','siteId','agentId','priority','date','note']
function EditTicket({
    onSave,
    filter
}) {
  let [inputs , setInputs] = useState({})
  const [date, setDate] = useState(null)

  const navigate = useNavigation();
  const [isValid, setIsValid] = useState(null)
  let sites = useSelector(getSites)
  let tickettypes = useSelector(getTicketTypes)
  let users = useSelector(getUsers)
  const dispatch = useDispatch()

  const setItemValue = useCallback((item ,key ,  valueKey)=>{
      console.log(item , key , valueKey)
      setInputs(prev =>({...prev , [key]: item}))
  })

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      value: inputs.date || new Date(),
      onChange:onDateChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const onDateChange = (selectedDate)=>{
    setInputs(prev =>({...prev , date: selectedDate}))
  }
  const save = ()=>{
    let data = _.cloneDeep(inputs);
    if(data.date) data.date = moment(data.date).format('YYYY-MM-DD')
    
    // console.log('save:', data)
    // return 
    dispatch(setUiParams({showLoader: true}))
    dispatch(createOrUpdateTicket(data)).then(({payload})=>{
        dispatch(setUiParams({showLoader: false}))

        if(payload.success){
          navigate.navigate("TicketList", {
            key: moment().unix()
          })
          setInputs({})
        }
    })
  }

  const processIsValid = ()=>{
    let data = _.cloneDeep(inputs) || {};
    let _valid = true;
    if(mandatories.find(o => !data[o])){
      _valid = false
    }
    setIsValid(_valid)
  }

  useEffect(()=>{
    dispatch(fetchSites())
    dispatch(fetchTicketTypes())
    dispatch(fetchUsers())
  },[])

  useEffect(()=>{
    processIsValid()
  },[inputs])

  return (
    <ScrollView style={{flex: 1}}>
        <View className="m-2 mt-5">
          <View className="gap-5">
            <View>
              <Text>Type de tache</Text>
              <ISelectDropdown onSelect={setItemValue} name={'ticket_typeId'} data={tickettypes.map(o => ({label: o.label , value: o.id}))} />
            </View>
            <View>
              <Text>Site</Text>
              <ISelectDropdown  onSelect={setItemValue}  data={sites.map(o => ({label: `${o.label}(${o.code})` , value: o.id}))}  name={'siteId'} />
            </View>
            <View>
              <Text>Agent</Text>
              <ISelectDropdown  onSelect={setItemValue}  data={users.map(o => ({label: o.fullname , value: o.id}))}  name={'agentId'} />
            </View>
            <View>
              <Text>Priorité</Text>
              <ISelectDropdown  onSelect={setItemValue} data={['P1', 'P2', 'P3'].map( o => ({label: o , value: o}))}  name={'priority'} />
            </View>
            <View>
              <Text>Date</Text>
              {/* <TouchableOpacity onPress={showMode} className="h-10 justify-center rounded-md border border-gray-400">
                  {inputs?.date && <Text> {moment(inputs.date).format('DD/MM/YYYY')} </Text>}
              </TouchableOpacity> */}
              <IDatePicker value={inputs?.date} onChange={onDateChange} />
            </View>
            <View>
              <Text>Commentaire</Text>
               <InputComponent value={inputs.note} onChangeText={note => setInputs(prev =>({...prev , note}))}/>
            </View>
          </View>

          <View className="flex-row gap-2 mt-3">
            <Button onPress={e => showMode('time')} style={{flex: 1}} className="bg-red-500"  textColor='#fff' >
                <Text className="font-semibold  text-lg">Annuler</Text>
            </Button>
            <Button onPress={save} disabled={!isValid}  style={{flex: 1}} className="bg-blue-500" textColor='#fff' >
              <Text className="font-semibold text-lg">Enregistrer</Text>
            </Button>
          </View>
        </View>
    </ScrollView>
  )
}


export default EditTicket