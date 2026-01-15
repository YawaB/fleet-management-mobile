import { request } from "../../../api";

export async function _fetchMessages(filter) {
  return await request("messages/list", { params: filter });
}

export async function _fetchDetailPanne(data) {
  return await request("Pannes/get", {
    method: "post",
    data,
  });
}

export async function _fetchDashboard(data) {
  return await request("dashboard/mobileKpis", {
    method: "post",
    data,
  });
}

export async function _createTask(data) {
  return await request(`tasks/save`, {
    method: "post",
    data,
  });
}
