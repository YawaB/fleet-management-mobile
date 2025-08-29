import {io} from 'socket.io-client'
import {socketEvents} from './event'
import { APP_API_BASE } from '../api/config'
import AsyncStorage from '@react-native-async-storage/async-storage'


let params = {}
if (process.env.EXPO_PUBLIC_REACT_APP_SOCKET_URL) {
  params.path = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_ROOT
}//process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL 
export const socket = io( process.env.EXPO_PUBLIC_REACT_APP_SOCKET_URL , params )

let isBind = false

export const bindEvents = (dispatch)=> {
    try{

        console.log('start bindinggg', APP_API_BASE)
        if(!socket.connected || isBind) {
          console.log('socket not connected or already binded')
          return
        }
        AsyncStorage.setItem('x-socket', socket.id)
        for(let event in socketEvents){
            socket.off(event , (dt) => socketEvents[event](dt, dispatch))
            socket.on(event , (dt) => socketEvents[event](dt, dispatch))
            console.log(`event ${event} binded successfully !!!`)
        }

        isBind = true
        console.log('socket:', socket?.id)
  } catch (e) {
    console.error('error binding events:', e)
  }
}

export const unbindEvents = () => {
  try {
    if (typeof socket.off != 'function') return
    console.log('start unbinding events...')

    for (let event in socketEvents) {
      socket.off(event, socketEvents[event])
      console.log(`event ${event} unbinded successfully !!!`)
    }
    isBind = false
  } catch (e) {
    console.error('error unbinding events:', e)
  }
}
