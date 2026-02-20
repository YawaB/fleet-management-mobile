import { request } from "../../../api";

export async function _fetchForms(data) {
  return await request(`forms/list`, {
    method: "post",
    data,
  });
}

export async function _saveForm(data) {
  return await request(`form/saveFieldValues`, {
    method: "post",
    data,
  });
}

export async function _fetchFormById(data) {
  return await request(`forms/detail`, {
    method: "post",
    data,
  });
}
