// import { updateTickets } from "../modules/Ticket/slice/slice"

import { setNewChat } from "../modules/Chat/slice/slice"

export const socketEvents = {
  connect: (data) => console.log('socket connected:', data),
  disconnect: () => console.log('disconnect'),
  engin_update: (data , dispatch)=>{
    console.log('engin_update:', data)
    // dispatch(updateTickets(data.data))
  },
  new_message: (data , dispatch)=>{
    console.log('new chatss:', data)
    if(data.data){
      dispatch(setNewChat(data.data))
    }
  }
}