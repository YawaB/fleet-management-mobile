import { request } from "../../../api";

export async function _fetchConversationList(data) {
  return await request("communication/list", {
    method: "POST",
    data,
  });
}

export async function _saveConversation(data) {
  return await request("communication/save", {
    method: "POST",
    data,
  });
}

export async function _fetchMessagesList() {
  return await request("communication/mainList");
}

export async function _getUserRead() {
  return await request("communication/isReadAll");
}

export async function _readMsg(data) {
  return await request("communication/isRead", {
    method: "POST",
    data,
  });
}

export async function _fetchResources(data) {
  return await request("communication/ressources", {
    method: "POST",
    data,
  });
}

export async function _fetchNotificationList(data) {
  return await request(`notifications/list`, {
    method: "post",
    data,
  });
}

export async function _readNotification(data) {
  return await request(`notifications/markAsRead`, {
    method: "post",
    data,
  });
}
