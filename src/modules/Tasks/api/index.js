import { request } from "../../../api";

export async function _fetchTaskList(data) {
  return await request(`tasks/list`, {
    method: "post",
    data,
  });
}

export async function _saveOrUpdateTask(data) {
  return await request(`tasks/save`, {
    method: "post",
    data,
  });
}

export async function _startTaskOrStop(data) {
  return await request(`tasks/changestate`, {
    method: "post",
    data,
  });
}
