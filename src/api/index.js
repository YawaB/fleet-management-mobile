import AsyncStorage from "@react-native-async-storage/async-storage";
import _axios from "./axios";
import { logoutWithAlert } from "../modules/Authentication/util/util";
import { saveLog } from "../hook/Logger/service";
let refreshCount = 0;

const defaultConfigs = { auth_key: "1234", app: "PSWEB" };

export async function request(url, params) {
  try {
    params = Object.keys(params || {})?.length > 0 ? params : {};
    params.method = params.method || "get";
    params.data = params.data || {};
    params.params = params.params || {};
    params.headers = params.headers || {};
    params.url = url;
    const token = await AsyncStorage.getItem("token");
    let userInf = await AsyncStorage.getItem("user");
    userInf = JSON.parse(userInf);
    console.log("userInf", userInf);
    params.headers["Authorization"] = "Bearer " + token;
    params.headers["x-socket"] = await AsyncStorage.getItem("x-socket");

    console.log("url", url);

    let userInfos = {
      userID: userInf?.userID,
    };
    console.log('userInfos', userInfos);
    params.params = {
      ...params.params,
      ...defaultConfigs,
      userInfos,
    };
    params.data = {
      ...params.data,
      data: params.data,
      ...defaultConfigs,
      userInfos,
    };
    console.log("_axios url", _axios.defaults.baseURL);
    let res = await _axios(url, params);
    console.log("response request:", res);
    res = res || { data: {} };
    refreshCount = 0;
    return res;
  } catch (e) {
    console.log("error request:", e);
    if (
      e.response?.status === 403 &&
      !url.includes("authentication") &&
      refreshCount == 0
    ) {
      console.log("refreshing token");
      let res = await _refreshToken();
      console.log("refresh response:", res);
      await AsyncStorage.setItem("token", res?.accessToken);
      refreshCount++;
      return await request(url, params);
    } else if (e.response?.status === 403 && url == "authentication/refresh") {
      logoutWithAlert();
      saveLog({
        message: "Token expired",
        type: "error",
        data:
          typeof e?.response?.data == "string"
            ? e?.response?.data
            : JSON.stringify(e?.response?.data),
        tag: "authentication",
      });
    } else if (e.response?.status == 203) {
    }

    return { success: false, response: e?.response?.data };
  }
}

export async function _refreshToken() {
  let res = await request("authentication/refresh");
  return res?.response || {};
}
