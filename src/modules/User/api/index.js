import { request } from "../../../api";

export async function _fetchUsers(role) {
  return await request("users/list?role=" + role);
}

export async function _createUser(data) {
  delete data.id;
  return await request(`users/create`, {
    method: "post",
    data,
  });
}

export async function _updateUser(data) {
  const id = data.id;
  delete data.id;
  return await request(`users/update`, {
    method: "post",
    data,
    params: { id },
  });
}

export async function _removeUser(id) {
  return await request(`users/delete`, {
    method: "delete",
    params: { id },
  });
}

export async function _fetchStaff(data) {
  return await request(`staff/list`, {
    method: "post",
    data,
  });
}
