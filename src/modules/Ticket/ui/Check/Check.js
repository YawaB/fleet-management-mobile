import React, { useEffect, useState } from 'react'
import { View , Text, ScrollView, TouchableOpacity , Image} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { createOrUpdateTicket, fetchTicketTemplate, getSelectedTicket, saveTicketResults, setSelectedTicket } from '../../slice/slice'
import { Button, Checkbox, Divider, Switch, TextInput } from 'react-native-paper'
import { setUiParams } from '../../../../store/slice/ui'
import ISelectDropdown from '../../../../component/Shared/ISelectDropdown/ISelectDropdown'
import _ from 'lodash'
import CameraScreen from '../../../../component/Shared/CameraScreen/CameraScreen'
import { Ionicons } from '@expo/vector-icons'
import InputComponent from '../../../../component/Shared/InputComponent/InputComponent'
import { useNavigation } from '@react-navigation/native'
import ImageContainerComponent from '../../../../component/Shared/ImageContainer/ImageContainerComponent'
import { fetchCheckImagesOffline, fetchCheckOfflineResults, removeCheckImageOffline, saveCheckImageOffline, saveCheckResultsOffline } from '../../service'
import { toastMessage } from '../../../../core/ui'
import { requestGeolocationCurrentPosition } from '../../../../core/api/geolocation'
import { localFilesPathToBase64 } from '../../../../core/utils/file'
import useLogger from '../../../../hook/Logger/useLogger'

function CheckTicket({route}) {
  let [page , setPage] = useState(0)
  let [values , setValues] = useState([])
  let [images , setImages] = useState([])
  let [currentTempItem , setCurrentTempItem] = useState(null)
  let [currentTemplate , setCurrentTemplate] = useState(null)
  let ticket = useSelector(getSelectedTicket)
  let [template , setTemplates] = useState([])
  let [show_save , setShowSave] = useState(false)
  let [showCamera , setShowCamera] = useState(false)
  let [isSwitchMode , setIsSwitchMode] = useState(true)
  let [clickedItems , setClickedItems]= useState([])
  let [hasChanged , setHasChanged] = useState(false)
  let [naTemps , setNaTemps] = useState([])
  let [errors , setErrors] = useState([])

  let { log } = useLogger()

  let dispatch = useDispatch()
  let navigate = useNavigation()

  let onChange = (id , value , key)=>{
     setValues(prev =>{
        let newVal = [...prev]
        if(id == 'global'){
           let items = currentTemplate.items.map( o => ({temp_id: currentTemplate.id , item_id: o.id , value: value , check_case: value , comment: '' }));
           newVal = [
            ...newVal.filter( o =>  currentTemplate.id != o.temp_id),
            ...items
           ]

           setNaTemps(prev => {
              if(value == 'NA'){
                return [...prev.filter(o => o != currentTemplate.id), currentTemplate.id]
              }else{
                return [...prev.filter(o => o != currentTemplate.id)]
              }
           })
        }else{
          let item = prev.find( o =>  currentTemplate.id == o.temp_id && o.item_id == id) || {};
          let obj = {
            ...item,
            temp_id: currentTemplate.id,
            item_id: id,
            [key || 'value']: value,
            ticket: ticket.id,
          }
          if(key == 'check_case' && value == 'NA') obj.value = "NA"
          else if(key == 'check_case') obj.value = ""
          newVal = [
            ...newVal.filter( o =>  currentTemplate.id != o.temp_id || o.item_id != id),
            obj
          ]
        }
        setHasChanged(true)
        return newVal
     })
  }
  const addToPage =  async (count)=>{
    if(count == 1){
     let isSave = await saveCurrentData(_.cloneDeep(values) , _.cloneDeep(currentTemplate))
     if(!isSave) return
    }
    setPage(p =>{
      let newPage = p + count
      if(newPage<0) newPage = 0
      else if(newPage > template?.length - 1) {
        newPage = template?.length -1
        setShowSave(true)
      }else{
        setShowSave(false)
        setClickedItems([])
      }
      return newPage
    })
  }

  const saveCurrentData = async ()=>{
    try{
      saveOffline(_.cloneDeep(values) , _.cloneDeep(currentTemplate))
      let data_to_save = getTemplateValues(currentTemplate?.id);
      let isValid = checkValuesValidity(data_to_save.map(o =>({...o , item_id: o.itemId , temp_id: currentTemplate?.id})))
      console.log('isValid:', isValid) 
      if(!isValid){
        toastMessage({
          type: "error",
          text1: "Sauvegarde",
          text2: "Certains renseignements sont incorrect. Veuillez les corriger pour continuer",
          visibilityTime: 1500
        })
        return false
      }

      // if(!hasChanged) return true
      setErrors([])
      return await save(data_to_save)
       
    }catch(e){
      console.log('Error:', e.message)
      return false
    }
  }

  const saveOffline = (val , template)=>{
     let data = _.cloneDeep(val).filter(o => o.temp_id == template?.id);
     for(let obj of data){
      for(let k in obj){
        if(!obj[k]) obj[k] = ''
      }
      delete obj.id
     }
     saveCheckResultsOffline(data)
  }


  const getItemValue = (id , key , label)=>{
      if(!Array.isArray(values)) return ''
      let value = values.find(o => currentTemplate.id == o.temp_id && o.item_id == id) || {}
      return (value[key || 'value'] || '')
  }

  const getItemImages = (id )=>{
     let _imgs = _.cloneDeep(images)
     if(!Array.isArray(_imgs)) _imgs = [];
     return _imgs.filter(o => o.temp_id == currentTemplate.id && o.item_id == id) 
  }

  const getItemErrors = (id)=>{
    let _errors = errors.find(o => o.temp_id == currentTemplate.id && o.item_id == id) 
    return _errors?.messages || []
  }

  const getTemplateValues = (temp_id)=>{
    let data = _.cloneDeep(values);
    if(!Array.isArray(data)) data = []
    data = data.filter( o=> o.temp_id == temp_id);

    let output = []
    let temp = template.find(o => o.id == temp_id)
    if(!temp) return output
    for(let  item  of temp.items){
      let obj = values.find( o => o.item_id == item.id && o.temp_id == temp_id) || {}
      // if(!obj) continue

      let objImages = obj?.check_case == 'NA' && isSwitchMode ? [] : images.filter(o => o.temp_id == temp_id && o.item_id == item.id).map(o => o.base64 || o.path);

      if(objImages?.length > 0){
        let imgs = localFilesPathToBase64(objImages)
        if(Array.isArray(imgs)) objImages = imgs;
      }
      
      output.push({
        ticketId: ticket.id,
        itemId: item.id,
        value: obj.value || '',
        comment: obj?.comment || '',
        images:objImages
      })
    }
    return output
  }


  const checkValuesValidity = (values)=>{
      let {temp_id} = values[0];
      let temp = template.find(o => o.id == temp_id);
      let items = temp?.items || [];
      let errors = [];
      try{
        items.forEach(tempElement  => {
          try{
            let value = values.find(o => tempElement.id == o.item_id) || {};
            let ckImages = value?.images || []
            let messages = []
            let message = ""
            if(value.value == 'NA') return
            if(tempElement.is_file_required && ckImages?.length == 0){
              messages.push(`Des images sont requise pour ce champ:minimum ${tempElement.min_file} et maximum  ${tempElement.max_file}`)
            }
  
            if(ckImages.length > 0){
              if(ckImages.length < tempElement.min_file  ) message = `Nombre d'images insuiffisant: minimum ${tempElement.min_file} et maximum  ${tempElement.max_file}`
              else if(ckImages.length > tempElement.max_file) message = `Le nombre d'image depasse le maximum requis: ${tempElement.max_file} aux maximum`
              if(message)  messages.push(message)
            }
            if(tempElement.is_value_required && !value.value) {
              messages.push('Valeur réquise')
            }
            if(messages.length > 0){
              errors.push({
                temp_id,
                item_id: tempElement.id,
                messages: messages
              })
            }
          }catch(e){
            console.log('error:', e.message)
          }
          
        })

        console.log('Errors:', errors)
        setErrors(prev =>([
          ...prev.filter(o => o.temp_id != temp_id),
          ...errors
        ]))

        return errors.length == 0
      }catch(e){
        console.log('error:', e.message)
        return false
      }
  }

  const toggleClickItem = (id)=>{
      setClickedItems(prev =>{
        let exist = prev.findIndex(o => o == id) != -1
        if(exist) return prev.filter(o => o != id)
        else return [...prev , id]
      })
  }

  function getComponent(item , type){
    let Component = null;
    switch(item.type){
      case 'select':
         Component = <ISelectDropdown style={isSwitchMode ? {height: 40 , width: '49%'  } : {}} value={getItemValue(item?.id, 'value' , item.label)} onSelect={(val) => onChange(item.id , val , 'value') } data={(item?.values_list || []).map(o => ({label: o , value: o}))} />
       break;
      default:
         Component = <InputComponent style={ isSwitchMode ? {height: 40 , width: '49%' }: {}} type={item?.type || 'text'} value={getItemValue(item?.id, 'value' , item.label)} onChangeText={val => {
           onChange(item.id , val , 'value')
         }} />
    }

    return Component
  }

  async function setLocation(){
    requestGeolocationCurrentPosition().then(response =>{
      if(response){
        let latitem = (currentTemplate?.items || []).find(o => o.label.toLowerCase().includes('lat') && o.type == 'coords')
        let longitem = (currentTemplate?.items || []).find(o => o.label.toLowerCase().includes('long') && o.type == 'coords')
        if(latitem) onChange(latitem.id, (response?.latitude || '').toString(), 'value')
        if(longitem) onChange(longitem.id, (response?.longitude || '').toString(), 'value')
      }
    })
  }

  useEffect(()=>{
    // console.log('clickedItems:', clickedItems)
  },[clickedItems])

  let buildTemplate = (items)=>{
    return (
      ticket?.ticketType?.display_type != 'check' ? 
      <View>
         {
          items.map(tempItem =>{
            let Component = getComponent(tempItem)
            return (
              <View key={tempItem.id} className="p-2 bg-white rouded-2 my-2" style={{elevation: 2}}>
                  <View className="flex flex-row items-center justify-between mb-1">
                    <Text className="font-semibold">
                      {tempItem.label} 
                      {tempItem?.is_value_required == 1 && <Text className="text-red-600">*</Text>}
                      {
                        tempItem.is_file_required == 1 && (
                          <Text className="ml-2">
                            - {tempItem.min_file != tempItem.max_file ? `(${tempItem.min_file} à ${tempItem.max_file})`: tempItem.min_file} image requise
                          </Text>
                        )
                      }
                      {tempItem?.is_file_required == 1 && <Text className="text-red-600"> </Text>}
                    </Text>
                    {
                      tempItem?.type == 'coords' && (tempItem.label || '').toLowerCase().includes('lat') && (
                        <Ionicons onPress={setLocation} size={30} color={'blue'} name='accessibility-outline' />
                      )
                    }
                  </View>
                  {tempItem?.type != 'file' && Component}
                  {
                    (tempItem.min_file >0 || tempItem.max_file > 0)  && (
                      <View className="flex-row flex-wrap gap-3" style={{marginTop: 5}}>
                          {
                            getItemImages(tempItem.id).map(o=>(
                              <View key={o.id}>
                                <ImageContainerComponent 
                                    source={{uri: o.path}}
                                    width={60}
                                    height={60}
                                    deleteIconSize={25}
                                    onRemove = {()=>removeImage(o.id)}
                                  />
                              </View>
                            ))
                          }
                          <TouchableOpacity onPress={e =>{
                            setCurrentTempItem(tempItem)
                            setShowCamera(true)
                          }} style={{width: 60 , height: 60}} className="bg-gray-400 justify-center items-center">
                              <Ionicons name='camera-outline' size={40} color={'#fff'} />
                          </TouchableOpacity>
                      </View>
                    )
                  }
                  <View className="my-2">
                    {
                      getItemErrors(tempItem.id).map((o, i) =>(
                        <Text key={i} className="text-red-500 ml-2 mb-1" style={{fontSize: 10}}>
                          <Text className="text-gray-600 font-semibold">*</Text>
                           {o}
                        </Text>
                      ))
                    }
                  </View>
              </View>
            )
          })
         }
      </View>
       :(
        <View className="">
           <View className="m-2 flex-row justify-between">
              <Text className="font-semibold text-lg">
               {currentTemplate?.label}
              </Text>
              {currentTemplate?.can_be_absent == 1 && (
                <Switch value={naTemps.includes(currentTemplate?.id)} onValueChange={v => onChange('global' , v ? 'NA' : '' )} />
              )}
            </View>
            <Divider />
            {
              !naTemps.includes(currentTemplate?.id) ? (
                <View >
                  <View className="flex-row p-2 justify-between border-b border-gray-200 py-2 mb-2">
                    <View style={{width: '50%'}}>
                      <Text className="font-semibold">Libélé</Text>
                    </View>
                    <View className="flex-row items-center">
                      {/* <View style={{width: 50}} className="items-center">
                        <Text className="font-semibold">OK</Text>
                      </View> */}
                      <View style={{width: 50}} className="items-center">
                        <Text className="font-semibold">NA</Text>
                      </View>
                    </View>
                  </View>
                  <View className=" py-1  border-gray-200">
                    {
                      items.map(tempItem=>{
                        let Component = getComponent(tempItem , 'check')
                        return (
                          <View key={tempItem.id} className="flex-row justify-between items-center p-2 border-b border-gray-300 flex-wrap">
                            <View style={{width: '50%'}} className="py-1">
                              <View className="flex flex-row justify-between">
                                <TouchableOpacity onPress={e => toggleClickItem(tempItem.id)}>
                                  <Text className="text-gray-600 font-semibold" style={{fontSize: 12}}>{tempItem.label}</Text>
                                </TouchableOpacity>
                                {
                                  tempItem?.type == 'coords' && (tempItem.label || '').toLowerCase().includes('lat') && (
                                    <Ionicons onPress={setLocation} size={30} color={'blue'} name='accessibility-outline' />
                                  )
                                }
                              </View>
                              {
                                (tempItem.min_file >0 || tempItem.max_file > 0)  && (
                                  <View className="p-1">
                                    <View className="flex-row flex-wrap gap-5" >
                                     {
                                        getItemImages(tempItem.id).map(o=>(
                                          <View key={o.id}>
                                            <ImageContainerComponent 
                                                source={{uri: o.path}}
                                                width={30}
                                                height={30}
                                                deleteIconSize={20}
                                                onRemove = {()=>removeImage(o.id)}
                                              />
                                          </View>
                                        ))
                                     }
                                     {
                                        getItemValue(tempItem?.id , 'check_case') != 'NA' && (
                                            <TouchableOpacity onPress={e =>{
                                              setCurrentTempItem(tempItem)
                                              setShowCamera(true)
                                            }} style={{width: 30 , height: 30}} className="bg-gray-400 justify-center items-center">
                                                <Ionicons name='camera-outline' size={20} color={'#fff'} />
                                            </TouchableOpacity>
                                        )
                                     }
                                    </View>
                                  </View>
                                )
                              }
                            </View>
                            <View  className="flex-row">
                              {/* <View style={{width: 50}}>
                                <Switch value={getItemValue(tempItem?.id , 'check_case')  == 'OK'} onValueChange={v => onChange(tempItem.id , v ? 'OK' : '' , 'check_case')}/>
                              </View> */}
                              <View style={{width: 50}} className="justify-end">
                                <Switch value={getItemValue(tempItem?.id , 'check_case') == 'NA'} onValueChange={v => onChange(tempItem.id , v ? 'NA' : '' , 'check_case')}/>
                              </View>
                            </View>
                            {
                              tempItem?.type != 'file' && getItemValue(tempItem?.id , 'check_case') != 'NA' /*&& (clickedItems.includes(tempItem?.id) || getItemValue(tempItem?.id , 'check_case')  != 'NA')*/ && (
                                <View className="flex-row justify-between w-full" >
                                    {

                                      
                                      Component
                                        // tempItem.type != 'select' ? (
                                        //   <InputComponent value={getItemValue(tempItem?.id)} onChangeText={val =>  onChange(tempItem.id , val, 'value')} style={{height: 30, fontSize: 11 , width: '49%'}} placeholder={'valeur'} />
                                        // ) :
                                    } 
                                    <InputComponent value={getItemValue(tempItem?.id , 'comment')} onChangeText={val =>  onChange(tempItem.id , val, 'comment') } style={{height: 30,  fontSize: 11 ,width: '49%'}} placeholder={'commentaire'} />
                                </View>
                              )
                            }

                            { getItemValue(tempItem?.id , 'check_case') != 'NA' &&  getItemErrors(tempItem.id).length > 0 &&
                              <View className="my-2">
                                {
                                  getItemErrors(tempItem.id).map((o, i) =>(
                                    <Text key={i} className="text-red-500 ml-2 mb-1" style={{fontSize: 10}}>
                                      <Text className="text-gray-600 font-semibold">*</Text>
                                      {o}
                                    </Text>
                                  ))
                                }
                              </View>
                            }
                           
                          </View>
                        )
                      })
                    }
                  </View>
                </View>
              ):
              <View className="mt-5 pt-2  items-center justify-center" style={{height: 300}}>
                <Text className="font-semibold text-gray-400 text-6xl">NA</Text>
              </View>
            }
        </View>
      )
    )
  }

  let initializeData = ()=>{
     fetchCheckOfflineResults({ticket: ticket?.id}).then(({success, response})=>{
      if(Array.isArray(response)) setValues(response)
     })
     getImageOffline()
  }

  let getImageOffline = ()=>{
    fetchCheckImagesOffline({
      itemObject: "ticket",
      itemId: ticket.id.toString()
    }).then(({success, response})=>{
       if(Array.isArray(response)) setImages(response)
    })
  }

  const validateAndContinue = ()=>{
    dispatch(createOrUpdateTicket({
      id: ticket.id,
      statusId: 'waiting_validation'
    })).then(({py})=>{})

    goToReport()
  }
  const goToReport = ()=>{
    navigate.navigate("TicketReport", {ticketId: ticket.id})
  }

  function splitDataToSave(data , count = 2){
    if(!data) return [];

    if(isNaN(count)) count = 2;

    let withImage = data.filter( o => o.images && o.images?.length > 0)
    let withoutImage = data.filter( o => !o.images || o.images?.length == 0)

    withImage = _.chunk(withImage, Math.ceil(withImage.length/count))
    withoutImage = _.chunk(withoutImage, Math.ceil(withoutImage.length/count));

    let len = withImage.length;
    if(withoutImage.length > len) len = withoutImage.length;
    return Array.from({length: len}, (_, i) => [...(withImage[i] || []) , ...(withoutImage[i] || [])])
  }

  function checkIsDataToLarge(response){
    return (response?.response || '').toString().toLowerCase().includes('payloadtoolargeerror')
  }
  const save = async (data)=>{
    dispatch(setUiParams({showLoader: true}))
    log(`Start saving checks for ticket ${ticket?.reference}` , 'info', 'Checks');
    let { payload } = await dispatch(saveTicketResults(data))
    if(payload?.success){
      toastMessage({
        text1: "Sauvegarde",
        text2: "Check sauvegardé avec succés",
        visibilityTime: 800,
        tag:"Checks"
      })
    }else{
      let displayError = true
      if(checkIsDataToLarge(payload)){
        log(`Data to large spliting in two request` , 'info', 'Checks');
        let split =  splitDataToSave(data, 2);
        console.log('split:', split.length)
        let response = await Promise.all(split.map(o => dispatch(saveTicketResults(o))))
        let errors = response.filter(o => !o?.payload?.success)
        if(errors.length == 0){
          toastMessage({
            text1: "Sauvegarde",
            text2: "Check sauvegardé avec succés",
            visibilityTime: 800,
            tag:"Checks"
          })
          displayError = false
        }else{
          payload = errors[0]?.payload
        }
      }

      if(displayError){
        toastMessage({
          type: "error",
          text1: "Erreur de sauvegarde",
          text2: (checkIsDataToLarge(payload) ?"Données trop volimuneux. Veuillez contacter l administrateur": payload?.response),
          visibilityTime: 6000,
          tag:"Checks"
        })
      }
      
    }
    dispatch(setUiParams({showLoader: false}))
    return payload?.success
  }

  const removeImage = (id)=>{
    setImages((prev)=>{
      return prev.filter(o => o.id != id)
    })
    removeCheckImageOffline({name: id}).then(res => {
      console.log('remove response:', res)
    })
  }

  const onImage = (images)=>{
    let id = Date.now()
    let datas = images.map((o,idx) =>({
      path: o.uri,
      base64: o.base64,
      item_id: currentTempItem?.id,
      temp_id: currentTemplate?.id,
      id: id+idx
    }))
    setImages( prev =>{
       return [
        ...prev,
        ...datas
       ]
    })
    
    saveCheckImageOffline(datas.map(o => ({
      srcObject: 'temp_item',
      srcId: o.item_id,
      srcParent: 'template',
      srcParentId: o.temp_id,
      itemObject: 'ticket',
      itemId: ticket.id,
      name: o.id,
      path: o.path,
      // base64: o.base64
    }))).then(o =>{
      console.log('save image response:', o)
      getImageOffline()
    })

    setHasChanged(true)

  }

  const onHide = ()=>{
    setShowCamera(false)
  }
  useEffect(()=>{
    if(ticket?.ticket_typeId){
        dispatch(setUiParams({showLoader: true}))
        setPage(0);
        setShowSave(false)
        dispatch(fetchTicketTemplate(ticket?.ticket_typeId)).then(({payload})=>{
            if(payload.success && Array.isArray(payload?.response)){
              setTemplates(payload.response)
              initializeData();
            }else{
              setTemplates([])
            }
            dispatch(setUiParams({showLoader: false}))
        })
    }
  },[ticket , route])


  useEffect(()=>{
    setIsSwitchMode((ticket?.ticketType?.display_type || "").toLowerCase() == 'check')
  },[ticket])

  useEffect(()=>{
    setHasChanged(false)
    if(Array.isArray(currentTemplate?.items)){
      setClickedItems(currentTemplate.items.map(o => o.id))
    }
  },[currentTemplate])

  useEffect(()=>{
    if(Array.isArray(template) && template?.length > 0){
      setCurrentTemplate(template[page])
      dispatch(setUiParams({
        title: template[page]?.label
      }))
    }
    return ()=>{
      dispatch(setUiParams({
        title: ''
      }))
    }
  },[page , template])

  
  return (
    !show_save ? 
    (<View style={{flex: 1, position: 'relative', zIndex: 120000}}>
        <View style={{ width: '100%', bottom: 0,  position: 'absolute' , zIndex: 12000}}>
          <CameraScreen visible={showCamera} onHide={onHide} onImage={onImage} style={{height: 500}} />
        </View>
        <ScrollView style={{flex: 1 , elevation: isSwitchMode ? 3 : 0 }} className={`m-2 ${isSwitchMode && 'bg-white'}`} >
            {
              currentTemplate != null && buildTemplate(currentTemplate?.items || [])
            }
        </ScrollView>
        <View className={`flex-row justify-${page == 0 ? 'end' : 'between'} bg-white`}>
          <View className={`flex-row items-center ${page == 0 ? 'hidden' : ''} mx-2`}>
              <Ionicons name='arrow-back' color={'blue'} size={20} />
              <Button  textColor='blue'  onPress={e => addToPage(-1)}>Précedent</Button>
          </View>
          <View className="flex-row items-center mx-2">
             <Button textColor='blue' onPress={e => addToPage(1)}>Suivant</Button>
             <Ionicons name='arrow-forward' color={'blue'} size={20} />
          </View>
        </View>
    </View>):
    <View className="m-3" style={{flex: 1}}>
       <View className="p-5 justify-center flex-row items-center border border-green-700">
            <Ionicons name='warning-outline' color={'green'} size={30} />
            <View className="ml-3" style={{width: '90%'}}>
               <Text className="font-semibold text-green-600">
                  Données sauvegardées
                </Text>
                <Text>
                  Cliquez sur continuer pour terminer et voir le rapport.
                </Text>
            </View>
       </View>
       <View className="absolute flex-row justify-between bottom-0 w-full">
          <Button onPress={ e=>{
             setShowSave(false)
          }} icon={'arrow-left'} mode='contained' className="bg-gray-400">
             Modifier
          </Button>
          <Button onPress={validateAndContinue} icon={'arrow-right'}  mode='contained' className="bg-blue-500">
             Continuer
          </Button>
       </View>
    </View>
  )
}
export default CheckTicket