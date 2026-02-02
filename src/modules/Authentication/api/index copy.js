import { request } from "../../../api";
const root = "authentication";

export async function _login(credentials) {
  return await request(`/user/login`, {
    method: "post",
    data: credentials,
  });
}

export async function _signin(credentials) {
  return await request(`${root}/signin`, {
    method: "post",
    data: credentials,
  });
}

export async function _logOut(userId) {
  return await request(`${root}/logout`);
}

export async function _checkUser(token) {
  return await request(`user/checkUserToken`, {
    method: "post",
    data: { token },
  });
}
export async function _fetchUserAuthorizations(id) {
  return await request(`users/authorizations?id=${id}`);
}
