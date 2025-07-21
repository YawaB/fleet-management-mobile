import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { createOrUpdateTicket, fetchTickets, getTicketDashboardFilters, getTicketFilters, getTickets, removeTicket, setSelectedTicket } from '../../slice/slice'
import TicketItem from '../Item/Item'
import { FlatList } from 'react-native-gesture-handler'
import { Divider, FAB } from 'react-native-paper'
import TicketFilter from '../Filter/TicketFilter'
import _ from 'lodash'
import { setUiParams } from '../../../../store/slice/ui'
import DialogComponent from '../../../../component/DialogComponent/DialogComponent'
import FilterComponent from '../../../../component/Filter/FilterComponent'
import { useNavigation } from '@react-navigation/native'

function TicketList({status, route  , filter , hideFilter , filterFields}) {
  let [filtredData , setFilteredData] = useState([])
  let [openSettings,setOpenSetting] = useState(false)
  let [dialogTitle,setDialogTitle] = useState("Confirmer")
  let [openDialog,setOpenDialog] = useState(false)
  let [dialogContent,setDialogContent] = useState("Veuillez confirmer votre action")
  let [selectedTicket , setSelecedTicket] = useState(null)
  let [action , setAction] = useState(null)
  let [actionArgs , setActionArgs] = useState([])
  let [showFilter , setShowFilter]=useState(false)
  let tickets = useSelector(getTickets)
  let [filters , setFilters] =useState({})
  let dashboard_filters = useSelector(getTicketDashboardFilters)

  let navigation = useNavigation()
  let dispatch = useDispatch()
 
  let actions = useMemo(()=>{
    let obj = [
      { 
        icon: 'refresh', 
        onPress: () => _fetchTickets(), 
      }
    ]

    if(!hideFilter){
      obj.push({
        icon: `filter${showFilter ? '-remove': ''}`,        
        onPress: () => setShowFilter(prev=> !prev),
      })
    }
    return obj
  },[hideFilter])
  let handleConfirm = ()=>{
    console.log('confirmmm:', action)
    try {
      dispatch(setUiParams({showLoader: true}))
      switch(action){
        case 'remove':
          dispatch(removeTicket(selectedTicket?.id)).then(r => {
            dispatch(setUiParams({showLoader: false}))
            _fetchTickets()
          })
          break
        case 'changeStatus':
          dispatch(createOrUpdateTicket({
            id: selectedTicket?.id,
            statusId: actionArgs?.[0]
          })).then(r => {
            dispatch(setUiParams({showLoader: false}))
            _fetchTickets()
          })
          break
        default:
          dispatch(setUiParams({showLoader: false}))
          ''
      }
      setTimeout(resetDialogData , 4000)
    }catch(e){
      console.log('error:', e.message)
    }
    
  }

  let handleCancel = ()=>{
    resetDialogData()
  }

  const onFilterChanged = (_filters)=>{
      setFilters(_filters)
  }

  let resetDialogData = ()=>{
    setSelecedTicket(null)
    setAction(null)
    setActionArgs([])
    setDialogContent('')
    setDialogTitle('')
    setOpenDialog(false)
  }

  let onSelect = useCallback((type , item ,...args)=>{
    dispatch(setSelectedTicket(item))

    switch(type){
      case 'edit_check':
        navigate('CheckTicket' , {
          id: item?.id,
        })
        break
      case 'repport':
        navigate('TicketReport' , {
          ticketId: item?.id,
        })
        break
      case 'chat':
        navigate('TicketChat' , {
          srcObject: 'ticket',
          srcId: item?.id,
          label: 'Ticket - '+item?.reference
        })
        break
      default:
        console.log('type:', type)
        if(['remove', 'changeStatus'].includes(type)){
          if(type == 'remove'){
            setDialogTitle("Confirmer")
            setDialogContent("Ce ticket sera supprimer definitivement. Voulez-vous continuer ?")
          }else{
            setDialogTitle("Changer le status")
            setDialogContent("Veuillez confirmer votre action")
          }
          setAction(type)
          setActionArgs(args)
          setSelecedTicket(item)
          setOpenDialog(true)
        }
        
    }
  })
  
  let navigate = (screen , params)=>{
    navigation.navigate(screen ,params)
  }

  let onStateChange = ({open})=>{
    setOpenSetting((open))
  }
  
  useEffect(()=>{
    let data = _.cloneDeep(tickets);
    if(!Array.isArray(data)) data = [];

    data = data.filter(o =>(
      (!filters?.site || o?.siteId == filters?.site) &&
      (!filters?.area || o?.site?.areaId == filters?.area) &&
      (!filters?.status || o?.statusId == filters?.status) 
    ))
    setFilteredData(data)
  },[tickets , filters])

  const _fetchTickets = ()=>{
    dispatch(setUiParams({showLoader: true}))
    let objFilter = {
      ...dashboard_filters,
      ...filter,
    }
    dispatch(fetchTickets(objFilter)).then(({payload})=>{
      dispatch(setUiParams({showLoader: false}))
    })
  }
  useEffect(()=>{
    _fetchTickets()
  },[route , navigation , filter])

  return (
    <View style={{flex: 1}}>
        <DialogComponent title={dialogTitle} 
                         confirmClassName={"bg-red-500"} 
                         confirmLabel={"Confirmer"} 
                         visible={openDialog}
                         onCancel={handleCancel}
                         onConfirm={handleConfirm}>
            {dialogContent}
        </DialogComponent>
        
        {  showFilter && !hideFilter && 
            (
                <View className="bg-white" style={{elevation: 7}}>
                  <FilterComponent onChange={onFilterChanged} fields={filterFields || ['site', 'area', 'reference', 'status']} />
                </View>
            )
        }
        <View  className="p-2 m-2 rounded-lg justify-center items-center bg-blue-100">
          <Text className="font-semibold text-blue-700 text-2xl">
            {(filtredData.length).toString().padStart(2 , '0')} tickets
          </Text>
        </View>
        <Divider />
        <FlatList
            // onScroll={}  
            className=""
            data={filtredData}
            renderItem={({item})=>(
               <TicketItem data={item} onSelect={onSelect}  />
            )}
            keyExtractor={(item)=> item.id}
        />
        {/* <FAB 
            className="bg-gray-200"
            icon={`filter${showFilter ? '-remove': ''}`}
            color={showFilter ? 'red' : 'gray'}
            size='small'
            style={{ position: 'absolute' , bottom: 10 , right: 10}}
            onPress={() => setShowFilter(prev=> !prev)}
          /> */}
        <FAB.Group 
          className=""
          style={{ bottom: 45, width: '100%' }}
          open={openSettings} 
          icon={openSettings ? 'cancel' : 'cog'}
          actions={actions}
          size='small'
          onStateChange={onStateChange}
          backdropColor='rgba(231, 228, 228, 0.2)'
        />
        
    </View>
  )
}

export default TicketList