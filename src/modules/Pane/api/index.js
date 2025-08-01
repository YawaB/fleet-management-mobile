import { request } from "../../../api"

export async function _cratePanne(data) {
    return await request(`pannes/save`, {
      method: "post",
      data,
    });
  }

  export async function _fetchPannes(data) {
    return await request(`pannes/list`, {
      method: "post",
      data,
    });
  }

  export async function _removePanne(data) {
    return await request(`pannes/remove`, {
      method: "post",
      data,
    });
  }


  export async function _fetchVehicles() {
    return await request("vehicule/list", {
      method: "post",
    });
  }

  export async function _fetchTypes(data) {
    return await request(`types/typeItemsList`, {
      method: "post",
      data,
    });
  }