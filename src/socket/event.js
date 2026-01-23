// import { updateTickets } from "../modules/Ticket/slice/slice"

import { setNewChat } from "../modules/Chat/slice/slice";
import { upsertTask } from "../modules/Tasks/slice/slice";

export const socketEvents = {
  connect: (data) => console.log("socket connected:", data),
  disconnect: () => console.log("disconnect"),
  engin_update: (data, dispatch) => {
    console.log("engin_update:", data);
    // dispatch(updateTickets(data.data))
  },
  new_message: (data, dispatch) => {
    console.log("new chatss:", data);
    // if (data.data) {
    //   dispatch(setNewChat(data.data));
    // }
  },
  new_location: (data, dispatch) => {
    console.log("new_location:", data);
    // dispatch(setNewChat(data.data))
  },
  task_status_changed: (data, dispatch) => {
    console.log("task_status_changed:", data);
    const task = data?.task ?? data?.data?.task;
    if (task) dispatch(upsertTask(task));
  },
  data_message: (data, dispatch, socketId) => {
    console.log("data_message:", data);
    if (data.msg) dispatch(setNewChat(data));
  },
};
